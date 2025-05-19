const express = require('express');
const router = express.Router();
const pool = require("../config/database");


// Obtener todos los bancos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bancos ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener bancos:', error);
    res.status(500).json({ error: 'Error al obtener los bancos' });
  }
});

// Crear nuevo banco
router.post('/', async (req, res) => {
  const { nombre, pais, ciudad } = req.body;
  
  try {
    const { rows } = await pool.query(
      'INSERT INTO bancos (nombre, pais, ciudad) VALUES ($1, $2, $3) RETURNING *',
      [nombre, pais, ciudad]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear banco:', error);
    res.status(500).json({ error: 'Error al crear el banco' });
  }
});

// Actualizar banco
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, pais, ciudad } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE bancos SET nombre = $1, pais = $2, ciudad = $3 WHERE id = $4 RETURNING *',
      [nombre, pais, ciudad, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Banco no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar banco:', error);
    res.status(500).json({ error: 'Error al actualizar el banco' });
  }
});

// Eliminar banco
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { rowCount } = await pool.query('DELETE FROM bancos WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Banco no encontrado' });
    }
    
    res.json({ message: 'Banco eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar banco:', error);
    res.status(500).json({ error: 'Error al eliminar el banco' });
  }
});

module.exports = router;