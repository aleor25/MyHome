const Review = require('../models/review');

// Crear una reseña
exports.crearResena = async (req, res) => {
  try {
    const {
      reservaId,
      propiedadId,
      propietarioId,
      calificacion,
      comentario,
      limpieza,
      ubicacion,
      comunicacion,
      relacionCalidadPrecio
    } = req.body;

    // Validaciones
    if (!reservaId || !propiedadId || !propietarioId || !calificacion) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }

    // Verificar si puede dejar reseña
    const verificacion = await Review.puedeDejarResena(reservaId, req.userId);
    if (!verificacion.puede) {
      return res.status(400).json({ error: verificacion.motivo });
    }

    // Crear reseña
    const resena = await Review.crearResena(
      reservaId,
      propiedadId,
      req.userId,
      propietarioId,
      calificacion,
      comentario,
      {
        limpieza,
        ubicacion,
        comunicacion,
        relacionCalidadPrecio
      }
    );

    res.status(201).json({
      mensaje: 'Reseña creada exitosamente',
      resena
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe una reseña para esta reserva' });
    }
    res.status(500).json({ error: 'Error al crear reseña' });
  }
};

// Obtener reseñas de una propiedad
exports.obtenerResenasPorPropiedad = async (req, res) => {
  try {
    const { propiedadId } = req.params;

    const resenas = await Review.obtenerResenasPorPropiedad(propiedadId);
    const promedio = await Review.obtenerPromedioCalificacion(propiedadId);

    res.json({
      resenas,
      promedio
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

// Obtener reseñas dejadas por el usuario
exports.obtenerMisResenas = async (req, res) => {
  try {
    const resenas = await Review.obtenerResenasPorHuesped(req.userId);

    res.json({
      total: resenas.length,
      resenas
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

// Obtener reseñas recibidas (para propietarios)
exports.obtenerResenasRecibidas = async (req, res) => {
  try {
    const resenas = await Review.obtenerResenasRecibidas(req.userId);

    res.json({
      total: resenas.length,
      resenas
    });
  } catch (error) {
    console.error('Error al obtener reseñas recibidas:', error);
    res.status(500).json({ error: 'Error al obtener reseñas recibidas' });
  }
};

// Obtener reservas pendientes de reseña
exports.obtenerReservasPendientesResena = async (req, res) => {
  try {
    const reservas = await Review.obtenerReservasSinResena(req.userId);

    res.json({
      total: reservas.length,
      reservas
    });
  } catch (error) {
    console.error('Error al obtener reservas pendientes:', error);
    res.status(500).json({ error: 'Error al obtener reservas pendientes' });
  }
};

// Verificar si puede dejar reseña
exports.verificarPuedeDejarResena = async (req, res) => {
  try {
    const { reservaId } = req.params;

    const verificacion = await Review.puedeDejarResena(reservaId, req.userId);

    res.json(verificacion);
  } catch (error) {
    console.error('Error al verificar reseña:', error);
    res.status(500).json({ error: 'Error al verificar reseña' });
  }
};
