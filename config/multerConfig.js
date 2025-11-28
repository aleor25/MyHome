const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar dónde se guardan las fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usar ruta absoluta basada en el directorio del proyecto
    const baseDir = path.join(__dirname, '..');
    let carpeta = path.join(baseDir, 'uploads', 'propiedades'); // Por defecto propiedades

    // Verificar la URL para determinar si es checkin/checkout
    if (req.originalUrl.includes('checkin-checkout')) {
      carpeta = path.join(baseDir, 'uploads', 'checkin_checkout');
    }

    // Crear carpeta si no existe
    if (!fs.existsSync(carpeta)) {
      fs.mkdirSync(carpeta, { recursive: true });
    }

    cb(null, carpeta);
  },
  filename: (req, file, cb) => {
    // Nombre único para cada archivo
    const nombreUnico = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, nombreUnico);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!extensionesPermitidas.includes(ext)) {
    return cb(new Error('Solo se aceptan imágenes (jpg, jpeg, png, gif)'));
  }
  
  // Máximo 5MB
  if (file.size > 5 * 1024 * 1024) {
    return cb(new Error('El archivo no debe superar 5MB'));
  }
  
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;