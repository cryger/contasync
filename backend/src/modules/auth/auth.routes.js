const router = require('express').Router();
const { asyncHandler } = require('../../shared/http');
const { requireAuth } = require('./auth.middleware');
const auth = require('./auth.service');

// ¿Hay que crear el primer administrador?
router.get('/estado', asyncHandler(async (req, res) => res.json({ configurado: await auth.hayUsuarios() })));

router.post('/configuracion-inicial', asyncHandler(async (req, res) =>
  res.status(201).json(await auth.configuracionInicial(req.body))));

router.post('/login', asyncHandler(async (req, res) => res.json(await auth.login(req.body, req.ip))));

router.get('/yo', requireAuth, (req, res) => res.json(req.usuario));

router.put('/yo/password', requireAuth, asyncHandler(async (req, res) => {
  await auth.cambiarPassword(req.usuario.id, req.body);
  res.json({ ok: true });
}));

module.exports = router;
