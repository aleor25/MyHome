const request = require('supertest');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

jest.mock('../../models/user');
jest.mock('jsonwebtoken');

// Mock Express app
let app;
const authController = require('../../controllers/authController');

describe('Auth Controller Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  // ==================== PRUEBAS: registro() ====================

  describe('registro() - User Registration', () => {

    test('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@example.com',
        tipo_usuario: 'huesped'
      };

      const mockToken = 'valid.jwt.token';

      User.obtenerPorEmail.mockResolvedValueOnce(null);
      User.crearUsuario.mockResolvedValueOnce(mockUser);
      jwt.sign.mockReturnValueOnce(mockToken);

      // Simulate request/response
      const req = {
        body: {
          nombre: 'Juan',
          email: 'juan@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          telefono: '555-1234',
          tipoUsuario: 'huesped'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.registro(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Usuario registrado exitosamente',
        usuario: mockUser,
        token: mockToken
      });
    });

    test('should reject registration with mismatched passwords', async () => {
      const req = {
        body: {
          nombre: 'Juan',
          email: 'juan@example.com',
          password: 'password123',
          confirmPassword: 'password456',
          tipoUsuario: 'huesped'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.registro(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('no coinciden') })
      );
    });

    test('should reject registration with duplicate email', async () => {
      const existingUser = { id: 1, email: 'juan@example.com' };
      User.obtenerPorEmail.mockResolvedValueOnce(existingUser);

      const req = {
        body: {
          nombre: 'Juan',
          email: 'juan@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          tipoUsuario: 'huesped'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.registro(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('ya está registrado') })
      );
    });

    test('should reject registration with invalid user type', async () => {
      const req = {
        body: {
          nombre: 'Juan',
          email: 'juan@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          tipoUsuario: 'admin'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.registro(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('inválido') })
      );
    });

    test('should reject registration with missing required fields', async () => {
      const req = {
        body: {
          nombre: 'Juan',
          email: 'juan@example.com'
          // missing password, confirmPassword, tipoUsuario
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.registro(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('requeridos') })
      );
    });

    test('should generate JWT token with correct claims', async () => {
      const mockUser = {
        id: 42,
        nombre: 'Juan',
        email: 'juan@example.com',
        tipo_usuario: 'propietario'
      };

      User.obtenerPorEmail.mockResolvedValueOnce(null);
      User.crearUsuario.mockResolvedValueOnce(mockUser);
      jwt.sign.mockReturnValueOnce('token123');

      const req = {
        body: {
          nombre: 'Juan',
          email: 'juan@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          telefono: '555-1234',
          tipoUsuario: 'propietario'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.registro(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 42, tipo_usuario: 'propietario' },
        'test-secret',
        { expiresIn: '7d' }
      );
    });

    test('should handle database errors gracefully', async () => {
      User.obtenerPorEmail.mockRejectedValueOnce(new Error('DB error'));

      const req = {
        body: {
          nombre: 'Juan',
          email: 'juan@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          tipoUsuario: 'huesped'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.registro(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Error') })
      );
    });
  });

  // ==================== PRUEBAS: login() ====================

  describe('login() - User Login', () => {

    test('should login user successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@example.com',
        password: 'hashed_password',
        tipo_usuario: 'huesped'
      };

      const mockToken = 'valid.jwt.token';

      User.obtenerPorEmail.mockResolvedValueOnce(mockUser);
      User.verificarPassword.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce(mockToken);

      const req = {
        body: {
          email: 'juan@example.com',
          password: 'password123'
        }
      };

      const res = {
        status: jest.fn(),
        json: jest.fn().mockReturnThis()
      };

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensaje: 'Inicio de sesión exitoso',
          usuario: expect.objectContaining({
            id: 1,
            email: 'juan@example.com'
          }),
          token: mockToken
        })
      );
    });

    test('should reject login with non-existing email', async () => {
      User.obtenerPorEmail.mockResolvedValueOnce(null);

      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Credenciales inválidas' })
      );
    });

    test('should reject login with wrong password', async () => {
      const mockUser = {
        id: 1,
        email: 'juan@example.com',
        password: 'hashed_password'
      };

      User.obtenerPorEmail.mockResolvedValueOnce(mockUser);
      User.verificarPassword.mockResolvedValueOnce(false);

      const req = {
        body: {
          email: 'juan@example.com',
          password: 'wrongpassword'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Credenciales inválidas' })
      );
    });

    test('should reject login with missing credentials', async () => {
      const req = {
        body: {
          email: 'juan@example.com'
          // missing password
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('requeridos') })
      );
    });

    test('should not expose password hash in response', async () => {
      const mockUser = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@example.com',
        password: 'hashed_password_should_not_be_exposed',
        tipo_usuario: 'huesped'
      };

      User.obtenerPorEmail.mockResolvedValueOnce(mockUser);
      User.verificarPassword.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('token');

      const req = {
        body: {
          email: 'juan@example.com',
          password: 'password123'
        }
      };

      const res = {
        status: jest.fn(),
        json: jest.fn().mockReturnThis()
      };

      await authController.login(req, res);

      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.usuario.password).toBeUndefined();
    });

    test('should handle database errors gracefully', async () => {
      User.obtenerPorEmail.mockRejectedValueOnce(new Error('DB error'));

      const req = {
        body: {
          email: 'juan@example.com',
          password: 'password123'
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Error') })
      );
    });

    test('should generate JWT with 7 day expiration', async () => {
      User.obtenerPorEmail.mockResolvedValueOnce({
        id: 1,
        email: 'juan@example.com',
        password: 'hash'
      });
      User.verificarPassword.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('token');

      const req = {
        body: {
          email: 'juan@example.com',
          password: 'password123'
        }
      };

      const res = {
        status: jest.fn(),
        json: jest.fn().mockReturnThis()
      };

      await authController.login(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'test-secret',
        { expiresIn: '7d' }
      );
    });
  });

});
