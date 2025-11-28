const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const autenticar = require('../middleware/auth');

// Crear reseña
router.post('/crear', autenticar, reviewController.crearResena);

// Obtener reseñas de una propiedad
router.get('/propiedad/:propiedadId', reviewController.obtenerResenasPorPropiedad);

// Obtener mis reseñas (dejadas por el usuario)
router.get('/mis-resenas', autenticar, reviewController.obtenerMisResenas);

// Obtener reseñas recibidas (para propietarios)
router.get('/recibidas', autenticar, reviewController.obtenerResenasRecibidas);

// Obtener reservas pendientes de reseña
router.get('/pendientes', autenticar, reviewController.obtenerReservasPendientesResena);

// Verificar si puede dejar reseña
router.get('/verificar/:reservaId', autenticar, reviewController.verificarPuedeDejarResena);

module.exports = router;
