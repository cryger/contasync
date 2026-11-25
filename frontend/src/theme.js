import { createTheme, useTheme } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { aclarar, ajustarContraste, contraste, escala, esHex, mezclar, oscurecer } from "./utils/color";

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
 *   gray       → textos y bordes (neutros "slate", levemente azulados)
 * Sistema de diseño: minimalista/suizo para dashboards (UI UX Pro Max):
 * superficies planas con borde de 1px, sin sombras pesadas, alto contraste.
 * ------------------------------------------------------------------ */
export const tokens = (mode, marca = MARCA_DEFECTO) => {
  const { color_base: b, color_acento: a, color_secundario: s } = marca;
  const oscuro = mode === "dark";

  const base = oscuro
    ? {
        100: aclarar(b, 0.8), 200: aclarar(b, 0.6), 300: aclarar(b, 0.4),
        400: aclarar(b, 0.07), // superficies (tarjetas, paneles, menú)
        500: b, // fondo
        600: aclarar(b, 0.16), // bordes y separadores
        700: oscurecer(b, 0.4), 800: oscurecer(b, 0.6), 900: oscurecer(b, 0.8),
      }
    : {
        100: oscurecer(b, 0.5), 200: oscurecer(b, 0.3), 300: b,
        400: "#ffffff", // superficies
        500: aclarar(b, 0.955), // fondo
        600: aclarar(b, 0.86), // bordes y separadores
        700: aclarar(b, 0.6), 800: aclarar(b, 0.45), 900: aclarar(b, 0.3),
      };

  // Slate: 300 es el texto secundario y siempre cumple contraste ≥ 4.5:1 sobre las superficies
  const gray = oscuro
    ? { 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a" }
    : { 100: "#0f172a", 200: "#1e293b", 300: "#475569", 400: "#64748b", 500: "#94a3b8", 600: "#cbd5e1", 700: "#e2e8f0", 800: "#f1f5f9", 900: "#f8fafc" };

  return {
    base,
    gray,
    acento: escala(a, !oscuro),
    secundario: escala(s, !oscuro),
    rojo: escala("#dc2626", !oscuro),
    texto_sobre_acento: contraste(a),
    texto_sobre_secundario: contraste(s),
    texto_sobre_base: contraste(b),
    // Tokens semánticos
    superficie: base[400],
    borde: base[600],
    texto: gray[100],
    textoSuave: gray[300],
    foco: a,
    acentoSuave: oscuro ? mezclar(b, a, 0.16) : aclarar(a, 0.88), // fondo del ítem activo, chips suaves
    // Colores para TEXTO e íconos: ajustados para cumplir 4.5:1 sobre las superficies con cualquier marca
    acentoTexto: ajustarContraste(a, base[400]),
    secundarioTexto: ajustarContraste(s, base[400]),
    peligro: ajustarContraste(oscuro ? "#f87171" : "#b91c1c", base[400]),
    exito: ajustarContraste(oscuro ? "#4ade80" : "#15803d", base[400]),
  };
};

/* ------------------------------------------------------------------
 * Tema de MUI
 * ------------------------------------------------------------------ */
const fuente = ["'Fira Sans'", "system-ui", "-apple-system", "'Segoe UI'", "sans-serif"].join(",");
export const fuenteMono = ["'Fira Code'", "ui-monospace", "'Cascadia Code'", "monospace"].join(",");

const RADIO = 10;
const TRANSICION = "background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease";

export const themeSettings = (mode, marca) => {
  const c = tokens(mode, marca);
  const oscuro = mode === "dark";
  const anilloFoco = `0 0 0 3px ${mezclar(oscuro ? marca.color_base : "#ffffff", marca.color_acento, 0.55)}`;

  return {
    colores: c, // accesible con useColors()
    shape: { borderRadius: RADIO },
    palette: {
      mode,
      primary: { main: oscuro ? c.gray[200] : c.base[300] },
      secondary: { main: marca.color_acento, contrastText: c.texto_sobre_acento },
      info: { main: marca.color_secundario },
      error: { main: oscuro ? "#f87171" : "#b91c1c" },
      success: { main: oscuro ? "#4ade80" : "#15803d", contrastText: oscuro ? "#052e16" : "#ffffff" }, // ≥ 4.5:1 en ambos modos
      warning: { main: oscuro ? "#fbbf24" : "#b45309", contrastText: oscuro ? "#451a03" : "#ffffff" },
      neutral: { dark: c.gray[700], main: c.gray[500], light: c.gray[100] },
      text: { primary: c.texto, secondary: c.textoSuave },
      divider: c.borde,
      background: { default: c.base[500], paper: c.superficie },
    },
    typography: {
      fontFamily: fuente,
      fontSize: 14, // base 14px: denso pero legible (antes 12px)
      h1: { fontFamily: fuente, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 },
      h2: { fontFamily: fuente, fontSize: 28, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.2 },
      h3: { fontFamily: fuente, fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.25 },
      h4: { fontFamily: fuente, fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
      h5: { fontFamily: fuente, fontSize: 15, fontWeight: 500, lineHeight: 1.4 },
      h6: { fontFamily: fuente, fontSize: 13, fontWeight: 500, lineHeight: 1.4 },
      body1: { fontSize: 14, lineHeight: 1.55 },
      body2: { fontSize: 13, lineHeight: 1.5 },
      button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
      caption: { fontSize: 12 },
      overline: { fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFeatureSettings: '"tnum" 1, "lnum" 1', // cifras alineadas en tablas y totales
            WebkitFontSmoothing: "antialiased",
          },
          "::selection": { background: mezclar(c.superficie, marca.color_acento, 0.35) },
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-thumb": { background: c.borde, borderRadius: 8, border: `2px solid ${c.base[500]}` },
          "*::-webkit-scrollbar-track": { background: "transparent" },
          // Accesibilidad: respetar "reducir movimiento" del sistema
          "@media (prefers-reduced-motion: reduce)": {
            "*, *::before, *::after": {
              animationDuration: "0.01ms !important",
              animationIterationCount: "1 !important",
              transitionDuration: "0.01ms !important",
              scrollBehavior: "auto !important",
            },
          },
          ".tabular": { fontVariantNumeric: "tabular-nums" },
          ".mono": { fontFamily: fuenteMono, fontFeatureSettings: "normal" },
        },
      },
      // Foco visible por teclado en todo lo clicable (WCAG 2.4.7)
      MuiButtonBase: {
        defaultProps: { disableRipple: false },
        styleOverrides: {
          root: {
            "&.Mui-focusVisible": { outline: `2px solid ${c.foco}`, outlineOffset: 2 },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: RADIO, minHeight: 40, paddingInline: 16, transition: TRANSICION },
          sizeSmall: { minHeight: 32, paddingInline: 12 },
          sizeLarge: { minHeight: 48, fontSize: 15 },
          outlined: { borderColor: c.borde },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: RADIO - 2, transition: TRANSICION, "&:hover": { backgroundColor: mezclar(c.superficie, c.texto, 0.08) } },
          sizeSmall: { padding: 6 }, // área ≥ 32px (WCAG 2.5.8 pide ≥ 24px)
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: RADIO,
            backgroundColor: oscuro ? mezclar(c.superficie, "#000000", 0.15) : "#ffffff",
            transition: TRANSICION,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: c.borde, transition: TRANSICION },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.gray[500] },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: marca.color_acento, borderWidth: 2 },
            "&.Mui-focused": { boxShadow: anilloFoco },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { "&.Mui-focused": { color: c.texto } } },
      },
      MuiFormHelperText: { styleOverrides: { root: { marginLeft: 2, color: c.textoSuave } } },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          outlined: { borderColor: c.borde },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16, border: `1px solid ${c.borde}`, boxShadow: "0 24px 64px rgba(2,6,23,.35)" },
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontSize: 18, fontWeight: 600, paddingBottom: 8 } } },
      MuiDialogActions: { styleOverrides: { root: { padding: "12px 24px 20px", gap: 8 } } },
      MuiBackdrop: { styleOverrides: { root: { backgroundColor: "rgba(2,6,23,.6)" } } },
      MuiMenu: {
        styleOverrides: { paper: { border: `1px solid ${c.borde}`, boxShadow: "0 12px 32px rgba(2,6,23,.25)" } },
      },
      MuiAutocomplete: {
        styleOverrides: { paper: { border: `1px solid ${c.borde}`, boxShadow: "0 12px 32px rgba(2,6,23,.25)" } },
      },
      MuiTooltip: {
        defaultProps: { arrow: true, enterDelay: 300 },
        styleOverrides: {
          tooltip: { backgroundColor: oscuro ? c.gray[100] : c.gray[100], color: oscuro ? c.gray[900] : "#ffffff", fontSize: 12, padding: "6px 10px", borderRadius: 6 },
          arrow: { color: c.gray[100] },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 600, fontSize: 12 },
          sizeSmall: { height: 24 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: c.borde },
          head: { color: c.textoSuave, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em" },
        },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: "none", fontWeight: 600, fontSize: 14, minHeight: 44 } },
      },
      MuiTabs: { styleOverrides: { root: { minHeight: 44, borderBottom: `1px solid ${c.borde}` } } },
      MuiToggleButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, borderColor: c.borde } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: RADIO, alignItems: "center" } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 999 } } },
      MuiDivider: { styleOverrides: { root: { borderColor: c.borde } } },
      MuiSnackbarContent: { styleOverrides: { root: { borderRadius: RADIO } } },
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
