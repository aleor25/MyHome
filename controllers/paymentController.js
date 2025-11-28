const Payment = require('../models/payment');
const Reservation = require('../models/reservation');

// Procesar pago
exports.procesarPago = async (req, res) => {
  try {
    const { reservaId, numeroTarjeta, cvv, mesExpiracion, anioExpiracion, nombreTitular } = req.body;

    // Validaciones
    if (!reservaId || !numeroTarjeta || !cvv || !mesExpiracion || !anioExpiracion || !nombreTitular) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Verificar que la reserva existe
    const reserva = await Reservation.obtenerPorId(reservaId);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Verificar que el usuario es el dueño de la reserva
    if (reserva.huesped_id !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para pagar esta reserva' });
    }

    // Verificar que no haya un pago completado previo
    const pagoExistente = await Payment.obtenerPagoPorReserva(reservaId);
    if (pagoExistente && pagoExistente.estado === 'completado') {
      return res.status(400).json({ error: 'Esta reserva ya tiene un pago completado' });
    }

    // Procesar pago simulado
    const resultado = await Payment.procesarPagoSimulado(
      reservaId,
      reserva.precio_total,
      {
        numeroTarjeta,
        cvv,
        mesExpiracion,
        anioExpiracion,
        nombreTitular
      }
    );

    // Actualizar reserva con últimos 4 dígitos de la tarjeta
    await Reservation.actualizarNumeroTarjeta(reservaId, resultado.pago.numero_tarjeta_ultimos_4);

    res.status(201).json({
      mensaje: 'Pago procesado exitosamente',
      pago: resultado.pago,
      reserva: {
        id: reserva.id,
        precio_total: reserva.precio_total,
        fecha_checkin: reserva.fecha_checkin,
        fecha_checkout: reserva.fecha_checkout
      }
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(500).json({
      error: error.message || 'Error al procesar el pago'
    });
  }
};

// Obtener pago por reserva
exports.obtenerPagoPorReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;

    const pago = await Payment.obtenerPagoPorReserva(reservaId);
    if (!pago) {
      return res.status(404).json({ error: 'No se encontró pago para esta reserva' });
    }

    res.json({ pago });
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ error: 'Error al obtener pago' });
  }
};

// Obtener historial de pagos del usuario
exports.obtenerMisPagos = async (req, res) => {
  try {
    const pagos = await Payment.obtenerPagosUsuario(req.userId);
    res.json({
      total: pagos.length,
      pagos
    });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};
