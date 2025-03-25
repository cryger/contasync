const pool = require('../config/database');

module.exports = {
  async getRoles() {
    try {
      const { rows } = await pool.query('SELECT * FROM roles ORDER BY id');
      return rows;
    } catch (error) {
      console.error('Error en getRoles:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO usuarios 
         (nombre, email, contrasena, rol_id, telefono, direccion1, direccion2) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, nombre, email, rol_id`,
        [
          userData.nombre,
          userData.email,
          userData.contrasena,
          userData.rol_id,
          userData.telefono || null,
          userData.direccion1 || null,
          userData.direccion2 || null
        ]
      );
      return rows[0];
    } catch (error) {
      console.error('Error en createUser:', error);
      throw error;
    }
  },

  async emailExists(email) {
    try {
      const { rows } = await pool.query(
        'SELECT 1 FROM usuarios WHERE email = $1', 
        [email]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error en emailExists:', error);
      throw error;
    }
  }
};