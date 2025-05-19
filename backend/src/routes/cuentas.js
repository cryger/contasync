const express = require('express');
const router = express.Router();
const pool = require("../config/database");
const { check, validationResult } = require('express-validator');

// Obtener todas las cuentas
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT c.*, b.nombre AS banco_nombre 
      FROM cuentas c
      LEFT JOIN bancos b ON c.banco_id = b.id
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las cuentas' });
  }
});

// Obtener una cuenta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM cuentas WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la cuenta' });
  }
});

// Crear una nueva cuenta
router.post('/', [
  check('numero_cuenta').notEmpty().withMessage('El número de cuenta es requerido'),
  check('tipo_cuenta').isIn(['Ahorro', 'Corriente']).withMessage('Tipo de cuenta inválido'),
  check('banco_id').isInt().withMessage('El ID del banco debe ser un número entero'),
  check('saldo_actual').isFloat({ min: 0 }).withMessage('El saldo debe ser un número positivo')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { numero_cuenta, tipo_cuenta, banco_id, saldo_actual } = req.body;
    
    // Verificar si el número de cuenta ya existe
    const cuentaExistente = await pool.query(
      'SELECT id FROM cuentas WHERE numero_cuenta = $1',
      [numero_cuenta]
    );
    
    if (cuentaExistente.rows.length > 0) {
      return res.status(400).json({ error: 'El número de cuenta ya existe' });
    }

    const { rows } = await pool.query(
      'INSERT INTO cuentas (numero_cuenta, tipo_cuenta, banco_id, saldo_actual) VALUES ($1, $2, $3, $4) RETURNING *',
      [numero_cuenta, tipo_cuenta, banco_id, saldo_actual]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la cuenta' });
  }
});

// Actualizar una cuenta
router.put('/:id', [
  check('numero_cuenta').notEmpty().withMessage('El número de cuenta es requerido'),
  check('tipo_cuenta').isIn(['Ahorro', 'Corriente']).withMessage('Tipo de cuenta inválido'),
  check('banco_id').isInt().withMessage('El ID del banco debe ser un número entero'),
  check('saldo_actual').isFloat({ min: 0 }).withMessage('El saldo debe ser un número positivo')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { numero_cuenta, tipo_cuenta, banco_id, saldo_actual } = req.body;
    
    // Verificar si el número de cuenta ya existe en otra cuenta
    const cuentaExistente = await pool.query(
      'SELECT id FROM cuentas WHERE numero_cuenta = $1 AND id != $2',
      [numero_cuenta, id]
    );
    
    if (cuentaExistente.rows.length > 0) {
      return res.status(400).json({ error: 'El número de cuenta ya existe en otra cuenta' });
    }

    const { rows } = await pool.query(
      'UPDATE cuentas SET numero_cuenta = $1, tipo_cuenta = $2, banco_id = $3, saldo_actual = $4 WHERE id = $5 RETURNING *',
      [numero_cuenta, tipo_cuenta, banco_id, saldo_actual, id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la cuenta' });
  }
});

// Eliminar una cuenta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM cuentas WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    
    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la cuenta' });
  }
});

module.exports = router;