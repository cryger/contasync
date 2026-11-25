const router = require('express').Router();
const pool = require('../../config/db');
const { asyncHandler } = require('../../shared/http');
const v = require('../../shared/validate');
const { HttpError } = require('../../shared/http');

const color = (campo) => (x) => {
  if (!/^#[0-9a-fA-F]{6}$/.test(x || '')) throw new HttpError(400, `"${campo}" debe ser un color en formato #RRGGBB`);
  return x.toLowerCase();
};

const MAX_LOGO = 400 * 1024; // caracteres del data URL
const logo = (x) => {
  if (x === null || x === undefined || x === '') return null;
  if (typeof x !== 'string' || !/^data:image\/(png|jpeg|webp);base64,/.test(x)) {
    throw new HttpError(400, 'El logo debe ser una imagen PNG, JPG o WEBP');
  }
  if (x.length > MAX_LOGO) throw new HttpError(400, 'El logo es muy pesado (máx. 400 KB)');
  return x;
};

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
  // Apariencia
  nombre_comercial: v.optionalText,
  color_acento: color('color de acento'),
  color_secundario: color('color secundario'),
  color_base: color('color base'),
  tema_modo: (x) => v.oneOf(x, ['dark', 'light'], 'modo', 'dark'),
  logo,
};

const { requireRol } = require('../auth/auth.middleware');

/** Público: solo lo necesario para pintar la pantalla de login con la marca del negocio */
const marca = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT razon_social, nombre_comercial, color_acento, color_secundario, color_base, tema_modo, logo
     FROM empresa WHERE id = 1`,
  );
  res.json(rows[0] || {});
});

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM empresa WHERE id = 1');
  res.json(rows[0]);
}));

router.put('/', requireRol('admin'), asyncHandler(async (req, res) => {
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
module.exports.marca = marca;
