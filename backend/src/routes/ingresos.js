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

module.exports = router;