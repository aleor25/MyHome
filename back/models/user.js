const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Crear nuevo usuario
  static async crearUsuario(nombre, email, password, telefono, tipoUsuario) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await pool.query(
        'INSERT INTO usuarios (nombre, email, password, telefono, tipo_usuario) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, email, tipo_usuario, fecha_registro',
        [nombre, email, hashedPassword, telefono, tipoUsuario]
      );
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por email
  static async obtenerPorEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM usuarios WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por ID
  static async obtenerPorId(id) {
    try {
      const result = await pool.query(
        'SELECT id, nombre, email, telefono, tipo_usuario, fecha_registro FROM usuarios WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Verificar contraseña
  static async verificarPassword(passwordIngresada, passwordEncriptada) {
    return await bcrypt.compare(passwordIngresada, passwordEncriptada);
  }

  // Actualizar perfil
  static async actualizarPerfil(id, nombre, telefono) {
    try {
      const result = await pool.query(
        'UPDATE usuarios SET nombre = $1, telefono = $2 WHERE id = $3 RETURNING id, nombre, email, telefono, tipo_usuario, fecha_registro',
        [nombre, telefono, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Cambiar contraseña
  static async cambiarContrasena(id, nuevoHashPassword) {
    try {
      const result = await pool.query(
        'UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id',
        [nuevoHashPassword, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario con password para verificación
  static async obtenerConPassword(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM usuarios WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;