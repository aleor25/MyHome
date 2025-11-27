const Favorite = require('../models/favorite');

// Toggle favorito
exports.toggleFavorito = async (req, res) => {
  try {
    const { propiedadId } = req.body;

    if (!propiedadId) {
      return res.status(400).json({ error: 'propiedadId es requerido' });
    }

    const result = await Favorite.toggle(req.userId, propiedadId);

    res.json(result);
  } catch (error) {
    console.error('Error al toggle favorito:', error);
    if (error.code === '23503') {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }
    res.status(500).json({ error: 'Error al procesar favorito' });
  }
};

// Obtener mis favoritos
exports.obtenerMisFavoritos = async (req, res) => {
  try {
    const favoritos = await Favorite.obtenerMisFavoritos(req.userId);

    res.json({
      total: favoritos.length,
      favoritos
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

// Verificar si es favorito
exports.verificarFavorito = async (req, res) => {
  try {
    const { propiedadId } = req.params;

    const esFavorito = await Favorite.esFavorito(req.userId, parseInt(propiedadId));

    res.json({ esFavorito });
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    res.status(500).json({ error: 'Error al verificar favorito' });
  }
};
