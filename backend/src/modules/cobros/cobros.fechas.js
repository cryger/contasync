/**
 * Cálculo de fechas de los cobros mensuales (sin zonas horarias: todo en texto AAAA-MM-DD).
 */
const pad = (n) => String(n).padStart(2, '0');

/** Fecha local de hoy (AAAA-MM-DD) según el reloj del servidor */
function hoyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const periodoDe = (fecha) => fecha.slice(0, 7);

function siguientePeriodo(periodo) {
  let [y, m] = periodo.split('-').map(Number);
  m += 1;
  if (m > 12) { m = 1; y += 1; }
  return `${y}-${pad(m)}`;
}

const fechaCobro = (periodo, dia) => `${periodo}-${pad(dia)}`;

function sumarDias(fecha, dias) {
  const [y, m, d] = fecha.split('-').map(Number);
  const f = new Date(Date.UTC(y, m - 1, d + dias));
  return `${f.getUTCFullYear()}-${pad(f.getUTCMonth() + 1)}-${pad(f.getUTCDate())}`;
}

/**
 * Meses que ya deberían estar facturados y no lo están, en orden.
 * - Empieza en el mes siguiente al último facturado, o en el mes de inicio.
 * - Un mes cuenta solo si su día de cobro ya llegó, no es anterior a la fecha de inicio
 *   y no pasa la fecha de fin.
 * - Máximo `limite` meses de una vez (por si el servidor estuvo apagado mucho tiempo).
 */
function periodosPendientes(sus, hoy = hoyLocal(), limite = 12) {
  const inicio = String(sus.fecha_inicio).slice(0, 10);
  const fin = sus.fecha_fin ? String(sus.fecha_fin).slice(0, 10) : null;
  let p = sus.ultimo_periodo ? siguientePeriodo(sus.ultimo_periodo) : periodoDe(inicio);
  const resultado = [];
  while (resultado.length < limite) {
    const fecha = fechaCobro(p, sus.dia_facturacion);
    if (fecha > hoy) break;
    if (fin && fecha > fin) break;
    if (fecha >= inicio) resultado.push({ periodo: p, fecha });
    p = siguientePeriodo(p);
  }
  return resultado;
}

/** Próxima fecha en que se generará un cobro (o null si el plan terminó / está inactivo) */
function proximoCobro(sus, hoy = hoyLocal()) {
  if (!sus.activo) return null;
  const inicio = String(sus.fecha_inicio).slice(0, 10);
  const fin = sus.fecha_fin ? String(sus.fecha_fin).slice(0, 10) : null;
  let p = sus.ultimo_periodo ? siguientePeriodo(sus.ultimo_periodo) : periodoDe(inicio);
  for (let i = 0; i < 24; i++) {
    const fecha = fechaCobro(p, sus.dia_facturacion);
    if (fin && fecha > fin) return null;
    if (fecha >= inicio) return fecha < hoy ? hoy : fecha; // si está atrasado, se genera en la próxima revisión
    p = siguientePeriodo(p);
  }
  return null;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const nombrePeriodo = (periodo) => {
  const [y, m] = periodo.split('-').map(Number);
  return `${MESES[m - 1]} de ${y}`;
};

module.exports = { hoyLocal, periodosPendientes, proximoCobro, sumarDias, nombrePeriodo, siguientePeriodo };
