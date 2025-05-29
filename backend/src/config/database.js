const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'contasync',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5433
});

// Verificación de conexión al iniciar
pool.on('connect', () => console.log('Conexión a PostgreSQL establecida'));
pool.on('error', (err) => console.error('Error en el pool de PostgreSQL:', err));

module.exports = pool;