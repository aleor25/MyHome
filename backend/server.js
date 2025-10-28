// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (fotos)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MyHome API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
// TODO: Agregar rutas de otros módulos cuando estén listas
// app.use('/api/auth', require('./src/routes/auth.routes'));
// app.use('/api/properties', require('./src/routes/properties.routes'));
// app.use('/api/reservations', require('./src/routes/reservations.routes'));

// Check-in module (Ricardo)
app.use('/api/checkin', require('./src/routes/checkin.routes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MyHome API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});