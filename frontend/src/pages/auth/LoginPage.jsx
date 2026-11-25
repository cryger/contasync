import { useEffect, useState } from "react";
import {
  Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../../auth/AuthContext";
import { authApi } from "../../api";
import { mensajeError } from "../../api/client";
import { useColors, useMarca } from "../../theme";
import { contraste, mezclar } from "../../utils/color";

export default function LoginPage() {
  const colors = useColors();
  const { marca } = useMarca();
  const { login, configuracionInicial, aviso } = useAuth();
  const ancho = useMediaQuery("(min-width:900px)");

  const [configurado, setConfigurado] = useState(null); // null = consultando
  const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmar: "" });
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    authApi.estado()
      .then((r) => setConfigurado(r.configurado))
      .catch((err) => { setConfigurado(true); setError(mensajeError(err)); });
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    if (!configurado && form.password !== form.confirmar) return setError("Las contraseñas no coinciden");
    setEnviando(true);
    try {
      if (configurado) await login(form.email, form.password);
      else await configuracionInicial({ nombre: form.nombre, email: form.email, password: form.password });
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const base = marca.color_base;
  const textoBase = contraste(base);

  const campoClave = (k, label, autoComplete) => (
    <TextField
      fullWidth label={label} type={verClave ? "text" : "password"} value={form[k]} onChange={set(k)} required
      autoComplete={autoComplete} sx={{ mb: 2 }}
      helperText={!configurado && k === "password" ? "Mínimo 8 caracteres" : undefined}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setVerClave(!verClave)} edge="end" aria-label="Mostrar contraseña" tabIndex={-1}>
              {verClave ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <Box minHeight="100vh" display="flex" bgcolor={colors.base[500]}>
      {/* Panel de marca */}
      {ancho && (
        <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center" p={6} color={textoBase}
          sx={{ background: `linear-gradient(150deg, ${base} 0%, ${mezclar(base, marca.color_acento, 0.35)} 100%)`, position: "relative", overflow: "hidden" }}>
          <Box position="absolute" width={420} height={420} borderRadius="50%" bgcolor={marca.color_acento}
            sx={{ opacity: 0.12, top: -120, right: -120 }} />
          <Box position="absolute" width={300} height={300} borderRadius="50%" bgcolor={marca.color_secundario}
            sx={{ opacity: 0.1, bottom: -90, left: -90 }} />
          <Box bgcolor="#fff" borderRadius={4} p={2} mb={3} boxShadow="0 10px 40px rgba(0,0,0,.25)" zIndex={1}>
            <img src={marca.logo || "/logo_contasync_svg.svg"} alt="" style={{ width: 110, height: 110, objectFit: "contain", display: "block" }} />
          </Box>
          <Typography variant="h1" fontWeight="bold" textAlign="center" zIndex={1}>{marca.nombre_comercial}</Typography>
          <Typography variant="h5" mt={1} sx={{ opacity: 0.8 }} textAlign="center" zIndex={1}>
            Facturación rápida y control de tu negocio
          </Typography>
        </Box>
      )}

      {/* Formulario */}
      <Box flex={{ xs: 1, md: "0 0 480px" }} display="flex" alignItems="center" justifyContent="center" p={3}>
        <Box component="form" onSubmit={enviar} width="100%" maxWidth={380}>
          {!ancho && (
            <Box textAlign="center" mb={3}>
              <img src={marca.logo || "/logo_contasync_svg.svg"} alt="" style={{ width: 72, height: 72, objectFit: "contain" }} />
              <Typography variant="h3" fontWeight="bold" mt={1}>{marca.nombre_comercial}</Typography>
            </Box>
          )}

          {configurado === null ? (
            <Box textAlign="center"><CircularProgress color="secondary" /></Box>
          ) : (
            <>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Box width={40} height={40} borderRadius={2} bgcolor={colors.acento[500]} color={colors.texto_sobre_acento}
                  display="flex" alignItems="center" justifyContent="center"><LockOutlined /></Box>
                <Typography variant="h2" fontWeight="bold">{configurado ? "Iniciar sesión" : "Bienvenido"}</Typography>
              </Box>
              <Typography color={colors.gray[300]} mb={3}>
                {configurado
                  ? "Ingresa con tu correo y contraseña."
                  : "Es la primera vez que se usa el sistema. Crea la cuenta del administrador."}
              </Typography>

              {aviso && !error && <Alert severity="info" sx={{ mb: 2 }}>{aviso}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              {!configurado && (
                <TextField fullWidth label="Tu nombre" value={form.nombre} onChange={set("nombre")} required autoFocus sx={{ mb: 2 }} />
              )}
              <TextField fullWidth label="Correo" type="email" value={form.email} onChange={set("email")} required
                autoComplete="username" autoFocus={configurado} sx={{ mb: 2 }} />
              {campoClave("password", "Contraseña", configurado ? "current-password" : "new-password")}
              {!configurado && campoClave("confirmar", "Confirmar contraseña", "new-password")}

              <Button type="submit" fullWidth size="large" variant="contained" color="secondary" disabled={enviando} sx={{ py: 1.4, mt: 1 }}>
                {enviando ? <CircularProgress size={22} color="inherit" /> : configurado ? "Entrar" : "Crear administrador y entrar"}
              </Button>
              {configurado && (
                <Typography variant="body2" color={colors.textoSuave} textAlign="center" mt={3}>
                  ¿Olvidaste tu contraseña? Pídele al administrador que la cambie en Usuarios.
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
