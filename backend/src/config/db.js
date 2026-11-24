const { Pool, types } = require('pg');
require('dotenv').config();

// NUMERIC llega como string desde pg; lo convertimos a número para la API
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
// DATE se devuelve tal cual (YYYY-MM-DD) para evitar corrimientos de zona horaria
types.setTypeParser(1082, (v) => v);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'contasync_facturacion',
});

pool.on('error', (err) => console.error('Error en el pool de PostgreSQL:', err.message));

/** Ejecuta fn(client) dentro de una transacción. */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = pool;
module.exports.withTransaction = withTransaction;
