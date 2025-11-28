const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const autenticar = require('../middleware/auth');

// Rutas protegidas (requieren autenticación)
router.post('/crear', autenticar, reservationController.crearReserva);
router.get('/mis-reservas', autenticar, reservationController.obtenerMisReservas);
router.get('/reservas-propiedades', autenticar, reservationController.obtenerReservasPropiedades);
router.get('/historial-clientes', autenticar, reservationController.obtenerHistorialClientes);
router.get('/:id', autenticar, reservationController.obtenerReserva);
router.post('/:id/cancelar', autenticar, reservationController.cancelarReserva);
router.post('/checkin', autenticar, reservationController.procesarCheckin);
router.post('/checkout', autenticar, reservationController.procesarCheckout);
router.get('/:id/fotos', autenticar, reservationController.obtenerFotosReserva);

module.exports = router;