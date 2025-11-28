-- Crear tabla de usuarios (propietarios y huéspedes)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(15),
  tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('propietario', 'huesped')),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  es_activo BOOLEAN DEFAULT true
);

-- Crear tabla de propiedades
CREATE TABLE IF NOT EXISTS propiedades (
  id SERIAL PRIMARY KEY,
  propietario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  zona VARCHAR(100) NOT NULL,
  precio_noche DECIMAL(10, 2) NOT NULL,
  cantidad_habitaciones INTEGER NOT NULL,
  cantidad_huespedes INTEGER NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  pais VARCHAR(100) NOT NULL,
  foto_exterior VARCHAR(500),
  foto_interior VARCHAR(500),
  disponible BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de fotos de propiedades
CREATE TABLE IF NOT EXISTS fotos_propiedad (
  id SERIAL PRIMARY KEY,
  propiedad_id INTEGER NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  url_foto VARCHAR(500) NOT NULL,
  tipo_foto VARCHAR(50) CHECK (tipo_foto IN ('exterior', 'interior', 'otro')),
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  propiedad_id INTEGER NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  huesped_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_checkin DATE NOT NULL,
  fecha_checkout DATE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'check-in', 'activa', 'check-out', 'completada', 'cancelada')),
  precio_total DECIMAL(10, 2) NOT NULL,
  penalizacion DECIMAL(10, 2) DEFAULT 0,
  numero_tarjeta_ultimos_4 VARCHAR(4),
  qr_checkin VARCHAR(500),
  qr_checkout VARCHAR(500),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_cancelacion TIMESTAMP,
  motivo_cancelacion TEXT
);

-- Crear tabla de fotos check-in y check-out
CREATE TABLE IF NOT EXISTS fotos_checkin_checkout (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  tipo_foto VARCHAR(50) NOT NULL CHECK (tipo_foto IN ('checkin', 'checkout')),
  url_foto VARCHAR(500) NOT NULL,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  reserva_id INTEGER REFERENCES reservas(id) ON DELETE CASCADE,
  tipo_notificacion VARCHAR(100) NOT NULL CHECK (tipo_notificacion IN ('reserva_confirmada', 'recordatorio_checkin', 'cobro_realizado', 'cancelacion', 'check_in_completado', 'check_out_completado')),
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de historial de clientes
CREATE TABLE IF NOT EXISTS historial_clientes (
  id SERIAL PRIMARY KEY,
  propietario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  huesped_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  propiedad_id INTEGER NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  numero_visitas INTEGER DEFAULT 1,
  fecha_primera_visita TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_visita TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  es_cliente_recurrente BOOLEAN DEFAULT false
);

-- Crear tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  monto DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'rechazado', 'reembolsado')),
  metodo_pago VARCHAR(50) DEFAULT 'tarjeta_credito',
  numero_tarjeta_ultimos_4 VARCHAR(4),
  nombre_titular VARCHAR(100),
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  descripcion TEXT
);

-- Crear tabla de reseñas
CREATE TABLE IF NOT EXISTS resenas (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  propiedad_id INTEGER NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  huesped_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  propietario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario TEXT,
  limpieza INTEGER CHECK (limpieza >= 1 AND limpieza <= 5),
  ubicacion INTEGER CHECK (ubicacion >= 1 AND ubicacion <= 5),
  comunicacion INTEGER CHECK (comunicacion >= 1 AND comunicacion <= 5),
  relacion_calidad_precio INTEGER CHECK (relacion_calidad_precio >= 1 AND relacion_calidad_precio <= 5),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reserva_id)
);

-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  propiedad_id INTEGER NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, propiedad_id)
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_propiedades_propietario ON propiedades(propietario_id);
CREATE INDEX IF NOT EXISTS idx_propiedades_zona ON propiedades(zona);
CREATE INDEX IF NOT EXISTS idx_reservas_huesped ON reservas(huesped_id);
CREATE INDEX IF NOT EXISTS idx_reservas_propiedad ON reservas(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_reserva ON pagos(reserva_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_resenas_propiedad ON resenas(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_resenas_huesped ON resenas(huesped_id);
CREATE INDEX IF NOT EXISTS idx_resenas_propietario ON resenas(propietario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_propiedad ON favoritos(propiedad_id);