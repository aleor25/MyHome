const Reservation = require('../models/reservation');
const Property = require('../models/property');
const Notification = require('../models/notification');

// Crear reserva
exports.crearReserva = async (req, res) => {
  try {
    const { propiedadId, fechaCheckin, fechaCheckout, numeroTarjeta } = req.body;

    // Validaciones
    if (!propiedadId || !fechaCheckin || !fechaCheckout) {
      console.error('ERROR 400 Reserva: Faltan campos requeridos.'); // <-- AÑADIDO
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const fechaIn = new Date(fechaCheckin);
    const fechaOut = new Date(fechaCheckout);

    if (fechaIn >= fechaOut) {
      console.error('ERROR 400 Reserva: Fecha de checkout no es posterior a checkin.'); // <-- AÑADIDO
      return res.status(400).json({ error: 'La fecha de checkout debe ser posterior a la de checkin' });
    }

// ...

// 1. Crear objetos Date a medianoche para ignorar la hora
const hoyMedianoche = new Date();
hoyMedianoche.setHours(0, 0, 0, 0); 
const fechaInMedianoche = new Date(fechaIn);
fechaInMedianoche.setHours(0, 0, 0, 0);

// 2. Usar la versión a medianoche para la validación de fecha pasada
if (fechaInMedianoche < hoyMedianoche) { 
    console.error('ERROR 400 Reserva: Intentando reservar en fecha pasada.');
    return res.status(400).json({ error: 'No puedes reservar para fechas pasadas' });
}
// ...

    // Obtener propiedad
    const propiedad = await Property.obtenerPorId(propiedadId);
    if (!propiedad) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    // Verificar disponibilidad
    const disponible = await Reservation.verificarDisponibilidad(propiedadId, fechaCheckin, fechaCheckout);
    if (!disponible) {
      console.error('ERROR 400 Reserva: Propiedad no disponible en el rango de fechas.'); // <-- AÑADIDO
      return res.status(400).json({ error: 'La propiedad no está disponible en esas fechas' });
    }

    // Calcular precio
    const dias = Math.ceil((fechaOut - fechaIn) / (1000 * 60 * 60 * 24));
    const precioTotal = dias * parseFloat(propiedad.precio_noche);

    // Crear reserva
    const reserva = await Reservation.crearReserva(
      propiedadId,
      req.userId,
      fechaCheckin,
      fechaCheckout,
      precioTotal
    );
    // notificacion:
    // Enviar notificación de reserva confirmada
    await Notification.notificacionReservaConfirmada(req.userId, reserva.id, propiedad.nombre);

    // Actualizar historial de clientes (Dos veces? Revisar duplicidad si es necesario)
    await Reservation.actualizarHistorialClientes(propiedad.propietario_id, req.userId, propiedadId);

    // Actualizar historial de clientes
    await Reservation.actualizarHistorialClientes(propiedad.propietario_id, req.userId, propiedadId);

    res.status(201).json({
      mensaje: 'Reserva creada exitosamente',
      reserva,
      detalles: {
        dias,
        precioNoche: propiedad.precio_noche,
        precioTotal
      }
    });
  } catch (error) {
    console.error('Error 500 al crear reserva (Excepción no controlada):', error); // <-- ACTUALIZADO
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};

// Obtener mis reservas (como huésped)
exports.obtenerMisReservas = async (req, res) => {
  try {
    const reservas = await Reservation.obtenerReservasHuesped(req.userId);
    res.json({
      total: reservas.length,
      reservas
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// Obtener reservas de mis propiedades (como propietario)
exports.obtenerReservasPropiedades = async (req, res) => {
  try {
    const reservas = await Reservation.obtenerReservasPropietario(req.userId);
    res.json({
      total: reservas.length,
      reservas
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// Obtener detalle de reserva
exports.obtenerReserva = async (req, res) => {
  try {
    const { id } = req.params;

    const reserva = await Reservation.obtenerPorId(id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Verificar que pertenece al usuario (como huésped o propietario)
    if (reserva.huesped_id !== req.userId && reserva.propietario_id !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta reserva' });
    }

    res.json(reserva);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error al obtener reserva' });
  }
};


// Cancelar reserva
exports.cancelarReserva = async (req, res) => {
  // Obtenemos el ID de los parámetros de ruta inmediatamente
  const reservaId = req.params.id;

  try {
    // 🚨 LOG REUBICADO: DEBE EJECUTARSE SI LA RUTA ES DETECTADA 🚨
    console.log(`[CANCELAR] >> INICIO DEL CONTROLADOR para ID: ${reservaId}. Usuario: ${req.userId}`);

    // Extraer motivo de forma segura (req.body podría ser undefined)
    const motivo = req.body?.motivo || 'Cancelación del usuario'; 

    const reserva = await Reservation.obtenerPorId(reservaId);
    if (!reserva) {
      console.error(`[CANCELAR] Error 404: Reserva ID ${reservaId} no encontrada.`);
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Solo el huésped puede cancelar
    if (reserva.huesped_id !== req.userId) {
      console.error(`[CANCELAR] Error 403: Usuario ${req.userId} intentó cancelar reserva que no le pertenece.`);
      return res.status(403).json({ error: 'Solo el huésped puede cancelar la reserva' });
    }

    if (reserva.estado !== 'confirmada') {
      console.error(`[CANCELAR] ERROR 400: Intentando cancelar reserva en estado: ${reserva.estado}`);
      return res.status(400).json({ error: 'No puedes cancelar una reserva que no está confirmada' });
    }

    const reservaCancelada = await Reservation.cancelarReserva(reservaId, motivo);

    res.json({
      mensaje: 'Reserva cancelada',
      reserva: reservaCancelada,
      penalizacion: reservaCancelada.penalizacion > 0 ? `Se aplicó una penalización de $${reservaCancelada.penalizacion}` : 'Sin penalización'
    });
  } catch (error) {
    console.error(`[CANCELAR] Error 500 (Excepción): Falló la cancelación de ID ${reservaId}.`, error);
    res.status(500).json({ error: error.message || 'Error al cancelar reserva' });
  }
};

// Obtener historial de clientes
exports.obtenerHistorialClientes = async (req, res) => {
  try {
    const historial = await Reservation.obtenerHistorialClientes(req.userId);
    res.json({
      total: historial.length,
      historial
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// Procesar checkin
exports.procesarCheckin = async (req, res) => {
  try {
    const { reservaId, fotos } = req.body;

    if (!reservaId) {
      console.error('ERROR 400 Checkin: reservaId requerido.'); // <-- AÑADIDO
      return res.status(400).json({ error: 'reservaId requerido' });
    }

    const resultado = await Reservation.procesarCheckin(reservaId, fotos || []);

    if (!resultado.exito) {
      console.error(`ERROR 400 Checkin: ${resultado.error}`); // <-- AÑADIDO
      return res.status(400).json({ error: resultado.error });
    }

    res.json({
      mensaje: resultado.mensaje,
      reserva: resultado.reserva
    });
  } catch (error) {
    console.error('Error al procesar checkin:', error);
    res.status(500).json({ error: 'Error al procesar check-in' });
  }
};

// Procesar checkout
exports.procesarCheckout = async (req, res) => {
  try {
    const { reservaId, fotos } = req.body;

    if (!reservaId) {
      console.error('ERROR 400 Checkout: reservaId requerido.'); // <-- AÑADIDO
      return res.status(400).json({ error: 'reservaId requerido' });
    }

    const resultado = await Reservation.procesarCheckout(reservaId, fotos || []);

    if (!resultado.exito) {
      console.error(`ERROR 400 Checkout: ${resultado.error}`); // <-- AÑADIDO
      return res.status(400).json({ error: resultado.error });
    }

    res.json({
      mensaje: resultado.mensaje,
      reserva: resultado.reserva
    });
  } catch (error) {
    console.error('Error al procesar checkout:', error);
    res.status(500).json({ error: 'Error al procesar check-out' });
  }
};

// Obtener fotos de reserva
exports.obtenerFotosReserva = async (req, res) => {
  try {
    const { id } = req.params;

    const fotos = await Reservation.obtenerFotosReserva(id);

    res.json({ fotos });
  } catch (error) {
    console.error('Error al obtener fotos:', error);
    res.status(500).json({ error: 'Error al obtener fotos' });
  }
};