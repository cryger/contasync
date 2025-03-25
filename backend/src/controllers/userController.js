const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

module.exports = {
  async getRoles(req, res) {
    try {
      const roles = await userModel.getRoles();
      res.json(roles);
    } catch (error) {
      console.error('Error en getRoles:', error);
      res.status(500).json({ error: 'Error al obtener roles' });
    }
  },

  async createUser(req, res) {
    try {
      const { firstName, lastName, email, password, roleId, contact, address1, address2 } = req.body;

      if (await userModel.emailExists(email)) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await userModel.createUser({
        nombre: `${firstName} ${lastName}`,
        email,
        contrasena: hashedPassword,
        rol_id: roleId,
        telefono: contact,
        direccion1: address1,
        direccion2: address2
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error en createUser:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }
};