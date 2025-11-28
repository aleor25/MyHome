-- Actualización de tabla propiedades para desglozar dirección en componentes
-- y agregar campos de ubicación geográfica

-- Paso 1: Verificar y agregar nuevas columnas
ALTER TABLE propiedades
ADD COLUMN IF NOT EXISTS calle VARCHAR(255),
ADD COLUMN IF NOT EXISTS entre_calle VARCHAR(255),
ADD COLUMN IF NOT EXISTS y_entre_calle VARCHAR(255),
ADD COLUMN IF NOT EXISTS cp VARCHAR(10),
ADD COLUMN IF NOT EXISTS colonia VARCHAR(150);

-- Paso 2: Migrar datos de dirección existentes a calle (si es necesario)
UPDATE propiedades
SET calle = direccion
WHERE calle IS NULL AND direccion IS NOT NULL;

-- Paso 3: Eliminar columnas obsoletas
ALTER TABLE propiedades
DROP COLUMN IF EXISTS direccion,
DROP COLUMN IF EXISTS pais;

-- Paso 4: Hacer la columna calle obligatoria (después de migración de datos)
ALTER TABLE propiedades
ALTER COLUMN calle SET NOT NULL;

-- Comentario para referencia: Se mantiene ciudad como campo obligatorio
-- ya que el CP se usará para auto-llenar la ciudad mediante API externa
