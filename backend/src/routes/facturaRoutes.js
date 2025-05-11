const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener todas las facturas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM facturas ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener facturas:', err);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// Crear una nueva factura
router.post('/', async (req, res) => {
  const { cliente, nit, fecha, total } = req.body;
  
  if (!cliente || !nit || !fecha || total === undefined) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO facturas (cliente, nit, fecha, total) VALUES ($1, $2, $3, $4) RETURNING *',
      [cliente, nit, fecha, parseFloat(total)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear factura:', err);
    res.status(500).json({ error: 'Error al crear factura' });
  }
});

// Actualizar factura
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente, nit, fecha, total } = req.body;

  if (!cliente || !nit || !fecha || total === undefined) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const result = await pool.query(
      'UPDATE facturas SET cliente = $1, nit = $2, fecha = $3, total = $4 WHERE id = $5 RETURNING *',
      [cliente, nit, fecha, parseFloat(total), id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar factura:', err);
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si la factura existe
    const existe = await pool.query('SELECT id FROM facturas WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Eliminar la factura
    await pool.query('DELETE FROM facturas WHERE id = $1', [id]);
    
    // Respuesta exitosa sin contenido
    res.status(204).end();
  } catch (err) {
    console.error('Error al eliminar factura:', err);
    res.status(500).json({ error: 'Error al eliminar factura' });
  }
});

module.exports = router;