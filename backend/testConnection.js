const { Pool } = require('pg');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'contasync',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5433,
};

const pool = new Pool(config);

async function test() {
  let client;
  try {
    console.log('Intentando conectar a PostgreSQL...');
    client = await pool.connect();
    
    // 1. Verificar conexión básica
    const time = await client.query('SELECT NOW()');
    console.log('✅ Conexión exitosa. Hora del servidor:', time.rows[0].now);
    
    // 2. Verificar tabla roles
    const roles = await client.query('SELECT * FROM public.roles ORDER BY id ASC');
    console.log(`✅ Encontrados ${roles.rowCount} roles:`);
    console.log(roles.rows);
    
    // 3. Verificar permisos
    const user = await client.query('SELECT current_user');
    console.log('🔑 Usuario de conexión:', user.rows[0].current_user);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

test();