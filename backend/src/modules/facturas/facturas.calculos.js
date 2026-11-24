/**
 * Cálculo de totales de una factura.
 * Este mismo algoritmo está en frontend/src/utils/factura.js para la vista previa;
 * el servidor siempre recalcula y es la fuente de verdad.
 */
const redondear = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function calcularItem({ cantidad, precio_unitario, descuento_porcentaje = 0, iva_porcentaje = 0 }) {
  const base = redondear(cantidad * precio_unitario);
  const descuento = redondear(base * (descuento_porcentaje / 100));
  const gravable = base - descuento;
  const iva = redondear(gravable * (iva_porcentaje / 100));
  return { base, descuento, iva, total: redondear(gravable + iva) };
}

function calcularFactura(items) {
  const detalle = items.map((it) => ({ ...it, ...calcularItem(it) }));
  const suma = (k) => redondear(detalle.reduce((acc, it) => acc + it[k], 0));
  return {
    items: detalle,
    subtotal: suma('base'),
    descuento: suma('descuento'),
    iva: suma('iva'),
    total: suma('total'),
  };
}

module.exports = { calcularItem, calcularFactura, redondear };
