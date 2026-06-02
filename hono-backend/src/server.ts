import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import app from './index'

app.use('/uploads/*', serveStatic({ root: './' }))

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})