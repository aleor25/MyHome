const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const pool = require('./config/database');
const { runMigrations } = require('./migrations/runMigrations');
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const checkinCheckoutRoutes = require('./routes/checkinCheckoutRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const zipCodeRoutes = require('./routes/zipCodeRoutes');
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));
app.use(express.json());

// Middleware de logging global para TODAS las peticiones
app.use((req, res, next) => {
  console.log('\n' + '='.repeat(50));
  console.log(`[SERVER] ${new Date().toISOString()}`);
  console.log(`[SERVER] ${req.method} ${req.path}`);
  console.log(`[SERVER] Headers:`, {
    'content-type': req.get('content-type'),
    'authorization': req.get('authorization') ? 'Bearer ...' : 'NO AUTH'
  });
  console.log(`[SERVER] Body:`, req.body);
  console.log('='.repeat(50) + '\n');
  next();
});

// Servir archivos estáticos (fotos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de propiedades
app.use('/api/propiedades', propertyRoutes);

// Rutas de reservas
app.use('/api/reservas', reservationRoutes);

// Rutas de check-in/check-out
app.use('/api/checkin-checkout', checkinCheckoutRoutes);

// Rutas de notificaciones
app.use('/api/notificaciones', notificationRoutes);

// Rutas de estadísticas
app.use('/api/estadisticas', statisticsRoutes);

// Rutas de pagos
app.use('/api/pagos', paymentRoutes);

// Rutas de reseñas
app.use('/api/resenas', reviewRoutes);

// Rutas de favoritos
app.use('/api/favoritos', favoriteRoutes);

// Rutas de códigos postales
app.use('/api/zip-code', zipCodeRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ mensaje: 'Backend funcionando correctamente' });
});

// Ruta para probar conexión a BD
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      mensaje: 'Conexión a base de datos exitosa',
      timestamp: result.rows[0]
    });
  } catch (error) {
    console.error('Error al conectar a la BD:', error);
    res.status(500).json({ 
      error: 'Error al conectar a la base de datos',
      detalles: error.message 
    });
  }
});

// Ruta para verificar las tablas
app.get('/api/tables-test', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json({ 
      mensaje: 'Tablas en la base de datos:',
      tablas: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Puerto
const PORT = process.env.PORT || 5000;

// Iniciar servidor y ejecutar migraciones
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);

  // Ejecutar migraciones al iniciar
  console.log('\n🚀 Ejecutando migraciones de base de datos...');
  const migrationSuccess = await runMigrations();

  if (migrationSuccess) {
    console.log('\n✅ Sistema listo para usar!\n');
  } else {
    console.log('\n⚠️  Advertencia: Algunas migraciones fallaron, pero el servidor continúa.\n');
  }
});