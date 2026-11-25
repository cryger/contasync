/* eslint-disable react/prop-types */
import { useState } from "react";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { EmailOutlined, PictureAsPdfOutlined, WhatsApp } from "@mui/icons-material";
import { facturasApi } from "../api";
import { mensajeError } from "../api/client";
import { descargarFacturaPDF } from "../utils/pdfFactura";
import { urlCorreo, urlWhatsApp } from "../utils/envio";
import { useNotify } from "./Notifier";

/**
 * Botones para enviar una factura al cliente.
 * Al enviar: descarga el PDF (para adjuntarlo), abre WhatsApp o el correo con el mensaje listo
 * y marca la factura como enviada.
 * - factura: puede ser la fila del listado (sin ítems); si falta el detalle se consulta.
 * - compacto: solo íconos (para tablas)
 */
const BotonesEnvio = ({ factura, empresa, onEnviada, compacto = false }) => {
  const notify = useNotify();
  const [ocupado, setOcupado] = useState(false);

  const completa = async () => (factura.items ? factura : facturasApi.obtener(factura.id));

  const enviar = async (canal) => {
    // La ventana se abre antes del await para que el navegador no la bloquee
    const ventana = canal === "whatsapp" ? window.open("about:blank", "_blank") : null;
    setOcupado(true);
    try {
      const f = await completa();
      await descargarFacturaPDF(f, empresa);
      if (canal === "whatsapp") {
        if (ventana) ventana.location.href = urlWhatsApp(f, empresa);
        else window.open(urlWhatsApp(f, empresa), "_blank");
        if (!f.cliente_telefono) notify("El cliente no tiene celular: elige el contacto en WhatsApp", "info");
      } else {
        window.location.href = urlCorreo(f, empresa);
        if (!f.cliente_email) notify("El cliente no tiene correo registrado", "info");
      }
      const actualizada = await facturasApi.marcarEnviada(f.id);
      onEnviada?.(actualizada);
    } catch (err) {
      ventana?.close();
      notify(mensajeError(err), "error");
    } finally {
      setOcupado(false);
    }
  };

  const pdf = async () => {
    setOcupado(true);
    try {
      await descargarFacturaPDF(await completa(), empresa);
    } catch (err) {
      notify(mensajeError(err), "error");
    } finally {
      setOcupado(false);
    }
  };

  if (compacto) {
    return (
      <Box display="flex" onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Enviar por WhatsApp (descarga el PDF para adjuntarlo)">
          <span><IconButton size="small" aria-label="Enviar por WhatsApp" disabled={ocupado} onClick={() => enviar("whatsapp")} sx={{ color: "#25D366" }}><WhatsApp fontSize="small" /></IconButton></span>
        </Tooltip>
        <Tooltip title="Enviar por correo">
          <span><IconButton size="small" aria-label="Enviar por correo" disabled={ocupado} onClick={() => enviar("correo")}><EmailOutlined fontSize="small" /></IconButton></span>
        </Tooltip>
        <Tooltip title="Descargar PDF">
          <span><IconButton size="small" aria-label="Descargar PDF" disabled={ocupado} onClick={pdf}><PictureAsPdfOutlined fontSize="small" /></IconButton></span>
        </Tooltip>
      </Box>
    );
  }

  return (
    <>
      <Button variant="contained" disabled={ocupado} startIcon={<WhatsApp />} onClick={() => enviar("whatsapp")}
        sx={{ bgcolor: "#25D366", color: "#fff", "&:hover": { bgcolor: "#1ebe5a" } }}>
        WhatsApp
      </Button>
      <Button variant="outlined" color="inherit" disabled={ocupado} startIcon={<EmailOutlined />} onClick={() => enviar("correo")}>
        Correo
      </Button>
    </>
  );
};

export default BotonesEnvio;
