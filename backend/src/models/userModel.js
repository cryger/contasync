const pool = require('../config/database');

module.exports = {
  // Métodos de roles
  async getRoles() {
    try {
      const { rows } = await pool.query('SELECT * FROM roles ORDER BY id');
      return rows;
    } catch (error) {
      console.error('Error en getRoles:', error);
      throw error;
    }
  },

  // Métodos para usuarios
  async getAllUsers() {
    const { rows } = await pool.query(`
      SELECT u.id, u.nombre, u.email, u.rol_id, u.fecha_creacion, r.nombre as rol_nombre 
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
    `);
    return rows;
  },

  async getUserById(id) {
    try {
      const { rows } = await pool.query(`
        SELECT u.id, u.nombre, u.email, u.rol_id, u.fecha_creacion, r.nombre as rol_nombre 
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE u.id = $1 order by u.id asc
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error en getUserById:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO usuarios 
         (nombre, email, contrasena, rol_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, nombre, email, rol_id, fecha_creacion`,
        [
          userData.nombre,
          userData.email,
          userData.contrasena,
          userData.rol_id
        ]
      );
      return rows[0];
    } catch (error) {
      console.error('Error en createUser:', error);
      throw error;
    }
  },

  async updateUser(id, userData) {
    try {
      const { rows } = await pool.query(
        `UPDATE usuarios SET
         nombre = $1,
         email = $2,
         rol_id = $3
         WHERE id = $4
         RETURNING id, nombre, email, rol_id, fecha_creacion`,
        [
          userData.nombre,
          userData.email,
          userData.rol_id,
          id
        ]
      );
      return rows[0];
    } catch (error) {
      console.error('Error en updateUser:', error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      const { rowCount } = await pool.query(
        'DELETE FROM usuarios WHERE id = $1',
        [id]
      );
      return rowCount > 0;
    } catch (error) {
      console.error('Error en deleteUser:', error);
      throw error;
    }
  },

  async emailExists(email, excludeUserId = null) {
    try {
      let query = 'SELECT 1 FROM usuarios WHERE email = $1';
      const params = [email];
      
      if (excludeUserId) {
        query += ' AND id != $2';
        params.push(excludeUserId);
      }
      
      const { rows } = await pool.query(query, params);
      return rows.length > 0;
    } catch (error) {
      console.error('Error en emailExists:', error);
      throw error;
    }
  },

  async updateUserPassword(id, newPassword) {
    try {
      const { rows } = await pool.query(
        'UPDATE usuarios SET contrasena = $1 WHERE id = $2 RETURNING id',
        [newPassword, id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error en updateUserPassword:', error);
      throw error;
    }
  }
};