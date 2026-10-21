import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { config } from '../config/env.js';
import { AppError } from '../middlewares/error.middleware.js';
import { Usuario, PayloadJwt, RolUsuario } from '../types/index.js';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const correo = req.body.correo || req.body.email;
    const clave = req.body.clave || req.body.password;

    const usuario = db.prepare('SELECT * FROM usuarios WHERE correo = ?').get(correo) as Usuario | undefined;

    if (!usuario || !usuario.clave) {
      throw new AppError('Credenciales inválidas (correo o contraseña incorrectos)', 401);
    }

    const coincide = await bcrypt.compare(clave, usuario.clave);
    if (!coincide) {
      throw new AppError('Credenciales inválidas (correo o contraseña incorrectos)', 401);
    }

    const payload: PayloadJwt = {
      usuarioId: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);

    const datosUsuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      
      name: usuario.nombre,
      email: usuario.correo,
      role: usuario.rol,
    };

    res.json({
      success: true,
      mensaje: 'Inicio de sesión exitoso',
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: datosUsuario,
        user: datosUsuario,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const nombre = req.body.nombre || req.body.name;
    const correo = req.body.correo || req.body.email;
    const clave = req.body.clave || req.body.password;
    let rol = req.body.rol || req.body.role || 'cliente';

    if (rol === 'admin') rol = 'administrador';
    if (rol === 'seller') rol = 'vendedor';
    if (rol === 'customer') rol = 'cliente';

    
    const existe = db.prepare('SELECT id FROM usuarios WHERE correo = ?').get(correo);
    if (existe) {
      throw new AppError('El correo electrónico ya está registrado', 409);
    }

    const claveHasheada = await bcrypt.hash(clave, 10);

    const resultado = db
      .prepare('INSERT INTO usuarios (nombre, correo, clave, rol) VALUES (?, ?, ?, ?)')
      .run(nombre, correo, claveHasheada, rol);

    const nuevoUsuarioId = Number(resultado.lastInsertRowid);

    const payload: PayloadJwt = {
      usuarioId: nuevoUsuarioId,
      correo,
      rol: rol as RolUsuario,
      nombre,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);

    const datosUsuario = {
      id: nuevoUsuarioId,
      nombre,
      correo,
      rol: rol as RolUsuario,
      name: nombre,
      email: correo,
      role: rol as RolUsuario,
    };

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado exitosamente',
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        usuario: datosUsuario,
        user: datosUsuario,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuarioAuth = req.usuario || req.user;
    if (!usuarioAuth) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const usuario = db
      .prepare('SELECT id, nombre, correo, rol, creado_en FROM usuarios WHERE id = ?')
      .get(usuarioAuth.usuarioId) as Omit<Usuario, 'clave'> | undefined;

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      data: {
        ...usuario,
        name: usuario.nombre,
        email: usuario.correo,
        role: usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
}
