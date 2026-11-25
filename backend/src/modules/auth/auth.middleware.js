const { HttpError } = require('../../shared/http');
const auth = require('./auth.service');

/** Exige un token válido (Authorization: Bearer ...) y deja el usuario en req.usuario */
async function requireAuth(req, res, next) {
  try {
    const [tipo, token] = String(req.headers.authorization || '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new HttpError(401, 'Debes iniciar sesión');
    const payload = auth.verificarToken(token);
    req.usuario = await auth.usuarioActivo(payload.sub); // revisa que siga activo y con el mismo rol
    next();
  } catch (err) {
    next(err);
  }
}

/** Restringe a ciertos roles. Uso: requireRol('admin') */
const requireRol = (...roles) => (req, res, next) =>
  roles.includes(req.usuario?.rol) ? next() : next(new HttpError(403, 'No tienes permiso para esta sección'));

module.exports = { requireAuth, requireRol };
