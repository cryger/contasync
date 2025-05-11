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

// ================== NUEVAS RUTAS: FACTURAS ==================

// Obtener todas las facturas
app.get('/api/facturas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM facturas ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// Crear nueva factura
app.post('/api/facturas', async (req, res) => {
  const { cliente, nit, fecha, total } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO facturas (cliente, nit, fecha, total) VALUES ($1, $2, $3, $4) RETURNING *',
      [cliente, nit, fecha, total]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({ error: 'Error al crear factura' });
  }
});

// Actualizar factura
app.put('/api/facturas/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente, nit, fecha, total } = req.body;
  try {
    const result = await pool.query(
      'UPDATE facturas SET cliente = $1, nit = $2, fecha = $3, total = $4 WHERE id = $5 RETURNING *',
      [cliente, nit, fecha, total, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
});

// Eliminar factura
app.delete('/api/facturas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM facturas WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    res.status(500).json({ error: 'Error al eliminar factura' });
  }
});

// ================== INICIO DE SERVIDOR ==================
app.listen(5000, () => {
  console.log('Backend ejecutándose en http://localhost:5000');
});
