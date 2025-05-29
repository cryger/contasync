const express = require('express');
const router = express.Router();
const pool = require("../config/database");

// Helper para parsear valores monetarios
const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  return parseFloat(value.toString().replace(/[^\d.-]/g, '')) || 0;
};

// Obtener todos los ingresos con información de cliente y banco
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT i.*, 
             c.nombre as cliente_nombre,
             b.nombre as banco_nombre,
             cu.numero_cuenta
      FROM ingresos i
      LEFT JOIN clientes c ON i.cliente_id = c.id
      LEFT JOIN bancos b ON i.banco_id = b.id
      LEFT JOIN cuentas cu ON i.cuenta_id = cu.id
      ORDER BY i.fecha DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
});

// Obtener un ingreso por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT i.*, 
              c.nombre as cliente_nombre,
              b.nombre as banco_nombre,
              cu.numero_cuenta
       FROM ingresos i
       LEFT JOIN clientes c ON i.cliente_id = c.id
       LEFT JOIN bancos b ON i.banco_id = b.id
       LEFT JOIN cuentas cu ON i.cuenta_id = cu.id
       WHERE i.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener ingreso:', error);
    res.status(500).json({ error: 'Error al obtener ingreso' });
  }
});

// Crear nuevo ingreso
router.post('/', async (req, res) => {
  const {
    cliente_id,
    fecha,
    valor_recibido,
    banco_id,
    cuenta_id,
    numero_recibo,
    saldo_anterior,
    saldo_en_caja,
    total_ingresos
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO ingresos (
        cliente_id, fecha, valor_recibido, banco_id, cuenta_id,
        numero_recibo, saldo_anterior, saldo_en_caja, total_ingresos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        cliente_id || null,
        fecha,
        parseCurrency(valor_recibido),
        banco_id || null,
        cuenta_id || null,
        numero_recibo,
        parseCurrency(saldo_anterior),
        parseCurrency(saldo_en_caja),
        parseCurrency(total_ingresos)
      ]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear ingreso:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Número de recibo ya existe' });
    }
    
    res.status(500).json({ error: 'Error al crear ingreso' });
  }
});

// Actualizar ingreso
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    cliente_id,
    fecha,
    valor_recibido,
    banco_id,
    cuenta_id,
    numero_recibo,
    saldo_anterior,
    saldo_en_caja,
    total_ingresos
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE ingresos 
       SET cliente_id = $1, fecha = $2, valor_recibido = $3, banco_id = $4,
           cuenta_id = $5, numero_recibo = $6, saldo_anterior = $7,
           saldo_en_caja = $8, total_ingresos = $9
       WHERE id = $10 RETURNING *`,
      [
        cliente_id || null,
        fecha,
        parseCurrency(valor_recibido),
        banco_id || null,
        cuenta_id || null,
        numero_recibo,
        parseCurrency(saldo_anterior),
        parseCurrency(saldo_en_caja),
        parseCurrency(total_ingresos),
        id
      ]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar ingreso:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Número de recibo ya existe' });
    }
    
    res.status(500).json({ error: 'Error al actualizar ingreso' });
  }
});

// Eliminar ingreso
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM ingresos WHERE id = $1',
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar ingreso:', error);
    res.status(500).json({ error: 'Error al eliminar ingreso' });
  }
});

module.exports = router;