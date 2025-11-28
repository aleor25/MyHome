const Review = require('../../models/review');
const pool = require('../../config/database');

jest.mock('../../config/database');

describe('Review Model Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== PRUEBAS: puedeDejarResena() ====================

  describe('puedeDejarResena() - Check Review Eligibility', () => {

    test('should allow review for completed reservation without review', async () => {
      const mockReservation = {
        id: 1,
        estado: 'completada',
        tiene_resena: 0
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReservation] });

      const result = await Review.puedeDejarResena(1, 5);

      expect(result.puede).toBe(true);
      expect(result.motivo).toBeUndefined();
    });

    test('should deny review if reservation is not completed', async () => {
      const mockReservation = {
        id: 1,
        estado: 'confirmada',
        tiene_resena: 0
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReservation] });

      const result = await Review.puedeDejarResena(1, 5);

      expect(result.puede).toBe(false);
      expect(result.motivo).toContain('completada');
    });

    test('should deny review if already reviewed', async () => {
      const mockReservation = {
        id: 1,
        estado: 'completada',
        tiene_resena: 1
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReservation] });

      const result = await Review.puedeDejarResena(1, 5);

      expect(result.puede).toBe(false);
      expect(result.motivo).toContain('Ya has dejado');
    });

    test('should deny review if reservation not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await Review.puedeDejarResena(999, 5);

      expect(result.puede).toBe(false);
      expect(result.motivo).toContain('no encontrada');
    });

    test('should deny review if guest is not the owner', async () => {
      // Note: The function actually checks if guest matches, returning empty rows if not
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await Review.puedeDejarResena(1, 999);

      expect(result.puede).toBe(false);
    });

    test('should pass correct parameters to database query', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await Review.puedeDejarResena(42, 15);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT r.id'),
        [42, 15]
      );
    });
  });

  // ==================== PRUEBAS: obtenerPromedioCalificacion() ====================

  describe('obtenerPromedioCalificacion() - Get Average Rating', () => {

    test('should calculate average rating correctly with multiple reviews', async () => {
      const mockAverages = {
        promedio_general: 4.5,
        promedio_limpieza: 4.8,
        promedio_ubicacion: 4.2,
        promedio_comunicacion: 4.6,
        promedio_calidad_precio: 4.3,
        total_resenas: 10
      };

      pool.query.mockResolvedValueOnce({ rows: [mockAverages] });

      const result = await Review.obtenerPromedioCalificacion(10);

      expect(result.promedio_general).toBe(4.5);
      expect(result.total_resenas).toBe(10);
      expect(result.promedio_limpieza).toBe(4.8);
    });

    test('should return proper structure for property with no reviews', async () => {
      const mockAverages = {
        promedio_general: null,
        promedio_limpieza: null,
        total_resenas: 0
      };

      pool.query.mockResolvedValueOnce({ rows: [mockAverages] });

      const result = await Review.obtenerPromedioCalificacion(10);

      expect(result.total_resenas).toBe(0);
      expect(result.promedio_general).toBeNull();
    });

    test('should round averages to one decimal place', async () => {
      const mockAverages = {
        promedio_general: 4.6,
        total_resenas: 5
      };

      pool.query.mockResolvedValueOnce({ rows: [mockAverages] });

      const result = await Review.obtenerPromedioCalificacion(10);

      expect(result.promedio_general).toBe(4.6);
    });

    test('should pass property ID to database query', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{}] });

      await Review.obtenerPromedioCalificacion(42);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AVG(calificacion)'),
        [42]
      );
    });

    test('should calculate all rating categories', async () => {
      const mockAverages = {
        promedio_general: 4.5,
        promedio_limpieza: 4.8,
        promedio_ubicacion: 4.2,
        promedio_comunicacion: 4.6,
        promedio_calidad_precio: 4.3
      };

      pool.query.mockResolvedValueOnce({ rows: [mockAverages] });

      const result = await Review.obtenerPromedioCalificacion(10);

      expect(result.promedio_limpieza).toBe(4.8);
      expect(result.promedio_ubicacion).toBe(4.2);
      expect(result.promedio_comunicacion).toBe(4.6);
      expect(result.promedio_calidad_precio).toBe(4.3);
    });
  });

  // ==================== PRUEBAS: crearResena() ====================

  describe('crearResena() - Create Review', () => {

    test('should create a review successfully with all details', async () => {
      const mockReview = {
        id: 1,
        reserva_id: 10,
        calificacion: 5,
        comentario: 'Excelente lugar',
        limpieza: 5,
        ubicacion: 4,
        comunicacion: 5,
        relacion_calidad_precio: 4
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReview] });

      const result = await Review.crearResena(10, 5, 15, 20, 5, 'Excelente lugar', {
        limpieza: 5,
        ubicacion: 4,
        comunicacion: 5,
        relacionCalidadPrecio: 4
      });

      expect(result).toEqual(mockReview);
      expect(result.calificacion).toBe(5);
    });

    test('should create review with null detalles', async () => {
      const mockReview = {
        id: 1,
        reserva_id: 10,
        calificacion: 4
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReview] });

      const result = await Review.crearResena(10, 5, 15, 20, 4, 'Good', null);

      expect(result).toBeDefined();
      expect(pool.query).toHaveBeenCalled();
    });

    test('should insert all provided details into database', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{}] });

      await Review.crearResena(10, 5, 15, 20, 5, 'Great', {
        limpieza: 5,
        ubicacion: 4,
        comunicacion: 5,
        relacionCalidadPrecio: 4
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO resenas'),
        expect.arrayContaining([10, 5, 15, 20, 5, 'Great', 5, 4, 5, 4])
      );
    });
  });

  // ==================== PRUEBAS: obtenerResenasPorPropiedad() ====================

  describe('obtenerResenasPorPropiedad() - Get Property Reviews', () => {

    test('should return all reviews for a property', async () => {
      const mockReviews = [
        { id: 1, propiedadId: 10, calificacion: 5, nombre_huesped: 'Juan' },
        { id: 2, propiedadId: 10, calificacion: 4, nombre_huesped: 'María' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockReviews });

      const result = await Review.obtenerResenasPorPropiedad(10);

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockReviews);
    });

    test('should return empty array if property has no reviews', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await Review.obtenerResenasPorPropiedad(999);

      expect(result).toEqual([]);
    });

    test('should order reviews by creation date descending', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await Review.obtenerResenasPorPropiedad(10);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY r.fecha_creacion DESC'),
        [10]
      );
    });

    test('should include guest name in reviews', async () => {
      const mockReviews = [
        { id: 1, nombre_huesped: 'John Doe' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockReviews });

      const result = await Review.obtenerResenasPorPropiedad(10);

      expect(result[0].nombre_huesped).toBe('John Doe');
    });
  });

  // ==================== PRUEBAS: obtenerResenasPorHuesped() ====================

  describe('obtenerResenasPorHuesped() - Get Guest Reviews', () => {

    test('should return all reviews left by a guest', async () => {
      const mockReviews = [
        { id: 1, huesped_id: 5, nombre_propiedad: 'Casa 1' },
        { id: 2, huesped_id: 5, nombre_propiedad: 'Casa 2' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockReviews });

      const result = await Review.obtenerResenasPorHuesped(5);

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockReviews);
    });

    test('should return empty array for guest with no reviews', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await Review.obtenerResenasPorHuesped(999);

      expect(result).toEqual([]);
    });

    test('should include property information', async () => {
      const mockReviews = [
        { id: 1, nombre_propiedad: 'Casa Playa', zona: 'Zona Centro' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockReviews });

      const result = await Review.obtenerResenasPorHuesped(5);

      expect(result[0].nombre_propiedad).toBe('Casa Playa');
      expect(result[0].zona).toBe('Zona Centro');
    });
  });

  // ==================== PRUEBAS: obtenerResenasRecibidas() ====================

  describe('obtenerResenasRecibidas() - Get Owner Reviews', () => {

    test('should return all reviews received by an owner', async () => {
      const mockReviews = [
        { id: 1, propietario_id: 20, nombre_propiedad: 'Casa 1' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockReviews });

      const result = await Review.obtenerResenasRecibidas(20);

      expect(result).toEqual(mockReviews);
    });

    test('should include property and guest names', async () => {
      const mockReviews = [
        { id: 1, nombre_propiedad: 'Casa A', nombre_huesped: 'Juan' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockReviews });

      const result = await Review.obtenerResenasRecibidas(20);

      expect(result[0].nombre_propiedad).toBe('Casa A');
      expect(result[0].nombre_huesped).toBe('Juan');
    });
  });

  // ==================== PRUEBAS: obtenerResenaPorId() ====================

  describe('obtenerResenaPorId() - Get Review by ID', () => {

    test('should return complete review details', async () => {
      const mockReview = {
        id: 1,
        calificacion: 5,
        comentario: 'Excelente',
        nombre_propiedad: 'Casa Bonita',
        nombre_huesped: 'Juan'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReview] });

      const result = await Review.obtenerResenaPorId(1);

      expect(result).toEqual(mockReview);
      expect(result.nombre_propiedad).toBe('Casa Bonita');
    });

    test('should return undefined for non-existing review', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await Review.obtenerResenaPorId(999);

      expect(result).toBeUndefined();
    });
  });

});
