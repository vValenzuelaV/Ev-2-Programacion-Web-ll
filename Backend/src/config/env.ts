import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_music_store_2026_evaluacion2',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(origin => origin.trim()),
  databasePath: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'musicstore.sqlite'),
  dbDialect: process.env.DB_DIALECT || 'sqlite', 
  dbServer: process.env.DB_SERVER || 'localhost',
  dbPort: parseInt(process.env.DB_PORT || '1433', 10),
  dbUser: process.env.DB_USER !== undefined ? process.env.DB_USER : 'sa',
  dbPassword: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  dbName: process.env.DB_NAME || 'TiendaMusicaDB',
  dbEncrypt: process.env.DB_ENCRYPT === 'true',
  dbTrustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};
