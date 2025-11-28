const pool = require('../config/database');

class Review {
  // Crear una reseña
  static async crearResena(reservaId, propiedadId, huespedId, propietarioId, calificacion, comentario, detalles) {
    try {
      const { limpieza, ubicacion, comunicacion, relacionCalidadPrecio } = detalles || {};

      const result = await pool.query(
        `INSERT INTO resenas
          (reserva_id, propiedad_id, huesped_id, propietario_id, calificacion, comentario,
           limpieza, ubicacion, comunicacion, relacion_calidad_precio)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [reservaId, propiedadId, huespedId, propietarioId, calificacion, comentario,
         limpieza, ubicacion, comunicacion, relacionCalidadPrecio]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener reseñas de una propiedad
  static async obtenerResenasPorPropiedad(propiedadId) {
    try {
      const result = await pool.query(
        `SELECT r.*, u.nombre as nombre_huesped
         FROM resenas r
         JOIN usuarios u ON r.huesped_id = u.id
         WHERE r.propiedad_id = $1
         ORDER BY r.fecha_creacion DESC`,
        [propiedadId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener promedio de calificación de una propiedad
  static async obtenerPromedioCalificacion(propiedadId) {
    try {
      const result = await pool.query(
        `SELECT
           ROUND(AVG(calificacion), 1) as promedio_general,
           ROUND(AVG(limpieza), 1) as promedio_limpieza,
           ROUND(AVG(ubicacion), 1) as promedio_ubicacion,
           ROUND(AVG(comunicacion), 1) as promedio_comunicacion,
           ROUND(AVG(relacion_calidad_precio), 1) as promedio_calidad_precio,
           COUNT(*) as total_resenas
         FROM resenas
         WHERE propiedad_id = $1`,
        [propiedadId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Verificar si el huésped puede dejar reseña (reserva completada y sin reseña previa)
  static async puedeDejarResena(reservaId, huespedId) {
    try {
      const result = await pool.query(
        `SELECT r.id, r.estado,
          (SELECT COUNT(*) FROM resenas WHERE reserva_id = r.id) as tiene_resena
         FROM reservas r
         WHERE r.id = $1 AND r.huesped_id = $2`,
        [reservaId, huespedId]
      );

      if (result.rows.length === 0) {
        return { puede: false, motivo: 'Reserva no encontrada' };
      }

      const reserva = result.rows[0];

      if (reserva.estado !== 'completada') {
        return { puede: false, motivo: 'La reserva debe estar completada' };
      }

      if (reserva.tiene_resena > 0) {
        return { puede: false, motivo: 'Ya has dejado una reseña para esta reserva' };
      }

      return { puede: true };
    } catch (error) {
      throw error;
    }
  }

  // Obtener reseñas dejadas por un huésped
  static async obtenerResenasPorHuesped(huespedId) {
    try {
      const result = await pool.query(
        `SELECT r.*, p.nombre as nombre_propiedad, p.zona
         FROM resenas r
         JOIN propiedades p ON r.propiedad_id = p.id
         WHERE r.huesped_id = $1
         ORDER BY r.fecha_creacion DESC`,
        [huespedId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener reseñas recibidas por un propietario
  static async obtenerResenasRecibidas(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT r.*, p.nombre as nombre_propiedad, u.nombre as nombre_huesped
         FROM resenas r
         JOIN propiedades p ON r.propiedad_id = p.id
         JOIN usuarios u ON r.huesped_id = u.id
         WHERE r.propietario_id = $1
         ORDER BY r.fecha_creacion DESC`,
        [propietarioId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener reseña por ID
  static async obtenerResenaPorId(resenaId) {
    try {
      const result = await pool.query(
        `SELECT r.*,
          p.nombre as nombre_propiedad, p.zona,
          u.nombre as nombre_huesped
         FROM resenas r
         JOIN propiedades p ON r.propiedad_id = p.id
         JOIN usuarios u ON r.huesped_id = u.id
         WHERE r.id = $1`,
        [resenaId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Verificar si existe reseña para una reserva
  static async existeResenaPorReserva(reservaId) {
    try {
      const result = await pool.query(
        'SELECT id FROM resenas WHERE reserva_id = $1',
        [reservaId]
      );

      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener reservas completadas sin reseña para un huésped
  static async obtenerReservasSinResena(huespedId) {
    try {
      const result = await pool.query(
        `SELECT r.id as reserva_id, r.fecha_checkin, r.fecha_checkout, r.precio_total,
          p.id as propiedad_id, p.nombre as propiedad_nombre, p.zona,
          p.propietario_id
         FROM reservas r
         JOIN propiedades p ON r.propiedad_id = p.id
         WHERE r.huesped_id = $1
           AND r.estado = 'completada'
           AND NOT EXISTS (
             SELECT 1 FROM resenas WHERE reserva_id = r.id
           )
         ORDER BY r.fecha_checkout DESC`,
        [huespedId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Review;
