// Jest setup file for test environment
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/lmsc_test'
process.env.CORS_ORIGIN = 'http://localhost:3000'
