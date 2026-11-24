const pool = require('../../config/db');
const { redondear } = require('../facturas/facturas.calculos');

/**
 * Ingresos (base sin IVA, menos descuentos), gastos y utilidad de un periodo.
 * El IVA no es ingreso de la empresa: se recauda para la DIAN.
 */
async function resumenPeriodo({ desde = null, hasta = null, criterio = 'causado' } = {}) {
  const estados = criterio === 'recaudado' ? ['pagada'] : ['pagada', 'pendiente'];
  const { rows: [f] } = await pool.query(`
    SELECT COALESCE(SUM(subtotal - descuento), 0)::numeric AS ingresos,
           COALESCE(SUM(iva), 0)::numeric AS iva,
           COALESCE(SUM(total), 0)::numeric AS facturado,
           COUNT(*)::int AS num_facturas
    FROM facturas
    WHERE estado = ANY($1) AND ($2::date IS NULL OR fecha >= $2) AND ($3::date IS NULL OR fecha <= $3)`,
  [estados, desde, hasta]);
  const { rows: [g] } = await pool.query(`
    SELECT COALESCE(SUM(monto), 0)::numeric AS gastos FROM gastos
    WHERE ($1::date IS NULL OR fecha >= $1) AND ($2::date IS NULL OR fecha <= $2)`,
  [desde, hasta]);

  return {
    ingresos: f.ingresos,
    iva: f.iva,
    facturado: f.facturado,
    num_facturas: f.num_facturas,
    gastos: g.gastos,
    utilidad: redondear(f.ingresos - g.gastos),
  };
}

async function dashboard({ desde, hasta } = {}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const inicioMes = `${hoy.slice(0, 7)}-01`;
  const d = desde || inicioMes;
  const h = hasta || hoy;

  const [periodo, porCobrar, ventasDiarias, topClientes, ultimas] = await Promise.all([
    resumenPeriodo({ desde: d, hasta: h }),
    pool.query(`SELECT COALESCE(SUM(total), 0)::numeric AS total, COUNT(*)::int AS cantidad
                FROM facturas WHERE estado = 'pendiente'`),
    pool.query(`SELECT fecha, SUM(total)::numeric AS total, COUNT(*)::int AS cantidad
                FROM facturas WHERE estado <> 'anulada' AND fecha BETWEEN $1 AND $2
                GROUP BY fecha ORDER BY fecha`, [d, h]),
    pool.query(`SELECT c.id, c.nombre, SUM(f.total)::numeric AS total, COUNT(*)::int AS facturas
                FROM facturas f JOIN clientes c ON c.id = f.cliente_id
                WHERE f.estado <> 'anulada' AND f.fecha BETWEEN $1 AND $2
                GROUP BY c.id ORDER BY total DESC LIMIT 5`, [d, h]),
    pool.query(`SELECT f.id, f.numero, f.fecha, f.total, f.estado, c.nombre AS cliente_nombre
                FROM facturas f JOIN clientes c ON c.id = f.cliente_id
                ORDER BY f.id DESC LIMIT 8`),
  ]);

  return {
    periodo: { desde: d, hasta: h },
    ...periodo,
    por_cobrar: porCobrar.rows[0],
    ventas_diarias: ventasDiarias.rows,
    top_clientes: topClientes.rows,
    ultimas_facturas: ultimas.rows,
  };
}

module.exports = { resumenPeriodo, dashboard };
