/* eslint-disable react/prop-types */
import { Box, IconButton, Typography } from "@mui/material";
import { Menu, MenuItem, Sidebar as ProSidebar } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import {
  AddCircleOutline, ContactsOutlined, DashboardOutlined, Inventory2Outlined, MenuOutlined, PaletteOutlined,
  ReceiptLongOutlined, SavingsOutlined, SettingsOutlined, TrendingDownOutlined,
} from "@mui/icons-material";
import { useColors, useMarca } from "../theme";

const SECCIONES = [
  { items: [{ title: "Inicio", path: "/", icon: <DashboardOutlined /> }] },
  {
    titulo: "Facturación",
    items: [
      { title: "Nueva factura", path: "/facturas/nueva", icon: <AddCircleOutline /> },
      { title: "Facturas", path: "/facturas", icon: <ReceiptLongOutlined /> },
      { title: "Clientes", path: "/clientes", icon: <ContactsOutlined /> },
      { title: "Productos y servicios", path: "/productos", icon: <Inventory2Outlined /> },
    ],
  },
  {
    titulo: "Finanzas",
    items: [
      { title: "Gastos", path: "/gastos", icon: <TrendingDownOutlined /> },
      { title: "Inversionistas", path: "/inversionistas", icon: <SavingsOutlined /> },
    ],
  },
  {
    titulo: "Ajustes",
    items: [
      { title: "Empresa", path: "/configuracion", icon: <SettingsOutlined /> },
      { title: "Apariencia", path: "/apariencia", icon: <PaletteOutlined /> },
    ],
  },
];

const Sidebar = ({ collapsed, setCollapsed, toggled, setToggled }) => {
  const colors = useColors();
  const { marca } = useMarca();
  const { pathname } = useLocation();
  const activo = (path) => {
    if (path === "/") return pathname === "/";
    if (path === "/facturas") return pathname === "/facturas" || /^\/facturas\/\d+$/.test(pathname);
    return pathname.startsWith(path);
  };

  const estilos = {
    button: {
      ":hover": { color: colors.acento[500], background: "transparent", transition: ".3s ease" },
    },
  };

  return (
    <ProSidebar
      backgroundColor={colors.base[400]}
      rootStyles={{ border: 0, height: "100%" }}
      collapsed={collapsed}
      toggled={toggled}
      onBackdropClick={() => setToggled(false)}
      breakPoint="md"
    >
      <Box display="flex" alignItems="center" justifyContent={collapsed ? "center" : "space-between"} px={2} py={2.5}>
        {!collapsed && (
          <Box display="flex" alignItems="center" gap={1.5}>
            <img
              src={marca.logo || "/logo_contasync_svg.svg"}
              alt=""
              style={{ width: 34, height: 34, borderRadius: 8, objectFit: "contain" }}
            />
            <Typography variant="h4" fontWeight="bold" color={colors.acento[500]} noWrap maxWidth={150} title={marca.nombre_comercial}>
              {marca.nombre_comercial}
            </Typography>
          </Box>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} aria-label="Contraer menú">
          <MenuOutlined />
        </IconButton>
      </Box>

      {SECCIONES.map((sec, i) => (
        <Box key={i} pl={collapsed ? 0 : "5%"}>
          {sec.titulo && (
            <Typography variant="h6" color={colors.gray[300]} sx={{ m: "15px 0 5px 20px" }}>
              {collapsed ? " " : sec.titulo}
            </Typography>
          )}
          <Menu menuItemStyles={estilos}>
            {sec.items.map((it) => (
              <MenuItem
                key={it.path}
                component={<Link to={it.path} />}
                icon={it.icon}
                onClick={() => setToggled(false)}
                rootStyles={{ color: activo(it.path) ? colors.acento[500] : undefined, fontWeight: activo(it.path) ? 600 : undefined }}
              >
                {it.title}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      ))}
    </ProSidebar>
  );
};

export default Sidebar;
