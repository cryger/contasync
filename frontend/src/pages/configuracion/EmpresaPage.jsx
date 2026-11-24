import { useEffect, useState } from "react";
import { Box, Button, Grid, TextField } from "@mui/material";
import Header from "../../components/Header";
import { useNotify } from "../../components/Notifier";
import { empresaApi } from "../../api";
import { mensajeError } from "../../api/client";
import { useColors } from "../../theme";

const CAMPOS = [
  { name: "razon_social", label: "Razón social", xs: 8, required: true },
  { name: "nit", label: "NIT", xs: 4, required: true },
  { name: "direccion", label: "Dirección", xs: 6 },
  { name: "telefono", label: "Teléfono", xs: 3 },
  { name: "email", label: "Correo", xs: 3 },
  { name: "prefijo_factura", label: "Prefijo de factura", xs: 4, required: true },
  { name: "siguiente_numero", label: "Siguiente número", xs: 4, type: "number", required: true },
  { name: "iva_por_defecto", label: "IVA por defecto (%)", xs: 4, type: "number", required: true },
  { name: "resolucion", label: "Resolución de facturación (sale en el PDF)", xs: 12, multiline: true },
  { name: "pie_factura", label: "Pie de factura (cuentas bancarias, condiciones…)", xs: 12, multiline: true },
];

export default function EmpresaPage() {
  const colors = useColors();
  const notify = useNotify();
  const [valores, setValores] = useState(null);

  useEffect(() => {
    empresaApi.obtener().then(setValores).catch((err) => notify(mensajeError(err), "error"));
  }, [notify]);

  const guardar = async (e) => {
    e.preventDefault();
    try {
      setValores(await empresaApi.actualizar(valores));
      notify("Datos de la empresa guardados");
    } catch (err) {
      notify(mensajeError(err), "error");
    }
  };

  if (!valores) return null;

  return (
    <Box>
      <Header title="Empresa" subtitle="Datos que aparecen en tus facturas y numeración" />
      <Box component="form" onSubmit={guardar} bgcolor={colors.base[400]} p={3} borderRadius={2} maxWidth={900}>
        <Grid container spacing={2}>
          {CAMPOS.map((c) => (
            <Grid item xs={12} md={c.xs} key={c.name}>
              <TextField
                fullWidth size="small" label={c.label} type={c.type} required={c.required}
                multiline={c.multiline} minRows={c.multiline ? 2 : undefined}
                value={valores[c.name] ?? ""}
                onChange={(e) => setValores({ ...valores, [c.name]: e.target.value })}
              />
            </Grid>
          ))}
        </Grid>
        <Box mt={3} textAlign="right">
          <Button type="submit" variant="contained" color="secondary">Guardar</Button>
        </Box>
      </Box>
    </Box>
  );
}
