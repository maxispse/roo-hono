import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from './db/db-example.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { z } from 'zod'


type Variables = {
  user: any
}

const app = new Hono<{ Variables: Variables }>()
const JWT_SECRET = 'your-secret-key'
const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
})

const usernameSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long')
})

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long')
})

const reportSchema = z.object({
  reason: z.string().min(1, 'Reason is required')
})

const reactionSchema = z.object({
  type: z.enum(['like', 'dislike'])
})

async function getFreshUsername(userId: number): Promise<string> {
  const [rows] = await db.query('SELECT username FROM users WHERE id = ?', [userId]) as any
  return rows[0].username
}

app.use('*', cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

// middleware
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

const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('user')
  if (!user || user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  await next()
}

// base
app.get('/', (c) => c.json({ message: 'ScrollTube API running' }))

app.post('/auth/register', async (c) => {
  const body = await c.req.json()
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error.errors[0].message }, 400)
  }

  const { email, username, password } = result.data
  const hashed = await bcrypt.hash(password, 10)

  try {
    await db.query(
      'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
      [email, username, hashed, 'user']
    )
    return c.json({ message: 'User created' })
  } catch {
    return c.json({ error: 'Email already exists' }, 400)
  }
})

app.post('/auth/login', async (c) => {
  const body = await c.req.json()
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error.errors[0].message }, 400)
  }

  const { email, password } = result.data
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
    const [rows] = await db.query('SELECT id, email, username, role, avatar FROM users WHERE id = ?', [decoded.id]) as any
    return c.json(rows[0])
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

// admin
app.get('/admin/users', authMiddleware, adminMiddleware, async (c) => {
  const [users] = await db.query('SELECT id, email, username, role FROM users') as any
  return c.json(users)
})

app.delete('/admin/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id')
  await db.query('DELETE FROM users WHERE id = ?', [id])
  return c.json({ message: 'User deleted' })
})

// users — specific routes before /:username
app.patch('/users/username', authMiddleware, async (c) => {
  const body = await c.req.json()
  const result = usernameSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error.errors[0].message }, 400)
  }

  const user = c.get('user')
  const { username } = result.data

  try {
    const [rows] = await db.query('SELECT username FROM users WHERE id = ?', [user.id]) as any
    const oldUsername = rows[0].username
    await db.query('UPDATE users SET username = ? WHERE id = ?', [username, user.id])
    await db.query('UPDATE videos SET username = ? WHERE username = ?', [username, oldUsername])
    await db.query('UPDATE comments SET username = ? WHERE username = ?', [username, oldUsername])

    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
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

app.post('/users/avatar', authMiddleware, async (c) => {
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

app.delete('/users/me', authMiddleware, async (c) => {
  const user = c.get('user')
  await db.query('DELETE FROM users WHERE id = ?', [user.id])
  deleteCookie(c, 'token')
  return c.json({ message: 'Account deleted' })
})

app.get('/users/:username', async (c) => {
  const username = c.req.param('username')
  const [rows] = await db.query('SELECT id, username, avatar FROM users WHERE username = ?', [username]) as any
  if (!rows[0]) return c.json({ error: 'User not found' }, 404)
  return c.json(rows[0])
})

// subscriptions — specific routes before /:username
app.get('/subscriptions/following', authMiddleware, async (c) => {
  const user = c.get('user')
  const [rows] = await db.query(`
    SELECT users.id, users.username, users.avatar
    FROM subscriptions 
    JOIN users ON subscriptions.channel_id = users.id 
    WHERE subscriptions.subscriber_id = ?
  `, [user.id]) as any
  return c.json(rows)
})

app.get('/subscriptions/count/:username', async (c) => {
  const username = c.req.param('username')
  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]) as any
  const channel = rows[0]
  if (!channel) return c.json({ count: 0 })
  const [countRows] = await db.query('SELECT COUNT(*) as count FROM subscriptions WHERE channel_id = ?', [channel.id]) as any
  return c.json({ count: countRows[0].count })
})

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

app.post('/subscriptions/:username', authMiddleware, async (c) => {
  const user = c.get('user')
  const username = c.req.param('username')

  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]) as any
  const channel = rows[0]
  if (!channel) return c.json({ error: 'User not found' }, 404)

  try {
    await db.query('INSERT INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)', [user.id, channel.id])
    const freshUsername = await getFreshUsername(user.id)
    await createNotification(channel.id, 'subscribe', `${freshUsername} subscribed to your channel`)
    return c.json({ message: 'Subscribed' })
  } catch {
    return c.json({ error: 'Already subscribed' }, 400)
  }
})


app.delete('/subscriptions/:username', authMiddleware, async (c) => {
  const user = c.get('user')
  const username = c.req.param('username')
  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]) as any
  const channel = rows[0]
  if (!channel) return c.json({ error: 'User not found' }, 404)
  await db.query('DELETE FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?', [user.id, channel.id])
  return c.json({ message: 'Unsubscribed' })
})

// videos — specific routes before /:id
app.get('/videos', async (c) => {
  const [videos] = await db.query('SELECT * FROM videos')
  return c.json(videos)
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
  if (!allowedTypes.includes(file.type)) return c.json({ error: 'Only mp4, webm, and ogg files are allowed' }, 400)

  const uploadsDir = join(process.cwd(), 'uploads')
  if (!existsSync(uploadsDir)) await mkdir(uploadsDir)

  const filename = `${Date.now()}-${file.name}`
  const filepath = join(uploadsDir, filename)
  const buffer = await file.arrayBuffer()
  await writeFile(filepath, Buffer.from(buffer))

  const url = `/uploads/${filename}`
  const [result] = await db.query(
    'INSERT INTO videos (url, title, username) VALUES (?, ?, ?)',
    [url, title, username]
  ) as any

  // broadcast new video to all connected clients
  broadcast({
    type: 'new_video',
    video: {
      id: result.insertId,
      url,
      title,
      username,
      views: 0,
      created_at: new Date().toISOString()
    }
  })

  return c.json({ message: 'Video uploaded', url })
})

app.get('/videos/:id/comments', async (c) => {
  const id = c.req.param('id')
  const [rows] = await db.query(`
    SELECT comments.*, users.username, users.avatar
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE comments.video_id = ?
    ORDER BY comments.created_at DESC
  `, [id]) as any
  return c.json(rows)
})

app.post('/videos/:id/comments', authMiddleware, async (c) => {
  const body = await c.req.json()
  const result = commentSchema.safeParse(body)
  if (!result.success) return c.json({ error: result.error.errors[0].message }, 400)

  const user = c.get('user')
  const id = c.req.param('id')

  await db.query('INSERT INTO comments (user_id, video_id, content) VALUES (?, ?, ?)', [user.id, id, result.data.content])

  const [videoRows] = await db.query('SELECT * FROM videos WHERE id = ?', [id]) as any
  const [ownerRows] = await db.query('SELECT id FROM users WHERE username = ?', [videoRows[0].username]) as any
  if (ownerRows[0] && ownerRows[0].id !== user.id) {
    const freshUsername = await getFreshUsername(user.id)
    await createNotification(ownerRows[0].id, 'comment', `${freshUsername} commented on your video "${videoRows[0].title}"`)
  }

  return c.json({ message: 'Comment posted' })
})

app.post('/videos/:id/react', authMiddleware, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const { type } = await c.req.json()

  if (!['like', 'dislike'].includes(type)) return c.json({ error: 'Invalid reaction type' }, 400)

  const [existing] = await db.query(
    'SELECT * FROM video_reactions WHERE user_id = ? AND video_id = ?',
    [user.id, id]
  ) as any

  if (existing[0]) {
    if (existing[0].type === type) {
      await db.query('DELETE FROM video_reactions WHERE user_id = ? AND video_id = ?', [user.id, id])
      return c.json({ message: 'Reaction removed' })
    } else {
      await db.query('UPDATE video_reactions SET type = ? WHERE user_id = ? AND video_id = ?', [type, user.id, id])
      return c.json({ message: 'Reaction updated' })
    }
  }

  await db.query('INSERT INTO video_reactions (user_id, video_id, type) VALUES (?, ?, ?)', [user.id, id, type])

  if (type === 'like') {
    const [videoRows] = await db.query('SELECT * FROM videos WHERE id = ?', [id]) as any
    const [ownerRows] = await db.query('SELECT id FROM users WHERE username = ?', [videoRows[0].username]) as any
    if (ownerRows[0] && ownerRows[0].id !== user.id) {
      const freshUsername = await getFreshUsername(user.id)
      await createNotification(ownerRows[0].id, 'like', `${freshUsername} liked your video "${videoRows[0].title}"`)
    }
  }

  return c.json({ message: 'Reaction added' })
})

app.get('/videos/:id/reaction', authMiddleware, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const [rows] = await db.query(
    'SELECT type FROM video_reactions WHERE user_id = ? AND video_id = ?',
    [user.id, id]
  ) as any
  return c.json({ reaction: rows[0]?.type || null })
})

app.post('/videos/:id/report', authMiddleware, async (c) => {
  const body = await c.req.json()
  const result = reportSchema.safeParse(body)
  if (!result.success) return c.json({ error: result.error.errors[0].message }, 400)

  const user = c.get('user')
  const id = c.req.param('id')

  await db.query('INSERT INTO reports (user_id, video_id, reason) VALUES (?, ?, ?)', [user.id, id, result.data.reason])

  const [videoRows] = await db.query('SELECT * FROM videos WHERE id = ?', [id]) as any
  const [admins] = await db.query('SELECT id FROM users WHERE role = ?', ['admin']) as any
  const freshUsername = await getFreshUsername(user.id)
  for (const admin of admins) {
    await createNotification(admin.id, 'report', `${freshUsername} reported video "${videoRows[0].title}" for: ${result.data.reason}`)
  }

  return c.json({ message: 'Report submitted' })
})

app.get('/videos/:id', async (c) => {
  const id = c.req.param('id')
  const [rows] = await db.query(`
    SELECT videos.*, users.username, users.avatar,
    (SELECT COUNT(*) FROM video_reactions WHERE video_id = videos.id AND type = 'like') as likes,
    (SELECT COUNT(*) FROM video_reactions WHERE video_id = videos.id AND type = 'dislike') as dislikes,
    (SELECT COUNT(*) FROM comments WHERE video_id = videos.id) as comment_count
    FROM videos 
    JOIN users ON videos.username = users.username
    WHERE videos.id = ?
  `, [id]) as any
  if (!rows[0]) return c.json({ error: 'Video not found' }, 404)
  return c.json(rows[0])
})

// comments
app.delete('/comments/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [id]) as any
  if (!rows[0]) return c.json({ error: 'Comment not found' }, 404)
  if (rows[0].user_id !== user.id && user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  await db.query('DELETE FROM comments WHERE id = ?', [id])
  return c.json({ message: 'Comment deleted' })
})

// store active SSE connections
const clients = new Set<any>()

// SSE endpoint
app.get('/sse', (c) => {
  const stream = new ReadableStream({
    start(controller) {
      const client = { controller }
      clients.add(client)

      // send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)

      // remove client when connection closes
      c.req.raw.signal.addEventListener('abort', () => {
        clients.delete(client)
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
})

// helper to broadcast to all clients
function broadcast(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`
  clients.forEach((client) => {
    try {
      client.controller.enqueue(message)
    } catch {
      clients.delete(client)
    }
  })
}

// helper to create a notification
async function createNotification(userId: number, type: string, message: string) {
  await db.query(
    'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
    [userId, type, message]
  )
  // broadcast to SSE so notification appears instantly
  broadcast({ type: 'notification', userId })
}

// get notifications for logged in user
app.get('/notifications', authMiddleware, async (c) => {
  const user = c.get('user')
  const [rows] = await db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [user.id]
  ) as any
  return c.json(rows)
})

// mark all as read
app.patch('/notifications/read', authMiddleware, async (c) => {
  const user = c.get('user')
  await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [user.id])
  return c.json({ message: 'Notifications marked as read' })
})

// mark single as read
app.patch('/notifications/:id/read', authMiddleware, async (c) => {
  const id = c.req.param('id')
  await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id])
  return c.json({ message: 'Notification marked as read' })
})

// get unread count
app.get('/notifications/unread', authMiddleware, async (c) => {
  const user = c.get('user')
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [user.id]
  ) as any
  return c.json({ count: rows[0].count })
})
export default app