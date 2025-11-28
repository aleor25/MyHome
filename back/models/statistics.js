const pool = require('../config/database');

class Statistics {
  // Obtener ingresos totales del propietario
  static async obtenerIngresosTotales(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT SUM(precio_total) as ingresos_totales, COUNT(*) as total_reservas
         FROM reservas r
         JOIN propiedades p ON r.propiedad_id = p.id
         WHERE p.propietario_id = $1 AND r.estado IN ('check-out', 'completada')`,
        [propietarioId]
      );
      return {
        ingresosTotales: parseFloat(result.rows[0].ingresos_totales) || 0,
        totalReservas: parseInt(result.rows[0].total_reservas) || 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener ingresos del mes actual
  static async obtenerIngresosDelMes(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT SUM(precio_total) as ingresos_mes, COUNT(*) as reservas_mes
         FROM reservas r
         JOIN propiedades p ON r.propiedad_id = p.id
         WHERE p.propietario_id = $1 
         AND r.estado IN ('check-out', 'completada')
         AND DATE_TRUNC('month', r.fecha_creacion) = DATE_TRUNC('month', NOW())`,
        [propietarioId]
      );
      return {
        ingresosMes: parseFloat(result.rows[0].ingresos_mes) || 0,
        reservasMes: parseInt(result.rows[0].reservas_mes) || 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener tasa de ocupación
  static async obtenerTasaOcupacion(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT 
           COUNT(DISTINCT p.id) as total_propiedades,
           COUNT(CASE WHEN r.estado IN ('check-in', 'activa') THEN 1 END) as ocupadas_ahora
         FROM propiedades p
         LEFT JOIN reservas r ON p.id = r.propiedad_id 
           AND r.estado IN ('check-in', 'activa')
           AND r.fecha_checkin <= NOW()
           AND r.fecha_checkout >= NOW()
         WHERE p.propietario_id = $1`,
        [propietarioId]
      );
      
      const { total_propiedades, ocupadas_ahora } = result.rows[0];
      const tasaOcupacion = total_propiedades > 0 
        ? ((ocupadas_ahora / total_propiedades) * 100).toFixed(2)
        : 0;

      return {
        totalPropiedades: parseInt(total_propiedades),
        ocupadasAhora: parseInt(ocupadas_ahora),
        tasaOcupacion: parseFloat(tasaOcupacion)
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener cancelaciones
  static async obtenerCancelaciones(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as total_cancelaciones, 
                SUM(penalizacion) as penalizaciones_totales
         FROM reservas r
         JOIN propiedades p ON r.propiedad_id = p.id
         WHERE p.propietario_id = $1 AND r.estado = 'cancelada'`,
        [propietarioId]
      );
      
      return {
        totalCancelaciones: parseInt(result.rows[0].total_cancelaciones) || 0,
        penalizacionesTotales: parseFloat(result.rows[0].penalizaciones_totales) || 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener propiedad más popular
  static async obtenerPropiedadMasPopular(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT p.id, p.nombre, COUNT(r.id) as total_reservas, AVG(r.precio_total) as precio_promedio
         FROM propiedades p
         LEFT JOIN reservas r ON p.id = r.propiedad_id AND r.estado IN ('check-out', 'completada')
         WHERE p.propietario_id = $1
         GROUP BY p.id, p.nombre
         ORDER BY total_reservas DESC
         LIMIT 1`,
        [propietarioId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }

      return {
        id: result.rows[0].id,
        nombre: result.rows[0].nombre,
        totalReservas: parseInt(result.rows[0].total_reservas),
        precioPromedio: parseFloat(result.rows[0].precio_promedio) || 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener clientes recurrentes
  static async obtenerClientesRecurrentes(propietarioId, limite = 10) {
    try {
      const result = await pool.query(
        `SELECT hc.*, u.nombre, u.email, COUNT(r.id) as visitas_totales
         FROM historial_clientes hc
         JOIN usuarios u ON hc.huesped_id = u.id
         LEFT JOIN reservas r ON hc.huesped_id = r.huesped_id
         WHERE hc.propietario_id = $1 AND hc.es_cliente_recurrente = true
         GROUP BY hc.id, u.nombre, u.email
         ORDER BY hc.numero_visitas DESC
         LIMIT $2`,
        [propietarioId, limite]
      );
      
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener ingresos por propiedad
  static async obtenerIngresosPorPropiedad(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT p.id, p.nombre, p.zona, COUNT(r.id) as reservas, SUM(r.precio_total) as ingresos
         FROM propiedades p
         LEFT JOIN reservas r ON p.id = r.propiedad_id AND r.estado IN ('check-out', 'completada')
         WHERE p.propietario_id = $1
         GROUP BY p.id, p.nombre, p.zona
         ORDER BY ingresos DESC`,
        [propietarioId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        zona: row.zona,
        reservas: parseInt(row.reservas),
        ingresos: parseFloat(row.ingresos) || 0
      }));
    } catch (error) {
      throw error;
    }
  }

  // Obtener ingresos por mes (últimos 12 meses)
  static async obtenerIngresosPorMes(propietarioId) {
    try {
      const result = await pool.query(
        `SELECT 
           TO_CHAR(r.fecha_creacion, 'YYYY-MM') as mes,
           COUNT(r.id) as reservas,
           SUM(r.precio_total) as ingresos
         FROM reservas r
         JOIN propiedades p ON r.propiedad_id = p.id
         WHERE p.propietario_id = $1 
         AND r.estado IN ('check-out', 'completada')
         AND r.fecha_creacion >= NOW() - INTERVAL '12 months'
         GROUP BY TO_CHAR(r.fecha_creacion, 'YYYY-MM')
         ORDER BY mes DESC`,
        [propietarioId]
      );
      
      return result.rows.map(row => ({
        mes: row.mes,
        reservas: parseInt(row.reservas),
        ingresos: parseFloat(row.ingresos) || 0
      }));
    } catch (error) {
      throw error;
    }
  }

  // Obtener calificación promedio (cuando implentes reseñas)
  static async obtenerCalificacionPromedio(propietarioId) {
    try {
      // Por ahora, esto es un placeholder. Cuando tengas tabla de reseñas, actualiza esta query
      return {
        calificacion: 5.0,
        totalResenas: 0,
        comentario: 'Las reseñas se habilitarán próximamente'
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener tendencias
  static async obtenerTendencias(propietarioId) {
    try {
      // Ingresos este mes vs mes anterior
      const mesActual = await pool.query(
        `SELECT SUM(precio_total) as total
         FROM reservas r
         JOIN propiedades p ON r.propiedad_id = p.id
         WHERE p.propietario_id = $1 
         AND r.estado IN ('check-out', 'completada')
         AND DATE_TRUNC('month', r.fecha_creacion) = DATE_TRUNC('month', NOW())`,
        [propietarioId]
      );

      const mesAnterior = await pool.query(
        `SELECT SUM(precio_total) as total
         FROM reservas r
         JOIN propiedades p ON r.propiedad_id = p.id
         WHERE p.propietario_id = $1 
         AND r.estado IN ('check-out', 'completada')
         AND DATE_TRUNC('month', r.fecha_creacion) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')`,
        [propietarioId]
      );

      const ingresosMesActual = parseFloat(mesActual.rows[0].total) || 0;
      const ingresosMesAnterior = parseFloat(mesAnterior.rows[0].total) || 0;

      let porcentajeCambio = 0;
      if (ingresosMesAnterior > 0) {
        porcentajeCambio = (((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior) * 100).toFixed(2);
      }

      return {
        ingresosMesActual,
        ingresosMesAnterior,
        porcentajeCambio: parseFloat(porcentajeCambio),
        tendencia: porcentajeCambio > 0 ? 'Al alza 📈' : porcentajeCambio < 0 ? 'Al baja 📉' : 'Sin cambios →'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Statistics;