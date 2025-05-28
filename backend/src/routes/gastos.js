const express = require('express');
const router = express.Router();
const pool = require("../config/database");

// Helper para parsear valores monetarios
const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  return parseFloat(value.toString().replace(/[^\d.-]/g, '')) || 0;
};

// Obtener todos los gastos con información relacionada
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT g.*,
             p.nombre as proveedor_nombre,
             cc.nombre as centro_costo_nombre,
             pr.nombre as presupuesto_nombre,
             b.nombre as banco_nombre,
             cu.numero_cuenta
      FROM gastos g
      LEFT JOIN proveedores p ON g.proveedor_id = p.id
      LEFT JOIN centros_costos cc ON g.centro_costo_id = cc.id
      LEFT JOIN presupuestos pr ON g.presupuesto_id = pr.id
      LEFT JOIN bancos b ON g.banco_id = b.id
      LEFT JOIN cuentas cu ON g.cuenta_id = cu.id
      ORDER BY g.fecha DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
});

// Obtener un gasto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT g.*,
              p.nombre as proveedor_nombre,
              cc.nombre as centro_costo_nombre,
              pr.nombre as presupuesto_nombre,
              b.nombre as banco_nombre,
              cu.numero_cuenta
       FROM gastos g
       LEFT JOIN proveedores p ON g.proveedor_id = p.id
       LEFT JOIN centros_costos cc ON g.centro_costo_id = cc.id
       LEFT JOIN presupuestos pr ON g.presupuesto_id = pr.id
       LEFT JOIN bancos b ON g.banco_id = b.id
       LEFT JOIN cuentas cu ON g.cuenta_id = cu.id
       WHERE g.id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener gasto:', error);
    res.status(500).json({ error: 'Error al obtener gasto' });
  }
});

// Crear nuevo gasto
router.post('/', async (req, res) => {
  const { 
    fecha, 
    descripcion, 
    monto, 
    categoria, 
    metodo_pago,
    banco_id,
    cuenta_id,
    proveedor_id,
    centro_costo_id,
    presupuesto_id
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO gastos (
        fecha, descripcion, monto, categoria, metodo_pago,
        banco_id, cuenta_id, proveedor_id, centro_costo_id, presupuesto_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        fecha,
        descripcion,
        parseCurrency(monto),
        categoria,
        metodo_pago || 'Efectivo',
        banco_id || null,
        cuenta_id || null,
        proveedor_id || null,
        centro_costo_id || null,
        presupuesto_id || null
      ]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.status(500).json({ error: 'Error al crear gasto' });
  }
});

// Actualizar gasto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    fecha, 
    descripcion, 
    monto, 
    categoria, 
    metodo_pago,
    banco_id,
    cuenta_id,
    proveedor_id,
    centro_costo_id,
    presupuesto_id
  } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE gastos 
       SET fecha = $1, descripcion = $2, monto = $3, categoria = $4,
           metodo_pago = $5, banco_id = $6, cuenta_id = $7,
           proveedor_id = $8, centro_costo_id = $9, presupuesto_id = $10
       WHERE id = $11 RETURNING *`,
      [
        fecha,
        descripcion,
        parseCurrency(monto),
        categoria,
        metodo_pago || 'Efectivo',
        banco_id || null,
        cuenta_id || null,
        proveedor_id || null,
        centro_costo_id || null,
        presupuesto_id || null,
        id
      ]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    res.status(500).json({ error: 'Error al actualizar gasto' });
  }
});

// Eliminar gasto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM gastos WHERE id = $1',
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
});

module.exports = router;