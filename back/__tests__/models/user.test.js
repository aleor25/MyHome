const User = require('../../models/user');
const pool = require('../../config/database');
const bcrypt = require('bcryptjs');

jest.mock('../../config/database');
jest.mock('bcryptjs');

describe('User Model Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== PRUEBAS: crearUsuario() ====================

  describe('crearUsuario() - Create User', () => {

    test('should create a new user with hashed password', async () => {
      const hashedPassword = '$2a$10$hashedpassword123';
      const mockUser = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        tipo_usuario: 'huesped',
        fecha_registro: '2025-11-18T00:00:00'
      };

      bcrypt.hash.mockResolvedValueOnce(hashedPassword);
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.crearUsuario(
        'Juan Pérez',
        'juan@example.com',
        'password123',
        '555-1234',
        'huesped'
      );

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usuarios'),
        ['Juan Pérez', 'juan@example.com', hashedPassword, '555-1234', 'huesped']
      );
    });

    test('should use bcryptjs with 10 salt rounds', async () => {
      const hashedPassword = '$2a$10$encrypted';
      bcrypt.hash.mockResolvedValueOnce(hashedPassword);
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await User.crearUsuario('John Doe', 'john@example.com', 'secret123', '555-5555', 'propietario');

      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
    });

    test('should not return password hash in response', async () => {
      bcrypt.hash.mockResolvedValueOnce('hashedpass');
      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'john@example.com',
        tipo_usuario: 'huesped'
      };
      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.crearUsuario('John', 'john@example.com', 'pass', '555', 'huesped');

      expect(result.password).toBeUndefined();
    });

    test('should throw error when database fails', async () => {
      bcrypt.hash.mockResolvedValueOnce('hashedpass');
      pool.query.mockRejectedValueOnce(new Error('Duplicate email'));

      await expect(User.crearUsuario('John', 'john@example.com', 'pass', '555', 'huesped'))
        .rejects.toThrow('Duplicate email');
    });

    test('should throw error when hashing fails', async () => {
      bcrypt.hash.mockRejectedValueOnce(new Error('Bcrypt error'));

      await expect(User.crearUsuario('John', 'john@example.com', 'pass', '555', 'huesped'))
        .rejects.toThrow('Bcrypt error');
    });
  });

  // ==================== PRUEBAS: verificarPassword() ====================

  describe('verificarPassword() - Verify Password', () => {

    test('should return true for correct password', async () => {
      bcrypt.compare.mockResolvedValueOnce(true);

      const result = await User.verificarPassword('password123', '$2a$10$hashedpass');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', '$2a$10$hashedpass');
    });

    test('should return false for incorrect password', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);

      const result = await User.verificarPassword('wrongpassword', '$2a$10$hashedpass');

      expect(result).toBe(false);
    });

    test('should use bcryptjs compare function', async () => {
      bcrypt.compare.mockResolvedValueOnce(true);

      await User.verificarPassword('test123', 'hashed');

      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });

    test('should handle bcrypt comparison errors', async () => {
      bcrypt.compare.mockRejectedValueOnce(new Error('Bcrypt error'));

      await expect(User.verificarPassword('pass', 'hash'))
        .rejects.toThrow('Bcrypt error');
    });
  });

  // ==================== PRUEBAS: obtenerPorEmail() ====================

  describe('obtenerPorEmail() - Get User by Email', () => {

    test('should return user by email', async () => {
      const mockUser = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@example.com',
        tipo_usuario: 'huesped'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.obtenerPorEmail('juan@example.com');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE email = $1',
        ['juan@example.com']
      );
    });

    test('should return undefined for non-existing email', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.obtenerPorEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });

    test('should be case-sensitive for email search', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await User.obtenerPorEmail('JUAN@EXAMPLE.COM');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['JUAN@EXAMPLE.COM']
      );
    });
  });

  // ==================== PRUEBAS: obtenerPorId() ====================

  describe('obtenerPorId() - Get User by ID', () => {

    test('should return user by ID without password', async () => {
      const mockUser = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@example.com',
        telefono: '555-1234',
        tipo_usuario: 'huesped',
        fecha_registro: '2025-11-18'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.obtenerPorId(1);

      expect(result).toEqual(mockUser);
      expect(result.password).toBeUndefined();
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nombre, email'),
        [1]
      );
    });

    test('should return undefined for non-existing user', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.obtenerPorId(999);

      expect(result).toBeUndefined();
    });

    test('should include user type in response', async () => {
      const mockUser = {
        id: 1,
        tipo_usuario: 'propietario'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.obtenerPorId(1);

      expect(result.tipo_usuario).toBe('propietario');
    });
  });

  // ==================== PRUEBAS: actualizarPerfil() ====================

  describe('actualizarPerfil() - Update Profile', () => {

    test('should update user profile successfully', async () => {
      const mockUpdatedUser = {
        id: 1,
        nombre: 'Juan Updated',
        email: 'juan@example.com',
        telefono: '555-5678'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUpdatedUser] });

      const result = await User.actualizarPerfil(1, 'Juan Updated', '555-5678');

      expect(result).toEqual(mockUpdatedUser);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE usuarios'),
        ['Juan Updated', '555-5678', 1]
      );
    });

    test('should not return password in updated response', async () => {
      const mockUpdatedUser = {
        id: 1,
        nombre: 'John',
        email: 'john@example.com'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUpdatedUser] });

      const result = await User.actualizarPerfil(1, 'John', '555-1234');

      expect(result.password).toBeUndefined();
    });

    test('should throw error when update fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Update failed'));

      await expect(User.actualizarPerfil(1, 'John', '555'))
        .rejects.toThrow('Update failed');
    });
  });

  // ==================== PRUEBAS: cambiarContrasena() ====================

  describe('cambiarContrasena() - Change Password', () => {

    test('should change user password', async () => {
      const newHashedPassword = '$2a$10$newhashedpass';
      const mockUpdatedUser = { id: 1 };

      pool.query.mockResolvedValueOnce({ rows: [mockUpdatedUser] });

      const result = await User.cambiarContrasena(1, newHashedPassword);

      expect(result).toEqual(mockUpdatedUser);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id',
        [newHashedPassword, 1]
      );
    });

    test('should accept pre-hashed password', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await User.cambiarContrasena(1, '$2a$10$already_hashed_password');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['$2a$10$already_hashed_password', 1]
      );
    });

    test('should throw error when database fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(User.cambiarContrasena(1, 'newhash'))
        .rejects.toThrow('Database error');
    });
  });

  // ==================== PRUEBAS: obtenerConPassword() ====================

  describe('obtenerConPassword() - Get User with Password', () => {

    test('should return user with password hash', async () => {
      const mockUser = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@example.com',
        password: '$2a$10$hashedpassword'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await User.obtenerConPassword(1);

      expect(result).toEqual(mockUser);
      expect(result.password).toBeDefined();
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE id = $1',
        [1]
      );
    });

    test('should return undefined for non-existing user', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await User.obtenerConPassword(999);

      expect(result).toBeUndefined();
    });
  });

});
