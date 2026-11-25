const router = require('express').Router();
const { asyncHandler } = require('../../shared/http');
const { dashboard } = require('./dashboard.service');

router.get('/', asyncHandler(async (req, res) => res.json(await dashboard(req.query))));

module.exports = router;
