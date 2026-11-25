const router = require('express').Router();
const pool = require('../../config/db');
const { asyncHandler, parseId, HttpError } = require('../../shared/http');
const v = require('../../shared/validate');
const auth = require('../auth/auth.service');

const COLUMNAS = 'id, nombre, email, rol, activo, ultimo_acceso, creado_en';

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM usuarios ORDER BY nombre`);
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { nombre, email, password, rol, activo } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNAS}`,
    [v.requireText(nombre, 'nombre'), auth.validarEmail(email), auth.hashPassword(auth.validarPassword(password)),
      v.oneOf(rol, auth.ROLES, 'rol', 'cajero'), activo !== false && activo !== 'false'],
  );
  res.status(201).json(rows[0]);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { nombre, email, password, rol, activo } = req.body;
  const esYo = id === req.usuario.id;
  const nuevoRol = v.oneOf(rol, auth.ROLES, 'rol', 'cajero');
  const nuevoActivo = activo !== false && activo !== 'false';
  if (esYo && (nuevoRol !== 'admin' || !nuevoActivo)) {
    throw new HttpError(400, 'No puedes quitarte el rol de administrador ni desactivarte a ti mismo');
  }

  const sets = ['nombre = $1', 'email = $2', 'rol = $3', 'activo = $4'];
  const params = [v.requireText(nombre, 'nombre'), auth.validarEmail(email), nuevoRol, nuevoActivo];
  if (password) {
    params.push(auth.hashPassword(auth.validarPassword(password)));
    sets.push(`password_hash = $${params.length}`);
  }
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE usuarios SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${COLUMNAS}`, params,
  );
  if (!rows[0]) throw new HttpError(404, 'Usuario no encontrado');
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === req.usuario.id) throw new HttpError(400, 'No puedes eliminar tu propio usuario');
  // Si ya emitió facturas, se desactiva en lugar de borrarse (para conservar el historial)
  const { rows } = await pool.query('SELECT EXISTS (SELECT 1 FROM facturas WHERE usuario_id = $1) AS tiene', [id]);
  if (rows[0].tiene) {
    await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = $1', [id]);
    return res.json({ desactivado: true });
  }
  const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
  if (!rowCount) throw new HttpError(404, 'Usuario no encontrado');
  res.status(204).end();
}));

module.exports = router;
