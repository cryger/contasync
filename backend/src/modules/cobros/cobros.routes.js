const router = require('express').Router();
const { asyncHandler, parseId } = require('../../shared/http');
const service = require('./cobros.service');

router.get('/', asyncHandler(async (req, res) => res.json(await service.listar())));
router.post('/generar', asyncHandler(async (req, res) => res.json(await service.generarPendientes())));
router.get('/:id', asyncHandler(async (req, res) => res.json(await service.obtener(parseId(req.params.id)))));
router.post('/', asyncHandler(async (req, res) => res.status(201).json(await service.crear(req.body))));
router.put('/:id', asyncHandler(async (req, res) => res.json(await service.actualizar(parseId(req.params.id), req.body))));
router.delete('/:id', asyncHandler(async (req, res) => {
  await service.eliminar(parseId(req.params.id));
  res.status(204).end();
}));

module.exports = router;
