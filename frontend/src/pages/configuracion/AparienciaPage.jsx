import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert, Box, Button, Grid, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from "@mui/material";
import {
  DarkModeOutlined, DeleteOutline, LightModeOutlined, PictureAsPdfOutlined, RestartAltOutlined, SaveOutlined, UploadOutlined,
} from "@mui/icons-material";
import Header from "../../components/Header";
import { useNotify } from "../../components/Notifier";
import { empresaApi } from "../../api";
import { mensajeError } from "../../api/client";
import { ColorModeContext, MARCA_DEFECTO, TEMAS_PREDEFINIDOS, extraerMarca, useColors, useMarca } from "../../theme";
import { contraste, esHex, luminancia } from "../../utils/color";
import { descargarFacturaPDF, FACTURA_EJEMPLO } from "../../utils/pdfFactura";
import { estiloPanel } from "../../components/Panel";
import FacturaPreview from "./FacturaPreview";

const COLORES = [
  { campo: "color_acento", label: "Color de acento", ayuda: "Botones, totales, cifras y la franja de la factura" },
  { campo: "color_secundario", label: "Color secundario", ayuda: "Encabezados de tablas y detalles" },
  { campo: "color_base", label: "Color base", ayuda: "Fondo del sistema y encabezado de la factura" },
];

/** Reduce el logo a máx. 300 px y lo convierte a PNG en data URL */
const procesarLogo = (archivo) =>
  new Promise((resolve, reject) => {
    if (!archivo.type.startsWith("image/")) return reject(new Error("El archivo debe ser una imagen"));
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, 300 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        if (dataUrl.length > 400 * 1024) return reject(new Error("El logo sigue siendo muy pesado, prueba con otra imagen"));
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });

export default function AparienciaPage() {
  const colors = useColors();
  const notify = useNotify();
  const { setMarca, recargarMarca } = useMarca();
  const colorMode = useContext(ColorModeContext);
  const inputLogo = useRef(null);

  const [empresa, setEmpresa] = useState(null);
  const [borrador, setBorrador] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    empresaApi
      .obtener()
      .then((e) => {
        setEmpresa(e);
        setBorrador({ ...extraerMarca(e), nombre_comercial: e.nombre_comercial || "" });
      })
      .catch((err) => notify(mensajeError(err), "error"));
    // Al salir sin guardar, se vuelve a la marca guardada
    return () => recargarMarca();
  }, [notify, recargarMarca]);

  // Vista previa en vivo: todo el sistema cambia mientras editas
  const cambiar = (cambios) => {
    const nuevo = { ...borrador, ...cambios };
    setBorrador(nuevo);
    if (esHex(nuevo.color_acento) && esHex(nuevo.color_secundario) && esHex(nuevo.color_base)) {
      setMarca(extraerMarca({ ...empresa, ...nuevo }));
    }
  };

  const subirLogo = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    try {
      cambiar({ logo: await procesarLogo(archivo) });
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const { nombre_comercial, color_acento, color_secundario, color_base, tema_modo, logo } = borrador;
      const e = await empresaApi.actualizar({ nombre_comercial, color_acento, color_secundario, color_base, tema_modo, logo });
      setEmpresa(e);
      await recargarMarca();
      notify("Apariencia guardada");
    } catch (err) {
      notify(mensajeError(err), "error");
    } finally {
      setGuardando(false);
    }
  };

  if (!borrador) return null;

  const marcaActual = extraerMarca({ ...empresa, ...borrador });
  const temaActivo = (t) =>
    ["color_acento", "color_secundario", "color_base"].every((k) => t[k].toLowerCase() === borrador[k].toLowerCase());
  const acentoMuyOscuro = esHex(borrador.color_acento) && esHex(borrador.color_base) &&
    Math.abs(luminancia(borrador.color_acento) - luminancia(borrador.color_base)) < 0.12;

  const panel = { ...estiloPanel(colors), mb: 2.5 };

  return (
    <Box>
      <Header title="Apariencia" subtitle="Personaliza el sistema y tus facturas con la marca del negocio">
        <Button color="inherit" startIcon={<RestartAltOutlined />}
          onClick={() => cambiar({ ...MARCA_DEFECTO, nombre_comercial: borrador.nombre_comercial, logo: borrador.logo })}>
          Colores originales
        </Button>
        <Button variant="outlined" color="secondary" startIcon={<PictureAsPdfOutlined />}
          onClick={() => descargarFacturaPDF(FACTURA_EJEMPLO, { ...empresa, ...borrador })}>
          Factura de ejemplo
        </Button>
        <Button variant="contained" color="secondary" startIcon={<SaveOutlined />} disabled={guardando} onClick={guardar}>
          Guardar
        </Button>
      </Header>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          {/* Identidad */}
          <Box sx={panel}>
            <Typography component="h2" variant="h4" mb={2}>Identidad</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm="auto">
                <Box width={96} height={96} borderRadius={2} bgcolor="#fff" display="flex" alignItems="center" justifyContent="center"
                  border={`2px dashed ${colors.gray[500]}`} sx={{ cursor: "pointer" }} onClick={() => inputLogo.current?.click()}>
                  {borrador.logo ? (
                    <img src={borrador.logo} alt="Logo" style={{ maxWidth: 84, maxHeight: 84, objectFit: "contain" }} />
                  ) : (
                    <UploadOutlined sx={{ color: "#999", fontSize: 32 }} />
                  )}
                </Box>
                <input ref={inputLogo} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={subirLogo} />
              </Grid>
              <Grid item xs={12} sm>
                <TextField fullWidth size="small" label="Nombre comercial (se ve en el menú)"
                  placeholder={empresa?.razon_social} value={borrador.nombre_comercial}
                  onChange={(e) => cambiar({ nombre_comercial: e.target.value })} inputProps={{ maxLength: 80 }} sx={{ mb: 1.5 }} />
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" color="secondary" startIcon={<UploadOutlined />} onClick={() => inputLogo.current?.click()}>
                    {borrador.logo ? "Cambiar logo" : "Subir logo"}
                  </Button>
                  {borrador.logo && (
                    <Button size="small" color="inherit" startIcon={<DeleteOutline />} onClick={() => cambiar({ logo: null })}>Quitar</Button>
                  )}
                </Stack>
                <Typography variant="body2" color={colors.gray[300]} mt={1}>
                  PNG o JPG, idealmente cuadrado. Se ajusta solo a 300 px.
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Temas listos */}
          <Box sx={panel}>
            <Typography component="h2" variant="h4" mb={0.5}>Temas listos</Typography>
            <Typography variant="body2" color={colors.gray[300]} mb={2}>Elige uno como punto de partida y ajústalo abajo.</Typography>
            <Grid container spacing={1.5}>
              {TEMAS_PREDEFINIDOS.map((t) => {
                const activo = temaActivo(t);
                return (
                  <Grid item xs={6} sm={4} md={2.4} key={t.nombre}>
                    <Box onClick={() => cambiar({ color_acento: t.color_acento, color_secundario: t.color_secundario, color_base: t.color_base })}
                      sx={{
                        cursor: "pointer", borderRadius: 2, overflow: "hidden", transition: ".2s",
                        outline: activo ? `3px solid ${colors.acento[500]}` : `1px solid ${colors.base[600]}`,
                        "&:hover": { transform: "translateY(-2px)" },
                      }}>
                      <Box bgcolor={t.color_base} height={46} display="flex" alignItems="flex-end" p={0.75} gap={0.5}>
                        <Box width={18} height={18} borderRadius="50%" bgcolor={t.color_acento} />
                        <Box width={12} height={12} borderRadius="50%" bgcolor={t.color_secundario} />
                      </Box>
                      <Box bgcolor={colors.base[500]} px={1} py={0.6}>
                        <Typography fontSize={11.5} fontWeight={activo ? 700 : 500} noWrap>{t.nombre}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Colores */}
          <Box sx={panel}>
            <Typography component="h2" variant="h4" mb={2}>Colores</Typography>
            <Grid container spacing={2}>
              {COLORES.map(({ campo, label, ayuda }) => (
                <Grid item xs={12} md={4} key={campo}>
                  <Box display="flex" gap={1.5} alignItems="center">
                    <Tooltip title="Elegir color">
                      <Box component="label" width={46} height={46} borderRadius={2} flexShrink={0}
                        bgcolor={esHex(borrador[campo]) ? borrador[campo] : "#000"}
                        border={`2px solid ${colors.gray[600]}`} sx={{ cursor: "pointer", position: "relative" }}>
                        <input type="color" value={esHex(borrador[campo]) ? borrador[campo] : "#000000"}
                          onChange={(e) => cambiar({ [campo]: e.target.value })}
                          style={{ opacity: 0, position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "pointer" }} />
                      </Box>
                    </Tooltip>
                    <TextField size="small" label={label} value={borrador[campo]}
                      error={!esHex(borrador[campo])}
                      onChange={(e) => cambiar({ [campo]: e.target.value.trim() })}
                      inputProps={{ maxLength: 7, style: { fontFamily: "monospace" } }} />
                  </Box>
                  <Typography variant="body2" color={colors.gray[300]} mt={0.75}>{ayuda}</Typography>
                </Grid>
              ))}
            </Grid>
            {acentoMuyOscuro && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                El color de acento y el color base se parecen mucho: los botones y cifras pueden perderse sobre el fondo.
              </Alert>
            )}
          </Box>

          {/* Modo */}
          <Box sx={panel}>
            <Typography component="h2" variant="h4" mb={0.5}>Modo por defecto</Typography>
            <Typography variant="body2" color={colors.gray[300]} mb={2}>
              Así abre el sistema. Cada persona puede cambiarlo con el ícono de sol/luna arriba.
            </Typography>
            <ToggleButtonGroup exclusive value={borrador.tema_modo}
              onChange={(_, v) => {
                if (!v) return;
                colorMode.reiniciarModo();
                cambiar({ tema_modo: v });
              }}>
              <ToggleButton value="dark"><DarkModeOutlined sx={{ mr: 1 }} /> Oscuro</ToggleButton>
              <ToggleButton value="light"><LightModeOutlined sx={{ mr: 1 }} /> Claro</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>

        {/* Vista previa de la factura */}
        <Grid item xs={12} lg={5}>
          <Box position={{ lg: "sticky" }} top={0}>
            <Box sx={{ ...panel, mb: 0 }}>
              <Typography component="h2" variant="h4" mb={0.5}>Así se verá tu factura</Typography>
              <Typography variant="body2" color={colors.gray[300]} mb={2}>
                Vista previa en vivo. Usa “Factura de ejemplo” para descargar el PDF real.
              </Typography>
              <Box maxWidth={420} mx="auto">
                <FacturaPreview marca={marcaActual} razonSocial={empresa?.razon_social} />
              </Box>
              <Box display="flex" gap={1} mt={2} justifyContent="center">
                <Button variant="contained" color="secondary" size="small">Botón principal</Button>
                <Box px={1.5} py={0.5} borderRadius={1} bgcolor={colors.secundario[600]} color={contraste(colors.secundario[600])} fontSize={12}>
                  Encabezado
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
