const express = require('express');
const router = express.Router();
const pool = require("../config/database");

// Obtener todos los centros de costos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM centros_costos ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener centros de costos:', error);
    res.status(500).json({ message: 'Error al obtener centros de costos' });
  }
});

// Crear un nuevo centro de costos
router.post('/', async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO centros_costos (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json({ message: 'Ya existe un centro de costos con este nombre' });
    }
    console.error('Error al crear centro de costos:', error);
    res.status(500).json({ message: 'Error al crear centro de costos' });
  }
});

// Actualizar un centro de costos
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE centros_costos SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Centro de costos no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Ya existe un centro de costos con este nombre' });
    }
    console.error('Error al actualizar centro de costos:', error);
    res.status(500).json({ message: 'Error al actualizar centro de costos' });
  }
});

// Eliminar un centro de costos
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query('DELETE FROM centros_costos WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Centro de costos no encontrado' });
    }
    
    res.json({ message: 'Centro de costos eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar centro de costos:', error);
    res.status(500).json({ message: 'Error al eliminar centro de costos' });
  }
});

module.exports = router;