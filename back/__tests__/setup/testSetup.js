// Test Setup - Configuración global para las pruebas unitarias

// Mock de la base de datos
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
  end: jest.fn(),
}));

// Suprimir logs durante las pruebas (opcional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

// Configurar variable de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.PORT = '3001';

// Timeout global para las pruebas
jest.setTimeout(10000);
