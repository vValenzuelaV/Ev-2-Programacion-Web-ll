import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { apiReference } from '@scalar/express-api-reference';
import { config } from './config/env.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import { errorHandler, AppError } from './middlewares/error.middleware.js';
import apiRouter from './routes/index.js';
import { openApiSpec } from './docs/openapi.js';

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      
      if (!origin) return callback(null, true);

      if (config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) {
        return callback(null, true);
      }

      callback(new AppError(`Acceso CORS denegado para el origen: ${origin}`, 403));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/api', globalLimiter);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});

const scalarMiddleware = apiReference({
  spec: {
    content: openApiSpec,
  },
  theme: 'purple',
});

app.use('/reference', scalarMiddleware);
app.use('/docs', scalarMiddleware);

app.use('/api', apiRouter);

app.get('/', (_req, res) => {
  res.json({
    message: 'Bienvenido a la API de la Tienda de Instrumentos Musicales',
    docs: '/reference',
    health: '/api/health',
  });
});

app.use((req, _res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);
