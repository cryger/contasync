// Utilidades de color compartidas por el tema de la interfaz y el PDF.

export const esHex = (v) => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);

export const hexARgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const rgbAHex = ([r, g, b]) =>
  "#" + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");

/** Mezcla dos colores: t = 0 → a, t = 1 → b */
export const mezclar = (a, b, t) => {
  const [r1, g1, b1] = hexARgb(a);
  const [r2, g2, b2] = hexARgb(b);
  return rgbAHex([r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t]);
};

export const aclarar = (hex, t) => mezclar(hex, "#ffffff", t);
export const oscurecer = (hex, t) => mezclar(hex, "#000000", t);

/** Luminancia relativa (WCAG) */
export const luminancia = (hex) => {
  const c = hexARgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

/** Relación de contraste WCAG entre dos colores (1 a 21) */
export const relacionContraste = (a, b) => {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/**
 * Color de texto legible sobre un fondo: elige entre blanco y casi negro el que tenga MÁS contraste
 * (WCAG 1.4.3). Así un botón naranja o amarillo lleva texto oscuro y uno azul o rojo, texto blanco.
 */
export const contraste = (fondo) =>
  relacionContraste(fondo, "#ffffff") >= relacionContraste(fondo, "#111418") ? "#ffffff" : "#111418";

/**
 * Escala 100–900 a partir de un color (500 = el color).
 * 100 es el más claro y 900 el más oscuro; invertir = true la da vuelta (para modo claro).
 */
export const escala = (hex, invertir = false) => {
  const e = {
    100: aclarar(hex, 0.8),
    200: aclarar(hex, 0.6),
    300: aclarar(hex, 0.4),
    400: aclarar(hex, 0.2),
    500: hex,
    600: oscurecer(hex, 0.2),
    700: oscurecer(hex, 0.4),
    800: oscurecer(hex, 0.6),
    900: oscurecer(hex, 0.8),
  };
  if (!invertir) return e;
  return { 100: e[900], 200: e[800], 300: e[700], 400: e[600], 500: e[500], 600: e[400], 700: e[300], 800: e[200], 900: e[100] };
};

/**
 * Aclara u oscurece un color lo mínimo necesario para que, usado como TEXTO sobre `fondo`,
 * cumpla la relación de contraste pedida (4.5:1 por defecto, WCAG AA).
 */
export const ajustarContraste = (color, fondo, minimo = 4.5) => {
  if (relacionContraste(color, fondo) >= minimo) return color;
  const haciaBlanco = luminancia(fondo) < 0.5;
  for (let t = 0.05; t <= 1; t += 0.05) {
    const c = haciaBlanco ? aclarar(color, t) : oscurecer(color, t);
    if (relacionContraste(c, fondo) >= minimo) return c;
  }
  return haciaBlanco ? "#ffffff" : "#000000";
};
