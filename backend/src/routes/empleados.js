const express = require('express');
const router = express.Router();
const pool = require("../config/database");

// Obtener todos los empleados
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM empleados ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener los empleados' });
  }
});

// Crear nuevo empleado
router.post('/', async (req, res) => {
  const { nombre, identificacion, cargo, salario, fecha_contratacion } = req.body;
  
  if (!nombre || !identificacion || !salario || !fecha_contratacion) {
    return res.status(400).json({ error: 'Nombre, identificación, salario y fecha de contratación son campos requeridos' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO empleados 
      (nombre, identificacion, cargo, salario, fecha_contratacion) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, identificacion, cargo, salario, fecha_contratacion]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json({ error: 'Ya existe un empleado con esta identificación' });
    }
    res.status(500).json({ error: 'Error al crear el empleado' });
  }
});

// Actualizar empleado
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, identificacion, cargo, salario, fecha_contratacion } = req.body;

  if (!nombre || !identificacion || !salario || !fecha_contratacion) {
    return res.status(400).json({ error: 'Nombre, identificación, salario y fecha de contratación son campos requeridos' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE empleados SET 
      nombre = $1, 
      identificacion = $2, 
      cargo = $3, 
      salario = $4, 
      fecha_contratacion = $5 
      WHERE id = $6 RETURNING *`,
      [nombre, identificacion, cargo, salario, fecha_contratacion, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un empleado con esta identificación' });
    }
    res.status(500).json({ error: 'Error al actualizar el empleado' });
  }
});

// Eliminar empleado
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { rowCount } = await pool.query('DELETE FROM empleados WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ error: 'Error al eliminar el empleado' });
  }
});

module.exports = router;