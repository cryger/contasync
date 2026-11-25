const router = require('express').Router();
const { asyncHandler, parseId } = require('../../shared/http');
const { HttpError } = require('../../shared/http');
const service = require('./facturas.service');

router.get('/', asyncHandler(async (req, res) => res.json(await service.listar(req.query))));
router.get('/:id', asyncHandler(async (req, res) => res.json(await service.obtener(parseId(req.params.id)))));
router.post('/', asyncHandler(async (req, res) =>
  res.status(201).json(await service.crear({ ...req.body, usuario_id: req.usuario.id }))));
router.patch('/:id/estado', asyncHandler(async (req, res) => {
  if (req.body.estado === 'anulada' && req.usuario.rol !== 'admin') {
    throw new HttpError(403, 'Solo un administrador puede anular facturas');
  }
  res.json(await service.cambiarEstado(parseId(req.params.id), req.body.estado));
}));

router.patch('/:id/enviada', asyncHandler(async (req, res) =>
  res.json(await service.marcarEnviada(parseId(req.params.id), req.body.enviada !== false))));

module.exports = router;
