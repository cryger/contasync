import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert, Box, Button, Chip, Divider, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from "@mui/material";
import { ArrowBackOutlined, BlockOutlined, CheckCircleOutline, PictureAsPdfOutlined } from "@mui/icons-material";
import Header from "../../components/Header";
import ConfirmDialog from "../../components/ConfirmDialog";
import BotonesEnvio from "../../components/BotonesEnvio";
import { useNotify } from "../../components/Notifier";
import useCarga from "../../hooks/useCarga";
import { empresaApi, facturasApi } from "../../api";
import { mensajeError } from "../../api/client";
import { ESTADOS_FACTURA } from "../../utils/factura";
import { formatoFecha, formatoMoneda } from "../../utils/format";
import { descargarFacturaPDF } from "../../utils/pdfFactura";
import { useColors } from "../../theme";
import { estiloPanel } from "../../components/Panel";
import { useAuth } from "../../auth/AuthContext";

export default function FacturaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const colors = useColors();
  const { esAdmin } = useAuth();
  const [anular, setAnular] = useState(false);
  const { data, setData, cargando, error } = useCarga(
    () => Promise.all([facturasApi.obtener(id), empresaApi.obtener()]), [id],
  );
  const [f, empresa] = data || [];

  const cambiarEstado = async (estado) => {
    try {
      const nueva = await facturasApi.cambiarEstado(f.id, estado);
      setData([nueva, empresa]);
      notify(estado === "anulada" ? "Factura anulada" : "Factura marcada como pagada");
    } catch (err) {
      notify(mensajeError(err), "error");
    }
    setAnular(false);
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (cargando || !f) return null;

  const est = ESTADOS_FACTURA[f.estado];

  return (
    <Box>
      <Header title={`Factura ${f.numero}`} subtitle={`${formatoFecha(f.fecha)} · ${f.cliente_nombre}`}>
        <Button startIcon={<ArrowBackOutlined />} color="inherit" onClick={() => navigate("/facturas")}>Volver</Button>
        <Button variant="contained" color="secondary" startIcon={<PictureAsPdfOutlined />} onClick={() => descargarFacturaPDF(f, empresa)}>
          Descargar PDF
        </Button>
        {f.estado !== "anulada" && (
          <BotonesEnvio factura={f} empresa={empresa} onEnviada={(nueva) => setData([nueva, empresa])} />
        )}
        {f.estado === "pendiente" && (
          <Button variant="outlined" color="success" startIcon={<CheckCircleOutline />} onClick={() => cambiarEstado("pagada")}>
            Marcar pagada
          </Button>
        )}
        {f.estado !== "anulada" && esAdmin && (
          <Button variant="outlined" color="error" startIcon={<BlockOutlined />} onClick={() => setAnular(true)}>Anular</Button>
        )}
      </Header>

      <Box {...estiloPanel(colors, 3)}>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color={colors.gray[300]}>Cliente</Typography>
            <Typography component="h2" variant="h4">{f.cliente_nombre}</Typography>
            <Typography>{f.cliente_tipo_documento} {f.cliente_identificacion}</Typography>
            <Typography color={colors.gray[300]}>
              {[f.cliente_telefono, f.cliente_email, f.cliente_direccion].filter(Boolean).join(" · ")}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} textAlign={{ md: "right" }}>
            <Chip label={est.label} color={est.color} sx={{ mb: 1 }} />
            <Typography>Forma de pago: {f.forma_pago} · {f.medio_pago}</Typography>
            {f.vencimiento && <Typography>Vence: {formatoFecha(f.vencimiento)}</Typography>}
            {f.usuario_nombre && <Typography color={colors.gray[300]}>Emitida por {f.usuario_nombre}</Typography>}
            {f.enviada_en && <Typography color={colors.gray[300]}>Enviada al cliente el {new Date(f.enviada_en).toLocaleDateString("es-CO")}</Typography>}
          </Grid>
        </Grid>

        <Box overflow="auto" tabIndex={0} role="region" aria-label="Detalle de ítems">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Cant.</TableCell>
                <TableCell align="right">Precio unit.</TableCell>
                <TableCell align="right">Desc. %</TableCell>
                <TableCell align="right">IVA %</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {f.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.descripcion}</TableCell>
                  <TableCell align="right">{it.cantidad}</TableCell>
                  <TableCell align="right">{formatoMoneda(it.precio_unitario)}</TableCell>
                  <TableCell align="right">{it.descuento_porcentaje}</TableCell>
                  <TableCell align="right">{it.iva_porcentaje}</TableCell>
                  <TableCell align="right">{formatoMoneda(it.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box ml="auto" mt={3} maxWidth={320}>
          {[["Subtotal", f.subtotal], ["Descuento", -f.descuento], ["IVA", f.iva]].map(([l, v]) => (
            <Box key={l} display="flex" justifyContent="space-between" mb={0.5}>
              <Typography color={colors.gray[300]}>{l}</Typography>
              <Typography>{formatoMoneda(v)}</Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h4">Total</Typography>
            <Typography variant="h3" fontWeight="bold" color={colors.acentoTexto}>{formatoMoneda(f.total)}</Typography>
          </Box>
        </Box>
        {f.notas && <Typography mt={2} color={colors.gray[300]}>Notas: {f.notas}</Typography>}
      </Box>

      <ConfirmDialog
        open={anular}
        title={`Anular ${f.numero}`}
        message="La factura queda registrada como anulada y deja de contar en ingresos y en el reparto a inversionistas. No se puede revertir."
        confirmLabel="Anular"
        onCancel={() => setAnular(false)}
        onConfirm={() => cambiarEstado("anulada")}
      />
    </Box>
  );
}
