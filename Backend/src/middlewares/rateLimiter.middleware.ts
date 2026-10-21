import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

export const globalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde.',
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Demasiados intentos de autenticación. Por seguridad, intente en unos momentos.',
    },
  },
});

