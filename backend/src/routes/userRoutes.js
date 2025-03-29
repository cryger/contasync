const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas para roles
router.get('/roles', userController.getRoles);

// Rutas CRUD para usuarios
router.get('/usuarios', userController.getUsers);
router.post('/usuarios', userController.createUser);
router.get('/usuarios/:id', userController.getUserById);
router.put('/usuarios/:id', userController.updateUser);
router.delete('/usuarios/:id', userController.deleteUser);

// Ruta para cambio de contraseña
router.put('/usuarios/:id/change-password', userController.changePassword);

module.exports = router;