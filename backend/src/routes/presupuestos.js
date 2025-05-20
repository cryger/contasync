const express = require('express');
const router = express.Router();
const pool = require("../config/database");

// Obtener todos los presupuestos con información de centros de costos
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT p.*, c.nombre as centro_costo_nombre 
      FROM presupuestos p
      LEFT JOIN centros_costos c ON p.centro_costo_id = c.id
      ORDER BY p.id
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    res.status(500).json({ error: 'Error al obtener presupuestos' });
  }
});

// Crear nuevo presupuesto
router.post('/', async (req, res) => {
  const { nombre, monto_total, fecha_inicio, fecha_fin, centro_costo_id } = req.body;

  // Validaciones básicas
  if (!nombre || !monto_total || !fecha_inicio || !fecha_fin || !centro_costo_id) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  if (new Date(fecha_fin) < new Date(fecha_inicio)) {
    return res.status(400).json({ error: 'La fecha fin no puede ser anterior a la fecha inicio' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO presupuestos 
      (nombre, monto_total, fecha_inicio, fecha_fin, centro_costo_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [nombre, monto_total, fecha_inicio, fecha_fin, centro_costo_id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un presupuesto con este nombre' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: 'El centro de costo no existe' });
    }
    console.error('Error al crear presupuesto:', error);
    res.status(500).json({ error: 'Error al crear presupuesto' });
  }
});

// Actualizar presupuesto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, monto_total, fecha_inicio, fecha_fin, centro_costo_id } = req.body;

  if (!nombre || !monto_total || !fecha_inicio || !fecha_fin || !centro_costo_id) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE presupuestos 
      SET nombre = $1, monto_total = $2, fecha_inicio = $3, fecha_fin = $4, centro_costo_id = $5
      WHERE id = $6
      RETURNING *`,
      [nombre, monto_total, fecha_inicio, fecha_fin, centro_costo_id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un presupuesto con este nombre' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: 'El centro de costo no existe' });
    }
    console.error('Error al actualizar presupuesto:', error);
    res.status(500).json({ error: 'Error al actualizar presupuesto' });
  }
});

// Eliminar presupuesto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM presupuestos WHERE id = $1',
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    res.json({ message: 'Presupuesto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    res.status(500).json({ error: 'Error al eliminar presupuesto' });
  }
});

module.exports = router;