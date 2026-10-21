import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { Categoria } from '../types/index.js';

export function getAllCategories(_req: Request, res: Response, next: NextFunction): void {
  try {
    const filas = db.prepare('SELECT * FROM categorias ORDER BY nombre ASC').all() as any[];
    const categorias = filas.map(c => ({
      id: c.id,
      nombre: c.nombre,
      slug: c.slug,
      descripcion: c.descripcion,
      icono: c.icono,
      creado_en: c.creado_en,
      name: c.nombre,
      description: c.descripcion,
      icon: c.icono,
      created_at: c.creado_en,
    }));

    res.json({
      success: true,
      total: categorias.length,
      count: categorias.length,
      data: categorias,
    });
  } catch (error) {
    next(error);
  }
}

export function getCategoryById(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = Number(req.params.id);
    const c = db.prepare('SELECT * FROM categorias WHERE id = ?').get(id) as any;

    if (!c) {
      throw new AppError('Categoría no encontrada', 404);
    }

    const categoria = {
      id: c.id,
      nombre: c.nombre,
      slug: c.slug,
      descripcion: c.descripcion,
      icono: c.icono,
      creado_en: c.creado_en,
      name: c.nombre,
      description: c.descripcion,
      icon: c.icono,
      created_at: c.creado_en,
    };

    res.json({
      success: true,
      data: categoria,
    });
  } catch (error) {
    next(error);
  }
}

export function createCategory(req: Request, res: Response, next: NextFunction): void {
  try {
    const nombre = req.body.nombre || req.body.name;
    const slug = req.body.slug;
    const descripcion = req.body.descripcion || req.body.description || '';
    const icono = req.body.icono || req.body.icon || '';

    if (!nombre || !slug) {
      throw new AppError('El nombre y el slug de la categoría son obligatorios', 400);
    }

    const resultado = db
      .prepare('INSERT INTO categorias (nombre, slug, descripcion, icono) VALUES (?, ?, ?, ?)')
      .run(nombre, slug, descripcion, icono);

    const c = db
      .prepare('SELECT * FROM categorias WHERE id = ?')
      .get(resultado.lastInsertRowid) as any;

    const nuevaCategoria = {
      id: c.id,
      nombre: c.nombre,
      slug: c.slug,
      descripcion: c.descripcion,
      icono: c.icono,
      creado_en: c.creado_en,
      name: c.nombre,
      description: c.descripcion,
      icon: c.icono,
      created_at: c.creado_en,
    };

    res.status(201).json({
      success: true,
      mensaje: 'Categoría creada exitosamente',
      message: 'Categoría creada exitosamente',
      data: nuevaCategoria,
    });
  } catch (error) {
    next(error);
  }
}
