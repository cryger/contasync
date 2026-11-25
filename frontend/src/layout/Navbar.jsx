/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import {
  Avatar, Box, Button, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import {
  AddOutlined, DarkModeOutlined, KeyOutlined, LightModeOutlined, LogoutOutlined, MenuOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ColorModeContext, useColors } from "../theme";
import { useAuth } from "../auth/AuthContext";
import { useNotify } from "../components/Notifier";
import FormDialog from "../components/FormDialog";
import { authApi } from "../api";
import { mensajeError } from "../api/client";

const iniciales = (nombre = "") =>
  nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");

const Navbar = ({ onToggleMenu }) => {
  const theme = useTheme();
  const colors = useColors();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const notify = useNotify();
  const { usuario, logout } = useAuth();
  const esMovil = useMediaQuery("(max-width:768px)");
  const [anchor, setAnchor] = useState(null);
  const [cambiarClave, setCambiarClave] = useState(false);

  const guardarClave = async ({ actual, nueva, confirmar }) => {
    if (nueva !== confirmar) return notify("Las contraseñas nuevas no coinciden", "error");
    try {
      await authApi.cambiarPassword({ actual, nueva });
      setCambiarClave(false);
      notify("Contraseña actualizada");
    } catch (err) {
      notify(mensajeError(err), "error");
    }
  };

  return (
    <Box component="header" display="flex" alignItems="center" justifyContent="space-between" px={{ xs: 1.5, md: 3 }} height={64} flexShrink={0}
      borderBottom={`1px solid ${colors.borde}`} bgcolor={colors.superficie}>
      <IconButton onClick={onToggleMenu} sx={{ visibility: esMovil ? "visible" : "hidden" }} aria-label="Abrir menú">
        <MenuOutlined />
      </IconButton>
      <Box display="flex" alignItems="center" gap={1}>
        <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={() => navigate("/facturas/nueva")}>
          {esMovil ? "Factura" : "Nueva factura"}
        </Button>
        <Tooltip title="Cambiar tema">
          <IconButton onClick={colorMode.toggleColorMode} aria-label="Cambiar tema">
            {theme.palette.mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
          </IconButton>
        </Tooltip>
        <Tooltip title={usuario?.nombre}>
          <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Menú de usuario" sx={{ p: 0.5 }}>
            <Avatar sx={{ width: 34, height: 34, fontSize: 14, fontWeight: 700, bgcolor: colors.secundario[500], color: colors.texto_sobre_secundario }}>
              {iniciales(usuario?.nombre)}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <Box px={2} py={1} minWidth={220}>
          <Typography fontWeight="bold">{usuario?.nombre}</Typography>
          <Typography variant="body2" color={colors.gray[300]}>{usuario?.email}</Typography>
          <Typography variant="body2" color={colors.acentoTexto} mt={0.5}>
            {usuario?.rol === "admin" ? "Administrador" : "Cajero"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchor(null); setCambiarClave(true); }}>
          <ListItemIcon><KeyOutlined fontSize="small" /></ListItemIcon> Cambiar contraseña
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); logout(); }}>
          <ListItemIcon><LogoutOutlined fontSize="small" /></ListItemIcon> Cerrar sesión
        </MenuItem>
      </Menu>

      <FormDialog
        open={cambiarClave}
        title="Cambiar contraseña"
        campos={[
          { name: "actual", label: "Contraseña actual", type: "password", required: true },
          { name: "nueva", label: "Nueva contraseña", type: "password", required: true, help: "Mínimo 8 caracteres" },
          { name: "confirmar", label: "Confirmar nueva contraseña", type: "password", required: true },
        ]}
        onClose={() => setCambiarClave(false)}
        onSubmit={guardarClave}
      />
    </Box>
  );
};

export default Navbar;
