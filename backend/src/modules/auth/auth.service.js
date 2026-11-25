const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const { HttpError } = require('../../shared/http');
const v = require('../../shared/validate');

const DURACION_SESION = '12h';
const ROLES = ['admin', 'cajero'];

/* ---------- Clave para firmar tokens ---------- */
// Usa JWT_SECRET del .env; si no está, genera una y la guarda en backend/.jwt-secret
function obtenerSecreto() {
  const env = process.env.JWT_SECRET;
  if (env && env.length >= 24 && !env.startsWith('cambia_esto')) return env;
  const archivo = path.join(__dirname, '..', '..', '..', '.jwt-secret');
  try {
    return fs.readFileSync(archivo, 'utf8').trim();
  } catch {
    const nuevo = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(archivo, nuevo, { mode: 0o600 });
    console.log('• Se generó una clave de sesión en backend/.jwt-secret');
    return nuevo;
  }
}
const SECRETO = obtenerSecreto();

/* ---------- Contraseñas (scrypt, incluido en Node) ---------- */
function hashPassword(password) {
  const sal = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, sal, 64).toString('hex');
  return `scrypt$${sal}$${hash}`;
}

function verificarPassword(password, guardado) {
  const [alg, sal, hash] = String(guardado).split('$');
  if (alg !== 'scrypt' || !sal || !hash) return false;
  const calculado = crypto.scryptSync(password, sal, 64);
  const esperado = Buffer.from(hash, 'hex');
  return esperado.length === calculado.length && crypto.timingSafeEqual(esperado, calculado);
}

function validarPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres');
  }
  return password;
}

const validarEmail = (email) => {
  const e = v.requireText(email, 'correo').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new HttpError(400, 'Correo inválido');
  return e;
};

/* ---------- Tokens ---------- */
const publico = (u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol });

const firmar = (u) => jwt.sign({ sub: u.id, rol: u.rol }, SECRETO, { expiresIn: DURACION_SESION });

function verificarToken(token) {
  try {
    return jwt.verify(token, SECRETO);
  } catch {
    throw new HttpError(401, 'Tu sesión expiró, ingresa de nuevo');
  }
}

/* ---------- Bloqueo por intentos fallidos (en memoria) ---------- */
const MAX_INTENTOS = 5;
const VENTANA_MS = 15 * 60 * 1000;
const intentos = new Map(); // clave → { n, desde }

function revisarBloqueo(clave) {
  const r = intentos.get(clave);
  if (r && Date.now() - r.desde < VENTANA_MS && r.n >= MAX_INTENTOS) {
    const min = Math.ceil((VENTANA_MS - (Date.now() - r.desde)) / 60000);
    throw new HttpError(429, `Demasiados intentos. Intenta de nuevo en ${min} min`);
  }
}
function registrarFallo(clave) {
  const r = intentos.get(clave);
  if (!r || Date.now() - r.desde > VENTANA_MS) intentos.set(clave, { n: 1, desde: Date.now() });
  else r.n += 1;
}

/* ---------- Casos de uso ---------- */
async function hayUsuarios() {
  const { rows } = await pool.query('SELECT EXISTS (SELECT 1 FROM usuarios) AS hay');
  return rows[0].hay;
}

/** Crea el primer administrador. Solo funciona si la tabla está vacía. */
async function configuracionInicial({ nombre, email, password }) {
  const datos = [v.requireText(nombre, 'nombre'), validarEmail(email), hashPassword(validarPassword(password))];
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol, ultimo_acceso)
     SELECT $1, $2, $3, 'admin', NOW()
     WHERE NOT EXISTS (SELECT 1 FROM usuarios)
     RETURNING *`,
    datos,
  );
  if (!rows[0]) throw new HttpError(409, 'El sistema ya tiene usuarios. Inicia sesión.');
  return { token: firmar(rows[0]), usuario: publico(rows[0]) };
}

async function login({ email, password }, ip = '') {
  const correo = String(email || '').trim().toLowerCase();
  const clave = `${ip}|${correo}`;
  revisarBloqueo(clave);

  const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [correo]);
  const u = rows[0];
  if (!u || !verificarPassword(String(password || ''), u.password_hash)) {
    registrarFallo(clave);
    throw new HttpError(401, 'Correo o contraseña incorrectos');
  }
  if (!u.activo) throw new HttpError(403, 'Tu usuario está desactivado. Habla con el administrador.');

  intentos.delete(clave);
  await pool.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1', [u.id]);
  return { token: firmar(u), usuario: publico(u) };
}

async function usuarioActivo(id) {
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
  const u = rows[0];
  if (!u || !u.activo) throw new HttpError(401, 'Tu usuario ya no tiene acceso');
  return publico(u);
}

async function cambiarPassword(id, { actual, nueva }) {
  const { rows } = await pool.query('SELECT password_hash FROM usuarios WHERE id = $1', [id]);
  if (!rows[0] || !verificarPassword(String(actual || ''), rows[0].password_hash)) {
    throw new HttpError(400, 'La contraseña actual no es correcta');
  }
  await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [hashPassword(validarPassword(nueva)), id]);
}

module.exports = {
  ROLES, hashPassword, verificarPassword, validarPassword, validarEmail,
  verificarToken, hayUsuarios, configuracionInicial, login, usuarioActivo, cambiarPassword,
};
