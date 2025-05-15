const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'contasync',
  password: 'diana2000',
  port: 5432,
});

// ================== RUTAS EXISTENTES ==================

// Obtener usuarios con sus roles
app.get('/api/usuarios-con-roles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre, u.email, r.nombre as rol 
      FROM public.usuarios u
      LEFT JOIN public.roles r ON u.rol_id = r.id
      ORDER BY u.id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cargar usuarios' });
  }
});

// Obtener roles
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.roles ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar roles' });
  }
});



// ================== INICIO DE SERVIDOR ==================
app.listen(5000, () => {
  console.log('Backend ejecutándose en http://localhost:5000');
});
