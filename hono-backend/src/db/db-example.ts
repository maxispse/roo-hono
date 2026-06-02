import mysql from 'mysql2/promise'

export const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',        // XAMPP default is empty
  database: 'scroll tube'
})