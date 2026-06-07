import { getCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'

export const JWT_SECRET = 'your-secret-key'

export const authMiddleware = async (c: any, next: any) => {
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

export const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('user')
  if (!user || user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  await next()
}