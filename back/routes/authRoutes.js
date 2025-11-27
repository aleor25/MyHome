const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const autenticar = require('../middleware/auth');

// Rutas públicas
router.post('/registro', authController.registro);
router.post('/login', authController.login);

// Rutas protegidas
router.get('/perfil', autenticar, authController.obtenerPerfil);
router.put('/perfil', autenticar, authController.actualizarPerfil);
router.put('/cambiar-contrasena', autenticar, authController.cambiarContrasena);

module.exports = router;