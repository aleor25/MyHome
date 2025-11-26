# Módulo Check-in / Check-out

**Desarrollado por:** Ricardo  
**Versión:** 1.0.0  
**Fecha:** Octubre 2025  
**Sprint:** 3

---

## 📋 Descripción

Módulo completo para gestionar el proceso de check-in y check-out digital mediante códigos QR y captura de fotos del estado de las habitaciones.

### Características principales:

✅ Escaneo de códigos QR para check-in/check-out  
✅ Validación de QR con seguridad (hash SHA-256)  
✅ Captura de fotos del estado de la habitación (mín. 2, máx. 5)  
✅ Upload de fotos con validación de tamaño y tipo  
✅ Modo offline con sincronización automática  
✅ Integración con pasarela de pagos (captura automática)  
✅ Notificaciones push en eventos clave  

---

## 🏗️ Arquitectura

### Backend (Node.js)
```
backend/src/
├── models/
│   ├── CheckIn.js          # Modelos de check-in, check-out y fotos
│   └── QRToken.js          # Modelo de tokens QR
├── services/
│   ├── qr.service.js       # Generación y validación de QR
│   └── photo.service.js    # Gestión de fotos
├── controllers/
│   └── checkin.controller.js  # Lógica de negocio
└── routes/
    └── checkin.routes.js   # Endpoints API
```

### Frontend (React Native)
```
mobile/
├── services/
│   └── checkin.service.js     # API client
└── app/
    ├── (tabs)/
    │   └── reservations.tsx   # Lista de reservas
    └── checkin/
        ├── qr-scanner.tsx     # Escaneo QR
        └── photo-capture.tsx  # Captura de fotos
```

---

## 🔌 API Endpoints

### Base URL: `/api/checkin`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/validate-qr` | Validar código QR | ✅ |
| POST | `/` | Realizar check-in | ✅ |
| POST | `/photos` | Subir fotos | ✅ |
| GET | `/:reservationId/photos` | Obtener fotos | ✅ |
| POST | `/checkout` | Realizar check-out | ✅ |
| GET | `/:reservationId/status` | Estado check-in/out | ✅ |

---

## 📡 Ejemplos de Uso

### 1. Validar QR

**Request:**
```javascript
POST /api/checkin/validate-qr
Authorization: Bearer {token}
Content-Type: application/json

{
  "qrData": "{\"id\":\"...\",\"reservationId\":\"...\",\"hash\":\"...\"}"
}
```

**Response:**
```json
{
  "success": true,
  "message": "QR is valid",
  "data": {
    "tokenId": "uuid",
    "reservationId": "uuid",
    "type": "check-in",
    "userId": "uuid"
  }
}
```

### 2. Realizar Check-in

**Request:**
```javascript
POST /api/checkin
Authorization: Bearer {token}

{
  "reservationId": "uuid",
  "qrData": "{...}"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in completed successfully",
  "data": {
    "checkInId": "uuid",
    "reservationId": "uuid",
    "checkedInAt": "2025-10-26T14:00:00Z",
    "nextStep": "Upload photos of the room"
  }
}
```

### 3. Subir Fotos

**Request:**
```javascript
POST /api/checkin/photos
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  - reservationId: uuid
  - eventType: "check-in"
  - photos[]: File
  - photos[]: File
```

**Response:**
```json
{
  "success": true,
  "message": "Photos uploaded successfully",
  "data": {
    "count": 2,
    "photos": [
      {
        "photoId": "uuid",
        "url": "/uploads/checkin-photos/...",
        "size": 1234567
      }
    ]
  }
}
```

---

## 💾 Modelo de Datos

### Tabla: `qr_tokens`
```sql
id              UUID PRIMARY KEY
reservation_id  UUID NOT NULL
token_hash      VARCHAR(255) UNIQUE
type            VARCHAR(20) -- 'check-in' | 'check-out'
issued_at       TIMESTAMP
expires_at      TIMESTAMP
used_at         TIMESTAMP
is_used         BOOLEAN
```

### Tabla: `checkin_events`
```sql
id                UUID PRIMARY KEY
reservation_id    UUID NOT NULL UNIQUE
user_id           UUID NOT NULL
qr_token_id       UUID
checked_in_at     TIMESTAMP
payment_captured  BOOLEAN
payment_id        VARCHAR(255)
door_opened       BOOLEAN
```

### Tabla: `checkout_events`
```sql
id                UUID PRIMARY KEY
reservation_id    UUID NOT NULL UNIQUE
user_id           UUID NOT NULL
checkin_event_id  UUID
checked_out_at    TIMESTAMP
```

### Tabla: `photos`
```sql
id              UUID PRIMARY KEY
reservation_id  UUID NOT NULL
event_type      VARCHAR(20) -- 'check-in' | 'check-out'
storage_path    VARCHAR(500)
file_size       INTEGER
uploaded_at     TIMESTAMP
expires_at      TIMESTAMP
metadata        JSONB
```

---

## 🔐 Seguridad

### Generación de QR
- Hash SHA-256 con secret del servidor
- TTL de 48 horas para check-in, 24h para check-out
- Un solo uso por token
- Validación de firma en cada escaneo

### Fotos
- Límite de tamaño: 5MB por foto
- Formatos permitidos: JPEG, PNG
- Eliminación de metadatos EXIF/GPS
- Retención de 90 días
- URLs firmadas temporales

### Autenticación
- JWT Bearer token requerido en todos los endpoints
- Validación de pertenencia (usuario = dueño de reserva)

---

## 🚀 Instalación y Configuración

### Backend

1. **Instalar dependencias:**
```bash
cd backend
npm install express cors dotenv bcryptjs jsonwebtoken pg multer qrcode uuid
```

2. **Configurar variables de entorno (.env):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myhome
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

3. **Ejecutar migraciones:**
```bash
psql -U postgres -d myhome -f database/migrations/001_create_checkin_tables.sql
```

4. **Iniciar servidor:**
```bash
npm run dev
```

### Frontend (React Native)

1. **Instalar dependencias:**
```bash
cd mobile
npm install expo-camera expo-image-picker @react-native-async-storage/async-storage axios
```

2. **Configurar API URL (.env):**
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

3. **Iniciar app:**
```bash
npx expo start
```

---

## 🧪 Testing

### Backend - Ejemplo con curl

**Validar QR:**
```bash
curl -X POST http://localhost:3000/api/checkin/validate-qr \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrData":"{\"id\":\"...\",\"hash\":\"...\"}"}'
```

**Check-in:**
```bash
curl -X POST http://localhost:3000/api/checkin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reservationId":"uuid","qrData":"{...}"}'
```

### Frontend - Flujo de prueba

1. Iniciar sesión como cliente
2. Ir a "Mis Reservas"
3. Seleccionar reserva confirmada
4. Hacer clic en "Hacer Check-in"
5. Escanear QR de prueba
6. Tomar mínimo 2 fotos
7. Completar check-in

---

## 🐛 Troubleshooting

### Problema: "QR invalid signature"
- Verificar que el JWT_SECRET sea el mismo en backend y generación de QR
- Revisar que el payload del QR no haya sido modificado

### Problema: "Minimum 2 photos required"
- Asegurarse de capturar al menos 2 fotos antes de continuar
- Verificar permisos de cámara en el dispositivo

### Problema: "Failed to upload photos"
- Revisar tamaño de archivos (máx. 5MB cada una)
- Verificar formato (solo JPEG/PNG)
- Revisar configuración de multer en el backend

---

## 📝 TODO / Mejoras Futuras

- [ ] Comparación automática de fotos (antes/después) con ML
- [ ] Soporte para videos cortos (15 seg)
- [ ] Generación de reportes PDF con fotos
- [ ] Notificación al propietario cuando se complete check-out
- [ ] Dashboard de métricas (tiempo promedio de check-in, etc.)
- [ ] Integración completa con IoT Gateway
- [ ] Tests unitarios y de integración

---

## 👥 Integración con Otros Módulos

### Dependencias:
- **Kevin (Auth):** Middleware de autenticación JWT
- **Ale (Reservations):** Estado de reservas, fechas de check-in/out
- **Isaí (API Core):** Configuración base del servidor Express

### Provee a:
- **Zamora (Properties):** Estado de ocupación en tiempo real
- **Isaí (Reviews):** Trigger para solicitar reseña post check-out

---

## 📞 Contacto

**Desarrollador:** Ricardo  
**Módulo:** Check-in / Check-out  
**Equipo:** MyHome - Grupo 10B IDGS  

---

## 📄 Licencia

Proyecto académico - Desarrollo Web Integral  
Universidad Tecnológica de Veracruz  
Octubre 2025
