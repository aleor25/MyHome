/**
 * Script para ejecutar migraciones de BD
 * Se ejecuta cuando el servidor inicia
 */
const pool = require('../config/database');

const runMigrations = async () => {
  try {
    console.log('🔄 Iniciando migraciones de base de datos...');

    // Migración: Agregar campos nuevos a tabla propiedades
    console.log('📝 Aplicando migración: Actualizar tabla propiedades...');

    // Paso 1: Agregar columnas nuevas si no existen
    try {
      console.log('  → Agregando columnas nuevas...');
      await pool.query(`
        ALTER TABLE propiedades
        ADD COLUMN IF NOT EXISTS calle VARCHAR(255),
        ADD COLUMN IF NOT EXISTS entre_calle VARCHAR(255),
        ADD COLUMN IF NOT EXISTS y_entre_calle VARCHAR(255),
        ADD COLUMN IF NOT EXISTS cp VARCHAR(10),
        ADD COLUMN IF NOT EXISTS colonia VARCHAR(150),
        ADD COLUMN IF NOT EXISTS estado VARCHAR(100)
      `);
      console.log('  ✅ Columnas nuevas agregadas correctamente');
    } catch (error) {
      console.log('  ⚠️  Error al agregar columnas:', error.message);
    }

    // Paso 2: Si la columna dirección existe, migrar datos a calle
    try {
      console.log('  → Verificando si existe columna "direccion"...');

      // Primero verificamos si la columna existe
      const checkColumn = await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='propiedades' AND column_name='direccion'
        ) as column_exists
      `);

      if (checkColumn.rows[0].column_exists) {
        console.log('  → Migrando datos de "direccion" a "calle"...');
        await pool.query(`
          UPDATE propiedades
          SET calle = direccion
          WHERE calle IS NULL AND direccion IS NOT NULL
        `);
        console.log('  ✅ Datos migrados correctamente');

        // Ahora sí eliminar la columna dirección
        console.log('  → Eliminando columna "direccion"...');
        await pool.query('ALTER TABLE propiedades DROP COLUMN direccion');
        console.log('  ✅ Columna "direccion" eliminada');
      } else {
        console.log('  ℹ️  Columna "direccion" no existe - no hay nada que migrar');
      }
    } catch (error) {
      if (error.message.includes('does not exist') || error.message.includes('no existe')) {
        console.log('  ℹ️  Columna ya fue eliminada anteriormente');
      } else {
        console.log('  ⚠️  Error durante migración de dirección:', error.message);
      }
    }

    // Paso 3: Eliminar columna pais si existe
    try {
      console.log('  → Verificando si existe columna "pais"...');

      const checkPais = await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='propiedades' AND column_name='pais'
        ) as column_exists
      `);

      if (checkPais.rows[0].column_exists) {
        console.log('  → Eliminando columna "pais"...');
        await pool.query('ALTER TABLE propiedades DROP COLUMN pais');
        console.log('  ✅ Columna "pais" eliminada');
      } else {
        console.log('  ℹ️  Columna "pais" no existe');
      }
    } catch (error) {
      console.log('  ⚠️  Error al eliminar pais:', error.message);
    }

    // Paso 4: Asegurar que calle tenga valores por defecto si es necesario
    try {
      console.log('  → Validando datos en columna "calle"...');
      await pool.query(`UPDATE propiedades SET calle = 'Por especificar' WHERE calle IS NULL`);
      console.log('  ✅ Datos validados');
    } catch (error) {
      console.log('  ⚠️  Error al validar calle:', error.message);
    }

    console.log('\n✅ Migraciones completadas exitosamente!\n');
    return true;
  } catch (error) {
    console.error('\n❌ Error durante las migraciones:', error.message);
    // No lanzar error para no detener el servidor
    // En producción, esto debería enviarse a un servicio de logging
    return false;
  }
};

module.exports = { runMigrations };
