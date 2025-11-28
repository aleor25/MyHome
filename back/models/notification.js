const pool = require('../config/database');

class Notification {
  // Crear notificación
  static async crearNotificacion(usuarioId, reservaId, tipoNotificacion, titulo, mensaje) {
    try {
      const result = await pool.query(
        `INSERT INTO notificaciones (usuario_id, reserva_id, tipo_notificacion, titulo, mensaje)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [usuarioId, reservaId, tipoNotificacion, titulo, mensaje]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener notificaciones del usuario
  static async obtenerNotificacionesUsuario(usuarioId, limite = 50) {
    try {
      const result = await pool.query(
        `SELECT n.*, r.propiedad_id
         FROM notificaciones n
         LEFT JOIN reservas r ON n.reserva_id = r.id
         WHERE n.usuario_id = $1
         ORDER BY n.fecha_envio DESC
         LIMIT $2`,
        [usuarioId, limite]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener notificaciones no leídas
  static async obtenerNotificacionesNoLeidas(usuarioId) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) FROM notificaciones 
         WHERE usuario_id = $1 AND leida = false`,
        [usuarioId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Marcar notificación como leída
  static async marcarComoLeida(notificacionId, usuarioId) {
    try {
      const result = await pool.query(
        `UPDATE notificaciones 
         SET leida = true 
         WHERE id = $1 AND usuario_id = $2
         RETURNING *`,
        [notificacionId, usuarioId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

// Marcar todas como leídas
  static async marcarTodasComoLeidas(usuarioId) {
    try {
      // Primero, contar cuántas se van a actualizar
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM notificaciones 
         WHERE usuario_id = $1 AND leida = false`,
        [usuarioId]
      );
      
      const actualizadas = parseInt(countResult.rows[0].count);

      // Luego, actualizar todas
      await pool.query(
        `UPDATE notificaciones 
         SET leida = true 
         WHERE usuario_id = $1 AND leida = false`,
        [usuarioId]
      );

      return { actualizadas };
    } catch (error) {
      throw error;
    }
  }

  // Eliminar notificación
  static async eliminarNotificacion(notificacionId, usuarioId) {
    try {
      const result = await pool.query(
        `DELETE FROM notificaciones 
         WHERE id = $1 AND usuario_id = $2
         RETURNING id`,
        [notificacionId, usuarioId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Crear notificación de reserva confirmada
  static async notificacionReservaConfirmada(usuarioId, reservaId, nombrePropiedad) {
    try {
      return await this.crearNotificacion(
        usuarioId,
        reservaId,
        'reserva_confirmada',
        '¡Reserva Confirmada! 🎉',
        `Tu reserva en ${nombrePropiedad} ha sido confirmada exitosamente.`
      );
    } catch (error) {
      throw error;
    }
  }

  // Crear notificación de recordatorio check-in
  static async notificacionRecordatorioCheckin(usuarioId, reservaId, nombrePropiedad) {
    try {
      return await this.crearNotificacion(
        usuarioId,
        reservaId,
        'recordatorio_checkin',
        '¡Check-in Mañana! 📍',
        `No olvides hacer check-in en ${nombrePropiedad} mañana.`
      );
    } catch (error) {
      throw error;
    }
  }

  // Crear notificación de cobro realizado
  static async notificacionCobroRealizado(usuarioId, reservaId, monto, nombrePropiedad) {
    try {
      return await this.crearNotificacion(
        usuarioId,
        reservaId,
        'cobro_realizado',
        '💳 Cobro Realizado',
        `Se ha cobrado $${monto} por tu estancia en ${nombrePropiedad}.`
      );
    } catch (error) {
      throw error;
    }
  }

  // Crear notificación de check-in completado
  static async notificacionCheckInCompletado(usuarioId, reservaId, nombrePropiedad) {
    try {
      return await this.crearNotificacion(
        usuarioId,
        reservaId,
        'check_in_completado',
        '✅ Check-in Completado',
        `¡Bienvenido a ${nombrePropiedad}! Disfruta tu estancia.`
      );
    } catch (error) {
      throw error;
    }
  }

  // Crear notificación de check-out completado
  static async notificacionCheckOutCompletado(usuarioId, reservaId, nombrePropiedad) {
    try {
      return await this.crearNotificacion(
        usuarioId,
        reservaId,
        'check_out_completado',
        '👋 Check-out Completado',
        `Gracias por tu estancia en ${nombrePropiedad}. ¡Esperamos verte pronto!`
      );
    } catch (error) {
      throw error;
    }
  }

  // Crear notificación de cancelación
  static async notificacionCancelacion(usuarioId, reservaId, nombrePropiedad, razon = '') {
    try {
      const mensaje = razon 
        ? `Tu reserva en ${nombrePropiedad} ha sido cancelada. Motivo: ${razon}`
        : `Tu reserva en ${nombrePropiedad} ha sido cancelada.`;
      
      return await this.crearNotificacion(
        usuarioId,
        reservaId,
        'cancelacion',
        '❌ Reserva Cancelada',
        mensaje
      );
    } catch (error) {
      throw error;
    }
  }

  // Crear notificación de penalización
  static async notificacionPenalizacion(usuarioId, reservaId, monto, nombrePropiedad) {
    try {
      return await this.crearNotificacion(
        usuarioId,
        reservaId,
        'penalizacion',
        '⚠️ Penalización Aplicada',
        `Se ha aplicado una penalización de $${monto} por cancelación tardía en ${nombrePropiedad}.`
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Notification;