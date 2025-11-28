const Notification = require('../models/notification');

// Obtener notificaciones del usuario
exports.obtenerNotificaciones = async (req, res) => {
  try {
    const { limite } = req.query;
    const notificaciones = await Notification.obtenerNotificacionesUsuario(req.userId, limite || 50);

    res.json({
      total: notificaciones.length,
      notificaciones
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

// Obtener cantidad de notificaciones no leídas
exports.obtenerNoLeidas = async (req, res) => {
  try {
    const noLeidas = await Notification.obtenerNotificacionesNoLeidas(req.userId);

    res.json({
      noLeidas
    });
  } catch (error) {
    console.error('Error al obtener no leídas:', error);
    res.status(500).json({ error: 'Error al obtener no leídas' });
  }
};

// Marcar notificación como leída
exports.marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await Notification.marcarComoLeida(id, req.userId);

    if (!notificacion) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json({
      mensaje: 'Notificación marcada como leída',
      notificacion
    });
  } catch (error) {
    console.error('Error al marcar como leída:', error);
    res.status(500).json({ error: 'Error al marcar como leída' });
  }
};

// Marcar todas las notificaciones como leídas
exports.marcarTodasComoLeidas = async (req, res) => {
  try {
    const resultado = await Notification.marcarTodasComoLeidas(req.userId);

    res.json({
      mensaje: 'Todas las notificaciones marcadas como leídas',
      resultado
    });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    res.status(500).json({ error: 'Error al marcar todas como leídas' });
  }
};

// Eliminar notificación
exports.eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await Notification.eliminarNotificacion(id, req.userId);

    if (!resultado) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json({ mensaje: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
};

// Limpiar notificaciones antiguas (opcional - para mantenimiento)
exports.limpiarNotificacionesAntiguas = async (req, res) => {
  try {
    // Eliminar notificaciones leídas de más de 30 días
    const resultado = await Notification.eliminarNotificacionesAntiguas(req.userId);

    res.json({
      mensaje: 'Notificaciones antiguas limpiadas',
      eliminadas: resultado
    });
  } catch (error) {
    console.error('Error al limpiar notificaciones:', error);
    res.status(500).json({ error: 'Error al limpiar notificaciones' });
  }
};