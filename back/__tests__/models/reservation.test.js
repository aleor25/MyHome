const Reservation = require('../../models/reservation');
const pool = require('../../config/database');

jest.mock('../../config/database');

describe('Reservation Model Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== PRUEBAS: crearReserva() ====================

  describe('crearReserva() - Create Reservation', () => {

    test('should create a reservation successfully', async () => {
      const mockReserva = {
        id: 1,
        propiedad_id: 10,
        huesped_id: 5,
        fecha_checkin: '2025-12-20',
        fecha_checkout: '2025-12-25',
        precio_total: 5000,
        estado: 'confirmada'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReserva] });

      const result = await Reservation.crearReserva(10, 5, '2025-12-20', '2025-12-25', 5000);

      expect(result).toEqual(mockReserva);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO reservas'),
        [10, 5, '2025-12-20', '2025-12-25', 5000]
      );
    });

    test('should throw error when database fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(Reservation.crearReserva(10, 5, '2025-12-20', '2025-12-25', 5000))
        .rejects.toThrow('Database error');
    });
  });

  // ==================== PRUEBAS: cancelarReserva() ====================

  describe('cancelarReserva() - Cancel Reservation with Penalty', () => {

    test('should apply 50% penalty when canceling less than 24h before check-in', async () => {
      const now = new Date();
      const checkinIn12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      const mockReserva = {
        id: 1,
        precio_total: 1000,
        fecha_checkin: checkinIn12Hours.toISOString()
      };

      const mockCancelledReserva = {
        id: 1,
        precio_total: 1000,
        penalizacion: 500,
        estado: 'cancelada'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReserva] }); // obtenerPorId
      pool.query.mockResolvedValueOnce({ rows: [mockCancelledReserva] }); // cancelarReserva

      const result = await Reservation.cancelarReserva(1, 'User request');

      expect(result.penalizacion).toBe(500); // 50% of 1000
      expect(result.estado).toBe('cancelada');
    });

    test('should apply 0% penalty when canceling more than 24h before check-in', async () => {
      const now = new Date();
      const checkinIn72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000);

      const mockReserva = {
        id: 1,
        precio_total: 2000,
        fecha_checkin: checkinIn72Hours.toISOString()
      };

      const mockCancelledReserva = {
        id: 1,
        precio_total: 2000,
        penalizacion: 0,
        estado: 'cancelada'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReserva] }); // obtenerPorId
      pool.query.mockResolvedValueOnce({ rows: [mockCancelledReserva] }); // cancelarReserva

      const result = await Reservation.cancelarReserva(1, 'User request');

      expect(result.penalizacion).toBe(0);
      expect(result.estado).toBe('cancelada');
    });

    test('should apply exact 50% penalty calculation', async () => {
      const now = new Date();
      const checkinSoon = new Date(now.getTime() + 10 * 60 * 60 * 1000);

      const mockReserva = {
        id: 1,
        precio_total: 10000,
        fecha_checkin: checkinSoon.toISOString()
      };

      const mockCancelledReserva = {
        id: 1,
        precio_total: 10000,
        penalizacion: 5000,
        estado: 'cancelada'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReserva] });
      pool.query.mockResolvedValueOnce({ rows: [mockCancelledReserva] });

      const result = await Reservation.cancelarReserva(1, 'Emergency');

      expect(result.penalizacion).toBe(5000);
    });

    test('should store cancellation reason', async () => {
      const now = new Date();
      const futureCheckin = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const mockReserva = {
        id: 1,
        precio_total: 1000,
        fecha_checkin: futureCheckin.toISOString()
      };

      const mockCancelledReserva = {
        id: 1,
        motivo_cancelacion: 'Personal reasons',
        estado: 'cancelada'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReserva] });
      pool.query.mockResolvedValueOnce({ rows: [mockCancelledReserva] });

      const result = await Reservation.cancelarReserva(1, 'Personal reasons');

      expect(result.motivo_cancelacion).toBe('Personal reasons');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reservas'),
        expect.arrayContaining(['Personal reasons'])
      );
    });

    test('should throw error when reservation not found', async () => {
      pool.query.mockRejectedValueOnce(new Error('Reservation not found'));

      await expect(Reservation.cancelarReserva(999, 'User request'))
        .rejects.toThrow('Reservation not found');
    });
  });

  // ==================== PRUEBAS: verificarDisponibilidad() ====================

  describe('verificarDisponibilidad() - Check Property Availability', () => {

    test('should return true when property is available', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const result = await Reservation.verificarDisponibilidad(10, '2025-12-20', '2025-12-25');

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT'),
        [10, '2025-12-20', '2025-12-25']
      );
    });

    test('should return false when property is booked', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await Reservation.verificarDisponibilidad(10, '2025-12-20', '2025-12-25');

      expect(result).toBe(false);
    });

    test('should return false when there are multiple conflicting reservations', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ count: '3' }] });

      const result = await Reservation.verificarDisponibilidad(10, '2025-12-20', '2025-12-25');

      expect(result).toBe(false);
    });

    test('should handle overlapping dates correctly', async () => {
      // Check-in during existing reservation
      pool.query.mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await Reservation.verificarDisponibilidad(10, '2025-12-22', '2025-12-27');

      expect(result).toBe(false);
    });

    test('should ignore cancelled reservations', async () => {
      // The query should exclude cancelled reservations
      pool.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const result = await Reservation.verificarDisponibilidad(10, '2025-12-20', '2025-12-25');

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("estado != 'cancelada'"),
        expect.any(Array)
      );
    });
  });

  // ==================== PRUEBAS: obtenerPorId() ====================

  describe('obtenerPorId() - Get Reservation by ID', () => {

    test('should return complete reservation details', async () => {
      const mockReserva = {
        id: 1,
        propiedad_id: 10,
        huesped_id: 5,
        estado: 'confirmada',
        propiedad_nombre: 'Casa Bonita',
        huesped_nombre: 'Juan Pérez'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReserva] });

      const result = await Reservation.obtenerPorId(1);

      expect(result).toEqual(mockReserva);
      expect(result.propiedad_nombre).toBe('Casa Bonita');
      expect(result.huesped_nombre).toBe('Juan Pérez');
    });

    test('should return undefined for non-existing reservation', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await Reservation.obtenerPorId(999);

      expect(result).toBeUndefined();
    });

    test('should include property and guest information', async () => {
      const mockReserva = {
        id: 1,
        zona: 'Zona Centro',
        precio_noche: 500,
        huesped_email: 'juan@example.com'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockReserva] });

      const result = await Reservation.obtenerPorId(1);

      expect(result.zona).toBe('Zona Centro');
      expect(result.precio_noche).toBe(500);
      expect(result.huesped_email).toBe('juan@example.com');
    });
  });

  // ==================== PRUEBAS: obtenerReservasHuesped() ====================

  describe('obtenerReservasHuesped() - Get Guest Reservations', () => {

    test('should return all reservations for a guest', async () => {
      const mockReservas = [
        { id: 1, huesped_id: 5, estado: 'completada' },
        { id: 2, huesped_id: 5, estado: 'confirmada' },
        { id: 3, huesped_id: 5, estado: 'cancelada' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockReservas });

      const result = await Reservation.obtenerReservasHuesped(5);

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockReservas);
    });

    test('should return empty array if guest has no reservations', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await Reservation.obtenerReservasHuesped(999);

      expect(result).toEqual([]);
    });

    test('should include property and owner information', async () => {
      const mockReservas = [
        {
          id: 1,
          propiedad_nombre: 'Casa Playa',
          propietario_nombre: 'Carlos López'
        }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockReservas });

      const result = await Reservation.obtenerReservasHuesped(5);

      expect(result[0].propiedad_nombre).toBe('Casa Playa');
      expect(result[0].propietario_nombre).toBe('Carlos López');
    });

    test('should order reservations by check-in date descending', async () => {
      const mockReservas = [
        { id: 1, fecha_checkin: '2025-12-25' },
        { id: 2, fecha_checkin: '2025-12-20' },
        { id: 3, fecha_checkin: '2025-12-15' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockReservas });

      const result = await Reservation.obtenerReservasHuesped(5);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY r.fecha_checkin DESC'),
        expect.any(Array)
      );
    });
  });

  // ==================== PRUEBAS: actualizarEstado() ====================

  describe('actualizarEstado() - Update Reservation Status', () => {

    test('should update reservation status successfully', async () => {
      const mockUpdatedReserva = {
        id: 1,
        estado: 'completada'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUpdatedReserva] });

      const result = await Reservation.actualizarEstado(1, 'completada');

      expect(result.estado).toBe('completada');
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
        ['completada', 1]
      );
    });

    test('should handle status transitions correctly', async () => {
      const mockUpdatedReserva = {
        id: 1,
        estado: 'cancelada'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUpdatedReserva] });

      const result = await Reservation.actualizarEstado(1, 'cancelada');

      expect(result.estado).toBe('cancelada');
    });
  });

});
