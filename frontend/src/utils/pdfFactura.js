import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatoFecha, formatoMoneda } from "./format";

/** Genera y descarga el PDF de una factura (texto real, no captura de pantalla). */
export function descargarFacturaPDF(factura, empresa = {}) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const ancho = doc.internal.pageSize.getWidth();
  const m = 15;

  // Encabezado empresa
  doc.setFont("helvetica", "bold").setFontSize(16).text(empresa.razon_social || "Mi empresa", m, 20);
  doc.setFont("helvetica", "normal").setFontSize(9);
  const lineasEmpresa = [
    `NIT ${empresa.nit || ""}`,
    empresa.direccion,
    [empresa.telefono, empresa.email].filter(Boolean).join("  |  "),
  ].filter(Boolean);
  lineasEmpresa.forEach((l, i) => doc.text(l, m, 26 + i * 4.5));

  // Recuadro número
  doc.setFont("helvetica", "bold").setFontSize(12).text("FACTURA DE VENTA", ancho - m, 20, { align: "right" });
  doc.setFontSize(14).text(factura.numero, ancho - m, 27, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(`Fecha: ${formatoFecha(factura.fecha)}`, ancho - m, 33, { align: "right" });
  if (factura.vencimiento) doc.text(`Vence: ${formatoFecha(factura.vencimiento)}`, ancho - m, 37.5, { align: "right" });
  if (factura.estado === "anulada") {
    doc.setTextColor(200, 0, 0).setFont("helvetica", "bold").setFontSize(40);
    doc.text("ANULADA", ancho / 2, 140, { align: "center", angle: 30 });
    doc.setTextColor(0, 0, 0);
  }

  // Cliente
  let y = 48;
  doc.setDrawColor(200).line(m, y - 4, ancho - m, y - 4);
  doc.setFont("helvetica", "bold").setFontSize(10).text("Cliente", m, y);
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(factura.cliente_nombre || "", m, y + 5);
  doc.text(`${factura.cliente_tipo_documento || ""} ${factura.cliente_identificacion || ""}`, m, y + 9.5);
  const contacto = [factura.cliente_telefono, factura.cliente_email, factura.cliente_direccion].filter(Boolean).join("  |  ");
  if (contacto) doc.text(contacto, m, y + 14);
  doc.text(`Forma de pago: ${factura.forma_pago} - ${factura.medio_pago}`, ancho - m, y + 5, { align: "right" });

  // Ítems
  autoTable(doc, {
    startY: y + 20,
    margin: { left: m, right: m },
    head: [["Descripción", "Cant.", "Precio unit.", "Desc. %", "IVA %", "Total"]],
    body: factura.items.map((it) => [
      it.descripcion,
      Number(it.cantidad).toLocaleString("es-CO"),
      formatoMoneda(it.precio_unitario),
      `${Number(it.descuento_porcentaje)}`,
      `${Number(it.iva_porcentaje)}`,
      formatoMoneda(it.total),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [20, 27, 45] },
    columnStyles: { 0: { cellWidth: "auto" } },
    didParseCell: (d) => {
      if (d.column.index > 0) d.cell.styles.halign = "right";
    },
  });

  // Totales
  y = doc.lastAutoTable.finalY + 8;
  const fila = (label, valor, negrita = false) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal").setFontSize(negrita ? 11 : 9.5);
    doc.text(label, ancho - m - 45, y, { align: "right" });
    doc.text(valor, ancho - m, y, { align: "right" });
    y += negrita ? 7 : 5.5;
  };
  fila("Subtotal", formatoMoneda(factura.subtotal));
  if (Number(factura.descuento)) fila("Descuento", `- ${formatoMoneda(factura.descuento)}`);
  fila("IVA", formatoMoneda(factura.iva));
  fila("TOTAL", formatoMoneda(factura.total), true);

  // Notas y pie
  doc.setFont("helvetica", "normal").setFontSize(8.5);
  let yPie = y + 6;
  if (factura.notas) {
    doc.text(doc.splitTextToSize(`Notas: ${factura.notas}`, ancho - 2 * m), m, yPie);
    yPie += 10;
  }
  const pie = [empresa.resolucion, empresa.pie_factura].filter(Boolean).join("\n");
  if (pie) doc.text(doc.splitTextToSize(pie, ancho - 2 * m), m, yPie);

  doc.save(`${factura.numero}.pdf`);
}
