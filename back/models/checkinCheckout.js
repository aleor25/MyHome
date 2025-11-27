const pool = require('../config/database');

class CheckinCheckout {
  // Registrar check-in
  static async registrarCheckin(reservaId, huespedId) {
    try {
      const result = await pool.query(
        `UPDATE reservas 
         SET estado = 'check-in',
             qr_checkin = $1
         WHERE id = $2 AND huesped_id = $3
         RETURNING *`,
        [new Date().toISOString(), reservaId, huespedId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Reserva no encontrada o no tienes permiso');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Registrar check-out
  static async registrarCheckout(reservaId, huespedId) {
    try {
      const result = await pool.query(
        `UPDATE reservas 
         SET estado = 'check-out',
             qr_checkout = $1
         WHERE id = $2 AND huesped_id = $3
         RETURNING *`,
        [new Date().toISOString(), reservaId, huespedId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Reserva no encontrada o no tienes permiso');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Agregar foto de check-in/check-out
  static async agregarFotoCheckinCheckout(reservaId, urlFoto, tipoFoto) {
    try {
      const result = await pool.query(
        `INSERT INTO fotos_checkin_checkout (reserva_id, url_foto, tipo_foto)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [reservaId, urlFoto, tipoFoto]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener fotos de check-in/check-out
  static async obtenerFotosCheckinCheckout(reservaId) {
    try {
      const result = await pool.query(
        `SELECT * FROM fotos_checkin_checkout 
         WHERE reserva_id = $1
         ORDER BY fecha_subida ASC`,
        [reservaId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Contar fotos de check-in
  static async contarFotosCheckin(reservaId) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) FROM fotos_checkin_checkout 
         WHERE reserva_id = $1 AND tipo_foto = 'checkin'`,
        [reservaId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Contar fotos de check-out
  static async contarFotosCheckout(reservaId) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) FROM fotos_checkin_checkout 
         WHERE reserva_id = $1 AND tipo_foto = 'checkout'`,
        [reservaId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Verificar si puede hacer check-in
  static async puedeHacerCheckin(reservaId, huespedId) {
    try {
      const result = await pool.query(
        `SELECT r.*
         FROM reservas r
         WHERE r.id = $1 AND r.huesped_id = $2 AND r.estado = 'confirmada'`,
        [reservaId, huespedId]
      );
      
      if (result.rows.length === 0) {
        return { puede: false, razon: 'Reserva no encontrada o no está confirmada' };
      }

      const reserva = result.rows[0];
      const ahora = new Date();
      const fechaCheckin = new Date(reserva.fecha_checkin);
      const diferenciaHoras = (ahora - fechaCheckin) / (1000 * 60 * 60);

      // Permitir check-in hasta 24 horas después
      if (diferenciaHoras > 24) {
        return { puede: false, razon: 'El tiempo para check-in ha expirado' };
      }

      if (diferenciaHoras < -24) {
        return { puede: false, razon: 'Aún no es hora del check-in (falta más de 24 horas)' };
      }

      return { puede: true, razon: 'Puedes hacer check-in' };
    } catch (error) {
      throw error;
    }
  }

  // Verificar si puede hacer check-out
  static async puedeHacerCheckout(reservaId, huespedId) {
    try {
      const result = await pool.query(
        `SELECT r.*
         FROM reservas r
         WHERE r.id = $1 AND r.huesped_id = $2 AND r.estado = 'check-in'`,
        [reservaId, huespedId]
      );
      
      if (result.rows.length === 0) {
        return { puede: false, razon: 'Reserva no encontrada o no ha hecho check-in' };
      }

      return { puede: true, razon: 'Puedes hacer check-out' };
    } catch (error) {
      throw error;
    }
  }

  // Completar reserva (después de check-out)
  static async completarReserva(reservaId, huespedId) {
    try {
      const result = await pool.query(
        `UPDATE reservas 
         SET estado = 'completada'
         WHERE id = $1 AND huesped_id = $2 AND estado = 'check-out'
         RETURNING *`,
        [reservaId, huespedId]
      );

      if (result.rows.length === 0) {
        throw new Error('No se puede completar la reserva');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CheckinCheckout;