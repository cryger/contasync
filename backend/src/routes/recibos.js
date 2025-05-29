const express = require('express');
const router = express.Router();
const pool = require("../config/database");

// Helper para parsear valores monetarios
const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  return parseFloat(value.toString().replace(/[^\d.-]/g, '')) || 0;
};

// Obtener todos los recibos con información relacionada
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT r.*, 
             i.numero_recibo as ingreso_numero,
             g.descripcion as gasto_descripcion
      FROM recibos r
      LEFT JOIN ingresos i ON r.ingreso_id = i.id
      LEFT JOIN gastos g ON r.gasto_id = g.id
      ORDER BY r.fecha DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener recibos:', error);
    res.status(500).json({ error: 'Error al obtener recibos' });
  }
});

// Obtener un recibo por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT r.*, 
              i.numero_recibo as ingreso_numero,
              g.descripcion as gasto_descripcion
       FROM recibos r
       LEFT JOIN ingresos i ON r.ingreso_id = i.id
       LEFT JOIN gastos g ON r.gasto_id = g.id
       WHERE r.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recibo no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener recibo:', error);
    res.status(500).json({ error: 'Error al obtener recibo' });
  }
});

// Crear nuevo recibo
router.post('/', async (req, res) => {
  const { ingreso_id, gasto_id, fecha, monto } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO recibos (ingreso_id, gasto_id, fecha, monto)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        ingreso_id || null,
        gasto_id || null,
        fecha,
        parseCurrency(monto)
      ]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear recibo:', error);
    res.status(500).json({ error: 'Error al crear recibo' });
  }
});

// Actualizar recibo
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { ingreso_id, gasto_id, fecha, monto } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE recibos 
       SET ingreso_id = $1, gasto_id = $2, fecha = $3, monto = $4
       WHERE id = $5 RETURNING *`,
      [
        ingreso_id || null,
        gasto_id || null,
        fecha,
        parseCurrency(monto),
        id
      ]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recibo no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar recibo:', error);
    res.status(500).json({ error: 'Error al actualizar recibo' });
  }
});

// Eliminar recibo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM recibos WHERE id = $1',
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Recibo no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar recibo:', error);
    res.status(500).json({ error: 'Error al eliminar recibo' });
  }
});

module.exports = router;