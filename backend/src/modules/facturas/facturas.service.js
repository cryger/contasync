const pool = require('../../config/db');
const { withTransaction } = require('../../config/db');
const { HttpError } = require('../../shared/http');
const v = require('../../shared/validate');
const { calcularFactura } = require('./facturas.calculos');

const ESTADOS = ['pendiente', 'pagada', 'anulada'];
const FORMAS_PAGO = ['contado', 'credito'];

const SELECT_FACTURA = `
  SELECT f.*, u.nombre AS usuario_nombre, c.nombre AS cliente_nombre, c.identificacion AS cliente_identificacion,
         c.tipo_documento AS cliente_tipo_documento, c.telefono AS cliente_telefono,
         c.email AS cliente_email, c.direccion AS cliente_direccion
  FROM facturas f
  JOIN clientes c ON c.id = f.cliente_id
  LEFT JOIN usuarios u ON u.id = f.usuario_id`;

/** Valida y normaliza los ítems que llegan del cliente. */
function normalizarItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'La factura debe tener al menos un ítem');
  }
  return items.map((it, i) => {
    const n = i + 1;
    return {
      producto_id: it.producto_id ? Number(it.producto_id) : null,
      descripcion: v.requireText(it.descripcion, `descripción del ítem ${n}`),
      cantidad: v.requireNumber(it.cantidad, `cantidad del ítem ${n}`, { min: 0, allowZero: false }),
      precio_unitario: v.requireNumber(it.precio_unitario, `precio del ítem ${n}`, { min: 0 }),
      descuento_porcentaje: it.descuento_porcentaje ? v.requireNumber(it.descuento_porcentaje, `descuento del ítem ${n}`, { min: 0 }) : 0,
      iva_porcentaje: it.iva_porcentaje ? v.requireNumber(it.iva_porcentaje, `IVA del ítem ${n}`, { min: 0 }) : 0,
    };
  });
}

async function listar({ desde, hasta, estado, cliente_id, q, cobro, enviada, limite = 200 } = {}) {
  const cond = [];
  const params = [];
  const add = (sql, val) => { params.push(val); cond.push(sql.replace('?', `$${params.length}`)); };

  if (desde) add('f.fecha >= ?', v.optionalDate(desde));
  if (hasta) add('f.fecha <= ?', v.optionalDate(hasta));
  if (estado) add('f.estado = ?', v.oneOf(estado, ESTADOS, 'estado'));
  if (cliente_id) add('f.cliente_id = ?', Number(cliente_id));
  if (cobro === 'mensual') cond.push('f.suscripcion_id IS NOT NULL');
  if (enviada === 'no') cond.push("f.enviada_en IS NULL AND f.estado <> 'anulada'");
  if (enviada === 'si') cond.push('f.enviada_en IS NOT NULL');
  if (q) add('(f.numero ILIKE ? OR c.nombre ILIKE $' + (params.length + 1) + ')', `%${q}%`);

  params.push(Math.min(Number(limite) || 200, 1000));
  const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `${SELECT_FACTURA} ${where} ORDER BY f.fecha DESC, f.id DESC LIMIT $${params.length}`,
    params,
  );
  return rows;
}

async function obtener(id) {
  const { rows } = await pool.query(`${SELECT_FACTURA} WHERE f.id = $1`, [id]);
  if (!rows[0]) throw new HttpError(404, 'Factura no encontrada');
  const items = await pool.query('SELECT * FROM factura_items WHERE factura_id = $1 ORDER BY id', [id]);
  return { ...rows[0], items: items.rows };
}

/**
 * Crea una factura en una sola transacción:
 * 1. toma el consecutivo de la empresa (bloqueando la fila → no hay números repetidos)
 * 2. recalcula totales en el servidor
 * 3. inserta encabezado e ítems
 */
async function crear(datos) {
  const items = normalizarItems(datos.items);
  const calculo = calcularFactura(items);
  const formaPago = v.oneOf(datos.forma_pago, FORMAS_PAGO, 'forma_pago', 'contado');
  const estado = formaPago === 'credito' ? 'pendiente' : 'pagada';

  const id = await withTransaction(async (db) => {
    let clienteId = datos.cliente_id ? Number(datos.cliente_id) : null;
    if (clienteId) {
      const existe = await db.query('SELECT 1 FROM clientes WHERE id = $1', [clienteId]);
      if (!existe.rowCount) throw new HttpError(400, 'El cliente seleccionado no existe');
    } else {
      const cf = await db.query("SELECT id FROM clientes WHERE identificacion = '222222222222'");
      clienteId = cf.rows[0]?.id;
      if (!clienteId) throw new HttpError(400, 'Selecciona un cliente');
    }

    const { rows: [emp] } = await db.query(
      `UPDATE empresa SET siguiente_numero = siguiente_numero + 1 WHERE id = 1
       RETURNING prefijo_factura, siguiente_numero - 1 AS numero`,
    );
    if (!emp) throw new HttpError(500, 'Falta configurar los datos de la empresa');
    const numero = `${emp.prefijo_factura}-${emp.numero}`;

    const { rows: [fac] } = await db.query(
      `INSERT INTO facturas (numero, cliente_id, fecha, vencimiento, forma_pago, medio_pago, estado,
                             subtotal, descuento, iva, total, notas, usuario_id, suscripcion_id, periodo)
       VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id`,
      [numero, clienteId, v.optionalDate(datos.fecha), v.optionalDate(datos.vencimiento), formaPago,
        v.optionalText(datos.medio_pago) || 'efectivo', estado,
        calculo.subtotal, calculo.descuento, calculo.iva, calculo.total, v.optionalText(datos.notas),
        datos.usuario_id || null, datos.suscripcion_id || null, datos.periodo || null],
    );

    for (const it of calculo.items) {
      await db.query(
        `INSERT INTO factura_items (factura_id, producto_id, descripcion, cantidad, precio_unitario,
                                    descuento_porcentaje, iva_porcentaje, base, descuento, iva, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [fac.id, it.producto_id, it.descripcion, it.cantidad, it.precio_unitario,
          it.descuento_porcentaje, it.iva_porcentaje, it.base, it.descuento, it.iva, it.total],
      );
    }
    return fac.id;
  });

  return obtener(id);
}

/** Las facturas emitidas no se editan ni se borran: solo cambian de estado (pagar / anular). */
async function cambiarEstado(id, estado) {
  const nuevo = v.oneOf(estado, ESTADOS, 'estado');
  const actual = await obtener(id);
  if (actual.estado === 'anulada') throw new HttpError(409, 'La factura ya está anulada');
  await pool.query('UPDATE facturas SET estado = $1 WHERE id = $2', [nuevo, id]);
  return obtener(id);
}

/** Marca (o desmarca) que la factura ya se le envió al cliente */
async function marcarEnviada(id, enviada = true) {
  const { rowCount } = await pool.query(
    `UPDATE facturas SET enviada_en = ${enviada ? 'NOW()' : 'NULL'} WHERE id = $1`, [id],
  );
  if (!rowCount) throw new HttpError(404, 'Factura no encontrada');
  return obtener(id);
}

module.exports = { listar, obtener, crear, cambiarEstado, marcarEnviada };
