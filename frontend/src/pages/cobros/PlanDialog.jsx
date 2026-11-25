/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField, Typography,
} from "@mui/material";
import ItemsEditor, { conLlaves, nuevaLinea, sinLlaves } from "../../components/ItemsEditor";
import { hoy } from "../../utils/format";

const DIAS = Array.from({ length: 28 }, (_, i) => i + 1);

const vacio = () => ({
  cliente_id: null, nombre: "", dia_facturacion: 1, dias_plazo: 10, fecha_inicio: hoy(), fecha_fin: "",
  activo: true, notas: "", items: [nuevaLinea()],
});

/** Crear / editar un plan de cobro mensual */
const PlanDialog = ({ open, plan, clientes, productos, ivaDefecto, onClose, onGuardar }) => {
  const [v, setV] = useState(vacio);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setV(plan?.id
      ? { ...plan, fecha_inicio: plan.fecha_inicio?.slice(0, 10), fecha_fin: plan.fecha_fin?.slice(0, 10) || "", notas: plan.notas || "", items: conLlaves(plan.items) }
      : vacio());
  }, [open, plan]);

  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const cliente = clientes.find((c) => c.id === v.cliente_id) || null;
  const inicioPasado = !plan?.id && v.fecha_inicio && v.fecha_inicio < hoy();

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await onGuardar({ ...v, fecha_fin: v.fecha_fin || null, items: sinLlaves(v.items) });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={guardar}>
        <DialogTitle>{plan?.id ? "Editar plan de cobro" : "Nuevo plan de cobro mensual"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                size="small" options={clientes} value={cliente}
                onChange={(_, c) => setV({ ...v, cliente_id: c?.id ?? null })}
                getOptionLabel={(c) => `${c.nombre} · ${c.identificacion}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(p) => <TextField {...p} label="Cliente" required />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField size="small" fullWidth required label="Concepto (sale en la factura)" placeholder="Ej: Plan mensual de hosting"
                value={v.nombre} onChange={set("nombre")} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField size="small" fullWidth select label="Día de cobro" value={v.dia_facturacion} onChange={set("dia_facturacion")}
                helperText="Día del mes (1 a 28)">
                {DIAS.map((d) => <MenuItem key={d} value={d}>Día {d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField size="small" fullWidth type="number" label="Plazo para pagar" value={v.dias_plazo} onChange={set("dias_plazo")}
                inputProps={{ min: 0, max: 90 }} helperText="Días hasta el vencimiento" />
            </Grid>
            <Grid item xs={6} md={2.25}>
              <TextField size="small" fullWidth type="date" label="Inicia" required value={v.fecha_inicio} onChange={set("fecha_inicio")}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} md={2.25}>
              <TextField size="small" fullWidth type="date" label="Termina (opcional)" value={v.fecha_fin} onChange={set("fecha_fin")}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={1.5}>
              <TextField size="small" fullWidth select label="Estado" value={v.activo} onChange={set("activo")}>
                <MenuItem value={true}>Activo</MenuItem>
                <MenuItem value={false}>Pausado</MenuItem>
              </TextField>
            </Grid>
            {inicioPasado && (
              <Grid item xs={12}>
                <Alert severity="info">
                  La fecha de inicio ya pasó: al guardar se generan de una vez los meses cuyo día de cobro ya llegó.
                </Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography component="h2" variant="h4" mb={1}>Qué se cobra cada mes</Typography>
              <ItemsEditor items={v.items} onChange={(items) => setV({ ...v, items })} productos={productos} ivaDefecto={ivaDefecto} />
            </Grid>
            <Grid item xs={12}>
              <TextField size="small" fullWidth multiline minRows={2} label="Notas para la factura (opcional)" value={v.notas} onChange={set("notas")} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={guardando || !v.cliente_id || !v.items.length}>
            Guardar plan
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PlanDialog;
