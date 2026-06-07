import { Hono } from 'hono'
import { db } from '../db/db-example.js'
import { authMiddleware } from '../middleware/auth.js'
import { clients } from '../helpers/notifications.js'

type Variables = {
  user: any
}

const notifications = new Hono<{ Variables: Variables }>()

notifications.get('/unread', authMiddleware, async (c) => {
  const user = c.get('user')
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [user.id]
  ) as any
  return c.json({ count: rows[0].count })
})

notifications.patch('/read', authMiddleware, async (c) => {
  const user = c.get('user')
  await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [user.id])
  return c.json({ message: 'Notifications marked as read' })
})

notifications.patch('/:id/read', authMiddleware, async (c) => {
  const id = c.req.param('id')
  await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id])
  return c.json({ message: 'Notification marked as read' })
})

notifications.get('/', authMiddleware, async (c) => {
  const user = c.get('user')
  const [rows] = await db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [user.id]
  ) as any
  return c.json(rows)
})

export default notifications