import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config/env.js';

export class AppError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  
  if (err instanceof ZodError) {
    const details = err.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos proporcionados no son válidos',
        details,
      },
    });
    return;
  }

  
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR',
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const sqliteErr = err as { code: string; message: string };
    if (sqliteErr.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({
        success: false,
        error: {
          code: 'RESOURCE_CONFLICT',
          message: 'El registro ya existe o viola una restricción única',
        },
      });
      return;
    }
    if (sqliteErr.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Referencia a un recurso relacionado que no existe',
        },
      });
      return;
    }
  }

  
  console.error('[UNHANDLED_ERROR]:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocurrió un error interno en el servidor',
      ...(config.nodeEnv === 'development' && err instanceof Error
        ? { devMessage: err.message }
        : {}),
    },
  });
}
