const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const autenticar = require('../middleware/auth');

// Toggle favorito (agregar o eliminar)
router.post('/toggle', autenticar, favoriteController.toggleFavorito);

// Obtener mis favoritos
router.get('/mis-favoritos', autenticar, favoriteController.obtenerMisFavoritos);

// Verificar si una propiedad es favorita
router.get('/verificar/:propiedadId', autenticar, favoriteController.verificarFavorito);

module.exports = router;
