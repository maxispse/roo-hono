import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { z } from 'zod'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { db } from '../db/db-example.js'
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js'
import { broadcast, createNotification, getFreshUsername } from '../helpers/notifications.js'
import jwt from 'jsonwebtoken'

type Variables = {
  user: any
}

const subscriptions = new Hono<{ Variables: Variables }>()

subscriptions.get('/following', authMiddleware, async (c) => {
  const user = c.get('user')
  const [rows] = await db.query(`
    SELECT users.id, users.username, users.avatar
    FROM subscriptions
    JOIN users ON subscriptions.channel_id = users.id
    WHERE subscriptions.subscriber_id = ?
  `, [user.id]) as any
  return c.json(rows)
})

subscriptions.get('/count/:username', async (c) => {
  const username = c.req.param('username')
  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]) as any
  const channel = rows[0]
  if (!channel) return c.json({ count: 0 })
  const [countRows] = await db.query('SELECT COUNT(*) as count FROM subscriptions WHERE channel_id = ?', [channel.id]) as any
  return c.json({ count: countRows[0].count })
})

subscriptions.get('/check/:username', authMiddleware, async (c) => {
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

subscriptions.post('/:username', authMiddleware, async (c) => {
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

subscriptions.delete('/:username', authMiddleware, async (c) => {
  const user = c.get('user')
  const username = c.req.param('username')
  const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]) as any
  const channel = rows[0]
  if (!channel) return c.json({ error: 'User not found' }, 404)
  await db.query('DELETE FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?', [user.id, channel.id])
  return c.json({ message: 'Unsubscribed' })
})

export default subscriptions