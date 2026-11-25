// Aplica schema.sql una vez por proceso (en Vercel, en el primer request de cada instancia).
// El esquema es idempotente (CREATE ... IF NOT EXISTS), así que es seguro correrlo muchas veces.
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

let pendiente = null;

function asegurarEsquema() {
  if (!pendiente) {
    pendiente = (async () => {
      const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      const db = await pool.connect();
      try {
        await db.query('SELECT pg_advisory_lock(72200002)'); // evita que dos instancias lo apliquen a la vez
        await db.query(sql);
      } finally {
        await db.query('SELECT pg_advisory_unlock(72200002)').catch(() => {});
        db.release();
      }
    })().catch((err) => {
      pendiente = null; // reintentar en el próximo request
      throw err;
    });
  }
  return pendiente;
}

module.exports = { asegurarEsquema };
