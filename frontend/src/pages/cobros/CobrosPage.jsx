import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Chip, IconButton, MenuItem, Tab, Tabs, TextField, Tooltip, Typography,
} from "@mui/material";
import { AddOutlined, AutorenewOutlined, DeleteOutline, EditOutlined, MarkEmailReadOutlined, UndoOutlined } from "@mui/icons-material";
import Header from "../../components/Header";
import DataTable from "../../components/DataTable";
import ConfirmDialog from "../../components/ConfirmDialog";
import BotonesEnvio from "../../components/BotonesEnvio";
import { useNotify } from "../../components/Notifier";
import useCarga from "../../hooks/useCarga";
import { clientesApi, cobrosApi, empresaApi, facturasApi, productosApi } from "../../api";
import { mensajeError } from "../../api/client";
import { ESTADOS_FACTURA } from "../../utils/factura";
import { formatoFecha, formatoMoneda, hoy } from "../../utils/format";
import { nombrePeriodo } from "../../utils/envio";
import { useColors } from "../../theme";
import PlanDialog from "./PlanDialog";

export default function CobrosPage() {
  const colors = useColors();
  const notify = useNotify();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [filtroEnvio, setFiltroEnvio] = useState("no");
  const [recarga, setRecarga] = useState(0);
  const [editando, setEditando] = useState(null);
  const [borrando, setBorrando] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [aux, setAux] = useState({ clientes: [], productos: [], empresa: null });

  const planes = useCarga(() => cobrosApi.listar(), [recarga], []);
  const facturas = useCarga(
    () => facturasApi.listar({ cobro: "mensual", ...(filtroEnvio !== "todas" && { enviada: filtroEnvio }) }),
    [filtroEnvio, recarga], []
  );
  const porEnviar = useCarga(() => facturasApi.listar({ cobro: "mensual", enviada: "no" }), [recarga], []);

  useEffect(() => {
    Promise.all([clientesApi.listar(), productosApi.listar({ activo: true }), empresaApi.obtener()])
      .then(([clientes, productos, empresa]) => setAux({ clientes, productos, empresa }))
      .catch((err) => notify(mensajeError(err), "error"));
  }, [notify]);

  const recargar = () => setRecarga((n) => n + 1);

  const avisarGeneradas = (generadas = []) => {
    if (generadas.length) {
      notify(`Se generaron ${generadas.length} factura(s) de cobro. Quedan en "Por enviar".`);
      setTab(0);
      setFiltroEnvio("no");
    }
  };

  const guardarPlan = async (datos) => {
    try {
      const r = editando?.id ? await cobrosApi.actualizar(editando.id, datos) : await cobrosApi.crear(datos);
      setEditando(null);
      notify("Plan de cobro guardado");
      avisarGeneradas(r.generadas);
      recargar();
    } catch (err) {
      notify(mensajeError(err), "error");
    }
  };

  const generarAhora = async () => {
    setGenerando(true);
    try {
      const r = await cobrosApi.generar();
      if (r.generadas.length) avisarGeneradas(r.generadas);
      else notify("No hay cobros pendientes por generar hoy", "info");
      if (r.errores?.length) notify(`Hubo ${r.errores.length} error(es): ${r.errores[0].error}`, "error");
      recargar();
    } catch (err) {
      notify(mensajeError(err), "error");
    } finally {
      setGenerando(false);
    }
  };

  const eliminarPlan = async () => {
    try {
      await cobrosApi.eliminar(borrando.id);
      notify("Plan eliminado (las facturas ya emitidas se conservan)");
      setBorrando(null);
      recargar();
    } catch (err) {
      notify(mensajeError(err), "error");
    }
  };

  const alternarEnviada = async (f) => {
    try {
      await facturasApi.marcarEnviada(f.id, !f.enviada_en);
      recargar();
    } catch (err) {
      notify(mensajeError(err), "error");
    }
  };

  /* ---------- Columnas ---------- */
  const colFacturas = [
    { field: "numero", headerName: "Factura", width: 100 },
    { field: "cliente_nombre", headerName: "Cliente", flex: 1, minWidth: 180 },
    { field: "periodo", headerName: "Mes", width: 150, valueFormatter: ({ value }) => nombrePeriodo(value) },
    { field: "total", headerName: "Total", width: 130, align: "right", headerAlign: "right", valueFormatter: ({ value }) => formatoMoneda(value) },
    {
      field: "vencimiento", headerName: "Vence", width: 110,
      renderCell: ({ value, row }) => (
        <Typography fontSize={12} color={row.estado === "pendiente" && value < hoy() ? colors.peligro : undefined}>
          {formatoFecha(value)}
        </Typography>
      ),
    },
    {
      field: "estado", headerName: "Estado", width: 105,
      renderCell: ({ value }) => <Chip size="small" label={ESTADOS_FACTURA[value]?.label} color={ESTADOS_FACTURA[value]?.color} />,
    },
    {
      field: "enviada_en", headerName: "Enviada", width: 110,
      renderCell: ({ value }) => (value ? new Date(value).toLocaleDateString("es-CO") : <Chip size="small" variant="outlined" label="Por enviar" color="warning" />),
    },
    {
      field: "_enviar", headerName: "Enviar", width: 170, sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center">
          <BotonesEnvio compacto factura={row} empresa={aux.empresa} onEnviada={recargar} />
          <Tooltip title={row.enviada_en ? "Marcar como no enviada" : "Marcar como enviada (sin abrir WhatsApp ni correo)"}>
            <IconButton size="small" aria-label={row.enviada_en ? "Marcar como no enviada" : "Marcar como enviada"} onClick={(e) => { e.stopPropagation(); alternarEnviada(row); }}>
              {row.enviada_en ? <UndoOutlined fontSize="small" /> : <MarkEmailReadOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const colPlanes = [
    { field: "cliente_nombre", headerName: "Cliente", flex: 1, minWidth: 180 },
    { field: "nombre", headerName: "Concepto", flex: 1, minWidth: 180 },
    { field: "dia_facturacion", headerName: "Día", width: 70, valueFormatter: ({ value }) => `Día ${value}` },
    { field: "total_mensual", headerName: "Valor mensual", width: 140, align: "right", headerAlign: "right", valueFormatter: ({ value }) => formatoMoneda(value) },
    { field: "proximo_cobro", headerName: "Próximo cobro", width: 130, valueFormatter: ({ value }) => (value ? formatoFecha(value) : "—") },
    {
      field: "activo", headerName: "Estado", width: 100,
      renderCell: ({ value }) => <Chip size="small" label={value ? "Activo" : "Pausado"} color={value ? "success" : "default"} />,
    },
    {
      field: "_acciones", headerName: "", width: 90, sortable: false, filterable: false,
      renderCell: ({ row }) => (
        <Box>
          <IconButton size="small" aria-label={`Editar plan de ${row.cliente_nombre}`} onClick={() => setEditando(row)}><EditOutlined fontSize="small" /></IconButton>
          <IconButton size="small" aria-label={`Eliminar plan de ${row.cliente_nombre}`} onClick={() => setBorrando(row)}><DeleteOutline fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ];

  const activos = planes.data.filter((p) => p.activo);
  const totalMensual = activos.reduce((a, p) => a + p.total_mensual, 0);

  return (
    <Box>
      <Header title="Cobros mensuales"
        subtitle={`${activos.length} planes activos · ${formatoMoneda(totalMensual)} al mes`}>
        <Button color="inherit" startIcon={<AutorenewOutlined />} disabled={generando} onClick={generarAhora}>
          Generar ahora
        </Button>
        <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={() => setEditando({})}>
          Nuevo plan
        </Button>
      </Header>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="secondary" indicatorColor="secondary" sx={{ mb: 2 }}>
        <Tab label={`Facturas para enviar${porEnviar.data.length ? ` (${porEnviar.data.length})` : ""}`} />
        <Tab label="Planes de cobro" />
      </Tabs>

      {tab === 0 ? (
        <Box>
          <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
            <TextField select size="small" label="Mostrar" value={filtroEnvio} onChange={(e) => setFiltroEnvio(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="no">Por enviar</MenuItem>
              <MenuItem value="si">Ya enviadas</MenuItem>
              <MenuItem value="todas">Todas</MenuItem>
            </TextField>
            <Typography variant="body2" color={colors.gray[300]}>
              Las facturas se generan solas el día de cobro de cada plan. Con el botón de WhatsApp o correo se descarga el PDF y se abre el mensaje listo: solo adjunta el PDF y envía.
            </Typography>
          </Box>
          {facturas.error && <Alert severity="error" sx={{ mb: 2 }}>{facturas.error}</Alert>}
          <DataTable rows={facturas.data} columns={colFacturas} loading={facturas.cargando}
            onRowClick={({ row }) => navigate(`/facturas/${row.id}`)} sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }} />
        </Box>
      ) : (
        <Box>
          {planes.error && <Alert severity="error" sx={{ mb: 2 }}>{planes.error}</Alert>}
          {!planes.cargando && !planes.data.length && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Crea un plan para cada cliente al que le cobras lo mismo cada mes (arriendo, mensualidad, soporte, hosting…).
            </Alert>
          )}
          <DataTable rows={planes.data} columns={colPlanes} loading={planes.cargando} onRowDoubleClick={({ row }) => setEditando(row)} />
        </Box>
      )}

      <PlanDialog
        open={!!editando}
        plan={editando}
        clientes={aux.clientes}
        productos={aux.productos}
        ivaDefecto={Number(aux.empresa?.iva_por_defecto ?? 19)}
        onClose={() => setEditando(null)}
        onGuardar={guardarPlan}
      />
      <ConfirmDialog
        open={!!borrando}
        title="Eliminar plan de cobro"
        message="No se generarán más cobros para este plan. Las facturas ya emitidas se conservan. Si solo quieres detenerlo un tiempo, edítalo y ponlo en Pausado."
        confirmLabel="Eliminar"
        onCancel={() => setBorrando(null)}
        onConfirm={eliminarPlan}
      />
    </Box>
  );
}
