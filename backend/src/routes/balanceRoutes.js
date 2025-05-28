const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Asume que usas PostgreSQL directamente

// Obtener todos los balances
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT b.*, p.nombre as presupuesto_nombre 
      FROM balance b
      LEFT JOIN presupuestos p ON b.presupuesto_id = p.id
      ORDER BY b.fecha DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener balances' });
  }
});

// Crear nuevo balance
router.post('/', async (req, res) => {
  const { fecha, ingresos, gastos, presupuesto_id } = req.body;
  const utilidad = ingresos - gastos;

  try {
    const { rows } = await pool.query(
      'INSERT INTO balance (fecha, ingresos, gastos, utilidad, presupuesto_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [fecha || new Date(), ingresos, gastos, utilidad, presupuesto_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear balance' });
  }
});

// Actualizar balance
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha, ingresos, gastos, presupuesto_id } = req.body;
  const utilidad = ingresos - gastos;

  try {
    const { rowCount } = await pool.query(
      'UPDATE balance SET fecha=$1, ingresos=$2, gastos=$3, utilidad=$4, presupuesto_id=$5 WHERE id=$6',
      [fecha, ingresos, gastos, utilidad, presupuesto_id || null, id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Balance no encontrado' });
    }
    res.json({ message: 'Balance actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar balance' });
  }
});

// Eliminar balance
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM balance WHERE id=$1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Balance no encontrado' });
    }
    res.json({ message: 'Balance eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar balance' });
  }
});

module.exports = router;