import { createTheme, useTheme } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { aclarar, contraste, escala, esHex, mezclar, oscurecer } from "./utils/color";

/* ------------------------------------------------------------------
 * Marca: lo que cada negocio personaliza (se guarda en la tabla empresa)
 * ------------------------------------------------------------------ */
export const MARCA_DEFECTO = {
  nombre_comercial: "Contasync",
  color_acento: "#4cceac",
  color_secundario: "#6870fa",
  color_base: "#141b2d",
  tema_modo: "dark",
  logo: null,
};

/** Temas listos para elegir con un clic */
export const TEMAS_PREDEFINIDOS = [
  { nombre: "Contasync", color_acento: "#4cceac", color_secundario: "#6870fa", color_base: "#141b2d" },
  { nombre: "Tecnología", color_acento: "#38bdf8", color_secundario: "#818cf8", color_base: "#0b1220" },
  { nombre: "Cafetería", color_acento: "#d4a373", color_secundario: "#bc6c25", color_base: "#2b2118" },
  { nombre: "Restaurante", color_acento: "#f97316", color_secundario: "#facc15", color_base: "#1f1410" },
  { nombre: "Belleza y spa", color_acento: "#ec4899", color_secundario: "#a855f7", color_base: "#1f1424" },
  { nombre: "Tienda natural", color_acento: "#22c55e", color_secundario: "#84cc16", color_base: "#0f1f17" },
  { nombre: "Ferretería", color_acento: "#f59e0b", color_secundario: "#ef4444", color_base: "#1c1917" },
  { nombre: "Salud", color_acento: "#14b8a6", color_secundario: "#3b82f6", color_base: "#0f1d24" },
  { nombre: "Elegante", color_acento: "#c9a227", color_secundario: "#94a3b8", color_base: "#111111" },
  { nombre: "Moda", color_acento: "#e11d48", color_secundario: "#f472b6", color_base: "#18181b" },
];

/** Toma los campos de marca de la respuesta de /api/empresa, con valores seguros */
export const extraerMarca = (empresa = {}) => ({
  nombre_comercial: empresa.nombre_comercial || empresa.razon_social || MARCA_DEFECTO.nombre_comercial,
  color_acento: esHex(empresa.color_acento) ? empresa.color_acento : MARCA_DEFECTO.color_acento,
  color_secundario: esHex(empresa.color_secundario) ? empresa.color_secundario : MARCA_DEFECTO.color_secundario,
  color_base: esHex(empresa.color_base) ? empresa.color_base : MARCA_DEFECTO.color_base,
  tema_modo: empresa.tema_modo === "light" ? "light" : "dark",
  logo: empresa.logo || null,
});

/* ------------------------------------------------------------------
 * Tokens de color: escalas 100–900 generadas desde la marca
 *   base       → fondos y paneles
 *   acento     → color principal de la marca (botones, cifras, enlaces)
 *   secundario → encabezados de tablas, elementos activos
 *   rojo       → gastos, errores
 *   gray       → textos
 * ------------------------------------------------------------------ */
export const tokens = (mode, marca = MARCA_DEFECTO) => {
  const { color_base: b, color_acento: a, color_secundario: s } = marca;
  const oscuro = mode === "dark";

  const base = oscuro
    ? {
        100: aclarar(b, 0.8), 200: aclarar(b, 0.6), 300: aclarar(b, 0.4),
        400: aclarar(b, 0.18), // paneles
        500: b, // fondo
        600: oscurecer(b, 0.2), 700: oscurecer(b, 0.4), 800: oscurecer(b, 0.6), 900: oscurecer(b, 0.8),
      }
    : {
        100: oscurecer(b, 0.5), 200: oscurecer(b, 0.3), 300: b,
        400: aclarar(b, 0.985), // paneles
        500: aclarar(b, 0.93), // fondo
        600: aclarar(b, 0.75), 700: aclarar(b, 0.6), 800: aclarar(b, 0.45), 900: aclarar(b, 0.3),
      };

  const gray = oscuro
    ? { 100: "#e0e0e0", 200: "#c2c2c2", 300: "#a3a3a3", 400: "#858585", 500: "#666666", 600: "#525252", 700: "#3d3d3d", 800: "#292929", 900: "#141414" }
    : { 100: "#141414", 200: "#292929", 300: "#525252", 400: "#666666", 500: "#858585", 600: "#a3a3a3", 700: "#c2c2c2", 800: "#e0e0e0", 900: "#f5f5f5" };

  return {
    base,
    gray,
    acento: escala(a, !oscuro),
    secundario: escala(s, !oscuro),
    rojo: escala("#db4f4a", !oscuro),
    texto_sobre_acento: contraste(a),
    texto_sobre_secundario: contraste(s),
    texto_sobre_base: contraste(b),
  };
};

/* ------------------------------------------------------------------
 * Tema de MUI
 * ------------------------------------------------------------------ */
const fuente = ["Source Sans 3", "sans-serif"].join(",");

export const themeSettings = (mode, marca) => {
  const colores = tokens(mode, marca);
  const oscuro = mode === "dark";
  return {
    colores, // accesible con useColors()
    palette: {
      mode,
      primary: { main: oscuro ? colores.base[400] : colores.base[300] },
      secondary: { main: marca.color_acento, contrastText: colores.texto_sobre_acento },
      info: { main: marca.color_secundario },
      neutral: { dark: colores.gray[700], main: colores.gray[500], light: colores.gray[100] },
      background: {
        default: colores.base[500],
        paper: oscuro ? mezclar(marca.color_base, "#ffffff", 0.1) : "#ffffff",
      },
    },
    typography: {
      fontFamily: fuente,
      fontSize: 12,
      h1: { fontFamily: fuente, fontSize: 40 },
      h2: { fontFamily: fuente, fontSize: 32 },
      h3: { fontFamily: fuente, fontSize: 24 },
      h4: { fontFamily: fuente, fontSize: 20 },
      h5: { fontFamily: fuente, fontSize: 16 },
      h6: { fontFamily: fuente, fontSize: 14 },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    },
  };
};

/* ------------------------------------------------------------------
 * Contextos y hooks
 * ------------------------------------------------------------------ */
export const ColorModeContext = createContext({ toggleColorMode: () => {} });
export const MarcaContext = createContext({ marca: MARCA_DEFECTO, setMarca: () => {} });

/** Colores del tema actual: const colors = useColors(); colors.acento[500] */
export const useColors = () => useTheme().colores;

/** Marca actual y función para cambiarla (vista previa en vivo) */
export const useMarca = () => useContext(MarcaContext);

const CLAVE_MODO = "contasync-modo";

/**
 * Modo claro/oscuro: si el usuario lo cambió en este navegador se respeta,
 * si no, se usa el modo por defecto que definió el negocio.
 */
export const useMode = (marca) => {
  const [preferido, setPreferido] = useState(() => {
    try { return localStorage.getItem(CLAVE_MODO); } catch { return null; }
  });
  const mode = preferido || marca.tema_modo || "dark";

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setPreferido(() => {
          const next = mode === "light" ? "dark" : "light";
          try { localStorage.setItem(CLAVE_MODO, next); } catch { /* sin storage */ }
          return next;
        }),
      reiniciarModo: () => {
        try { localStorage.removeItem(CLAVE_MODO); } catch { /* sin storage */ }
        setPreferido(null);
      },
    }),
    [mode]
  );

  const theme = useMemo(() => createTheme(themeSettings(mode, marca)), [mode, marca]);

  // Título de la pestaña y favicon con la marca del negocio
  useEffect(() => {
    document.title = `${marca.nombre_comercial} · Facturación`;
    const icono = document.querySelector("link[rel='icon']");
    if (icono) icono.href = marca.logo || "/logo_contasync_svg.svg";
  }, [marca.nombre_comercial, marca.logo]);

  return [theme, colorMode];
};
