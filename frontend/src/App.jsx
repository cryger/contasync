/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ColorModeContext, MARCA_DEFECTO, MarcaContext, extraerMarca, useMode } from "./theme";
import { NotifierProvider } from "./components/Notifier";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { marcaApi } from "./api";
import Layout from "./layout/Layout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import FacturasPage from "./pages/facturas/FacturasPage";
import NuevaFacturaPage from "./pages/facturas/NuevaFacturaPage";
import FacturaDetallePage from "./pages/facturas/FacturaDetallePage";
import ClientesPage from "./pages/clientes/ClientesPage";
import ProductosPage from "./pages/productos/ProductosPage";
import GastosPage from "./pages/gastos/GastosPage";
import InversionistasPage from "./pages/inversionistas/InversionistasPage";
import EmpresaPage from "./pages/configuracion/EmpresaPage";
import AparienciaPage from "./pages/configuracion/AparienciaPage";
import UsuariosPage from "./pages/usuarios/UsuariosPage";
import CobrosPage from "./pages/cobros/CobrosPage";

/** Solo administradores; el cajero va directo a facturar */
const SoloAdmin = ({ children }) => {
  const { esAdmin } = useAuth();
  return esAdmin ? children : <Navigate to="/facturas/nueva" replace />;
};

/** Muestra el login si no hay sesión; si la hay, el sistema */
function Contenido() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress color="secondary" />
      </Box>
    );
  }
  if (!usuario) return <LoginPage />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<SoloAdmin><DashboardPage /></SoloAdmin>} />
          <Route path="facturas" element={<FacturasPage />} />
          <Route path="facturas/nueva" element={<NuevaFacturaPage />} />
          <Route path="facturas/:id" element={<FacturaDetallePage />} />
          <Route path="cobros" element={<SoloAdmin><CobrosPage /></SoloAdmin>} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="gastos" element={<SoloAdmin><GastosPage /></SoloAdmin>} />
          <Route path="inversionistas" element={<SoloAdmin><InversionistasPage /></SoloAdmin>} />
          <Route path="configuracion" element={<SoloAdmin><EmpresaPage /></SoloAdmin>} />
          <Route path="apariencia" element={<SoloAdmin><AparienciaPage /></SoloAdmin>} />
          <Route path="usuarios" element={<SoloAdmin><UsuariosPage /></SoloAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  // La marca (colores, logo, nombre) es pública para poder pintar también el login
  const [marca, setMarca] = useState(MARCA_DEFECTO);
  const recargarMarca = useCallback(
    () => marcaApi.obtener().then((e) => setMarca(extraerMarca(e))).catch(() => {}),
    []
  );
  useEffect(() => {
    recargarMarca();
  }, [recargarMarca]);

  const [theme, colorMode] = useMode(marca);
  const marcaCtx = useMemo(() => ({ marca, setMarca, recargarMarca }), [marca, recargarMarca]);

  return (
    <MarcaContext.Provider value={marcaCtx}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NotifierProvider>
            <AuthProvider>
              <Contenido />
            </AuthProvider>
          </NotifierProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </MarcaContext.Provider>
  );
}
