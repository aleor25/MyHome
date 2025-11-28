const express = require('express');
const router = express.Router();
const checkinCheckoutController = require('../controllers/checkinCheckoutController');
const autenticar = require('../middleware/auth');
const upload = require('../config/multerConfig');

// Verificar disponibilidad
router.post('/verificar-checkin', autenticar, checkinCheckoutController.verificarCheckin);
router.post('/verificar-checkout', autenticar, checkinCheckoutController.verificarCheckout);

// Check-in
router.post('/checkin', autenticar, checkinCheckoutController.registrarCheckin);
router.post('/checkin/foto', autenticar, upload.single('foto'), checkinCheckoutController.agregarFotoCheckin);

// Check-out
router.post('/checkout', autenticar, checkinCheckoutController.registrarCheckout);
router.post('/checkout/foto', autenticar, upload.single('foto'), checkinCheckoutController.agregarFotoCheckout);

// Completar reserva
router.post('/completar', autenticar, checkinCheckoutController.completarReserva);

// Obtener fotos
router.get('/fotos/:reservaId', autenticar, checkinCheckoutController.obtenerFotos);

module.exports = router;