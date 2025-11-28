const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const autenticar = require('../middleware/auth');

// Obtener notificaciones
router.get('/', autenticar, notificationController.obtenerNotificaciones);

// Obtener cantidad de no leídas
router.get('/no-leidas/cantidad', autenticar, notificationController.obtenerNoLeidas);

// Marcar como leída
router.put('/:id/leida', autenticar, notificationController.marcarComoLeida);

// Marcar todas como leídas
router.put('/todas/leidas', autenticar, notificationController.marcarTodasComoLeidas);

// Eliminar notificación
router.delete('/:id', autenticar, notificationController.eliminarNotificacion);

module.exports = router;