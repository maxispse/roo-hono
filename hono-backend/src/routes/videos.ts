import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { z } from 'zod'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { db } from '../db/db-example.js'
import { broadcast, createNotification, getFreshUsername } from '../helpers/notifications.js'
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js'
import jwt from 'jsonwebtoken'

type Variables = {
  user: any
}

const videos = new Hono<{ Variables: Variables }>()

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long')
})

const reactionSchema = z.object({
  type: z.enum(['like', 'dislike'])
})

const reportSchema = z.object({
  reason: z.string().min(1, 'Reason is required')
})

videos.get('/', async (c) => {
  const [rows] = await db.query(`
    SELECT videos.*, users.avatar
    FROM videos
    JOIN users ON videos.username = users.username
    ORDER BY videos.created_at DESC
  `) as any
  return c.json(rows)
})

videos.get('/user/:username', async (c) => {
  const username = c.req.param('username')
  const [rows] = await db.query('SELECT * FROM videos WHERE username = ?', [username]) as any
  return c.json(rows)
})

videos.post('/upload', authMiddleware, async (c) => {
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

  broadcast({
    type: 'new_video',
    video: { id: result.insertId, url, title, username, views: 0, created_at: new Date().toISOString() }
  })

  return c.json({ message: 'Video uploaded', url })
})

videos.get('/:id/comments', async (c) => {
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

videos.post('/:id/comments', authMiddleware, async (c) => {
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

videos.post('/:id/react', authMiddleware, async (c) => {
  const body = await c.req.json()
  const result = reactionSchema.safeParse(body)
  if (!result.success) return c.json({ error: result.error.errors[0].message }, 400)

  const user = c.get('user')
  const id = c.req.param('id')
  const { type } = result.data

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

videos.get('/:id/reaction', authMiddleware, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const [rows] = await db.query(
    'SELECT type FROM video_reactions WHERE user_id = ? AND video_id = ?',
    [user.id, id]
  ) as any
  return c.json({ reaction: rows[0]?.type || null })
})

videos.get('/search', async (c) => {
  const query = c.req.query('q')
  if (!query) return c.json([])

  const [rows] = await db.query(`
    SELECT videos.*, users.avatar,
    (SELECT COUNT(*) FROM video_reactions WHERE video_id = videos.id AND type = 'like') as likes,
    (SELECT COUNT(*) FROM comments WHERE video_id = videos.id) as comment_count
    FROM videos
    JOIN users ON videos.username = users.username
    WHERE videos.title LIKE ? OR videos.username LIKE ?
    ORDER BY videos.created_at DESC
  `, [`%${query}%`, `%${query}%`]) as any

  return c.json(rows)
})

videos.post('/:id/report', authMiddleware, async (c) => {
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

videos.delete('/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const [rows] = await db.query('SELECT * FROM videos WHERE id = ?', [id]) as any
  if (!rows[0]) return c.json({ error: 'Video not found' }, 404)

  const [ownerRows] = await db.query('SELECT id FROM users WHERE username = ?', [rows[0].username]) as any
  if (ownerRows[0].id !== user.id && user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)

  await db.query('DELETE FROM videos WHERE id = ?', [id])
  return c.json({ message: 'Video deleted' })
})

videos.get('/:id', async (c) => {
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

videos.post('/:id/view', async (c) => {
  const id = c.req.param('id')
  await db.query('UPDATE videos SET views = views + 1 WHERE id = ?', [id])
  return c.json({ message: 'View counted' })
})
export default videos