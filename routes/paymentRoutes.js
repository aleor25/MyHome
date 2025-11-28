const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const autenticar = require('../middleware/auth');

// Rutas protegidas (requieren autenticación)
router.post('/procesar', autenticar, paymentController.procesarPago);
router.get('/reserva/:reservaId', autenticar, paymentController.obtenerPagoPorReserva);
router.get('/mis-pagos', autenticar, paymentController.obtenerMisPagos);

module.exports = router;
