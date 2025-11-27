const Payment = require('../../models/payment');
const Reservation = require('../../models/reservation');
const paymentController = require('../../controllers/paymentController');

jest.mock('../../models/payment');
jest.mock('../../models/reservation');

describe('Payment Controller Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== PRUEBAS: procesarPago() ====================

  describe('procesarPago() - Process Payment', () => {

    test('should process payment successfully', async () => {
      const mockReservation = {
        id: 1,
        huesped_id: 5,
        precio_total: 5000,
        fecha_checkin: '2025-12-20',
        fecha_checkout: '2025-12-25'
      };

      const mockPayment = {
        id: 1,
        numero_tarjeta_ultimos_4: '0366'
      };

      Reservation.obtenerPorId.mockResolvedValueOnce(mockReservation);
      Payment.obtenerPagoPorReserva.mockResolvedValueOnce(null);
      Payment.procesarPagoSimulado.mockResolvedValueOnce({ pago: mockPayment });
      Reservation.actualizarNumeroTarjeta.mockResolvedValueOnce({});

      const req = {
        body: {
          reservaId: 1,
          numeroTarjeta: '4532015112830366',
          cvv: '123',
          mesExpiracion: '12',
          anioExpiracion: '2026',
          nombreTitular: 'John Doe'
        },
        userId: 5
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await paymentController.procesarPago(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: 'Pago procesado exitosamente'
        })
      );
    });

    test('should reject payment with missing required fields', async () => {
      const req = {
        body: {
          reservaId: 1,
          numeroTarjeta: '4532015112830366'
          // missing other required fields
        },
        userId: 5
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await paymentController.procesarPago(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('campos requeridos') })
      );
    });

    test('should reject payment for non-existing reservation', async () => {
      Reservation.obtenerPorId.mockResolvedValueOnce(null);

      const req = {
        body: {
          reservaId: 999,
          numeroTarjeta: '4532015112830366',
          cvv: '123',
          mesExpiracion: '12',
          anioExpiracion: '2026',
          nombreTitular: 'John Doe'
        },
        userId: 5
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await paymentController.procesarPago(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('no encontrada') })
      );
    });

    test('should reject payment if user is not reservation owner', async () => {
      const mockReservation = {
        id: 1,
        huesped_id: 99, // Different user
        precio_total: 5000
      };

      Reservation.obtenerPorId.mockResolvedValueOnce(mockReservation);

      const req = {
        body: {
          reservaId: 1,
          numeroTarjeta: '4532015112830366',
          cvv: '123',
          mesExpiracion: '12',
          anioExpiracion: '2026',
          nombreTitular: 'John Doe'
        },
        userId: 5 // Different from huesped_id
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await paymentController.procesarPago(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('No tienes permiso') })
      );
    });

    test('should reject payment if reservation already paid', async () => {
      const mockReservation = {
        id: 1,
        huesped_id: 5,
        precio_total: 5000
      };

      const existingPayment = {
        id: 1,
        estado: 'completado'
      };

      Reservation.obtenerPorId.mockResolvedValueOnce(mockReservation);
      Payment.obtenerPagoPorReserva.mockResolvedValueOnce(existingPayment);

      const req = {
        body: {
          reservaId: 1,
          numeroTarjeta: '4532015112830366',
          cvv: '123',
          mesExpiracion: '12',
          anioExpiracion: '2026',
          nombreTitular: 'John Doe'
        },
        userId: 5
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await paymentController.procesarPago(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('ya tiene un pago') })
      );
    });

    test('should reject payment with invalid card', async () => {
      const mockReservation = {
        id: 1,
        huesped_id: 5,
        precio_total: 5000
      };

      Reservation.obtenerPorId.mockResolvedValueOnce(mockReservation);
      Payment.obtenerPagoPorReserva.mockResolvedValueOnce(null);
      Payment.procesarPagoSimulado.mockRejectedValueOnce(
        new Error('Número de tarjeta inválido')
      );

      const req = {
        body: {
          reservaId: 1,
          numeroTarjeta: '123456789', // Invalid card
          cvv: '123',
          mesExpiracion: '12',
          anioExpiracion: '2026',
          nombreTitular: 'John Doe'
        },
        userId: 5
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await paymentController.procesarPago(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });

    test('should update reservation with card last 4 digits', async () => {
      const mockReservation = {
        id: 1,
        huesped_id: 5,
        precio_total: 5000,
        fecha_checkin: '2025-12-20',
        fecha_checkout: '2025-12-25'
      };

      const mockPayment = {
        id: 1,
        numero_tarjeta_ultimos_4: '0366'
      };

      Reservation.obtenerPorId.mockResolvedValueOnce(mockReservation);
      Payment.obtenerPagoPorReserva.mockResolvedValueOnce(null);
      Payment.procesarPagoSimulado.mockResolvedValueOnce({ pago: mockPayment });
      Reservation.actualizarNumeroTarjeta.mockResolvedValueOnce({});

      const req = {
        body: {
          reservaId: 1,
          numeroTarjeta: '4532015112830366',
          cvv: '123',
          mesExpiracion: '12',
          anioExpiracion: '2026',
          nombreTitular: 'John Doe'
        },
        userId: 5
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await paymentController.procesarPago(req, res);

      expect(Reservation.actualizarNumeroTarjeta).toHaveBeenCalledWith(1, '0366');
    });
  });

  // ==================== PRUEBAS: obtenerPagoPorReserva() ====================

  describe('obtenerPagoPorReserva() - Get Payment by Reservation', () => {

    test('should return payment for reservation', async () => {
      const mockPayment = {
        id: 1,
        reserva_id: 10,
        monto: 5000,
        estado: 'completado'
      };

      Payment.obtenerPagoPorReserva.mockResolvedValueOnce(mockPayment);

      const req = {
        params: { reservaId: 10 }
      };

      const res = {
        json: jest.fn()
      };

      await paymentController.obtenerPagoPorReserva(req, res);

      expect(res.json).toHaveBeenCalledWith({ pago: mockPayment });
    });

    test('should return 404 if payment not found', async () => {
      Payment.obtenerPagoPorReserva.mockResolvedValueOnce(null);

      const req = {
        params: { reservaId: 999 }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await paymentController.obtenerPagoPorReserva(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('No se encontró') })
      );
    });

    test('should handle database errors', async () => {
      Payment.obtenerPagoPorReserva.mockRejectedValueOnce(new Error('DB error'));

      const req = {
        params: { reservaId: 10 }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await paymentController.obtenerPagoPorReserva(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==================== PRUEBAS: obtenerMisPagos() ====================

  describe('obtenerMisPagos() - Get User Payment History', () => {

    test('should return all user payments', async () => {
      const mockPayments = [
        { id: 1, monto: 5000 },
        { id: 2, monto: 3000 }
      ];

      Payment.obtenerPagosUsuario.mockResolvedValueOnce(mockPayments);

      const req = { userId: 5 };
      const res = {
        json: jest.fn()
      };

      await paymentController.obtenerMisPagos(req, res);

      expect(res.json).toHaveBeenCalledWith({
        total: 2,
        pagos: mockPayments
      });
    });

    test('should return empty list if user has no payments', async () => {
      Payment.obtenerPagosUsuario.mockResolvedValueOnce([]);

      const req = { userId: 5 };
      const res = {
        json: jest.fn()
      };

      await paymentController.obtenerMisPagos(req, res);

      expect(res.json).toHaveBeenCalledWith({
        total: 0,
        pagos: []
      });
    });

    test('should handle database errors', async () => {
      Payment.obtenerPagosUsuario.mockRejectedValueOnce(new Error('DB error'));

      const req = { userId: 5 };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await paymentController.obtenerMisPagos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('should call obtenerPagosUsuario with correct userId', async () => {
      Payment.obtenerPagosUsuario.mockResolvedValueOnce([]);

      const req = { userId: 42 };
      const res = {
        json: jest.fn()
      };

      await paymentController.obtenerMisPagos(req, res);

      expect(Payment.obtenerPagosUsuario).toHaveBeenCalledWith(42);
    });
  });

});
