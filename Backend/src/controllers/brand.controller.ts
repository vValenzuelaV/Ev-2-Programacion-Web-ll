import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { Marca } from '../types/index.js';

export function getAllBrands(_req: Request, res: Response, next: NextFunction): void {
  try {
    const filas = db.prepare('SELECT * FROM marcas ORDER BY nombre ASC').all() as any[];
    const marcas = filas.map(m => ({
      id: m.id,
      nombre: m.nombre,
      pais_origen: m.pais_origen,
      sitio_web: m.sitio_web,
      creado_en: m.creado_en,
      name: m.nombre,
      country: m.pais_origen,
      website: m.sitio_web,
      created_at: m.creado_en,
    }));

    res.json({
      success: true,
      total: marcas.length,
      count: marcas.length,
      data: marcas,
    });
  } catch (error) {
    next(error);
  }
}

export function getBrandById(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = Number(req.params.id);
    const m = db.prepare('SELECT * FROM marcas WHERE id = ?').get(id) as any;

    if (!m) {
      throw new AppError('Marca no encontrada', 404);
    }

    const marca = {
      id: m.id,
      nombre: m.nombre,
      pais_origen: m.pais_origen,
      sitio_web: m.sitio_web,
      creado_en: m.creado_en,
      name: m.nombre,
      country: m.pais_origen,
      website: m.sitio_web,
      created_at: m.creado_en,
    };

    res.json({
      success: true,
      data: marca,
    });
  } catch (error) {
    next(error);
  }
}

export function createBrand(req: Request, res: Response, next: NextFunction): void {
  try {
    const nombre = req.body.nombre || req.body.name;
    const pais_origen = req.body.pais_origen || req.body.country || '';
    const sitio_web = req.body.sitio_web || req.body.website || '';

    if (!nombre) {
      throw new AppError('El nombre de la marca es obligatorio', 400);
    }

    const resultado = db
      .prepare('INSERT INTO marcas (nombre, pais_origen, sitio_web) VALUES (?, ?, ?)')
      .run(nombre, pais_origen, sitio_web);

    const m = db
      .prepare('SELECT * FROM marcas WHERE id = ?')
      .get(resultado.lastInsertRowid) as any;

    const nuevaMarca = {
      id: m.id,
      nombre: m.nombre,
      pais_origen: m.pais_origen,
      sitio_web: m.sitio_web,
      creado_en: m.creado_en,
      name: m.nombre,
      country: m.pais_origen,
      website: m.sitio_web,
      created_at: m.creado_en,
    };

    res.status(201).json({
      success: true,
      mensaje: 'Marca creada exitosamente',
      message: 'Marca creada exitosamente',
      data: nuevaMarca,
    });
  } catch (error) {
    next(error);
  }
}
