// Envío de facturas al cliente por WhatsApp o correo (abre la app del usuario con el mensaje listo).
import { formatoFecha, formatoMoneda } from "./format";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** "2026-11" → "noviembre de 2026" */
export const nombrePeriodo = (periodo) => {
  if (!periodo) return "";
  const [y, m] = periodo.split("-").map(Number);
  return `${MESES[m - 1]} de ${y}`;
};

/** Normaliza un celular colombiano para WhatsApp: 3101234567 → 573101234567 */
export const telefonoWhatsApp = (tel) => {
  const d = String(tel || "").replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("3")) return `57${d}`;
  return d.length >= 10 ? d : "";
};

const nombreEmpresa = (empresa) => empresa?.nombre_comercial || empresa?.razon_social || "";

/** Texto del mensaje de cobro */
export function mensajeCobro(factura, empresa, { formato = "whatsapp" } = {}) {
  const b = formato === "whatsapp" ? (t) => `*${t}*` : (t) => t;
  const lineas = [
    `Hola ${factura.cliente_nombre},`,
    "",
    `Te compartimos la factura ${b(factura.numero)} de ${nombreEmpresa(empresa)} por ${b(formatoMoneda(factura.total))}` +
      (factura.periodo ? `, correspondiente a ${nombrePeriodo(factura.periodo)}.` : "."),
  ];
  if (factura.vencimiento) lineas.push(`Fecha límite de pago: ${b(formatoFecha(factura.vencimiento))}.`);
  if (empresa?.pie_factura) lineas.push("", empresa.pie_factura);
  lineas.push("", "Adjuntamos la factura en PDF. ¡Gracias!");
  return lineas.join("\n");
}

export const urlWhatsApp = (factura, empresa) => {
  const tel = telefonoWhatsApp(factura.cliente_telefono);
  return `https://wa.me/${tel}?text=${encodeURIComponent(mensajeCobro(factura, empresa))}`;
};

export const urlCorreo = (factura, empresa) => {
  const asunto = `Factura ${factura.numero} - ${nombreEmpresa(empresa)}` + (factura.periodo ? ` - ${nombrePeriodo(factura.periodo)}` : "");
  return `mailto:${factura.cliente_email || ""}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
    mensajeCobro(factura, empresa, { formato: "correo" })
  )}`;
};
