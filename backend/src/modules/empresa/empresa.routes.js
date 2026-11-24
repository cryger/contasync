const router = require('express').Router();
const pool = require('../../config/db');
const { asyncHandler } = require('../../shared/http');
const v = require('../../shared/validate');

const CAMPOS = {
  razon_social: (x) => v.requireText(x, 'razón social'),
  nit: (x) => v.requireText(x, 'NIT'),
  direccion: v.optionalText,
  telefono: v.optionalText,
  email: v.optionalText,
  prefijo_factura: (x) => v.requireText(x, 'prefijo'),
  siguiente_numero: (x) => v.requireNumber(x, 'siguiente número', { min: 1 }),
  resolucion: v.optionalText,
  iva_por_defecto: (x) => v.requireNumber(x, 'IVA por defecto', { min: 0 }),
  pie_factura: v.optionalText,
};

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM empresa WHERE id = 1');
  res.json(rows[0]);
}));

router.put('/', asyncHandler(async (req, res) => {
  const cols = Object.keys(CAMPOS).filter((c) => c in req.body);
  const valores = cols.map((c) => CAMPOS[c](req.body[c]));
  if (!cols.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
  const { rows } = await pool.query(
    `UPDATE empresa SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} WHERE id = 1 RETURNING *`,
    valores,
  );
  res.json(rows[0]);
}));

module.exports = router;
