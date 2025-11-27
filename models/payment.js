const pool = require('../config/database');

class Payment {
  // Crear pago
  static async crearPago(reservaId, monto, numeroTarjetaUltimos4, nombreTitular, descripcion = '') {
    try {
      const result = await pool.query(
        `INSERT INTO pagos
         (reserva_id, monto, estado, metodo_pago, numero_tarjeta_ultimos_4, nombre_titular, descripcion)
         VALUES ($1, $2, 'completado', 'tarjeta_credito', $3, $4, $5)
         RETURNING *`,
        [reservaId, monto, numeroTarjetaUltimos4, nombreTitular, descripcion]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener pago por ID de reserva
  static async obtenerPagoPorReserva(reservaId) {
    try {
      const result = await pool.query(
        'SELECT * FROM pagos WHERE reserva_id = $1 ORDER BY fecha_pago DESC LIMIT 1',
        [reservaId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener pago por ID
  static async obtenerPagoPorId(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM pagos WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Actualizar estado de pago
  static async actualizarEstadoPago(id, nuevoEstado) {
    try {
      const result = await pool.query(
        `UPDATE pagos
         SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [nuevoEstado, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener historial de pagos de un usuario
  static async obtenerPagosUsuario(userId) {
    try {
      const result = await pool.query(
        `SELECT p.*, r.propiedad_id, r.fecha_checkin, r.fecha_checkout,
                prop.nombre as propiedad_nombre
         FROM pagos p
         INNER JOIN reservas r ON p.reserva_id = r.id
         INNER JOIN propiedades prop ON r.propiedad_id = prop.id
         WHERE r.huesped_id = $1
         ORDER BY p.fecha_pago DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Validar tarjeta (simulado - solo validación de formato)
  static validarTarjeta(numeroTarjeta, cvv, mesExpiracion, anioExpiracion) {
    // Remover espacios
    const numero = numeroTarjeta.replace(/\s/g, '');

    // Validar longitud (13-19 dígitos)
    if (numero.length < 13 || numero.length > 19) {
      return { valido: false, error: 'Número de tarjeta inválido' };
    }

    // Validar que solo contenga números
    if (!/^\d+$/.test(numero)) {
      return { valido: false, error: 'El número de tarjeta solo puede contener dígitos' };
    }

    // Validar CVV (3-4 dígitos)
    if (!/^\d{3,4}$/.test(cvv)) {
      return { valido: false, error: 'CVV inválido' };
    }

    // Validar mes (01-12)
    const mes = parseInt(mesExpiracion);
    if (mes < 1 || mes > 12) {
      return { valido: false, error: 'Mes de expiración inválido' };
    }

    // Validar año (no debe estar en el pasado)
    const anio = parseInt(anioExpiracion);
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1;

    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
      return { valido: false, error: 'La tarjeta está vencida' };
    }

    // Si pasa todas las validaciones
    return { valido: true, ultimos4: numero.slice(-4) };
  }

  // Procesar pago simulado
  static async procesarPagoSimulado(reservaId, monto, datosTarjeta) {
    try {
      const { numeroTarjeta, cvv, mesExpiracion, anioExpiracion, nombreTitular } = datosTarjeta;

      // Validar tarjeta
      const validacion = this.validarTarjeta(numeroTarjeta, cvv, mesExpiracion, anioExpiracion);

      if (!validacion.valido) {
        throw new Error(validacion.error);
      }

      // Simular procesamiento (siempre exitoso en este caso)
      const pago = await this.crearPago(
        reservaId,
        monto,
        validacion.ultimos4,
        nombreTitular,
        `Pago procesado exitosamente`
      );

      return {
        exito: true,
        pago,
        mensaje: 'Pago procesado exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Payment;
