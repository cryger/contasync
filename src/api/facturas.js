const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL - ajusta estos valores
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'contasync',
  password: '123456',
  port: 5433,
});

// Middleware para manejar errores
const handleErrors = (res, error) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
};

// GET todas las facturas
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM recibos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    handleErrors(res, error);
  }
});

// GET una factura por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM recibos WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    handleErrors(res, error);
  }
});

// POST crear nueva factura
router.post('/', async (req, res) => {
  const { ingreso_id, gasto_id, fecha, monto } = req.body;
  
  // Validación básica
  if (!ingreso_id || !gasto_id || !fecha || !monto) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO recibos (ingreso_id, gasto_id, fecha, monto) VALUES ($1, $2, $3, $4) RETURNING *',
      [ingreso_id, gasto_id, fecha, monto]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    handleErrors(res, error);
  }
});

// PUT actualizar factura
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { ingreso_id, gasto_id, fecha, monto } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE recibos SET ingreso_id = $1, gasto_id = $2, fecha = $3, monto = $4 WHERE id = $5 RETURNING *',
      [ingreso_id, gasto_id, fecha, monto, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    handleErrors(res, error);
  }
});

// DELETE eliminar factura
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM recibos WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    res.status(204).send();
  } catch (error) {
    handleErrors(res, error);
  }
});

module.exports = router;