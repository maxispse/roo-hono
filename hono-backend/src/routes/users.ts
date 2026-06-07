import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { z } from 'zod'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { db } from '../db/db-example.js'
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js'
import jwt from 'jsonwebtoken'

type Variables = {
  user: any
}

const users = new Hono<{ Variables: Variables }>()

const usernameSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long')
})

users.patch('/username', authMiddleware, async (c) => {
  const body = await c.req.json()
  const result = usernameSchema.safeParse(body)
  if (!result.success) return c.json({ error: result.error.errors[0].message }, 400)

  const user = c.get('user')
  const { username } = result.data

  try {
    const [rows] = await db.query('SELECT username FROM users WHERE id = ?', [user.id]) as any
    const oldUsername = rows[0].username
    await db.query('UPDATE users SET username = ? WHERE id = ?', [username, user.id])
    await db.query('UPDATE videos SET username = ? WHERE username = ?', [username, oldUsername])
    await db.query('UPDATE comments SET username = ? WHERE username = ?', [username, oldUsername])

    const newToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    setCookie(c, 'token', newToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7
    })
    return c.json({ message: 'Username updated', username })
  } catch {
    return c.json({ error: 'Username already taken' }, 400)
  }
})

users.post('/avatar', authMiddleware, async (c) => {
  const user = c.get('user')
  const body = await c.req.parseBody()
  const file = body['avatar'] as File

  if (!file) return c.json({ error: 'No file provided' }, 400)

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  if (!allowedTypes.includes(file.type)) return c.json({ error: 'Only jpg, png, and webp files are allowed' }, 400)

  const uploadsDir = join(process.cwd(), 'uploads/avatars')
  if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true })

  const filename = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`
  const filepath = join(uploadsDir, filename)
  const buffer = await file.arrayBuffer()
  await writeFile(filepath, Buffer.from(buffer))

  const avatarUrl = `/uploads/avatars/${filename}`
  await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, user.id])
  return c.json({ message: 'Avatar updated', avatar: avatarUrl })
})

users.delete('/me', authMiddleware, async (c) => {
  const user = c.get('user')
  
  // get username first
  const [rows] = await db.query('SELECT username FROM users WHERE id = ?', [user.id]) as any
  const username = rows[0].username

  // delete all user's videos first
  await db.query('DELETE FROM videos WHERE username = ?', [username])
  
  // then delete the user (CASCADE handles comments, reactions, subscriptions, notifications)
  await db.query('DELETE FROM users WHERE id = ?', [user.id])
  
  deleteCookie(c, 'token')
  return c.json({ message: 'Account deleted' })
})

users.get('/:username', async (c) => {
  const username = c.req.param('username')
  const [rows] = await db.query('SELECT id, username, avatar FROM users WHERE username = ?', [username]) as any
  if (!rows[0]) return c.json({ error: 'User not found' }, 404)
  return c.json(rows[0])
})

export default users