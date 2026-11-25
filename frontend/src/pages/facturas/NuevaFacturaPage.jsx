import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton,
  MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import { AddOutlined, DeleteOutline, PersonAddAlt1Outlined, PictureAsPdfOutlined } from "@mui/icons-material";
import Header from "../../components/Header";
import FormDialog from "../../components/FormDialog";
import { useNotify } from "../../components/Notifier";
import { clientesApi, empresaApi, facturasApi, productosApi } from "../../api";
import { mensajeError } from "../../api/client";
import { calcularFactura, MEDIOS_PAGO } from "../../utils/factura";
import { formatoMoneda, hoy } from "../../utils/format";
import { descargarFacturaPDF } from "../../utils/pdfFactura";
import { CAMPOS_CLIENTE } from "../clientes/ClientesPage";
import { estiloPanel } from "../../components/Panel";
import { fuenteMono, useColors } from "../../theme";

const CONSUMIDOR_FINAL = "222222222222";
let siguienteKey = 1;

const lineaVacia = (iva = 0) => ({
  key: siguienteKey++, producto_id: null, descripcion: "", cantidad: 1, precio_unitario: 0,
  descuento_porcentaje: 0, iva_porcentaje: iva,
});

const encabezadoInicial = () => ({
  fecha: hoy(), forma_pago: "contado", medio_pago: "efectivo", vencimiento: "", notas: "",
});

export default function NuevaFacturaPage() {
  const colors = useColors();
  const notify = useNotify();
  const navigate = useNavigate();
  const buscadorRef = useRef(null);

  const [empresa, setEmpresa] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [enc, setEnc] = useState(encabezadoInicial);
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [nuevoCliente, setNuevoCliente] = useState(false);
  const [emitiendo, setEmitiendo] = useState(false);
  const [emitida, setEmitida] = useState(null);

  // Carga inicial: empresa, clientes y productos activos
  useEffect(() => {
    Promise.all([empresaApi.obtener(), clientesApi.listar(), productosApi.listar({ activo: true })])
      .then(([emp, cli, prod]) => {
        setEmpresa(emp);
        setClientes(cli);
        setProductos(prod);
        setCliente(cli.find((c) => c.identificacion === CONSUMIDOR_FINAL) || null);
      })
      .catch((err) => notify(mensajeError(err), "error"));
  }, [notify]);

  const calculo = useMemo(() => calcularFactura(items), [items]);
  const ivaDefecto = Number(empresa?.iva_por_defecto ?? 19);

  // Agregar producto: si ya está en la factura, suma 1 a la cantidad
  const agregarProducto = (prod) => {
    if (!prod) return;
    setItems((prev) => {
      const i = prev.findIndex((it) => it.producto_id === prod.id && Number(it.descuento_porcentaje) === 0);
      if (i >= 0) return prev.map((it, j) => (j === i ? { ...it, cantidad: Number(it.cantidad) + 1 } : it));
      return [...prev, {
        ...lineaVacia(), producto_id: prod.id, descripcion: prod.nombre,
        precio_unitario: Number(prod.precio), iva_porcentaje: Number(prod.iva_porcentaje),
      }];
    });
    setBusqueda("");
    setTimeout(() => buscadorRef.current?.focus(), 0);
  };

  const editarItem = (key, campo) => (e) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, [campo]: e.target.value } : it)));

  const quitarItem = (key) => setItems((prev) => prev.filter((it) => it.key !== key));

  const reiniciar = () => {
    setItems([]);
    setEnc(encabezadoInicial());
    setCliente(clientes.find((c) => c.identificacion === CONSUMIDOR_FINAL) || null);
    setEmitida(null);
    empresaApi.obtener().then(setEmpresa).catch(() => {});
    setTimeout(() => buscadorRef.current?.focus(), 0);
  };

  const emitir = async () => {
    if (emitiendo) return;
    if (!items.length) return notify("Agrega al menos un producto o servicio", "warning");
    if (items.some((it) => !String(it.descripcion).trim())) return notify("Hay líneas sin descripción", "warning");
    setEmitiendo(true);
    try {
      const factura = await facturasApi.crear({
        ...enc,
        vencimiento: enc.forma_pago === "credito" ? enc.vencimiento || null : null,
        cliente_id: cliente?.id,
        items: items.map(({ key, ...it }) => it), // eslint-disable-line no-unused-vars
      });
      setEmitida(factura);
    } catch (err) {
      notify(mensajeError(err), "error");
    } finally {
      setEmitiendo(false);
    }
  };

  // Atajo: Ctrl + Enter emite la factura
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key === "Enter" && !emitida) emitir();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const crearCliente = async (valores) => {
    try {
      const c = await clientesApi.crear(valores);
      setClientes((prev) => [...prev, c].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setCliente(c);
      setNuevoCliente(false);
      notify("Cliente creado");
    } catch (err) {
      notify(mensajeError(err), "error");
    }
  };

  const campo = (name) => ({
    value: enc[name],
    onChange: (e) => setEnc((p) => ({ ...p, [name]: e.target.value })),
    size: "small",
    fullWidth: true,
  });

  const celdaNum = { size: "small", type: "number", fullWidth: true, inputProps: { step: "any", min: 0, style: { textAlign: "right" } } };

  return (
    <Box>
      <Header title="Nueva factura" subtitle={empresa ? `Siguiente número: ${empresa.prefijo_factura}-${empresa.siguiente_numero}` : " "} />

      <Grid container spacing={3}>
        {/* Columna principal */}
        <Grid item xs={12} lg={8.5}>
          <Box {...estiloPanel(colors)} mb={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5} display="flex" gap={1}>
                <Autocomplete
                  fullWidth
                  size="small"
                  options={clientes}
                  value={cliente}
                  onChange={(_, v) => setCliente(v)}
                  getOptionLabel={(c) => `${c.nombre} · ${c.identificacion}`}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderInput={(p) => <TextField {...p} label="Cliente" />}
                />
                <Tooltip title="Cliente nuevo">
                  <IconButton aria-label="Crear cliente nuevo" onClick={() => setNuevoCliente(true)}><PersonAddAlt1Outlined /></IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={6} md={2.5}>
                <TextField {...campo("fecha")} type="date" label="Fecha" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6} md={2.25}>
                <TextField {...campo("forma_pago")} select label="Forma de pago">
                  <MenuItem value="contado">Contado</MenuItem>
                  <MenuItem value="credito">Crédito</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={2.25}>
                {enc.forma_pago === "credito" ? (
                  <TextField {...campo("vencimiento")} type="date" label="Vence" InputLabelProps={{ shrink: true }} />
                ) : (
                  <TextField {...campo("medio_pago")} select label="Medio de pago">
                    {MEDIOS_PAGO.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </TextField>
                )}
              </Grid>
            </Grid>
          </Box>

          <Box {...estiloPanel(colors)}>
            <Box display="flex" gap={1} mb={2}>
              <Autocomplete
                fullWidth
                size="small"
                options={productos}
                value={null}
                inputValue={busqueda}
                onInputChange={(_, v, reason) => reason !== "reset" && setBusqueda(v)}
                onChange={(_, v) => agregarProducto(v)}
                blurOnSelect={false}
                clearOnBlur={false}
                getOptionLabel={(p) => `${p.codigo ? `[${p.codigo}] ` : ""}${p.nombre}`}
                renderOption={(props, p) => (
                  <li {...props} key={p.id}>
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <span>{p.codigo ? `[${p.codigo}] ` : ""}{p.nombre}</span>
                      <b>{formatoMoneda(p.precio)}</b>
                    </Box>
                  </li>
                )}
                noOptionsText="Sin coincidencias — usa “Línea libre”"
                renderInput={(p) => (
                  <TextField {...p} inputRef={buscadorRef} autoFocus label="Buscar producto o servicio por nombre o código (Enter para agregar)" />
                )}
              />
              <Button variant="outlined" color="secondary" startIcon={<AddOutlined />} sx={{ whiteSpace: "nowrap" }}
                onClick={() => setItems((p) => [...p, lineaVacia(ivaDefecto)])}>
                Línea libre
              </Button>
            </Box>

            <Box overflow="auto" tabIndex={0} role="region" aria-label="Detalle de ítems">
              <Table size="small" sx={{ minWidth: 820, "& input[type=number]": { MozAppearance: "textfield" }, "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Descripción</TableCell>
                    <TableCell width={80} align="right">Cant.</TableCell>
                    <TableCell width={150} align="right">Precio unit.</TableCell>
                    <TableCell width={90} align="right">Desc. %</TableCell>
                    <TableCell width={90} align="right">IVA %</TableCell>
                    <TableCell width={130} align="right">Total</TableCell>
                    <TableCell width={48} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calculo.items.map((it) => (
                    <TableRow key={it.key}>
                      <TableCell>
                        <TextField size="small" fullWidth value={it.descripcion} onChange={editarItem(it.key, "descripcion")} placeholder="Descripción" />
                      </TableCell>
                      <TableCell><TextField {...celdaNum} value={it.cantidad} onChange={editarItem(it.key, "cantidad")} /></TableCell>
                      <TableCell><TextField {...celdaNum} value={it.precio_unitario} onChange={editarItem(it.key, "precio_unitario")} /></TableCell>
                      <TableCell><TextField {...celdaNum} value={it.descuento_porcentaje} onChange={editarItem(it.key, "descuento_porcentaje")} /></TableCell>
                      <TableCell><TextField {...celdaNum} value={it.iva_porcentaje} onChange={editarItem(it.key, "iva_porcentaje")} /></TableCell>
                      <TableCell align="right"><b>{formatoMoneda(it.total)}</b></TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => quitarItem(it.key)} aria-label="Quitar"><DeleteOutline fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5, color: colors.gray[300] }}>
                        Busca un producto arriba o agrega una línea libre
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Grid>

        {/* Resumen */}
        <Grid item xs={12} lg={3.5}>
          <Box {...estiloPanel(colors)} position={{ lg: "sticky" }} top={0}>
            <Typography component="h2" variant="h4" mb={2}>Resumen</Typography>
            {[
              ["Subtotal", calculo.subtotal],
              ["Descuento", -calculo.descuento],
              ["IVA", calculo.iva],
            ].map(([l, v]) => (
              <Box key={l} display="flex" justifyContent="space-between" mb={1}>
                <Typography color={colors.gray[300]}>{l}</Typography>
                <Typography>{formatoMoneda(v)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1.5 }} />
            <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={2}>
              <Typography variant="h4">Total</Typography>
              <Typography variant="h2" fontFamily={fuenteMono} fontWeight={500} color={colors.acentoTexto}>
                {formatoMoneda(calculo.total)}
              </Typography>
            </Box>
            <TextField {...campo("notas")} label="Notas (opcional)" multiline minRows={2} sx={{ mb: 2 }} />
            <Button fullWidth size="large" variant="contained" color="secondary" disabled={emitiendo || !items.length} onClick={emitir}>
              {emitiendo ? "Emitiendo…" : "Emitir factura"}
            </Button>
            <Typography variant="body2" color={colors.textoSuave} textAlign="center" mt={1}>
              Atajo: Ctrl + Enter
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <FormDialog
        open={nuevoCliente}
        title="Nuevo cliente"
        campos={CAMPOS_CLIENTE}
        inicial={{ tipo_documento: "CC" }}
        onClose={() => setNuevoCliente(false)}
        onSubmit={crearCliente}
      />

      <Dialog open={!!emitida} onClose={reiniciar} maxWidth="xs" fullWidth>
        <DialogTitle>Factura {emitida?.numero} emitida</DialogTitle>
        <DialogContent>
          <Typography>{emitida?.cliente_nombre}</Typography>
          <Typography variant="h3" fontWeight="bold" color={colors.acentoTexto} mt={1}>
            {formatoMoneda(emitida?.total)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
          <Button color="secondary" startIcon={<PictureAsPdfOutlined />} onClick={() => descargarFacturaPDF(emitida, empresa)}>PDF</Button>
          <Button color="inherit" onClick={() => navigate(`/facturas/${emitida.id}`)}>Ver factura</Button>
          <Button variant="contained" color="secondary" onClick={reiniciar} autoFocus>Nueva factura</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
