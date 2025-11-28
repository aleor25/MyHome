const CheckinCheckout = require('../models/checkinCheckout');
const Reservation = require('../models/reservation');
const Notification = require('../models/notification');

// Verificar disponibilidad para check-in
exports.verificarCheckin = async (req, res) => {
  try {
    const { reservaId } = req.body;

    if (!reservaId) {
      return res.status(400).json({ error: 'reservaId es requerido' });
    }

    const validacion = await CheckinCheckout.puedeHacerCheckin(reservaId, req.userId);

    if (!validacion.puede) {
      return res.status(400).json({ error: validacion.razon });
    }

    // Obtener detalles de la reserva
    const reserva = await Reservation.obtenerPorId(reservaId);

    res.json({
      mensaje: 'Puedes hacer check-in',
      propiedad: reserva.propiedad_nombre,
      zona: reserva.zona,
      ciudad: reserva.zona // Puedes ajustar esto
    });
  } catch (error) {
    console.error('Error al verificar check-in:', error);
    res.status(500).json({ error: 'Error al verificar check-in' });
  }
};

// Registrar check-in (al escanear QR)
exports.registrarCheckin = async (req, res) => {
  try {
    const { reservaId } = req.body;

    if (!reservaId) {
      return res.status(400).json({ error: 'reservaId es requerido' });
    }

    const validacion = await CheckinCheckout.puedeHacerCheckin(reservaId, req.userId);
    if (!validacion.puede) {
      return res.status(400).json({ error: validacion.razon });
    }

    const reserva = await CheckinCheckout.registrarCheckin(reservaId, req.userId);
    // notificacion:
    // Obtener detalles de la reserva
    const reservaDetalles = await Reservation.obtenerPorId(reservaId);
    
    // Enviar notificación
    await Notification.notificacionCheckInCompletado(req.userId, reservaId, reservaDetalles.propiedad_nombre);

    res.json({
      mensaje: 'Check-in registrado. Ahora debes tomar fotos de la habitación.',
      reserva,
      fotosRequeridas: 'Debes tomar al menos 1 foto antes de poder ingresar a la habitación'
    });
  } catch (error) {
    console.error('Error al registrar check-in:', error);
    res.status(500).json({ error: error.message || 'Error al registrar check-in' });
  }
};

// Agregar foto de check-in
exports.agregarFotoCheckin = async (req, res) => {
  try {
    const { reservaId } = req.body;

    if (!reservaId || !req.file) {
      return res.status(400).json({ error: 'reservaId y foto son requeridos' });
    }

    // Verificar que la reserva pertenece al usuario
    const reserva = await Reservation.obtenerPorId(reservaId);
    if (reserva.huesped_id !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para esta reserva' });
    }

    if (reserva.estado !== 'check-in') {
      return res.status(400).json({ error: 'La reserva no está en estado check-in' });
    }

    // Guardar foto
    const urlFoto = `/uploads/checkin_checkout/${req.file.filename}`;
    const foto = await CheckinCheckout.agregarFotoCheckinCheckout(reservaId, urlFoto, 'checkin');

    // Contar fotos de check-in
    const totalFotos = await CheckinCheckout.contarFotosCheckin(reservaId);

    res.status(201).json({
      mensaje: 'Foto de check-in guardada',
      foto,
      totalFotosCheckin: totalFotos,
      detalles: 'Sigue tomando fotos del estado de la habitación'
    });
  } catch (error) {
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    }
    console.error('Error al agregar foto check-in:', error);
    res.status(500).json({ error: 'Error al guardar foto' });
  }
};

// Obtener fotos de check-in/check-out
exports.obtenerFotos = async (req, res) => {
  try {
    const { reservaId } = req.params;

    // Verificar que la reserva pertenece al usuario
    const reserva = await Reservation.obtenerPorId(reservaId);
    if (reserva.huesped_id !== req.userId && reserva.propietario_id !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para ver estas fotos' });
    }

    const fotos = await CheckinCheckout.obtenerFotosCheckinCheckout(reservaId);

    res.json({
      total: fotos.length,
      fotos
    });
  } catch (error) {
    console.error('Error al obtener fotos:', error);
    res.status(500).json({ error: 'Error al obtener fotos' });
  }
};

// Verificar disponibilidad para check-out
exports.verificarCheckout = async (req, res) => {
  try {
    const { reservaId } = req.body;

    if (!reservaId) {
      return res.status(400).json({ error: 'reservaId es requerido' });
    }

    const validacion = await CheckinCheckout.puedeHacerCheckout(reservaId, req.userId);

    if (!validacion.puede) {
      return res.status(400).json({ error: validacion.razon });
    }

    res.json({ mensaje: 'Puedes hacer check-out' });
  } catch (error) {
    console.error('Error al verificar check-out:', error);
    res.status(500).json({ error: 'Error al verificar check-out' });
  }
};

// Registrar check-out (al escanear QR al salir)
exports.registrarCheckout = async (req, res) => {
  try {
    const { reservaId } = req.body;

    if (!reservaId) {
      return res.status(400).json({ error: 'reservaId es requerido' });
    }

    const validacion = await CheckinCheckout.puedeHacerCheckout(reservaId, req.userId);
    if (!validacion.puede) {
      return res.status(400).json({ error: validacion.razon });
    }

    const reserva = await CheckinCheckout.registrarCheckout(reservaId, req.userId);

    res.json({
      mensaje: 'Check-out registrado. Ahora debes tomar fotos de la habitación antes de irte.',
      reserva,
      fotosRequeridas: 'Debes tomar al menos 1 foto para completar el check-out'
    });
  } catch (error) {
    console.error('Error al registrar check-out:', error);
    res.status(500).json({ error: error.message || 'Error al registrar check-out' });
  }
};

// Agregar foto de check-out
exports.agregarFotoCheckout = async (req, res) => {
  try {
    const { reservaId } = req.body;

    if (!reservaId || !req.file) {
      return res.status(400).json({ error: 'reservaId y foto son requeridos' });
    }

    // Verificar que la reserva pertenece al usuario
    const reserva = await Reservation.obtenerPorId(reservaId);
    if (reserva.huesped_id !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para esta reserva' });
    }

    if (reserva.estado !== 'check-out') {
      return res.status(400).json({ error: 'La reserva no está en estado check-out' });
    }

    // Guardar foto
    const urlFoto = `/uploads/checkin_checkout/${req.file.filename}`;
    const foto = await CheckinCheckout.agregarFotoCheckinCheckout(reservaId, urlFoto, 'checkout');

    // Contar fotos de check-out
    const totalFotosCheckout = await CheckinCheckout.contarFotosCheckout(reservaId);

    res.status(201).json({
      mensaje: 'Foto de check-out guardada',
      foto,
      totalFotosCheckout,
      detalles: 'Puedes completar la reserva cuando termines de tomar fotos'
    });
  } catch (error) {
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    }
    console.error('Error al agregar foto check-out:', error);
    res.status(500).json({ error: 'Error al guardar foto' });
  }
};

// Completar reserva
exports.completarReserva = async (req, res) => {
  try {
    const { reservaId } = req.body;

    if (!reservaId) {
      return res.status(400).json({ error: 'reservaId es requerido' });
    }

    // Verificar que haya fotos de checkout
    const fotosCheckout = await CheckinCheckout.contarFotosCheckout(reservaId);
    if (fotosCheckout === 0) {
      return res.status(400).json({ error: 'Debes tomar al menos una foto de checkout' });
    }

    const reserva = await CheckinCheckout.completarReserva(reservaId, req.userId);
    // notificacion:
    // Obtener detalles de la reserva
    const reservaDetalles = await Reservation.obtenerPorId(reservaId);
    // Enviar notificación
    await Notification.notificacionCheckOutCompletado(req.userId, reservaId, reservaDetalles.propiedad_nombre);
    
    res.json({
      mensaje: 'Reserva completada exitosamente',
      reserva
    });
  } catch (error) {
    console.error('Error al completar reserva:', error);
    res.status(500).json({ error: error.message || 'Error al completar reserva' });
  }
};