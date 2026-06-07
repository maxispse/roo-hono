import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from '../db/db-example.js'
import { JWT_SECRET } from '../middleware/auth.js'

const auth = new Hono()

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
})

auth.post('/register', async (c) => {
  const body = await c.req.json()
  const result = registerSchema.safeParse(body)
  if (!result.success) return c.json({ error: result.error.errors[0].message }, 400)

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

auth.post('/login', async (c) => {
  const body = await c.req.json()
  const result = loginSchema.safeParse(body)
  if (!result.success) return c.json({ error: result.error.errors[0].message }, 400)

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

auth.post('/logout', (c) => {
  deleteCookie(c, 'token')
  return c.json({ message: 'Logged out' })
})

auth.get('/me', async (c) => {
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

export default auth