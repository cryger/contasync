const { crearCrud } = require('../../shared/crud');
const { asyncHandler, parseId } = require('../../shared/http');
const v = require('../../shared/validate');
const service = require('./inversionistas.service');

const { router } = crearCrud({
  tabla: 'inversionistas',
  nombre: 'Inversionista',
  orden: 'nombre ASC',
  busqueda: ['nombre', 'identificacion'],
  campos: {
    nombre: (x) => v.requireText(x, 'nombre'),
    identificacion: v.optionalText,
    telefono: v.optionalText,
    email: v.optionalText,
    activo: (x) => x !== false && x !== 'false',
  },
});

// Estas rutas van antes que las genéricas /:id del CRUD
const extra = require('express').Router();
extra.get('/', asyncHandler(async (req, res) => res.json(await service.listar())));
extra.get('/reparto', asyncHandler(async (req, res) => res.json(await service.reparto(req.query))));
extra.get('/:id/aportes', asyncHandler(async (req, res) => res.json(await service.listarAportes(parseId(req.params.id)))));
extra.post('/:id/aportes', asyncHandler(async (req, res) =>
  res.status(201).json(await service.crearAporte(parseId(req.params.id), req.body))));
extra.delete('/aportes/:aporteId', asyncHandler(async (req, res) => {
  await service.eliminarAporte(parseId(req.params.aporteId));
  res.status(204).end();
}));

extra.use(router);
module.exports = extra;
