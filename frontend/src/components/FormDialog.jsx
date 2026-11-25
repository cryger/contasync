/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField,
} from "@mui/material";

/**
 * Diálogo de formulario genérico a partir de una lista de campos.
 * campos: [{ name, label, type?: 'text'|'number'|'date'|'email'|'select', options?: [...], required?, xs?, multiline? }]
 */
const FormDialog = ({ open, title, campos, inicial, onClose, onSubmit, submitLabel = "Guardar" }) => {
  const [valores, setValores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Se cargan los valores solo al abrir, para no borrar lo que se está escribiendo
  useEffect(() => {
    if (open) setValores(inicial || {});
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (name) => (e) => setValores((v) => ({ ...v, [name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await onSubmit(valores);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={enviar}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {campos.map((c, i) => (
              <Grid item xs={12} sm={c.xs || 12} key={c.name}>
                <TextField
                  fullWidth
                  size="small"
                  autoFocus={i === 0}
                  label={c.label}
                  type={c.type === "select" ? undefined : c.type || "text"}
                  select={c.type === "select"}
                  required={c.required}
                  multiline={c.multiline}
                  minRows={c.multiline ? 2 : undefined}
                  value={valores[c.name] ?? ""}
                  onChange={set(c.name)}
                  InputLabelProps={c.type === "date" ? { shrink: true } : undefined}
                  inputProps={c.type === "number" ? { step: "any" } : undefined}
                  helperText={c.help}
                >
                  {c.type === "select" &&
                    c.options.map((o) => {
                      const op = typeof o === "object" ? o : { value: o, label: o };
                      return <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>;
                    })}
                </TextField>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" color="secondary" disabled={guardando}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormDialog;
