/* eslint-disable react/prop-types */
import { useContext } from "react";
import { Box, Button, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { AddOutlined, DarkModeOutlined, LightModeOutlined, MenuOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../theme";

const Navbar = ({ onToggleMenu }) => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const esMovil = useMediaQuery("(max-width:768px)");

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
      <IconButton onClick={onToggleMenu} sx={{ visibility: esMovil ? "visible" : "hidden" }} aria-label="Abrir menú">
        <MenuOutlined />
      </IconButton>
      <Box display="flex" alignItems="center" gap={1}>
        <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={() => navigate("/facturas/nueva")}>
          Nueva factura
        </Button>
        <IconButton onClick={colorMode.toggleColorMode} aria-label="Cambiar tema">
          {theme.palette.mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Navbar;
