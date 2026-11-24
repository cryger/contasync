const { HttpError } = require('./http');

// Traduce errores conocidos de PostgreSQL a mensajes claros
const PG_ERRORS = {
  23505: [409, 'Ya existe un registro con ese valor único'],
  23503: [409, 'El registro está relacionado con otros datos y no se puede modificar/eliminar'],
  23514: [400, 'Algún valor no cumple las reglas de la base de datos'],
  '22P02': [400, 'Formato de dato inválido'],
};

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
  }
  const pg = PG_ERRORS[err.code];
  if (pg) {
    return res.status(pg[0]).json({ error: pg[1], details: err.detail });
  }
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

function notFound(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
