const fs = require('fs');
const path = require('path');

// Eliminar una foto
const eliminarFoto = (rutaFoto) => {
  try {
    if (fs.existsSync(rutaFoto)) {
      fs.unlinkSync(rutaFoto);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al eliminar foto:', error);
    return false;
  }
};

// Obtener URL relativa de la foto
const obtenerUrlFoto = (nombreArchivo, tipo = 'propiedad') => {
  if (tipo === 'checkin_checkout') {
    return `/uploads/checkin_checkout/${nombreArchivo}`;
  }
  return `/uploads/propiedades/${nombreArchivo}`;
};

module.exports = { eliminarFoto, obtenerUrlFoto };