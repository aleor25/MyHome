const pool = require('../config/database');
const QRCode = require('qrcode');
const crypto = require('crypto');

class Property {
  // Generar QR único para propiedad
  static async generarQRPropiedad(propiedadId) {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const qrData = JSON.stringify({
        propiedadId,
        token,
        timestamp: Date.now()
      });
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      return qrCodeDataURL;
    } catch (error) {
      throw error;
    }
  }

  // Crear nueva propiedad
  static async crearPropiedad(propietarioId, nombre, descripcion, zona, precioNoche, cantidadHabitaciones, cantidadHuespedes, calle, entreCalle, yEntreCalle, cp, colonia, ciudad, estado) {
    try {
      // Crear propiedad
      const result = await pool.query(
        `INSERT INTO propiedades
         (propietario_id, nombre, descripcion, zona, precio_noche, cantidad_habitaciones, cantidad_huespedes, calle, entre_calle, y_entre_calle, cp, colonia, ciudad, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [propietarioId, nombre, descripcion, zona, precioNoche, cantidadHabitaciones, cantidadHuespedes, calle, entreCalle, yEntreCalle, cp, colonia, ciudad, estado]
      );

      const propiedad = result.rows[0];

      // Generar QR único para la propiedad
      const qrCode = await this.generarQRPropiedad(propiedad.id);

      // Actualizar con QR
      await pool.query(
        'UPDATE propiedades SET qr_code = $1 WHERE id = $2',
        [qrCode, propiedad.id]
      );

      propiedad.qr_code = qrCode;
      return propiedad;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las propiedades de un propietario
  static async obtenerPropiedadesPropietario(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT p.*, COUNT(fp.id) as total_fotos
         FROM propiedades p
         LEFT JOIN fotos_propiedad fp ON p.id = fp.propiedad_id
         WHERE p.propietario_id = $1
         GROUP BY p.id
         ORDER BY p.fecha_creacion DESC`,
        [propietarioId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener propiedad por ID
  static async obtenerPorId(id) {
    try {
      const result = await pool.query(
        `SELECT p.*, COUNT(fp.id) as total_fotos
         FROM propiedades p
         LEFT JOIN fotos_propiedad fp ON p.id = fp.propiedad_id
         WHERE p.id = $1
         GROUP BY p.id`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener fotos de una propiedad
  static async obtenerFotosPropiedad(propiedadId) {
    try {
      const result = await pool.query(
        'SELECT * FROM fotos_propiedad WHERE propiedad_id = $1 ORDER BY fecha_subida DESC',
        [propiedadId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Agregar foto a propiedad
  static async agregarFoto(propiedadId, urlFoto, tipoFoto) {
    try {
      const result = await pool.query(
        'INSERT INTO fotos_propiedad (propiedad_id, url_foto, tipo_foto) VALUES ($1, $2, $3) RETURNING *',
        [propiedadId, urlFoto, tipoFoto]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar foto de propiedad
  static async eliminarFoto(fotoId, propietarioId) {
    try {
      const result = await pool.query(
        `DELETE FROM fotos_propiedad
         WHERE id = $1
         AND propiedad_id IN (SELECT id FROM propiedades WHERE propietario_id = $2)
         RETURNING *`,
        [fotoId, propietarioId]
      );

      if (result.rows.length === 0) {
        throw new Error('Foto no encontrada o no tienes permiso para eliminarla');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Actualizar propiedad
  static async actualizarPropiedad(id, propietarioId, datos) {
    try {
      const { nombre, descripcion, zona, precioNoche, cantidadHabitaciones, cantidadHuespedes, calle, entreCalle, yEntreCalle, cp, colonia, ciudad, estado, disponible } = datos;

      const result = await pool.query(
        `UPDATE propiedades
         SET nombre = COALESCE($1, nombre),
             descripcion = COALESCE($2, descripcion),
             zona = COALESCE($3, zona),
             precio_noche = COALESCE($4, precio_noche),
             cantidad_habitaciones = COALESCE($5, cantidad_habitaciones),
             cantidad_huespedes = COALESCE($6, cantidad_huespedes),
             calle = COALESCE($7, calle),
             entre_calle = COALESCE($8, entre_calle),
             y_entre_calle = COALESCE($9, y_entre_calle),
             cp = COALESCE($10, cp),
             colonia = COALESCE($11, colonia),
             ciudad = COALESCE($12, ciudad),
             estado = COALESCE($13, estado),
             disponible = COALESCE($14, disponible)
         WHERE id = $15 AND propietario_id = $16
         RETURNING *`,
        [nombre, descripcion, zona, precioNoche, cantidadHabitaciones, cantidadHuespedes, calle, entreCalle, yEntreCalle, cp, colonia, ciudad, estado, disponible, id, propietarioId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Propiedad no encontrada o no tienes permiso para editarla');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar propiedad
  static async eliminarPropiedad(id, propietarioId) {
    try {
      const result = await pool.query(
        'DELETE FROM propiedades WHERE id = $1 AND propietario_id = $2 RETURNING id',
        [id, propietarioId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Propiedad no encontrada o no tienes permiso para eliminarla');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener zonas disponibles (únicas)
  static async obtenerZonasDisponibles() {
    try {
      const result = await pool.query(
        `SELECT DISTINCT zona
         FROM propiedades
         WHERE disponible = true
         ORDER BY zona ASC`
      );
      return result.rows.map(row => row.zona);
    } catch (error) {
      throw error;
    }
  }

  // Buscar propiedades por zona y fechas
  static async buscarPropiedades(zona, fechaCheckin, fechaCheckout) {
    try {
      const result = await pool.query(
        `SELECT DISTINCT p.*, COUNT(fp.id) as total_fotos
         FROM propiedades p
         LEFT JOIN fotos_propiedad fp ON p.id = fp.propiedad_id
         WHERE p.zona ILIKE $1
         AND p.disponible = true
         AND p.id NOT IN (
           SELECT propiedad_id FROM reservas
           WHERE estado != 'cancelada'
           AND (
             (fecha_checkin <= $3 AND fecha_checkout >= $2)
           )
         )
         GROUP BY p.id
         ORDER BY p.precio_noche ASC`,
        [`%${zona}%`, fechaCheckin, fechaCheckout]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
    // Actualizar campo de foto (exterior/interior)
  static async actualizarCampoFoto(propiedadId, campo, urlFoto) {
    try {
      // Seguridad: solo permite actualizar columnas válidas
      if (!['foto_exterior', 'foto_interior'].includes(campo)) {
        throw new Error('Campo de foto no permitido');
      }

      const query = `UPDATE propiedades SET ${campo} = $1 WHERE id = $2`;
      await pool.query(query, [urlFoto, propiedadId]);
    } catch (error) {
      throw error;
    }
  }

}

module.exports = Property;