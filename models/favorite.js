const pool = require('../config/database');

class Favorite {
  // Agregar a favoritos
  static async agregar(usuarioId, propiedadId) {
    try {
      const result = await pool.query(
        'INSERT INTO favoritos (usuario_id, propiedad_id) VALUES ($1, $2) RETURNING *',
        [usuarioId, propiedadId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar de favoritos
  static async eliminar(usuarioId, propiedadId) {
    try {
      const result = await pool.query(
        'DELETE FROM favoritos WHERE usuario_id = $1 AND propiedad_id = $2 RETURNING *',
        [usuarioId, propiedadId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Verificar si es favorito
  static async esFavorito(usuarioId, propiedadId) {
    try {
      const result = await pool.query(
        'SELECT * FROM favoritos WHERE usuario_id = $1 AND propiedad_id = $2',
        [usuarioId, propiedadId]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener favoritos de un usuario
  static async obtenerMisFavoritos(usuarioId) {
    try {
      const result = await pool.query(
        `SELECT
          f.id as favorito_id,
          f.fecha_creacion,
          p.*,
          u.nombre as propietario_nombre,
          u.email as propietario_email,
          u.telefono as propietario_telefono,
          COALESCE(AVG(r.calificacion), 0) as calificacion_promedio,
          COUNT(DISTINCT r.id) as total_resenas
         FROM favoritos f
         JOIN propiedades p ON f.propiedad_id = p.id
         JOIN usuarios u ON p.propietario_id = u.id
         LEFT JOIN resenas r ON p.id = r.propiedad_id
         WHERE f.usuario_id = $1
         GROUP BY f.id, f.fecha_creacion, p.id, u.id
         ORDER BY f.fecha_creacion DESC`,
        [usuarioId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Alternar favorito (toggle)
  static async toggle(usuarioId, propiedadId) {
    try {
      const esFav = await this.esFavorito(usuarioId, propiedadId);

      if (esFav) {
        await this.eliminar(usuarioId, propiedadId);
        return { agregado: false, mensaje: 'Eliminado de favoritos' };
      } else {
        await this.agregar(usuarioId, propiedadId);
        return { agregado: true, mensaje: 'Agregado a favoritos' };
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Favorite;
