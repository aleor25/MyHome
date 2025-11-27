const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    // 1. Verificar si el token fue proporcionado
    if (!token) {
      console.log(`[AUTH FAIL] Token no proporcionado para la ruta: ${req.path}`); // <-- Log añadido
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // 2. Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Si la verificación es exitosa:
    req.userId = decoded.id;
    req.userTipo = decoded.tipo_usuario;
    
    console.log(`[AUTH SUCCESS] User ID: ${req.userId} autenticado para la ruta: ${req.path}`); // <-- Log añadido
    next();
  } catch (error) {
    // 3. Capturar errores de JWT (inválido, expirado, etc.)
    console.log(`[AUTH FAIL] Token inválido/expirado para la ruta: ${req.path}. Error: ${error.message}`); // <-- Log añadido
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = autenticar;