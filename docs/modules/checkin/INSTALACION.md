# 🚀 GUÍA DE INSTALACIÓN - MÓDULO CHECK-IN/CHECK-OUT
**Por Ricardo | Octubre 2025**

---

## 📦 ARCHIVOS ENTREGADOS

Tienes 12 archivos listos para usar:

### **Backend (Node.js)**
1. `CheckIn.js` → Modelos de base de datos
2. `QRToken.js` → Modelo de tokens QR
3. `checkin.controller.js` → Controlador principal
4. `checkin.routes.js` → Rutas de la API
5. `qr.service.js` → Servicio de generación/validación QR
6. `photo.service.js` → Servicio de gestión de fotos

### **Frontend (React Native)**
7. `qr-scanner.tsx` → Pantalla de escaneo QR
8. `photo-capture.tsx` → Pantalla de captura de fotos
9. `reservations.tsx` → Lista de reservas con botón check-in
10. `checkin.service.js` → Cliente API para el frontend

### **Database**
11. `001_create_checkin_tables.sql` → Script de migración

### **Docs**
12. `README_CHECKIN_MODULE.md` → Documentación completa

---

## 🏗️ PASO 1: CONFIGURAR EL BACKEND

### 1.1 Crear la estructura en tu proyecto

```bash
cd MyHome

# Crear carpeta del backend (si no existe)
mkdir -p backend/src/{models,controllers,routes,services,config}
```

### 1.2 Copiar archivos del backend

```bash
# Desde donde descargaste los archivos:
cp CheckIn.js backend/src/models/
cp QRToken.js backend/src/models/
cp checkin.controller.js backend/src/controllers/
cp checkin.routes.js backend/src/routes/
cp qr.service.js backend/src/services/
cp photo.service.js backend/src/services/
```

### 1.3 Instalar dependencias

```bash
cd backend
npm install express cors dotenv bcryptjs jsonwebtoken pg multer qrcode uuid
npm install nodemon --save-dev
```

### 1.4 Crear archivo de configuración de base de datos

**Archivo:** `backend/src/config/database.js`

```javascript
// backend/src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'myhome',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
```

### 1.5 Actualizar server.js

Agregar la ruta de check-in en tu `server.js`:

```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ... otras rutas ...

// 🔥 TU MÓDULO
app.use('/api/checkin', require('./src/routes/checkin.routes'));

// Servir archivos estáticos (fotos)
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### 1.6 Crear directorio de uploads

```bash
mkdir -p backend/uploads/checkin-photos
```

---

## 💾 PASO 2: CONFIGURAR LA BASE DE DATOS

### 2.1 Ejecutar migración

```bash
# Asegúrate de tener PostgreSQL corriendo
psql -U postgres -d myhome -f database/migrations/001_create_checkin_tables.sql
```

Si no tienes la base de datos `myhome`:

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE myhome;
\q

# Ahora ejecutar migración
psql -U postgres -d myhome -f 001_create_checkin_tables.sql
```

### 2.2 Verificar tablas creadas

```bash
psql -U postgres -d myhome
\dt
# Deberías ver: qr_tokens, checkin_events, checkout_events, photos
\q
```

---

## 📱 PASO 3: CONFIGURAR EL FRONTEND

### 3.1 Estructura de carpetas

```bash
cd MyHome  # (tu proyecto React Native)

# Crear carpetas necesarias
mkdir -p app/checkin
mkdir -p services
```

### 3.2 Copiar archivos del frontend

```bash
# Copiar pantallas
cp qr-scanner.tsx app/checkin/
cp photo-capture.tsx app/checkin/
cp reservations.tsx app/\(tabs\)/

# Copiar servicio
cp checkin.service.js services/
```

### 3.3 Instalar dependencias

```bash
npx expo install expo-camera expo-image-picker @react-native-async-storage/async-storage axios
```

### 3.4 Configurar permisos (app.json)

Agregar en tu `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Permitir a MyHome usar la cámara para escanear QR y tomar fotos."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Permitir a MyHome acceder a tus fotos."
        }
      ]
    ]
  }
}
```

### 3.5 Crear archivo .env (opcional)

**Archivo:** `.env`

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

⚠️ **Importante:** Cambia `192.168.1.100` por la IP de tu computadora (usar `ipconfig` en Windows o `ifconfig` en Mac/Linux).

---

## 🔗 PASO 4: CONECTAR CON OTROS MÓDULOS

### 4.1 Middleware de Autenticación (Kevin)

**Archivo necesario:** `backend/src/middleware/auth.middleware.js`

```javascript
// Este archivo debe estar hecho por Kevin
const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }
};
```

### 4.2 Integración con Reservas (Ale)

Tu módulo necesita que Ale tenga una función para generar QR cuando se confirme una reserva:

```javascript
// Ejemplo de cómo Ale debería llamar tu servicio
const QRService = require('../services/qr.service');

// Cuando se confirme una reserva:
async function confirmReservation(reservationId, userId) {
  // ... lógica de confirmación ...
  
  // Generar QR para check-in
  const qrResult = await QRService.generateCheckInQR(reservationId, userId);
  
  // Guardar QR o enviarlo al usuario
  return qrResult;
}
```

---

## ✅ PASO 5: PROBAR EL MÓDULO

### 5.1 Iniciar el backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Server running on port 3000
✅ Database connected
```

### 5.2 Iniciar la app móvil

```bash
cd MyHome
npx expo start
```

Presiona `a` para Android o `i` para iOS.

### 5.3 Flujo de prueba completo

1. **Registrarse/Iniciar sesión** (módulo de Kevin)
2. **Ir a "Mis Reservas"** (tu pantalla `reservations.tsx`)
3. **Hacer clic en "Hacer Check-in"** en una reserva confirmada
4. **Escanear QR** (genera uno de prueba si es necesario)
5. **Tomar fotos** (mínimo 2)
6. **Completar check-in**

---

## 🧪 PASO 6: GENERAR QR DE PRUEBA

Si todavía no tienen la funcionalidad completa de reservas, puedes generar un QR de prueba:

### 6.1 Endpoint temporal de prueba

**Agregar en `backend/server.js`:**

```javascript
// SOLO PARA PRUEBAS - ELIMINAR EN PRODUCCIÓN
app.post('/api/test/generate-qr', async (req, res) => {
  const QRService = require('./src/services/qr.service');
  
  const result = await QRService.generateCheckInQR(
    'test-reservation-123', // ID de prueba
    'test-user-456'         // ID de usuario de prueba
  );
  
  res.json(result);
});
```

### 6.2 Llamar al endpoint

```bash
curl -X POST http://localhost:3000/api/test/generate-qr
```

Te devolverá un QR en base64 que puedes mostrar en tu app.

---

## 📊 PASO 7: VERIFICAR QUE TODO FUNCIONA

### Checklist Backend:
- [ ] Servidor corriendo en puerto 3000
- [ ] Base de datos conectada
- [ ] Endpoint `/api/checkin/validate-qr` responde
- [ ] Endpoint `/api/checkin` responde
- [ ] Endpoint `/api/checkin/photos` responde

### Checklist Frontend:
- [ ] App compila sin errores
- [ ] Cámara abre correctamente
- [ ] Escaneo de QR funciona
- [ ] Captura de fotos funciona
- [ ] Upload de fotos funciona

### Test en Postman:

**1. Validar QR:**
```
POST http://localhost:3000/api/checkin/validate-qr
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "qrData": "{\"id\":\"...\",\"hash\":\"...\"}"
}
```

**2. Subir Fotos:**
```
POST http://localhost:3000/api/checkin/photos
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (form-data):
  reservationId: uuid
  eventType: check-in
  photos: [archivos]
```

---

## 🐛 TROUBLESHOOTING COMÚN

### Error: "Cannot find module 'pg'"
```bash
cd backend
npm install pg
```

### Error: "Camera permission denied"
- Android: Ir a Configuración → Apps → MyHome → Permisos → Permitir Cámara
- iOS: Reinstalar la app con `npx expo run:ios`

### Error: "Network request failed"
- Verificar que el backend esté corriendo
- Verificar la IP en el `.env` (debe ser la IP local, no localhost)
- Desactivar firewall temporalmente

### Error: "QR invalid signature"
- Verificar que `JWT_SECRET` sea el mismo en `.env` del backend

---

## 📞 CONTACTO Y SOPORTE

Si tienes dudas o errores:

1. **Revisa el README:** `README_CHECKIN_MODULE.md`
2. **Revisa los comentarios en el código**
3. **Prueba con Postman** primero antes del móvil
4. **Contacta a tu equipo:**
   - Kevin: Autenticación JWT
   - Ale: Integración con reservas
   - Zamora: Estados de propiedades

---

## 🎉 ¡LISTO!

Tu módulo de Check-in/Check-out está completo y listo para integrarse.

**Siguiente paso:** Coordinar con Ale para que al confirmar una reserva se genere automáticamente el QR.

---

**Desarrollado por Ricardo**  
**Proyecto MyHome - Sprint 3**  
**Octubre 2025**
