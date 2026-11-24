/** Error con código HTTP para responder al cliente. */
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Envuelve handlers async para que los errores lleguen al middleware de errores. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Lee :id de la ruta y valida que sea entero positivo. */
function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido');
  return id;
}

module.exports = { HttpError, asyncHandler, parseId };
