const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

module.exports = {
  // 1. Métodos para Roles
  async getRoles(req, res) {
    try {
      const roles = await userModel.getRoles();
      res.json(roles);
    } catch (error) {
      console.error('Error en getRoles:', error);
      res.status(500).json({ 
        error: 'Error al obtener roles',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // 2. Métodos para Usuarios
  async getUsers(req, res) {
    try {
      const users = await userModel.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error en getUsers:', error);
      res.status(500).json({
        error: 'Error al obtener usuarios',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async createUser(req, res) {
    try {
      // Verifica que el body exista
      if (!req.body) {
        return res.status(400).json({ error: 'Cuerpo de la solicitud vacío' });
      }
  
      const { nombre, email, contrasena, rol_id } = req.body;
  
      // Validaciones mejoradas
      if (!nombre || !email || !contrasena || !rol_id) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios',
          campos_requeridos: ['nombre', 'email', 'contrasena', 'rol_id'],
          campos_recibidos: Object.keys(req.body)
        });
      }
  
      if (await userModel.emailExists(email)) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
  
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      
      const newUser = await userModel.createUser({
        nombre,
        email,
        contrasena: hashedPassword,
        rol_id
      });
  
      // No retornar la contraseña
      delete newUser.contrasena;
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error en createUser:', error);
      res.status(500).json({
        error: 'Error al crear usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await userModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      // No retornar la contraseña
      delete user.contrasena;
      res.json(user);
    } catch (error) {
      console.error('Error en getUserById:', error);
      res.status(500).json({
        error: 'Error al obtener usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, rol_id } = req.body;

      // Validaciones
      if (!nombre || !email || !rol_id) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      // Verificar si el usuario existe
      const existingUser = await userModel.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar si el email ya está en uso por otro usuario
      if (email !== existingUser.email && await userModel.emailExists(email, id)) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const updatedUser = await userModel.updateUser(id, {
        nombre,
        email,
        rol_id
      });

      // No retornar la contraseña
      delete updatedUser.contrasena;
      res.json(updatedUser);
    } catch (error) {
      console.error('Error en updateUser:', error);
      res.status(500).json({
        error: 'Error al actualizar usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si el usuario existe
      const user = await userModel.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await userModel.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error en deleteUser:', error);
      res.status(500).json({
        error: 'Error al eliminar usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Ambas contraseñas son requeridas' });
      }

      const user = await userModel.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.contrasena);
      if (!isMatch) {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userModel.updateUserPassword(id, hashedPassword);

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error en changePassword:', error);
      res.status(500).json({
        error: 'Error al cambiar contraseña',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};