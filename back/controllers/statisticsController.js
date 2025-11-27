const Statistics = require('../models/statistics');

// Dashboard principal
exports.obtenerDashboard = async (req, res) => {
  try {
    const [ingresos, ingresosMes, ocupacion, cancelaciones, popular, tendencias] = await Promise.all([
      Statistics.obtenerIngresosTotales(req.userId),
      Statistics.obtenerIngresosDelMes(req.userId),
      Statistics.obtenerTasaOcupacion(req.userId),
      Statistics.obtenerCancelaciones(req.userId),
      Statistics.obtenerPropiedadMasPopular(req.userId),
      Statistics.obtenerTendencias(req.userId)
    ]);

    res.json({
      ingresos,
      ingresosMes,
      ocupacion,
      cancelaciones,
      propiedadPopular: popular,
      tendencias
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

// Obtener ingresos totales
exports.obtenerIngresos = async (req, res) => {
  try {
    const ingresos = await Statistics.obtenerIngresosTotales(req.userId);
    res.json(ingresos);
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
};

// Obtener tasa de ocupación
exports.obtenerOcupacion = async (req, res) => {
  try {
    const ocupacion = await Statistics.obtenerTasaOcupacion(req.userId);
    res.json(ocupacion);
  } catch (error) {
    console.error('Error al obtener ocupación:', error);
    res.status(500).json({ error: 'Error al obtener ocupación' });
  }
};

// Obtener clientes recurrentes
exports.obtenerClientesRecurrentes = async (req, res) => {
  try {
    const { limite } = req.query;
    const clientes = await Statistics.obtenerClientesRecurrentes(req.userId, limite || 10);
    
    res.json({
      total: clientes.length,
      clientes
    });
  } catch (error) {
    console.error('Error al obtener clientes recurrentes:', error);
    res.status(500).json({ error: 'Error al obtener clientes recurrentes' });
  }
};

// Obtener ingresos por propiedad
exports.obtenerIngresosPorPropiedad = async (req, res) => {
  try {
    const ingresos = await Statistics.obtenerIngresosPorPropiedad(req.userId);
    
    res.json({
      total: ingresos.length,
      ingresos
    });
  } catch (error) {
    console.error('Error al obtener ingresos por propiedad:', error);
    res.status(500).json({ error: 'Error al obtener ingresos por propiedad' });
  }
};

// Obtener ingresos por mes
exports.obtenerIngresosPorMes = async (req, res) => {
  try {
    const ingresos = await Statistics.obtenerIngresosPorMes(req.userId);
    
    res.json({
      total: ingresos.length,
      ingresos
    });
  } catch (error) {
    console.error('Error al obtener ingresos por mes:', error);
    res.status(500).json({ error: 'Error al obtener ingresos por mes' });
  }
};

// Obtener tendencias
exports.obtenerTendencias = async (req, res) => {
  try {
    const tendencias = await Statistics.obtenerTendencias(req.userId);
    res.json(tendencias);
  } catch (error) {
    console.error('Error al obtener tendencias:', error);
    res.status(500).json({ error: 'Error al obtener tendencias' });
  }
};

// Obtener reporte completo
exports.obtenerReporte = async (req, res) => {
  try {
    const [
      ingresos,
      ingresosMes,
      ocupacion,
      cancelaciones,
      popular,
      clientesRecurrentes,
      ingresosPorPropiedad,
      ingresosPorMes,
      tendencias
    ] = await Promise.all([
      Statistics.obtenerIngresosTotales(req.userId),
      Statistics.obtenerIngresosDelMes(req.userId),
      Statistics.obtenerTasaOcupacion(req.userId),
      Statistics.obtenerCancelaciones(req.userId),
      Statistics.obtenerPropiedadMasPopular(req.userId),
      Statistics.obtenerClientesRecurrentes(req.userId, 5),
      Statistics.obtenerIngresosPorPropiedad(req.userId),
      Statistics.obtenerIngresosPorMes(req.userId),
      Statistics.obtenerTendencias(req.userId)
    ]);

    res.json({
      resumen: {
        ingresos,
        ingresosMes,
        ocupacion,
        cancelaciones
      },
      analisis: {
        propiedadPopular: popular,
        tendencias
      },
      detalles: {
        clientesRecurrentes,
        ingresosPorPropiedad,
        ingresosPorMes
      }
    });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
};