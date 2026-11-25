import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useColors } from "../theme";

const Layout = () => {
  const colors = useColors();
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);

  return (
    <Box display="flex" height="100vh" maxWidth="100%">
      {/* Accesibilidad: permite saltar el menú con el teclado */}
      <a href="#contenido" className="skip-link" style={{ background: colors.acento[500], color: colors.texto_sobre_acento }}>
        Saltar al contenido
      </a>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} toggled={toggled} setToggled={setToggled} />
      <Box flexGrow={1} display="flex" flexDirection="column" height="100%" minWidth={0}>
        <Navbar onToggleMenu={() => setToggled(!toggled)} />
        <Box component="main" id="contenido" tabIndex={-1} flex={1} overflow="auto" px={{ xs: 2, md: 4 }} pt={{ xs: 2, md: 3 }} pb={6}
          sx={{ outline: "none" }}>
          <Box maxWidth={1440} mx="auto">
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
