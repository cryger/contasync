import { useCallback, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ColorModeContext, MARCA_DEFECTO, MarcaContext, extraerMarca, useMode } from "./theme";
import { NotifierProvider } from "./components/Notifier";
import { empresaApi } from "./api";
import Layout from "./layout/Layout";
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

export default function App() {
  // La marca del negocio (colores, logo, nombre) se carga de /api/empresa
  const [marca, setMarca] = useState(MARCA_DEFECTO);
  const recargarMarca = useCallback(
    () => empresaApi.obtener().then((e) => setMarca(extraerMarca(e))).catch(() => {}),
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
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="facturas" element={<FacturasPage />} />
                  <Route path="facturas/nueva" element={<NuevaFacturaPage />} />
                  <Route path="facturas/:id" element={<FacturaDetallePage />} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="productos" element={<ProductosPage />} />
                  <Route path="gastos" element={<GastosPage />} />
                  <Route path="inversionistas" element={<InversionistasPage />} />
                  <Route path="configuracion" element={<EmpresaPage />} />
                  <Route path="apariencia" element={<AparienciaPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </NotifierProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </MarcaContext.Provider>
  );
}
