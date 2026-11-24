import { useState } from "react";
import {
  Alert, Box, Dialog, DialogContent, DialogTitle, Grid, IconButton, LinearProgress, MenuItem, Tab, Table,
  TableBody, TableCell, TableFooter, TableHead, TableRow, Tabs, TextField, Tooltip, Typography, useTheme, Button,
} from "@mui/material";
import {
  AccountBalanceWalletOutlined, DeleteOutline, PercentOutlined, PaidOutlined, SavingsOutlined, TrendingDownOutlined,
} from "@mui/icons-material";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import PeriodoFiltro from "../../components/PeriodoFiltro";
import CrudPage from "../../components/CrudPage";
import { useNotify } from "../../components/Notifier";
import useCarga from "../../hooks/useCarga";
import { inversionistasApi } from "../../api";
import { mensajeError } from "../../api/client";
import { formatoFecha, formatoMoneda, formatoPorcentaje, hoy, inicioDeMes, leerNumero } from "../../utils/format";
import { tokens } from "../../theme";

/* ---------- Pestaña 1: reparto de utilidades ---------- */
function Reparto() {
  const colors = tokens(useTheme().palette.mode);
  const [filtros, setFiltros] = useState({ desde: inicioDeMes(), hasta: hoy(), criterio: "causado" });
  const { data: r, cargando, error } = useCarga(() => inversionistasApi.reparto(filtros), [filtros]);
  const tonoUtilidad = (r?.utilidad ?? 0) < 0 ? "red" : "green";

  return (
    <Box>
      <Box mb={2}>
        <PeriodoFiltro value={filtros} onChange={setFiltros}>
          <TextField select size="small" label="Ingresos" sx={{ minWidth: 220 }} value={filtros.criterio}
            onChange={(e) => setFiltros({ ...filtros, criterio: e.target.value })}>
            <MenuItem value="causado">Facturado (pagadas + pendientes)</MenuItem>
            <MenuItem value="recaudado">Recaudado (solo pagadas)</MenuItem>
          </TextField>
        </PeriodoFiltro>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {cargando && <LinearProgress sx={{ mb: 2 }} />}
      {r && (
        <>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Ingresos (sin IVA)" value={formatoMoneda(r.ingresos)} icon={<PaidOutlined />} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Gastos" value={formatoMoneda(r.gastos)} icon={<TrendingDownOutlined />} tone="red" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Utilidad a repartir" value={formatoMoneda(r.utilidad)} icon={<AccountBalanceWalletOutlined />} tone={tonoUtilidad} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Rentabilidad del periodo" value={formatoPorcentaje(r.rentabilidad_total)}
                subtitle={`sobre ${formatoMoneda(r.capital_total)} de capital`} icon={<PercentOutlined />} tone={tonoUtilidad} />
            </Grid>
          </Grid>

          <Box bgcolor={colors.primary[400]} p={2.5} borderRadius={2} overflow="auto">
            <Typography variant="h4" fontWeight="bold" mb={0.5}>Reparto por inversionista</Typography>
            <Typography variant="body2" color={colors.gray[300]} mb={2}>
              Participación = capital aportado ÷ capital total (aportes hasta la fecha final) · Ganancia = utilidad × participación ·
              Rentabilidad = ganancia ÷ capital del inversionista
            </Typography>
            {r.inversionistas.length === 0 ? (
              <Alert severity="info">Registra inversionistas y sus aportes en la pestaña “Inversionistas y aportes”.</Alert>
            ) : (
              <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Inversionista</TableCell>
                    <TableCell align="right">Capital aportado</TableCell>
                    <TableCell width="28%">Participación</TableCell>
                    <TableCell align="right">Ganancia del periodo</TableCell>
                    <TableCell align="right">Rentabilidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {r.inversionistas.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell><b>{i.nombre}</b></TableCell>
                      <TableCell align="right">{formatoMoneda(i.capital)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress variant="determinate" value={i.participacion} color="secondary"
                            sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                          <Typography width={64} textAlign="right">{formatoPorcentaje(i.participacion)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ color: i.ganancia < 0 ? colors.redAccent[500] : colors.greenAccent[500], fontWeight: "bold" }}>
                        {formatoMoneda(i.ganancia)}
                      </TableCell>
                      <TableCell align="right">{formatoPorcentaje(i.rentabilidad)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell><b>Total</b></TableCell>
                    <TableCell align="right"><b>{formatoMoneda(r.capital_total)}</b></TableCell>
                    <TableCell><b>100 %</b></TableCell>
                    <TableCell align="right"><b>{formatoMoneda(r.utilidad)}</b></TableCell>
                    <TableCell align="right"><b>{formatoPorcentaje(r.rentabilidad_total)}</b></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

/* ---------- Diálogo de aportes de un inversionista ---------- */
// eslint-disable-next-line react/prop-types
function AportesDialog({ inversionista, onClose }) {
  const notify = useNotify();
  const id = inversionista?.id;
  const { data: aportes, recargar } = useCarga(() => (id ? inversionistasApi.aportes(id) : Promise.resolve([])), [id], []);
  const [nuevo, setNuevo] = useState({ fecha: hoy(), monto: "", nota: "" });
  const total = aportes.reduce((a, x) => a + x.monto, 0);

  const agregar = async (e) => {
    e.preventDefault();
    try {
      await inversionistasApi.crearAporte(id, { ...nuevo, monto: leerNumero(nuevo.monto) });
      setNuevo({ fecha: hoy(), monto: "", nota: "" });
      recargar();
    } catch (err) {
      notify(mensajeError(err), "error");
    }
  };

  const borrar = async (aporteId) => {
    try {
      await inversionistasApi.eliminarAporte(aporteId);
      recargar();
    } catch (err) {
      notify(mensajeError(err), "error");
    }
  };

  return (
    <Dialog open={!!inversionista} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Aportes de {inversionista?.nombre} · {formatoMoneda(total)}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={agregar} display="flex" gap={1} pt={1} mb={2} flexWrap="wrap">
          <TextField size="small" type="date" label="Fecha" InputLabelProps={{ shrink: true }} value={nuevo.fecha}
            onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })} />
          <TextField size="small" label="Monto" required value={nuevo.monto} sx={{ width: 150 }}
            helperText="Negativo = retiro" onChange={(e) => setNuevo({ ...nuevo, monto: e.target.value })} />
          <TextField size="small" label="Nota" value={nuevo.nota} sx={{ flex: 1, minWidth: 120 }}
            onChange={(e) => setNuevo({ ...nuevo, nota: e.target.value })} />
          <Button type="submit" variant="contained" color="secondary" sx={{ height: 40 }}>Agregar</Button>
        </Box>
        <Table size="small">
          <TableBody>
            {aportes.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{formatoFecha(a.fecha)}</TableCell>
                <TableCell>{a.nota}</TableCell>
                <TableCell align="right">{formatoMoneda(a.monto)}</TableCell>
                <TableCell width={40}>
                  <IconButton size="small" onClick={() => borrar(a.id)}><DeleteOutline fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!aportes.length && (
              <TableRow><TableCell align="center" colSpan={4}>Sin aportes registrados</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Pestaña 2: inversionistas y aportes ---------- */
function Inversionistas() {
  const [verAportes, setVerAportes] = useState(null);
  const [recargarKey, setRecargarKey] = useState(0);

  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 180 },
    { field: "identificacion", headerName: "Documento", width: 140 },
    { field: "telefono", headerName: "Teléfono", width: 130 },
    { field: "capital", headerName: "Capital aportado", width: 160, align: "right", headerAlign: "right", valueFormatter: ({ value }) => formatoMoneda(value) },
    { field: "num_aportes", headerName: "Aportes", width: 90, align: "right", headerAlign: "right" },
    { field: "activo", headerName: "Activo", width: 80, valueFormatter: ({ value }) => (value ? "Sí" : "No") },
  ];

  return (
    <>
      <CrudPage
        title=""
        singular="Inversionista"
        api={inversionistasApi}
        columns={columns}
        recargarKey={recargarKey}
        campos={[
          { name: "nombre", label: "Nombre", required: true },
          { name: "identificacion", label: "Documento", xs: 6 },
          { name: "telefono", label: "Teléfono", xs: 6 },
          { name: "email", label: "Correo", type: "email", xs: 8 },
          { name: "activo", label: "Activo", type: "select", options: [{ value: true, label: "Sí" }, { value: false, label: "No" }], xs: 4 },
        ]}
        nuevoInicial={{ activo: true }}
        accionesExtra={(row) => (
          <Tooltip title="Aportes de capital">
            <IconButton size="small" onClick={() => setVerAportes(row)}><SavingsOutlined fontSize="small" /></IconButton>
          </Tooltip>
        )}
      />
      <AportesDialog
        inversionista={verAportes}
        onClose={() => { setVerAportes(null); setRecargarKey((k) => k + 1); }}
      />
    </>
  );
}

export default function InversionistasPage() {
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <Header title="Inversionistas" subtitle="Ganancia y porcentaje de cada socio según su aporte" />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="secondary" indicatorColor="secondary" sx={{ mb: 2 }}>
        <Tab label="Reparto de utilidades" />
        <Tab label="Inversionistas y aportes" />
      </Tabs>
      {tab === 0 ? <Reparto /> : <Inversionistas />}
    </Box>
  );
}
