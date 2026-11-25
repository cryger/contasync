const pool = require('../../config/db');
const { withTransaction } = require('../../config/db');
const { HttpError } = require('../../shared/http');
const v = require('../../shared/validate');
const { calcularFactura } = require('../facturas/facturas.calculos');
const facturas = require('../facturas/facturas.service');
const f = require('./cobros.fechas');

/* ---------- Validación ---------- */
function leerItems(items) {
  if (!Array.isArray(items) || !items.length) throw new HttpError(400, 'El plan debe tener al menos un ítem');
  return items.map((it, i) => ({
    producto_id: it.producto_id ? Number(it.producto_id) : null,
    descripcion: v.requireText(it.descripcion, `descripción del ítem ${i + 1}`),
    cantidad: v.requireNumber(it.cantidad, `cantidad del ítem ${i + 1}`, { min: 0, allowZero: false }),
    precio_unitario: v.requireNumber(it.precio_unitario, `precio del ítem ${i + 1}`, { min: 0 }),
    descuento_porcentaje: it.descuento_porcentaje ? v.requireNumber(it.descuento_porcentaje, 'descuento', { min: 0 }) : 0,
    iva_porcentaje: it.iva_porcentaje ? v.requireNumber(it.iva_porcentaje, 'IVA', { min: 0 }) : 0,
  }));
}

function leerPlan(body) {
  const dia = v.requireNumber(body.dia_facturacion, 'día de cobro', { min: 1 });
  if (dia > 28 || !Number.isInteger(dia)) throw new HttpError(400, 'El día de cobro debe estar entre 1 y 28');
  const plazo = body.dias_plazo === undefined || body.dias_plazo === '' ? 10 : v.requireNumber(body.dias_plazo, 'días de plazo', { min: 0 });
  if (plazo > 90) throw new HttpError(400, 'El plazo máximo es de 90 días');
  if (!body.cliente_id) throw new HttpError(400, 'Selecciona el cliente');
  return {
    cliente_id: Number(body.cliente_id),
    nombre: v.requireText(body.nombre, 'concepto'),
    dia_facturacion: dia,
    dias_plazo: Math.round(plazo),
    fecha_inicio: v.optionalDate(body.fecha_inicio) || f.hoyLocal(),
    fecha_fin: v.optionalDate(body.fecha_fin),
    activo: body.activo !== false && body.activo !== 'false',
    notas: v.optionalText(body.notas),
    items: leerItems(body.items),
  };
}

/* ---------- Consultas ---------- */
async function itemsDe(ids) {
  if (!ids.length) return {};
  const { rows } = await pool.query(
    'SELECT * FROM suscripcion_items WHERE suscripcion_id = ANY($1) ORDER BY id', [ids],
  );
  return rows.reduce((acc, it) => ((acc[it.suscripcion_id] ||= []).push(it), acc), {});
}

const conResumen = (sus, items = []) => {
  const calc = calcularFactura(items);
  return { ...sus, items, total_mensual: calc.total, proximo_cobro: f.proximoCobro(sus) };
};

async function listar() {
  const { rows } = await pool.query(`
    SELECT s.*, c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.email AS cliente_email
    FROM suscripciones s JOIN clientes c ON c.id = s.cliente_id
    ORDER BY s.activo DESC, c.nombre`);
  const items = await itemsDe(rows.map((r) => r.id));
  return rows.map((s) => conResumen(s, items[s.id]));
}

async function obtener(id) {
  const { rows } = await pool.query(
    `SELECT s.*, c.nombre AS cliente_nombre FROM suscripciones s JOIN clientes c ON c.id = s.cliente_id WHERE s.id = $1`, [id],
  );
  if (!rows[0]) throw new HttpError(404, 'Plan de cobro no encontrado');
  const items = await itemsDe([id]);
  return conResumen(rows[0], items[id]);
}

/* ---------- Escritura ---------- */
async function guardarItems(db, id, items) {
  await db.query('DELETE FROM suscripcion_items WHERE suscripcion_id = $1', [id]);
  for (const it of items) {
    await db.query(
      `INSERT INTO suscripcion_items (suscripcion_id, producto_id, descripcion, cantidad, precio_unitario, descuento_porcentaje, iva_porcentaje)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, it.producto_id, it.descripcion, it.cantidad, it.precio_unitario, it.descuento_porcentaje, it.iva_porcentaje],
    );
  }
}

async function crear(body) {
  const p = leerPlan(body);
  const id = await withTransaction(async (db) => {
    const { rows } = await db.query(
      `INSERT INTO suscripciones (cliente_id, nombre, dia_facturacion, dias_plazo, fecha_inicio, fecha_fin, activo, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [p.cliente_id, p.nombre, p.dia_facturacion, p.dias_plazo, p.fecha_inicio, p.fecha_fin, p.activo, p.notas],
    );
    await guardarItems(db, rows[0].id, p.items);
    return rows[0].id;
  });
  // Si la fecha de inicio es anterior a hoy, salen de una vez los meses cuyo día de cobro ya pasó
  const r = await generarPendientes({ soloId: id });
  return { ...(await obtener(id)), generadas: r.generadas };
}

async function actualizar(id, body) {
  const p = leerPlan(body);
  await withTransaction(async (db) => {
    const { rowCount } = await db.query(
      `UPDATE suscripciones SET cliente_id = $1, nombre = $2, dia_facturacion = $3, dias_plazo = $4,
              fecha_inicio = $5, fecha_fin = $6, activo = $7, notas = $8 WHERE id = $9`,
      [p.cliente_id, p.nombre, p.dia_facturacion, p.dias_plazo, p.fecha_inicio, p.fecha_fin, p.activo, p.notas, id],
    );
    if (!rowCount) throw new HttpError(404, 'Plan de cobro no encontrado');
    await guardarItems(db, id, p.items);
  });
  const r = await generarPendientes({ soloId: id }); // p. ej. si se reactivó o se cambió el día
  return { ...(await obtener(id)), generadas: r.generadas };
}

async function eliminar(id) {
  // Las facturas ya emitidas se conservan (suscripcion_id queda en NULL)
  const { rowCount } = await pool.query('DELETE FROM suscripciones WHERE id = $1', [id]);
  if (!rowCount) throw new HttpError(404, 'Plan de cobro no encontrado');
}

/* ---------- Generación de facturas ---------- */
const CANDADO = 72_200_001; // id del advisory lock para que dos procesos no generen a la vez

/**
 * Emite las facturas de todos los planes activos cuyo día de cobro ya llegó.
 * Es seguro correrla muchas veces: un plan nunca se cobra dos veces el mismo mes.
 */
async function generarPendientes({ hoy = f.hoyLocal(), soloId = null } = {}) {
  const lock = await pool.connect();
  const generadas = [];
  const errores = [];
  try {
    const { rows: [l] } = await lock.query('SELECT pg_try_advisory_lock($1) AS ok', [CANDADO]);
    if (!l.ok) return { generadas, errores, ocupado: true };

    const { rows: planes } = await pool.query(
      `SELECT * FROM suscripciones WHERE activo ${soloId ? 'AND id = $1' : ''}`, soloId ? [soloId] : [],
    );
    const items = await itemsDe(planes.map((p) => p.id));

    for (const plan of planes) {
      for (const { periodo, fecha } of f.periodosPendientes(plan, hoy)) {
        try {
          const factura = await facturas.crear({
            cliente_id: plan.cliente_id,
            fecha,
            vencimiento: f.sumarDias(fecha, plan.dias_plazo),
            forma_pago: 'credito',
            medio_pago: 'transferencia',
            notas: [`${plan.nombre} — ${f.nombrePeriodo(periodo)}`, plan.notas].filter(Boolean).join('\n'),
            items: items[plan.id] || [],
            suscripcion_id: plan.id,
            periodo,
          });
          generadas.push({ id: factura.id, numero: factura.numero, cliente: factura.cliente_nombre, periodo, total: factura.total });
        } catch (err) {
          if (err.code !== '23505') { // 23505 = ese mes ya estaba facturado
            errores.push({ plan: plan.id, periodo, error: err.message });
            break; // no seguir con meses siguientes de este plan si uno falla
          }
        }
        await pool.query(
          'UPDATE suscripciones SET ultimo_periodo = $1 WHERE id = $2 AND (ultimo_periodo IS NULL OR ultimo_periodo < $1)',
          [periodo, plan.id],
        );
      }
    }
    return { generadas, errores };
  } finally {
    await lock.query('SELECT pg_advisory_unlock($1)', [CANDADO]).catch(() => {});
    lock.release();
  }
}

/** Revisa cada hora (y al arrancar) si hay cobros por generar */
function iniciarProgramador({ cadaMs = 60 * 60 * 1000 } = {}) {
  const correr = async () => {
    try {
      const r = await generarPendientes();
      if (r.generadas.length) console.log(`✔ Cobros mensuales: ${r.generadas.length} factura(s) generada(s)`);
      if (r.errores.length) console.error('✖ Cobros mensuales con errores:', r.errores);
    } catch (err) {
      console.error('✖ Error revisando cobros mensuales:', err.message);
    }
  };
  setTimeout(correr, 5000);
  return setInterval(correr, cadaMs);
}

module.exports = { listar, obtener, crear, actualizar, eliminar, generarPendientes, iniciarProgramador };
