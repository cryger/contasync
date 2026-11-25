// Mismo algoritmo que backend/src/modules/facturas/facturas.calculos.js (solo para la vista previa).
const redondear = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calcularItem({ cantidad = 0, precio_unitario = 0, descuento_porcentaje = 0, iva_porcentaje = 0 }) {
  const base = redondear(Number(cantidad) * Number(precio_unitario));
  const descuento = redondear(base * (Number(descuento_porcentaje) / 100));
  const iva = redondear((base - descuento) * (Number(iva_porcentaje) / 100));
  return { base, descuento, iva, total: redondear(base - descuento + iva) };
}

export function calcularFactura(items) {
  const detalle = items.map((it) => ({ ...it, ...calcularItem(it) }));
  const suma = (k) => redondear(detalle.reduce((a, it) => a + it[k], 0));
  return { items: detalle, subtotal: suma("base"), descuento: suma("descuento"), iva: suma("iva"), total: suma("total") };
}

export const ESTADOS_FACTURA = {
  pagada: { label: "Pagada", color: "success" },
  pendiente: { label: "Pendiente", color: "warning" },
  anulada: { label: "Anulada", color: "error" },
};

export const MEDIOS_PAGO = ["efectivo", "transferencia", "tarjeta", "nequi", "daviplata"];
