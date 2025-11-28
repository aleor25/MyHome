const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const autenticar = require('../middleware/auth');
const upload = require('../config/multerConfig');

// Rutas públicas (búsqueda)
router.get('/zonas', propertyController.obtenerZonas);
router.get('/buscar', propertyController.buscarPropiedades);
router.get('/detalle/:id', propertyController.obtenerPropiedad);

// Rutas protegidas (solo para propietarios)
router.post('/crear', autenticar, propertyController.crearPropiedad);
router.get('/mis-propiedades', autenticar, propertyController.obtenerMisPropiedades);
router.put('/actualizar/:id', autenticar, propertyController.actualizarPropiedad);
router.delete('/eliminar/:id', autenticar, propertyController.eliminarPropiedad);

// Ruta para subir foto (con multer)
router.post('/:id/agregar-foto', autenticar, upload.single('foto'), propertyController.agregarFoto);

// Ruta para eliminar foto
router.delete('/foto/:fotoId', autenticar, propertyController.eliminarFoto);

//limpiar foto
router.put('/:id/limpiar-foto', propertyController.limpiarFoto);

// Obtener fechas ocupadas de una propiedad
router.get('/:id/fechas-ocupadas', propertyController.obtenerFechasOcupadas);


module.exports = router;