const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatoMoneda = (n) => cop.format(Number(n) || 0);
export const formatoPorcentaje = (n, dec = 2) =>
  `${(Number(n) || 0).toLocaleString("es-CO", { maximumFractionDigits: dec })} %`;

/** "2026-11-24" → "24/11/2026" sin corrimiento de zona horaria */
export const formatoFecha = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

/** Fecha local de hoy en formato AAAA-MM-DD */
export const hoy = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const inicioDeMes = () => `${hoy().slice(0, 7)}-01`;

/** Lee "1.500.000" o "1500000,5" como número */
export const leerNumero = (v) => {
  if (typeof v === "number") return v;
  let s = String(v ?? "").replace(/[^\d.,-]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};
