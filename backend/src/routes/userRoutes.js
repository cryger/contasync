const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/roles', userController.getRoles);
router.post('/users', userController.createUser);

module.exports = router;