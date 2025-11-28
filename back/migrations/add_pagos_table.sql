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

-- Crear índice para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_pagos_reserva ON pagos(reserva_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);

-- Comentarios
COMMENT ON TABLE pagos IS 'Tabla para almacenar los pagos de las reservas';
COMMENT ON COLUMN pagos.estado IS 'Estados: pendiente, completado, rechazado, reembolsado';
COMMENT ON COLUMN pagos.metodo_pago IS 'Métodos de pago disponibles';
