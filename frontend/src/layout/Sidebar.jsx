/* eslint-disable react/prop-types */
import { Box, IconButton, Typography } from "@mui/material";
import { Menu, MenuItem, Sidebar as ProSidebar } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import {
  AddCircleOutline, ContactsOutlined, EventRepeatOutlined, DashboardOutlined, Inventory2Outlined, ManageAccountsOutlined, MenuOutlined, PaletteOutlined,
  ReceiptLongOutlined, SavingsOutlined, SettingsOutlined, TrendingDownOutlined,
} from "@mui/icons-material";
import { useColors, useMarca } from "../theme";
import { useAuth } from "../auth/AuthContext";

// admin: true → solo lo ve el administrador
const SECCIONES = [
  { items: [{ title: "Inicio", path: "/", icon: <DashboardOutlined />, admin: true }] },
  {
    titulo: "Facturación",
    items: [
      { title: "Nueva factura", path: "/facturas/nueva", icon: <AddCircleOutline /> },
      { title: "Facturas", path: "/facturas", icon: <ReceiptLongOutlined /> },
      { title: "Cobros mensuales", path: "/cobros", icon: <EventRepeatOutlined />, admin: true },
      { title: "Clientes", path: "/clientes", icon: <ContactsOutlined /> },
      { title: "Productos y servicios", path: "/productos", icon: <Inventory2Outlined /> },
    ],
  },
  {
    titulo: "Finanzas",
    items: [
      { title: "Gastos", path: "/gastos", icon: <TrendingDownOutlined />, admin: true },
      { title: "Inversionistas", path: "/inversionistas", icon: <SavingsOutlined />, admin: true },
    ],
  },
  {
    titulo: "Ajustes",
    items: [
      { title: "Empresa", path: "/configuracion", icon: <SettingsOutlined />, admin: true },
      { title: "Apariencia", path: "/apariencia", icon: <PaletteOutlined />, admin: true },
      { title: "Usuarios", path: "/usuarios", icon: <ManageAccountsOutlined />, admin: true },
    ],
  },
];

const Sidebar = ({ collapsed, setCollapsed, toggled, setToggled }) => {
  const colors = useColors();
  const { marca } = useMarca();
  const { esAdmin } = useAuth();
  const secciones = SECCIONES.map((sec) => ({ ...sec, items: sec.items.filter((it) => esAdmin || !it.admin) }))
    .filter((sec) => sec.items.length);
  const { pathname } = useLocation();
  const activo = (path) => {
    if (path === "/") return pathname === "/";
    if (path === "/facturas") return pathname === "/facturas" || /^\/facturas\/\d+$/.test(pathname);
    return pathname.startsWith(path);
  };

  // Ítem activo: fondo suave + barra lateral de acento + texto en negrita (no depende solo del color)
  const estilos = {
    root: { fontSize: 14 },
    button: ({ active }) => ({
      height: 42,
      margin: "2px 10px",
      paddingLeft: collapsed ? 18 : 14,
      borderRadius: 10,
      position: "relative",
      color: active ? colors.texto : colors.textoSuave,
      fontWeight: active ? 600 : 500,
      backgroundColor: active ? colors.acentoSuave : "transparent",
      transition: "background-color 180ms ease, color 180ms ease",
      "&::before": active
        ? { content: '""', position: "absolute", left: 0, top: 9, bottom: 9, width: 3, borderRadius: 3, background: colors.acento[500] }
        : undefined,
      "&:hover": { backgroundColor: active ? colors.acentoSuave : colors.base[600], color: colors.texto },
      "&:focus-visible": { outline: `2px solid ${colors.foco}`, outlineOffset: -2 },
    }),
    icon: ({ active }) => ({ color: active ? colors.acentoTexto : "inherit", minWidth: 28, marginRight: 8 }),
  };

  return (
    <ProSidebar
      backgroundColor={colors.superficie}
      rootStyles={{ borderRight: `1px solid ${colors.borde} !important`, height: "100%" }}
      collapsed={collapsed}
      toggled={toggled}
      onBackdropClick={() => setToggled(false)}
      breakPoint="md"
      width="260px"
    >
      <Box component="nav" aria-label="Menú principal" display="flex" flexDirection="column" height="100%">
        <Box display="flex" alignItems="center" justifyContent={collapsed ? "center" : "space-between"} px={2} py={2.25}
          borderBottom={`1px solid ${colors.borde}`} mb={1}>
          {!collapsed && (
            <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
              <img
                src={marca.logo || "/logo_contasync_svg.svg"}
                alt=""
                width={34}
                height={34}
                style={{ borderRadius: 8, objectFit: "contain", flexShrink: 0 }}
              />
              <Typography variant="h4" component="span" color={colors.texto} noWrap title={marca.nombre_comercial}>
                {marca.nombre_comercial}
              </Typography>
            </Box>
          )}
          <IconButton onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            aria-expanded={!collapsed} size="small">
            <MenuOutlined />
          </IconButton>
        </Box>

        {secciones.map((sec, i) => (
          <Box key={i} mb={0.5}>
            {sec.titulo && !collapsed && (
              <Typography variant="overline" component="p" color={colors.gray[400]} sx={{ px: 3, pt: 1.5, pb: 0.5 }}>
                {sec.titulo}
              </Typography>
            )}
            {sec.titulo && collapsed && <Box mx={2} my={1} borderTop={`1px solid ${colors.borde}`} />}
            <Menu menuItemStyles={estilos}>
              {sec.items.map((it) => (
                <MenuItem
                  key={it.path}
                  active={activo(it.path)}
                  component={<Link to={it.path} aria-current={activo(it.path) ? "page" : undefined} />}
                  icon={it.icon}
                  onClick={() => setToggled(false)}
                  title={collapsed ? it.title : undefined}
                >
                  {it.title}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ))}
      </Box>
    </ProSidebar>
  );
};

export default Sidebar;
