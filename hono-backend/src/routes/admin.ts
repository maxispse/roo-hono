import { Hono } from 'hono'
import { db } from '../db/db-example.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const admin = new Hono()

admin.get('/users', authMiddleware, adminMiddleware, async (c) => {
  const [users] = await db.query('SELECT id, email, username, role FROM users') as any
  return c.json(users)
})

admin.delete('/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id')
  await db.query('DELETE FROM users WHERE id = ?', [id])
  return c.json({ message: 'User deleted' })
})

admin.get('/reports', authMiddleware, adminMiddleware, async (c) => {
  const [rows] = await db.query(`
    SELECT reports.*, users.username as reporter, videos.title as video_title
    FROM reports
    JOIN users ON reports.user_id = users.id
    JOIN videos ON reports.video_id = videos.id
    ORDER BY reports.created_at DESC
  `) as any
  return c.json(rows)
})

admin.delete('/reports/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id')
  await db.query('DELETE FROM reports WHERE id = ?', [id])
  return c.json({ message: 'Report dismissed' })
})

export default admin