// Crea la base de datos (si no existe) y aplica schema.sql.
// Uso: npm run db:init   (lee la conexión de backend/.env, no necesita psql)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
};
const nombreDb = process.env.DB_NAME || 'contasync_facturacion';

(async () => {
  // 1. Conectar a la base "postgres" para crear la nuestra si falta
  const admin = new Client({ ...config, database: 'postgres' });
  try {
    await admin.connect();
    const existe = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [nombreDb]);
    if (existe.rowCount) {
      console.log(`• La base "${nombreDb}" ya existe`);
    } else {
      await admin.query(`CREATE DATABASE "${nombreDb.replace(/"/g, '')}"`);
      console.log(`✔ Base "${nombreDb}" creada`);
    }
  } catch (err) {
    console.error(`✖ No pude conectar a PostgreSQL en ${config.host}:${config.port} como "${config.user}"`);
    console.error('  ', err.message);
    console.error('  Revisa DB_PORT y DB_PASSWORD en backend/.env y que el servicio de PostgreSQL esté corriendo.');
    process.exit(1);
  } finally {
    await admin.end().catch(() => {});
  }

  // 2. Aplicar el esquema
  const db = new Client({ ...config, database: nombreDb });
  try {
    await db.connect();
    await db.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    console.log('✔ Tablas listas. Ya puedes correr: npm run dev');
  } catch (err) {
    console.error('✖ Error aplicando el esquema:', err.message);
    process.exitCode = 1;
  } finally {
    await db.end().catch(() => {});
  }
})();
