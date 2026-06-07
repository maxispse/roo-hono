import { db } from '../db/db-example.js'

export const clients = new Set<any>()

export function broadcast(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`
  clients.forEach((client) => {
    try {
      client.controller.enqueue(message)
    } catch {
      clients.delete(client)
    }
  })
}

export async function getFreshUsername(userId: number): Promise<string> {
  const [rows] = await db.query('SELECT username FROM users WHERE id = ?', [userId]) as any
  return rows[0].username
}

export async function createNotification(userId: number, type: string, message: string) {
  await db.query(
    'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
    [userId, type, message]
  )
  broadcast({ type: 'notification', userId })
}