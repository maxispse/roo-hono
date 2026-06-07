import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { clients } from './helpers/notifications.js'
import authRoutes from './routes/auth.js'
import videoRoutes from './routes/videos.js'
import userRoutes from './routes/users.js'
import subscriptionRoutes from './routes/subscriptions.js'
import notificationRoutes from './routes/notifications.js'
import adminRoutes from './routes/admin.js'

type Variables = {
  user: any
}

const app = new Hono<{ Variables: Variables }>()

app.use('*', cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.get('/', (c) => c.json({ message: 'ScrollTube API running' }))

// SSE
app.get('/sse', (c) => {
  const stream = new ReadableStream({
    start(controller) {
      const client = { controller }
      clients.add(client)
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
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

// delete comment
app.delete('/comments/:id', async (c) => {
  const id = c.req.param('id')
  const [rows] = await (await import('./db/db-example.js')).db.query('SELECT * FROM comments WHERE id = ?', [id]) as any
  if (!rows[0]) return c.json({ error: 'Comment not found' }, 404)
  await (await import('./db/db-example.js')).db.query('DELETE FROM comments WHERE id = ?', [id])
  return c.json({ message: 'Comment deleted' })
})

// mount routes
app.route('/auth', authRoutes)
app.route('/videos', videoRoutes)
app.route('/users', userRoutes)
app.route('/subscriptions', subscriptionRoutes)
app.route('/notifications', notificationRoutes)
app.route('/admin', adminRoutes)

export default app