import { db } from './db-example.js'

async function migrate() {
  console.log('Running migrations...')

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      avatar VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('✅ users table')

  await db.query(`
    CREATE TABLE IF NOT EXISTS videos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      url VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      username VARCHAR(255),
      views INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('✅ videos table')

  await db.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      subscriber_id INT NOT NULL,
      channel_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscriber_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (channel_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_subscription (subscriber_id, channel_id)
    )
  `)
  console.log('✅ subscriptions table')

  await db.query(`
    CREATE TABLE IF NOT EXISTS video_reactions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      video_id INT NOT NULL,
      type ENUM('like', 'dislike') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
      UNIQUE KEY unique_reaction (user_id, video_id)
    )
  `)
  console.log('✅ video_reactions table')

  await db.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      video_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
    )
  `)
  console.log('✅ comments table')

  await db.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      video_id INT NOT NULL,
      reason TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
    )
  `)
  console.log('✅ reports table')

  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      type ENUM('like', 'dislike', 'subscribe', 'report', 'comment') NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
  console.log('✅ notifications table')

  console.log('✅ All migrations done!')
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})