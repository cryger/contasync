/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import {
  Autocomplete, Box, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { AddOutlined, DeleteOutline } from "@mui/icons-material";
import { calcularFactura } from "../utils/factura";
import { formatoMoneda } from "../utils/format";

let k = 1;
export const nuevaLinea = (iva = 0) => ({
  key: k++, producto_id: null, descripcion: "", cantidad: 1, precio_unitario: 0, descuento_porcentaje: 0, iva_porcentaje: iva,
});
export const conLlaves = (items = []) => items.map((it) => ({ ...it, key: k++ }));
export const sinLlaves = (items) => items.map(({ key, ...it }) => it); // eslint-disable-line no-unused-vars

/** Editor de ítems (producto del catálogo o línea libre) con total en vivo */
const ItemsEditor = ({ items, onChange, productos = [], ivaDefecto = 19 }) => {
  const [busqueda, setBusqueda] = useState("");
  const calculo = useMemo(() => calcularFactura(items), [items]);

  const agregar = (p) => {
    if (!p) return;
    onChange([...items, { ...nuevaLinea(), producto_id: p.id, descripcion: p.nombre, precio_unitario: Number(p.precio), iva_porcentaje: Number(p.iva_porcentaje) }]);
    setBusqueda("");
  };
  const editar = (key, campo) => (e) => onChange(items.map((it) => (it.key === key ? { ...it, [campo]: e.target.value } : it)));
  const num = { size: "small", type: "number", fullWidth: true, inputProps: { step: "any", min: 0, style: { textAlign: "right" } } };

  return (
    <Box>
      <Box display="flex" gap={1} mb={1}>
        <Autocomplete
          fullWidth size="small" options={productos} value={null} inputValue={busqueda}
          onInputChange={(_, v, r) => r !== "reset" && setBusqueda(v)} onChange={(_, v) => agregar(v)}
          getOptionLabel={(p) => `${p.codigo ? `[${p.codigo}] ` : ""}${p.nombre} — ${formatoMoneda(p.precio)}`}
          renderInput={(p) => <TextField {...p} label="Agregar producto o servicio del catálogo" />}
        />
        <Button variant="outlined" color="secondary" startIcon={<AddOutlined />} sx={{ whiteSpace: "nowrap" }}
          onClick={() => onChange([...items, nuevaLinea(ivaDefecto)])}>
          Línea libre
        </Button>
      </Box>
      <Box overflow="auto" tabIndex={0} role="region" aria-label="Detalle de ítems">
        <Table size="small" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell>Descripción</TableCell>
              <TableCell width={80} align="right">Cant.</TableCell>
              <TableCell width={130} align="right">Precio</TableCell>
              <TableCell width={80} align="right">Desc. %</TableCell>
              <TableCell width={80} align="right">IVA %</TableCell>
              <TableCell width={110} align="right">Total</TableCell>
              <TableCell width={40} />
            </TableRow>
          </TableHead>
          <TableBody>
            {calculo.items.map((it) => (
              <TableRow key={it.key}>
                <TableCell><TextField size="small" fullWidth value={it.descripcion} onChange={editar(it.key, "descripcion")} placeholder="Descripción" /></TableCell>
                <TableCell><TextField {...num} value={it.cantidad} onChange={editar(it.key, "cantidad")} /></TableCell>
                <TableCell><TextField {...num} value={it.precio_unitario} onChange={editar(it.key, "precio_unitario")} /></TableCell>
                <TableCell><TextField {...num} value={it.descuento_porcentaje} onChange={editar(it.key, "descuento_porcentaje")} /></TableCell>
                <TableCell><TextField {...num} value={it.iva_porcentaje} onChange={editar(it.key, "iva_porcentaje")} /></TableCell>
                <TableCell align="right"><b>{formatoMoneda(it.total)}</b></TableCell>
                <TableCell>
                  <IconButton size="small" aria-label={`Quitar ${it.descripcion || "línea"}`} onClick={() => onChange(items.filter((x) => x.key !== it.key))}><DeleteOutline fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!items.length && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, opacity: 0.7 }}>Agrega lo que se cobra cada mes</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Box display="flex" justifyContent="flex-end" gap={3} mt={1.5}>
        <Typography>IVA: {formatoMoneda(calculo.iva)}</Typography>
        <Typography fontWeight="bold">Total mensual: {formatoMoneda(calculo.total)}</Typography>
      </Box>
    </Box>
  );
};

export default ItemsEditor;
