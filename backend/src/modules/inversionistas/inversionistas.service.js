const pool = require('../../config/db');
const { HttpError } = require('../../shared/http');
const v = require('../../shared/validate');
const { calcularReparto } = require('./inversionistas.calculos');
const { resumenPeriodo } = require('../dashboard/dashboard.service');

async function listar() {
  const { rows } = await pool.query(`
    SELECT i.*, COALESCE(SUM(a.monto), 0)::numeric AS capital, COUNT(a.id)::int AS num_aportes
    FROM inversionistas i
    LEFT JOIN aportes a ON a.inversionista_id = i.id
    GROUP BY i.id
    ORDER BY i.nombre`);
  return rows;
}

async function listarAportes(inversionistaId) {
  const { rows } = await pool.query(
    'SELECT * FROM aportes WHERE inversionista_id = $1 ORDER BY fecha DESC, id DESC',
    [inversionistaId],
  );
  return rows;
}

async function crearAporte(inversionistaId, body) {
  const existe = await pool.query('SELECT 1 FROM inversionistas WHERE id = $1', [inversionistaId]);
  if (!existe.rowCount) throw new HttpError(404, 'Inversionista no encontrado');
  const { rows } = await pool.query(
    `INSERT INTO aportes (inversionista_id, fecha, monto, nota)
     VALUES ($1, COALESCE($2::date, CURRENT_DATE), $3, $4) RETURNING *`,
    [inversionistaId, v.optionalDate(body.fecha),
      v.requireNumber(body.monto, 'monto', { allowZero: false }), v.optionalText(body.nota)],
  );
  return rows[0];
}

async function eliminarAporte(aporteId) {
  const { rowCount } = await pool.query('DELETE FROM aportes WHERE id = $1', [aporteId]);
  if (!rowCount) throw new HttpError(404, 'Aporte no encontrado');
}

/**
 * Reparto de utilidades del periodo [desde, hasta].
 * El capital de cada inversionista es la suma de sus aportes hasta la fecha "hasta".
 * criterio: 'causado' (todas las facturas no anuladas) | 'recaudado' (solo pagadas)
 */
async function reparto({ desde, hasta, criterio = 'causado' } = {}) {
  const d = v.optionalDate(desde);
  const h = v.optionalDate(hasta);
  const crit = v.oneOf(criterio, ['causado', 'recaudado'], 'criterio', 'causado');

  const resumen = await resumenPeriodo({ desde: d, hasta: h, criterio: crit });
  const { rows } = await pool.query(`
    SELECT i.id, i.nombre, i.identificacion, COALESCE(SUM(a.monto), 0)::numeric AS capital
    FROM inversionistas i
    LEFT JOIN aportes a ON a.inversionista_id = i.id AND ($1::date IS NULL OR a.fecha <= $1::date)
    WHERE i.activo
    GROUP BY i.id`, [h]);

  return {
    periodo: { desde: d, hasta: h, criterio: crit },
    ingresos: resumen.ingresos,
    gastos: resumen.gastos,
    ...calcularReparto(resumen.utilidad, rows),
  };
}

module.exports = { listar, listarAportes, crearAporte, eliminarAporte, reparto };
