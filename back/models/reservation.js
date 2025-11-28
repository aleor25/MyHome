const pool = require('../config/database');
const QRCode = require('qrcode');
const crypto = require('crypto');

class Reservation {
  // Subir foto checkin/checkout
  static async subirFotoCheckinCheckout(reservaId, tipoFoto, urlFoto) {
    try {
      const result = await pool.query(
        'INSERT INTO fotos_checkin_checkout (reserva_id, tipo_foto, url_foto) VALUES ($1, $2, $3) RETURNING *',
        [reservaId, tipoFoto, urlFoto]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener fotos de una reserva
  static async obtenerFotosReserva(reservaId) {
    try {
      const result = await pool.query(
        'SELECT * FROM fotos_checkin_checkout WHERE reserva_id = $1 ORDER BY fecha_subida DESC',
        [reservaId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Crear nueva reserva
  static async crearReserva(propiedadId, huespedId, fechaCheckin, fechaCheckout, precioTotal) {
    try {
      const result = await pool.query(
        `INSERT INTO reservas
         (propiedad_id, huesped_id, fecha_checkin, fecha_checkout, precio_total, estado)
         VALUES ($1, $2, $3, $4, $5, 'confirmada')
         RETURNING *`,
        [propiedadId, huespedId, fechaCheckin, fechaCheckout, precioTotal]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener reserva por ID
  static async obtenerPorId(id) {
    try {
      const result = await pool.query(
        `SELECT r.*,
                p.nombre as propiedad_nombre, p.zona, p.precio_noche,
                u.nombre as huesped_nombre, u.email as huesped_email
         FROM reservas r
         JOIN propiedades p ON r.propiedad_id = p.id
         JOIN usuarios u ON r.huesped_id = u.id
         WHERE r.id = $1`,
        [id]
      );
      const reserva = result.rows[0];
      console.log(`[MODELO] obtenerPorId(${id}): Estado actual = '${reserva?.estado}'`);
      return reserva;
    } catch (error) {
      throw error;
    }
  }

  // Obtener reservas del huésped
  static async obtenerReservasHuesped(huespedId) {
    try {
      const result = await pool.query(
        `SELECT r.*,
                p.nombre as propiedad_nombre, p.zona, p.precio_noche, p.ciudad,
                u_prop.nombre as propietario_nombre
         FROM reservas r
         JOIN propiedades p ON r.propiedad_id = p.id
         JOIN usuarios u_prop ON p.propietario_id = u_prop.id
         WHERE r.huesped_id = $1
         ORDER BY r.fecha_checkin DESC`,
        [huespedId]
      );
      console.log(`[MODELO] obtenerReservasHuesped(${huespedId}): ${result.rows.length} reservas encontradas`);
      result.rows.forEach(r => {
        console.log(`  - Reserva #${r.id}: estado='${r.estado}'`);
      });
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener reservas del propietario
  static async obtenerReservasPropietario(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT r.*, 
                p.nombre as propiedad_nombre, p.zona,
                u.nombre as huesped_nombre, u.email as huesped_email, u.telefono as huesped_telefono
         FROM reservas r
         JOIN propiedades p ON r.propiedad_id = p.id
         JOIN usuarios u ON r.huesped_id = u.id
         WHERE p.propietario_id = $1
         ORDER BY r.fecha_checkin DESC`,
        [propietarioId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar estado de reserva
  static async actualizarEstado(id, nuevoEstado) {
    try {
      const result = await pool.query(
        'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
        [nuevoEstado, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Actualizar número de tarjeta
  static async actualizarNumeroTarjeta(id, ultimos4) {
    try {
      const result = await pool.query(
        'UPDATE reservas SET numero_tarjeta_ultimos_4 = $1 WHERE id = $2 RETURNING *',
        [ultimos4, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Cancelar reserva (con penalización)
  static async cancelarReserva(id, motivo) {
    try {
      // Calcular penalización: si cancela menos de 24h antes, cobra 50% del total
      const reserva = await this.obtenerPorId(id);
      const ahora = new Date();
      const fechaCheckin = new Date(reserva.fecha_checkin);
      const horasRestantes = (fechaCheckin - ahora) / (1000 * 60 * 60);
      
      let penalizacion = 0;
      if (horasRestantes < 24) {
        penalizacion = parseFloat(reserva.precio_total) * 0.5;
      }

      const result = await pool.query(
        `UPDATE reservas 
         SET estado = 'cancelada', 
             fecha_cancelacion = NOW(),
             motivo_cancelacion = $1,
             penalizacion = $2
         WHERE id = $3 
         RETURNING *`,
        [motivo, penalizacion, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Verificar disponibilidad de propiedad
  static async verificarDisponibilidad(propiedadId, fechaCheckin, fechaCheckout) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) FROM reservas 
         WHERE propiedad_id = $1 
         AND estado != 'cancelada'
         AND (
           (fecha_checkin <= $3 AND fecha_checkout >= $2)
         )`,
        [propiedadId, fechaCheckin, fechaCheckout]
      );
      return result.rows[0].count === '0';
    } catch (error) {
      throw error;
    }
  }

  // Obtener historial de clientes
  static async obtenerHistorialClientes(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT hc.*, 
                u.nombre as huesped_nombre, u.email,
                p.nombre as propiedad_nombre
         FROM historial_clientes hc
         JOIN usuarios u ON hc.huesped_id = u.id
         JOIN propiedades p ON hc.propiedad_id = p.id
         WHERE hc.propietario_id = $1
         ORDER BY hc.es_cliente_recurrente DESC, hc.numero_visitas DESC`,
        [propietarioId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar historial de clientes
  static async actualizarHistorialClientes(propietarioId, huespedId, propiedadId) {
    try {
      // Verificar si ya existe registro
      const existe = await pool.query(
        `SELECT * FROM historial_clientes 
         WHERE propietario_id = $1 AND huesped_id = $2 AND propiedad_id = $3`,
        [propietarioId, huespedId, propiedadId]
      );

      if (existe.rows.length > 0) {
        // Actualizar: incrementar visitas
        const result = await pool.query(
          `UPDATE historial_clientes 
           SET numero_visitas = numero_visitas + 1,
               fecha_ultima_visita = NOW(),
               es_cliente_recurrente = CASE WHEN numero_visitas >= 2 THEN true ELSE false END
           WHERE propietario_id = $1 AND huesped_id = $2 AND propiedad_id = $3
           RETURNING *`,
          [propietarioId, huespedId, propiedadId]
        );
        return result.rows[0];
      } else {
        // Crear nuevo registro
        const result = await pool.query(
          `INSERT INTO historial_clientes 
           (propietario_id, huesped_id, propiedad_id, numero_visitas, es_cliente_recurrente)
           VALUES ($1, $2, $3, 1, false)
           RETURNING *`,
          [propietarioId, huespedId, propiedadId]
        );
        return result.rows[0];
      }
    } catch (error) {
      throw error;
    }
  }

  // Procesar checkin con fotos
  static async procesarCheckin(reservaId, fotos) {
    try {
      const reserva = await this.obtenerPorId(reservaId);

      if (!reserva) {
        return { exito: false, error: 'Reserva no encontrada' };
      }

      if (reserva.estado !== 'confirmada') {
        return { exito: false, error: `No se puede hacer check-in. Estado: ${reserva.estado}` };
      }

      // Actualizar estado
      await this.actualizarEstado(reservaId, 'check-in');

      // Guardar fotos
      if (fotos && fotos.length > 0) {
        for (const foto of fotos) {
          await this.subirFotoCheckinCheckout(reservaId, 'checkin', foto);
        }
      }

      return {
        exito: true,
        mensaje: 'Check-in realizado exitosamente',
        reserva
      };
    } catch (error) {
      throw error;
    }
  }

  // Procesar checkout con fotos
  static async procesarCheckout(reservaId, fotos) {
    try {
      const reserva = await this.obtenerPorId(reservaId);

      if (!reserva) {
        return { exito: false, error: 'Reserva no encontrada' };
      }

      if (reserva.estado !== 'check-in') {
        return { exito: false, error: `No se puede hacer check-out. Estado: ${reserva.estado}` };
      }

      // Actualizar estado
      await this.actualizarEstado(reservaId, 'completada');

      // Guardar fotos
      if (fotos && fotos.length > 0) {
        for (const foto of fotos) {
          await this.subirFotoCheckinCheckout(reservaId, 'checkout', foto);
        }
      }

      return {
        exito: true,
        mensaje: 'Check-out realizado. Reserva completada',
        reserva
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Reservation;