import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from './db/db-example.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

type Variables = {
  user: any
}

const app = new Hono<{ Variables: Variables }>()
const JWT_SECRET = 'your-secret-key'

app.use('*', cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.get('/', (c) => {
  return c.json({ message: 'ScrollTube API running' })
})

app.get('/videos', async (c) => {
  const [videos] = await db.query('SELECT * FROM videos')
  return c.json(videos)
})


// middleware to check if logged in
const authMiddleware = async (c: any, next: any) => {
  const token = getCookie(c, 'token')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    c.set('user', decoded)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}

// middleware to check if admin
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('user')
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }
  await next()
}

// get all users (admin only)
app.get('/admin/users', authMiddleware, adminMiddleware, async (c) => {
  const [users] = await db.query('SELECT id, email, username, role FROM users') as any
  return c.json(users)
})

// delete user (admin only)
app.delete('/admin/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id')
  await db.query('DELETE FROM users WHERE id = ?', [id])
  return c.json({ message: 'User deleted' })
})

// subscribe
app.post('/subscriptions/:username', authMiddleware, async (c) => {
  const user = c.get('user')
  const username = c.req.param('username')

  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]) as any
  const channel = rows[0]
  if (!channel) return c.json({ error: 'User not found' }, 404)

  try {
    await db.query(
      'INSERT INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)',
      [user.id, channel.id]
    )
    return c.json({ message: 'Subscribed' })
  } catch {
    return c.json({ error: 'Already subscribed' }, 400)
  }
})

// unsubscribe
app.delete('/subscriptions/:username', authMiddleware, async (c) => {
  const user = c.get('user')
  const username = c.req.param('username')

  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]) as any
  const channel = rows[0]
  if (!channel) return c.json({ error: 'User not found' }, 404)

  await db.query(
    'DELETE FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?',
    [user.id, channel.id]
  )
  return c.json({ message: 'Unsubscribed' })
})

// get subscriber count
app.get('/subscriptions/count/:username', async (c) => {
  const username = c.req.param('username')

  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]) as any
  const channel = rows[0]
  if (!channel) return c.json({ count: 0 })

  const [countRows] = await db.query(
    'SELECT COUNT(*) as count FROM subscriptions WHERE channel_id = ?',
    [channel.id]
  ) as any
  return c.json({ count: countRows[0].count })
})

// check if subscribed
app.get('/subscriptions/check/:username', authMiddleware, async (c) => {
  const user = c.get('user')
  const username = c.req.param('username')

  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]) as any
  const channel = rows[0]
  if (!channel) return c.json({ subscribed: false })

  const [checkRows] = await db.query(
    'SELECT * FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?',
    [user.id, channel.id]
  ) as any
  return c.json({ subscribed: checkRows.length > 0 })
})

app.get('/videos/user/:username', async (c) => {
  const username = c.req.param('username')
  const [videos] = await db.query('SELECT * FROM videos WHERE username = ?', [username]) as any
  return c.json(videos)
})

app.post('/videos/upload', authMiddleware, async (c) => {
  const body = await c.req.parseBody()
  const file = body['video'] as File
  const title = body['title'] as string
  const username = body['username'] as string

  if (!file) return c.json({ error: 'No file provided' }, 400)

  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: 'Only mp4, webm, and ogg files are allowed' }, 400)
  }

  const uploadsDir = join(process.cwd(), 'uploads')
  if (!existsSync(uploadsDir)) await mkdir(uploadsDir)

  const filename = `${Date.now()}-${file.name}`
  const filepath = join(uploadsDir, filename)
  const buffer = await file.arrayBuffer()
  await writeFile(filepath, Buffer.from(buffer))

  const url = `/uploads/${filename}`
  await db.query(
    'INSERT INTO videos (url, title, username) VALUES (?, ?, ?)',
    [url, title, username]
  )

  return c.json({ message: 'Video uploaded', url })
})

app.get('/videos/:id', async (c) => {
  const id = c.req.param('id')
  const [rows] = await db.query('SELECT * FROM videos WHERE id = ?', [id]) as any
  return c.json(rows[0])
})

app.post('/auth/register', async (c) => {
  const { email, username, password } = await c.req.json()
  const hashed = await bcrypt.hash(password, 10)

  try {
    await db.query(
      'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
      [email, username, hashed, 'user']
    )
    return c.json({ message: 'User created' })
  } catch (err) {
    return c.json({ error: 'Email already exists' }, 400)
  }
})

app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]) as any
  const user = rows[0]

  if (!user) return c.json({ error: 'User not found' }, 404)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return c.json({ error: 'Wrong password' }, 401)

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7
  })

  return c.json({ username: user.username, id: user.id, role: user.role })
})

app.post('/auth/logout', (c) => {
  deleteCookie(c, 'token')
  return c.json({ message: 'Logged out' })
})

app.get('/auth/me', async (c) => {
  const token = getCookie(c, 'token')
  if (!token) return c.json({ error: 'Not logged in' }, 401)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const [rows] = await db.query('SELECT id, email, username, role FROM users WHERE id = ?', [decoded.id]) as any
    return c.json(rows[0])
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
})





export default app