const Property = require('../models/property');
const pool = require('../config/database'); // 👈 conexión directa a PostgreSQL

// Crear propiedad
exports.crearPropiedad = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      zona,
      precio_noche,
      precioNoche,
      cantidad_habitaciones,
      cantidadHabitaciones,
      cantidad_huespedes,
      cantidadHuespedes,
      calle,
      entre_calle,
      entreCalle,
      y_entre_calle,
      yEntreCalle,
      cp,
      colonia,
      ciudad
    } = req.body;

    const precio = precio_noche || precioNoche;
    const habitaciones = cantidad_habitaciones || cantidadHabitaciones;
    const huespedes = cantidad_huespedes || cantidadHuespedes;
    const entre = entre_calle || entreCalle;
    const yEntre = y_entre_calle || yEntreCalle;

    // Validaciones - descripción ahora es obligatoria
    if (!nombre || !zona || !precio || !habitaciones || !huespedes || !descripcion) {
      return res.status(400).json({ error: 'Faltan campos requeridos: nombre, descripción, zona, precio, habitaciones y huéspedes' });
    }

    if (!calle || !ciudad) {
      return res.status(400).json({ error: 'Faltan campos de ubicación: calle y ciudad' });
    }

    if (precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }

    const propiedad = await Property.crearPropiedad(
      req.userId,
      nombre,
      descripcion,
      zona,
      precio,
      habitaciones,
      huespedes,
      calle,
      entre,
      yEntre,
      cp || null,
      colonia || null,
      ciudad,
      null // estado (se llenará automáticamente desde CP)
    );

    res.status(201).json({
      mensaje: 'Propiedad creada exitosamente',
      propiedad
    });
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    res.status(500).json({ error: 'Error al crear propiedad' });
  }
};

// Obtener propiedades del propietario
exports.obtenerMisPropiedades = async (req, res) => {
  try {
    const propiedades = await Property.obtenerPropiedadesPropietario(req.userId);
    res.json({
      total: propiedades.length,
      propiedades
    });
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    res.status(500).json({ error: 'Error al obtener propiedades' });
  }
};

// Obtener fechas ocupadas de una propiedad
exports.obtenerFechasOcupadas = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT fecha_checkin, fecha_checkout
       FROM reservas
       WHERE propiedad_id = $1
         AND estado IN ('completada', 'check-in', 'confirmada')`,
      [id]
    );

    // Expande los rangos de fechas ocupadas a un arreglo plano de strings YYYY-MM-DD
    const diasOcupados = [];
    result.rows.forEach(row => {
      const inicio = new Date(row.fecha_checkin);
      const fin = new Date(row.fecha_checkout);
      for (let d = new Date(inicio); d < fin; d.setDate(d.getDate() + 1)) {
        diasOcupados.push(d.toISOString().split('T')[0]);
      }
    });

    res.json({ diasOcupados });
  } catch (error) {
    console.error('Error al obtener fechas ocupadas:', error);
    res.status(500).json({ error: 'Error al obtener fechas ocupadas' });
  }
};


// Obtener detalle de una propiedad
exports.obtenerPropiedad = async (req, res) => {
  try {
    const { id } = req.params;

    const propiedad = await Property.obtenerPorId(id);
    if (!propiedad) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    const fotos = await Property.obtenerFotosPropiedad(id);

    res.json({
      propiedad,
      fotos
    });
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(500).json({ error: 'Error al obtener propiedad' });
  }
};

// Actualizar propiedad
exports.actualizarPropiedad = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    // Validaciones para campos obligatorios
    if (datos.descripcion !== undefined && !datos.descripcion) {
      return res.status(400).json({ error: 'La descripción es obligatoria' });
    }

    if (datos.calle !== undefined && !datos.calle) {
      return res.status(400).json({ error: 'La calle es obligatoria' });
    }

    if (datos.ciudad !== undefined && !datos.ciudad) {
      return res.status(400).json({ error: 'La ciudad es obligatoria' });
    }

    const propiedadActualizada = await Property.actualizarPropiedad(id, req.userId, datos);

    res.json({
      mensaje: 'Propiedad actualizada exitosamente',
      propiedad: propiedadActualizada
    });
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar propiedad' });
  }
};

// Eliminar propiedad
exports.eliminarPropiedad = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Eliminando propiedad ${id} para usuario ${req.userId}`);

    const result = await Property.eliminarPropiedad(id, req.userId);

    console.log('Propiedad eliminada exitosamente:', result);

    res.json({ mensaje: 'Propiedad eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    res.status(500).json({ error: error.message || 'Error al eliminar propiedad' });
  }
};

// Agregar foto a propiedad
exports.agregarFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipoFoto } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Debes subir una imagen' });
    }

    if (!tipoFoto) {
      return res.status(400).json({ error: 'Tipo de foto es requerido' });
    }

    if (!['exterior', 'interior', 'otro'].includes(tipoFoto)) {
      return res.status(400).json({ error: 'Tipo de foto inválido' });
    }

    // Verificar que la propiedad pertenece al usuario
    const propiedad = await Property.obtenerPorId(id);
    if (!propiedad) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    if (propiedad.propietario_id !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para agregar fotos a esta propiedad' });
    }

    // Validar que tenga al menos exterior e interior
    const fotos = await Property.obtenerFotosPropiedad(id);
    const tiposExistentes = fotos.map(f => f.tipo_foto);

    if (tipoFoto === 'exterior' && tiposExistentes.includes('exterior')) {
      return res.status(400).json({ error: 'Esta propiedad ya tiene una foto de exterior' });
    }

    if (tipoFoto === 'interior' && tiposExistentes.includes('interior')) {
      return res.status(400).json({ error: 'Esta propiedad ya tiene una foto de interior' });
    }

    // Guardar URL de la foto en BD (corrigiendo las barras invertidas en Windows)
const urlFoto = `/uploads/propiedades/${req.file.filename}`.replace(/\\/g, '/');

// Insertar la foto en la tabla fotos_propiedad
const foto = await Property.agregarFoto(id, urlFoto, tipoFoto);

// 🔹 Actualizar automáticamente los campos foto_exterior o foto_interior
try {
  if (tipoFoto === 'exterior') {
    await Property.actualizarCampoFoto(id, 'foto_exterior', urlFoto);
  } else if (tipoFoto === 'interior') {
    await Property.actualizarCampoFoto(id, 'foto_interior', urlFoto);
  }
} catch (updateError) {
  console.error('Error al actualizar campos foto_exterior/interior:', updateError);
  // No detiene la ejecución si falla esta actualización
}

res.status(201).json({
  mensaje: 'Foto subida exitosamente',
  foto
});
  } catch (error) {
    console.error('Error al subir foto:', error);
    res.status(500).json({ error: error.message || 'Error al subir foto' });
  }
};

// Limpiar foto (eliminar registros de ambas tablas y dejar null en propiedad)
exports.limpiarFoto = async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body; // 'exterior' o 'interior'

  try {
    if (!['exterior', 'interior'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de foto inválido' });
    }

    // Convertir ID a número
    const propiedadId = parseInt(id);
    if (isNaN(propiedadId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // 🔹 1️⃣ Eliminar registro en fotos_propiedad
    await pool.query(
      'DELETE FROM fotos_propiedad WHERE propiedad_id = $1 AND tipo_foto = $2',
      [propiedadId, tipo]
    );

    // 🔹 2️⃣ Limpiar campo correspondiente en propiedades
    const campo = tipo === 'exterior' ? 'foto_exterior' : 'foto_interior';
    const updateQuery = `UPDATE propiedades SET ${campo} = NULL WHERE id = $1`;
    await pool.query(updateQuery, [propiedadId]);

    console.log(`✅ Foto ${tipo} eliminada correctamente de propiedad ${propiedadId}`);

    res.json({ mensaje: `Foto ${tipo} eliminada correctamente` });
  } catch (error) {
    console.error('❌ Error SQL al limpiar foto:', error);
    res.status(500).json({
      error: 'Error al eliminar foto',
      detalle: error.message,
    });
  }
};



// Eliminar foto de propiedad
exports.eliminarFoto = async (req, res) => {
  try {
    const { fotoId } = req.params;

    await Property.eliminarFoto(fotoId, req.userId);

    res.json({ mensaje: 'Foto eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar foto:', error);
    res.status(500).json({ error: error.message || 'Error al eliminar foto' });
  }
};

// Obtener zonas disponibles
exports.obtenerZonas = async (req, res) => {
  try {
    const zonas = await Property.obtenerZonasDisponibles();
    res.json({
      total: zonas.length,
      zonas
    });
  } catch (error) {
    console.error('Error al obtener zonas:', error);
    res.status(500).json({ error: 'Error al obtener zonas' });
  }
};

// Buscar propiedades disponibles
exports.buscarPropiedades = async (req, res) => {
  try {
    const { zona, fechaCheckin, fechaCheckout } = req.query;

    if (!zona) {
      return res.status(400).json({ error: 'Zona es requerida' });
    }

    const propiedades = await Property.buscarPropiedades(zona, fechaCheckin || null, fechaCheckout || null);

    res.json({
      total: propiedades.length,
      propiedades
    });
  } catch (error) {
    console.error('Error al buscar propiedades:', error);
    res.status(500).json({ error: 'Error al buscar propiedades' });
  }
};