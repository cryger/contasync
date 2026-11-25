import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatoFecha, formatoMoneda } from "./format";
import { aclarar, contraste, hexARgb, mezclar, oscurecer } from "./color";
import { extraerMarca } from "../theme";
import { nombrePeriodo } from "./envio";

const ESTADOS = { pagada: "PAGADA", pendiente: "PENDIENTE", anulada: "ANULADA" };

/** Carga una imagen (data URL) y devuelve sus dimensiones, o null si no se puede */
const cargarImagen = (src) =>
  new Promise((resolve) => {
    if (!src || !src.startsWith("data:image/")) return resolve(null);
    const img = new Image();
    img.onload = () => resolve({ src, w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });

/**
 * Genera el PDF de una factura con la marca del negocio (colores y logo de "Apariencia").
 * @param {object} factura  respuesta de GET /api/facturas/:id
 * @param {object} empresa  respuesta de GET /api/empresa
 * @param {object} [opciones] { guardar: true } → si es false devuelve el jsPDF sin descargar
 */
export async function descargarFacturaPDF(factura, empresa = {}, { guardar = true } = {}) {
  const marca = extraerMarca(empresa);
  const C = {
    base: marca.color_base,
    acento: marca.color_acento,
    secundario: marca.color_secundario,
    textoBase: contraste(marca.color_base),
    textoAcento: contraste(marca.color_acento),
    suave: aclarar(marca.color_acento, 0.9), // fondos de recuadros
    fila: aclarar(marca.color_acento, 0.95), // filas alternas
    etiqueta: luminanciaSegura(marca.color_acento), // títulos pequeños legibles sobre blanco
    gris: "#5f6673",
  };

  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const m = 14;
  const fill = (hex) => doc.setFillColor(...hexARgb(hex));
  const color = (hex) => doc.setTextColor(...hexARgb(hex));
  const draw = (hex) => doc.setDrawColor(...hexARgb(hex));
  const fuente = (estilo = "normal", tam = 9) => doc.setFont("helvetica", estilo).setFontSize(tam);

  /* ---------- Banda superior con la marca ---------- */
  const altoBanda = 40;
  fill(C.base);
  doc.rect(0, 0, W, altoBanda, "F");
  fill(C.acento);
  doc.rect(0, altoBanda, W, 1.8, "F");

  let xTexto = m;
  const logo = await cargarImagen(marca.logo);
  if (logo) {
    const max = 24;
    const r = Math.min(max / logo.w, max / logo.h);
    const w = logo.w * r;
    const h = logo.h * r;
    // Fondo blanco redondeado para que cualquier logo se vea sobre el color base
    fill("#ffffff");
    doc.roundedRect(m, (altoBanda - 28) / 2, 28, 28, 3, 3, "F");
    doc.addImage(logo.src, "PNG", m + (28 - w) / 2, (altoBanda - h) / 2, w, h);
    xTexto = m + 33;
  }

  color(C.textoBase);
  fuente("bold", 16);
  doc.text(empresa.razon_social || marca.nombre_comercial, xTexto, 15);
  fuente("normal", 8.5);
  color(mezclar(C.base, C.textoBase, 0.75));
  [
    `NIT ${empresa.nit || ""}`,
    empresa.direccion,
    [empresa.telefono, empresa.email].filter(Boolean).join("   |   "),
  ]
    .filter(Boolean)
    .forEach((l, i) => doc.text(l, xTexto, 21.5 + i * 4.3));

  // Bloque del número
  color(C.acento);
  fuente("bold", 9);
  doc.text("FACTURA DE VENTA", W - m, 13, { align: "right" });
  color(C.textoBase);
  fuente("bold", 20);
  doc.text(factura.numero, W - m, 22, { align: "right" });
  fuente("normal", 8.5);
  color(mezclar(C.base, C.textoBase, 0.75));
  doc.text(`Emitida el ${formatoFecha(factura.fecha)}`, W - m, 28, { align: "right" });

  // Estado como etiqueta
  const estado = ESTADOS[factura.estado] || "";
  if (estado) {
    fuente("bold", 7.5);
    const wEstado = doc.getTextWidth(estado) + 6;
    const colEstado = factura.estado === "anulada" ? "#db4f4a" : factura.estado === "pendiente" ? "#f0a020" : C.acento;
    fill(colEstado);
    doc.roundedRect(W - m - wEstado, 31, wEstado, 5, 1.5, 1.5, "F");
    color(contraste(colEstado));
    doc.text(estado, W - m - wEstado / 2, 34.6, { align: "center" });
  }

  /* ---------- Recuadros cliente / detalles ---------- */
  let y = altoBanda + 8;
  const gap = 6;
  const anchoCaja = (W - 2 * m - gap) / 2;
  const altoCaja = 27;

  const caja = (x, titulo, lineas) => {
    fill(C.suave);
    doc.roundedRect(x, y, anchoCaja, altoCaja, 2, 2, "F");
    fill(C.acento);
    doc.rect(x, y, 1.4, altoCaja, "F");
    color(C.etiqueta);
    fuente("bold", 7.5);
    doc.text(titulo.toUpperCase(), x + 5, y + 6);
    lineas.forEach(([texto, negrita], i) => {
      color(negrita ? "#111418" : C.gris);
      fuente(negrita ? "bold" : "normal", negrita ? 10.5 : 8.5);
      const t = doc.splitTextToSize(String(texto), anchoCaja - 9)[0];
      doc.text(t, x + 5, y + 12 + i * 4.6);
    });
  };

  caja(m, "Facturado a", [
    [factura.cliente_nombre, true],
    [`${factura.cliente_tipo_documento || ""} ${factura.cliente_identificacion || ""}`],
    [[factura.cliente_telefono, factura.cliente_email].filter(Boolean).join("  |  ") || " "],
    [factura.cliente_direccion || " "],
  ]);
  caja(m + anchoCaja + gap, "Detalles del pago", [
    [`Forma de pago: ${factura.forma_pago === "credito" ? "Crédito" : "Contado"}`, true],
    [`Medio: ${factura.medio_pago}`],
    [factura.vencimiento ? `Vence: ${formatoFecha(factura.vencimiento)}` : `Fecha: ${formatoFecha(factura.fecha)}`],
    [factura.periodo ? `Periodo: ${nombrePeriodo(factura.periodo)}` : " "],
  ]);

  /* ---------- Ítems ---------- */
  autoTable(doc, {
    startY: y + altoCaja + 7,
    margin: { left: m, right: m },
    head: [["#", "Descripción", "Cant.", "Precio unit.", "Desc.", "IVA", "Total"]],
    body: factura.items.map((it, i) => [
      i + 1,
      it.descripcion,
      Number(it.cantidad).toLocaleString("es-CO"),
      formatoMoneda(it.precio_unitario),
      Number(it.descuento_porcentaje) ? `${Number(it.descuento_porcentaje)} %` : "—",
      `${Number(it.iva_porcentaje)} %`,
      formatoMoneda(it.total),
    ]),
    theme: "plain",
    styles: { fontSize: 8.8, cellPadding: { top: 2.6, bottom: 2.6, left: 2.5, right: 2.5 }, textColor: [40, 44, 52] },
    headStyles: { fillColor: hexARgb(C.base), textColor: hexARgb(C.textoBase), fontStyle: "bold", fontSize: 8.3 },
    alternateRowStyles: { fillColor: hexARgb(C.fila) },
    columnStyles: { 0: { cellWidth: 9, halign: "center", textColor: hexARgb(C.gris) }, 1: { cellWidth: "auto" }, 6: { fontStyle: "bold" } },
    didParseCell: (d) => {
      if (d.column.index >= 2) d.cell.styles.halign = "right";
    },
    didDrawPage: () => pie(),
  });

  /* ---------- Totales ---------- */
  y = doc.lastAutoTable.finalY + 6;
  if (y > H - 75) {
    doc.addPage();
    pie();
    y = 20;
  }
  const anchoTot = 78;
  const xTot = W - m - anchoTot;
  const filaTot = (label, valor) => {
    color(C.gris);
    fuente("normal", 9);
    doc.text(label, xTot + 4, y + 4.5);
    color("#111418");
    doc.text(valor, W - m - 4, y + 4.5, { align: "right" });
    draw(aclarar(C.base, 0.85));
    doc.setLineWidth(0.2);
    doc.line(xTot, y + 7, W - m, y + 7);
    y += 7;
  };
  filaTot("Subtotal", formatoMoneda(factura.subtotal));
  if (Number(factura.descuento)) filaTot("Descuento", `- ${formatoMoneda(factura.descuento)}`);
  filaTot("IVA", formatoMoneda(factura.iva));
  y += 2;
  fill(C.acento);
  doc.roundedRect(xTot, y, anchoTot, 12, 2, 2, "F");
  color(C.textoAcento);
  fuente("bold", 10);
  doc.text("TOTAL A PAGAR", xTot + 4, y + 7.6);
  fuente("bold", 13);
  doc.text(formatoMoneda(factura.total), W - m - 4, y + 8, { align: "right" });

  // Notas a la izquierda de los totales
  let yNotas = doc.lastAutoTable.finalY + 6;
  if (factura.notas && yNotas < y) {
    color(C.etiqueta);
    fuente("bold", 7.5);
    doc.text("NOTAS", m, yNotas + 4.5);
    color(C.gris);
    fuente("normal", 8.5);
    doc.text(doc.splitTextToSize(factura.notas, W - 2 * m - anchoTot - 8), m, yNotas + 9.5);
  }

  // Resolución y pie personalizado
  y += 20;
  const textoPie = [empresa.resolucion, empresa.pie_factura].filter(Boolean).join("\n");
  if (textoPie) {
    draw(aclarar(C.base, 0.85));
    doc.line(m, y, W - m, y);
    color(C.gris);
    fuente("normal", 7.8);
    doc.text(doc.splitTextToSize(textoPie, W - 2 * m), m, y + 5);
  }

  // Marca de agua de anulada
  if (factura.estado === "anulada") {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    color("#db4f4a");
    fuente("bold", 70);
    doc.text("ANULADA", W / 2, H / 2, { align: "center", angle: 30 });
    doc.restoreGraphicsState();
  }

  if (guardar) doc.save(`${factura.numero}.pdf`);
  return doc;

  /* ---------- Pie de página (en cada hoja) ---------- */
  function pie() {
    fill(C.acento);
    doc.rect(0, H - 4, W, 4, "F");
    color(C.gris);
    fuente("normal", 7.5);
    doc.text("Gracias por su compra", m, H - 8);
    doc.text(`${factura.numero}  -  Página ${doc.getNumberOfPages()}`, W - m, H - 8, { align: "right" });
  }
}

/** Si el acento es muy claro (p. ej. amarillo), oscurecerlo para usarlo como texto sobre blanco */
function luminanciaSegura(hex) {
  let c = hex;
  for (let i = 0; i < 6 && contraste(c) !== "#ffffff"; i++) c = oscurecer(c, 0.15);
  return c;
}

/** Factura de ejemplo para ver el diseño desde "Apariencia" */
export const FACTURA_EJEMPLO = {
  numero: "FV-0001",
  fecha: new Date().toISOString().slice(0, 10),
  vencimiento: null,
  forma_pago: "contado",
  medio_pago: "transferencia",
  estado: "pagada",
  cliente_nombre: "Cliente de ejemplo S.A.S.",
  cliente_tipo_documento: "NIT",
  cliente_identificacion: "900123456-7",
  cliente_telefono: "310 000 0000",
  cliente_email: "cliente@correo.com",
  cliente_direccion: "Calle 1 # 2-3, San José del Guaviare",
  subtotal: 485000,
  descuento: 30000,
  iva: 74100,
  total: 529100,
  notas: "Esta es una factura de ejemplo para revisar el diseño.",
  items: [
    { descripcion: "Producto o servicio principal", cantidad: 2, precio_unitario: 150000, descuento_porcentaje: 10, iva_porcentaje: 19, total: 321300 },
    { descripcion: "Servicio adicional", cantidad: 1, precio_unitario: 120000, descuento_porcentaje: 0, iva_porcentaje: 19, total: 142800 },
    { descripcion: "Producto exento", cantidad: 2, precio_unitario: 32500, descuento_porcentaje: 0, iva_porcentaje: 0, total: 65000 },
  ],
};
