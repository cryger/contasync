const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener todos los estados financieros con datos del balance asociado
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ef.*, b.ingresos, b.gastos, b.utilidad
      FROM estados_financieros ef
      LEFT JOIN balance b ON ef.balance_id = b.id
      ORDER BY ef.fecha DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estados financieros' });
  }
});

// Crear nuevo estado financiero
router.post('/', async (req, res) => {
  const { balance_id, tipo, fecha, descripcion } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO estados_financieros 
       (balance_id, tipo, fecha, descripcion) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [balance_id || null, tipo, fecha || new Date(), descripcion || null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear estado financiero' });
  }
});

// Actualizar estado financiero
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { balance_id, tipo, fecha, descripcion } = req.body;

  try {
    const { rowCount } = await pool.query(
      `UPDATE estados_financieros 
       SET balance_id=$1, tipo=$2, fecha=$3, descripcion=$4 
       WHERE id=$5`,
      [balance_id || null, tipo, fecha, descripcion || null, id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Estado financiero no encontrado' });
    }
    res.json({ message: 'Estado financiero actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar estado financiero' });
  }
});

// Eliminar estado financiero
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM estados_financieros WHERE id=$1', 
      [id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Estado financiero no encontrado' });
    }
    res.json({ message: 'Estado financiero eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar estado financiero' });
  }
});

module.exports = router;