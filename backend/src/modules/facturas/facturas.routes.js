const router = require('express').Router();
const { asyncHandler, parseId } = require('../../shared/http');
const service = require('./facturas.service');

router.get('/', asyncHandler(async (req, res) => res.json(await service.listar(req.query))));
router.get('/:id', asyncHandler(async (req, res) => res.json(await service.obtener(parseId(req.params.id)))));
router.post('/', asyncHandler(async (req, res) => res.status(201).json(await service.crear(req.body))));
router.patch('/:id/estado', asyncHandler(async (req, res) =>
  res.json(await service.cambiarEstado(parseId(req.params.id), req.body.estado))));

module.exports = router;
