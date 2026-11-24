const { HttpError } = require('./http');

/** Convierte "$ 1.250.000" o "1250000.5" en número. Devuelve NaN si no es válido. */
function toNumber(value) {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined || value === '') return NaN;
  let s = String(value).replace(/[^\d.,-]/g, '');
  if (s.includes(',')) {
    // Formato colombiano: 1.250.000,50 → puntos de miles, coma decimal
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    // 1.500.000 → solo puntos de miles
    s = s.replace(/\./g, '');
  }
  return s === '' ? NaN : Number(s);
}

function requireText(value, campo) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `El campo "${campo}" es obligatorio`);
  }
  return value.trim();
}

function optionalText(value) {
  if (value === undefined || value === null) return null;
  const v = String(value).trim();
  return v === '' ? null : v;
}

function requireNumber(value, campo, { min, allowZero = true } = {}) {
  const n = toNumber(value);
  if (!Number.isFinite(n)) throw new HttpError(400, `El campo "${campo}" debe ser numérico`);
  if (min !== undefined && n < min) throw new HttpError(400, `El campo "${campo}" debe ser mayor o igual a ${min}`);
  if (!allowZero && n === 0) throw new HttpError(400, `El campo "${campo}" no puede ser 0`);
  return n;
}

function optionalDate(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new HttpError(400, `Fecha inválida: ${value} (usa AAAA-MM-DD)`);
  return value;
}

function oneOf(value, opciones, campo, porDefecto) {
  if (value === undefined || value === null || value === '') return porDefecto;
  if (!opciones.includes(value)) {
    throw new HttpError(400, `"${campo}" debe ser uno de: ${opciones.join(', ')}`);
  }
  return value;
}

module.exports = { toNumber, requireText, optionalText, requireNumber, optionalDate, oneOf };
