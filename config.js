/**
 * Ingeniria de Software
 * 04/04/2021
 * 
 * Arturo Ortega Robles
 * Diego Antonio Paredes
 */
require('dotenv').config()

module.exports = {
  port: process.env.PORT || 8080,
  secretKey: process.env.SECRET_KEY || 'secret',
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_DATABASE || 'software',
    password: process.env.DB_PASSWORD || '',
  }
}