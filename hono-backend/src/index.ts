import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from './db/db-example.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const app = new Hono()
const JWT_SECRET = 'your-secret-key' // change this to something long and random

app.use('*', cors())

app.get('/', (c) => {
  return c.json({ message: 'ScrollTube API running' })
})

app.get('/videos', async (c) => {
  const [videos] = await db.query('SELECT * FROM videos')
  return c.json(videos)
})

app.get('/videos/:id', async (c) => {
  const id = c.req.param('id')
  const [rows] = await db.query('SELECT * FROM videos WHERE id = ?', [id]) as any
  return c.json(rows[0])
})

// Register
app.post('/auth/register', async (c) => {
  const { email, username, password } = await c.req.json()
  const hashed = await bcrypt.hash(password, 10)
  
  try {
    await db.query(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashed]
    )
    return c.json({ message: 'User created' })
  } catch (err) {
    return c.json({ error: 'Email already exists' }, 400)
  }
})

// Login
app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]) as any
  const user = rows[0]

  if (!user) return c.json({ error: 'User not found' }, 404)

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return c.json({ error: 'Wrong password' }, 401)

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
  return c.json({ token, username: user.username })
})

export default app