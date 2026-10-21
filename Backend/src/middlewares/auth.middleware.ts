import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { PayloadJwt, RolUsuario } from '../types/index.js';
import { AppError } from './error.middleware.js';

export function authenticateJWT(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No se proporcionó token de autenticación (Bearer token requerido)', 401);
  }

  const token = authHeader.substring(7).trim();

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    
    const payload: PayloadJwt = {
      usuarioId: decoded.usuarioId || decoded.userId,
      correo: decoded.correo || decoded.email,
      rol: (decoded.rol === 'admin' ? 'administrador' : decoded.rol === 'seller' ? 'vendedor' : decoded.rol === 'customer' ? 'cliente' : decoded.rol) as RolUsuario,
      nombre: decoded.nombre || decoded.name,
    };

    req.usuario = payload;
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('El token de autenticación ha expirado', 401);
    }
    throw new AppError('Token de autenticación inválido', 401);
  }
}

export function authorizeRoles(...allowedRoles: (RolUsuario | string)[]) {
  const normalizedRoles = allowedRoles.map(r => {
    if (r === 'admin') return 'administrador';
    if (r === 'seller') return 'vendedor';
    if (r === 'customer') return 'cliente';
    return r;
  });

  return (req: Request, _res: Response, next: NextFunction): void => {
    const usuario = req.usuario || req.user;
    if (!usuario) {
      throw new AppError('Usuario no autenticado', 401);
    }

    if (!normalizedRoles.includes(usuario.rol)) {
      throw new AppError(
        `Acceso denegado: Se requiere uno de los siguientes roles: ${normalizedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
}

export const hasRole = authorizeRoles;
