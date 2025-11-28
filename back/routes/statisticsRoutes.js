const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const autenticar = require('../middleware/auth');

// Dashboard principal
router.get('/dashboard', autenticar, statisticsController.obtenerDashboard);

// Ingresos
router.get('/ingresos', autenticar, statisticsController.obtenerIngresos);
router.get('/ingresos-por-propiedad', autenticar, statisticsController.obtenerIngresosPorPropiedad);
router.get('/ingresos-por-mes', autenticar, statisticsController.obtenerIngresosPorMes);

// Ocupación
router.get('/ocupacion', autenticar, statisticsController.obtenerOcupacion);

// Tendencias
router.get('/tendencias', autenticar, statisticsController.obtenerTendencias);

// Clientes
router.get('/clientes-recurrentes', autenticar, statisticsController.obtenerClientesRecurrentes);

// Reporte completo
router.get('/reporte', autenticar, statisticsController.obtenerReporte);

module.exports = router;