import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { Instrumento } from '../types/index.js';

export function getInstruments(req: Request, res: Response, next: NextFunction): void {
  try {
    const query = req.query as Record<string, any>;
    const pagina = Number(query.pagina || query.page) || 1;
    const limite = Number(query.limite || query.limit) || 10;
    const offset = (pagina - 1) * limite;

    const condiciones: string[] = [];
    const params: (string | number)[] = [];

    
    const activo = query.esta_activo !== undefined ? query.esta_activo : query.is_active;
    if (activo !== undefined) {
      condiciones.push('i.esta_activo = ?');
      params.push(Number(activo));
    }

    
    const termino = query.q || query.buscar;
    if (termino) {
      condiciones.push('(i.nombre LIKE ? OR i.descripcion LIKE ? OR i.codigo_sku LIKE ?)');
      const patron = `%${termino}%`;
      params.push(patron, patron, patron);
    }

    
    if (query.categoria_id) {
      condiciones.push('i.categoria_id = ?');
      params.push(Number(query.categoria_id));
    }

    
    if (query.marca_id) {
      condiciones.push('i.marca_id = ?');
      params.push(Number(query.marca_id));
    }

    
    const cond = query.condicion || query.condition;
    if (cond) {
      condiciones.push('i.condicion = ?');
      params.push(cond === 'new' ? 'nuevo' : cond === 'used' ? 'usado' : cond === 'refurbished' ? 'reacondicionado' : cond);
    }

    
    const precioMin = query.precio_min !== undefined ? query.precio_min : query.minPrice;
    if (precioMin !== undefined) {
      condiciones.push('i.precio >= ?');
      params.push(Number(precioMin));
    }

    
    const precioMax = query.precio_max !== undefined ? query.precio_max : query.maxPrice;
    if (precioMax !== undefined) {
      condiciones.push('i.precio <= ?');
      params.push(Number(precioMax));
    }

    const whereSql = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    
    const countSql = `SELECT COUNT(*) as total FROM instrumentos i ${whereSql}`;
    const totalFila = db.prepare(countSql).get(...params) as { total: number };
    const total = totalFila ? totalFila.total : 0;
    const paginasTotales = Math.ceil(total / limite) || 1;

    
    const camposOrden: Record<string, string> = {
      id: 'i.id',
      nombre: 'i.nombre',
      name: 'i.nombre',
      precio: 'i.precio',
      price: 'i.precio',
      stock: 'i.stock',
      creado_en: 'i.creado_en',
      created_at: 'i.creado_en',
    };
    const campoPedir = query.ordenar_por || query.sortBy || 'id';
    const campoSql = camposOrden[campoPedir] || 'i.id';
    const sentido = (query.orden || query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    
    const sqlListado = `
      SELECT 
        i.*,
        c.nombre as categoria_nombre, c.slug as categoria_slug, c.icono as categoria_icono,
        m.nombre as marca_nombre, m.pais_origen as marca_pais, m.sitio_web as marca_web,
        s.material, s.color, s.acabado, s.meses_garantia, s.peso_kg
      FROM instrumentos i
      LEFT JOIN categorias c ON i.categoria_id = c.id
      LEFT JOIN marcas m ON i.marca_id = m.id
      LEFT JOIN especificaciones_instrumento s ON i.id = s.instrumento_id
      ${whereSql}
      ORDER BY ${campoSql} ${sentido}
      LIMIT ? OFFSET ?
    `;

    const filas = db.prepare(sqlListado).all(...params, limite, offset) as any[];

    const instrumentos = filas.map(fila => ({
      id: fila.id,
      nombre: fila.nombre,
      codigo_sku: fila.codigo_sku,
      categoria_id: fila.categoria_id,
      marca_id: fila.marca_id,
      precio: fila.precio,
      stock: fila.stock,
      condicion: fila.condicion,
      descripcion: fila.descripcion,
      imagen_url: fila.imagen_url,
      esta_activo: fila.esta_activo,
      creado_en: fila.creado_en,
      actualizado_en: fila.actualizado_en,
      
      name: fila.nombre,
      sku: fila.codigo_sku,
      price: fila.precio,
      condition: fila.condicion,
      description: fila.descripcion,
      image_url: fila.imagen_url,
      is_active: fila.esta_activo,
      created_at: fila.creado_en,
      updated_at: fila.actualizado_en,
      categoria: fila.categoria_id
        ? {
            id: fila.categoria_id,
            nombre: fila.categoria_nombre,
            slug: fila.categoria_slug,
            descripcion: '',
            icono: fila.categoria_icono,
            creado_en: '',
            name: fila.categoria_nombre,
            icon: fila.categoria_icono,
          }
        : undefined,
      category: fila.categoria_id
        ? {
            id: fila.categoria_id,
            name: fila.categoria_nombre,
            slug: fila.categoria_slug,
            icon: fila.categoria_icono,
          }
        : undefined,
      marca: fila.marca_id
        ? {
            id: fila.marca_id,
            nombre: fila.marca_nombre,
            pais_origen: fila.marca_pais,
            sitio_web: fila.marca_web,
            creado_en: '',
            name: fila.marca_nombre,
            country: fila.marca_pais,
            website: fila.marca_web,
          }
        : undefined,
      brand: fila.marca_id
        ? {
            id: fila.marca_id,
            name: fila.marca_nombre,
            country: fila.marca_pais,
            website: fila.marca_web,
          }
        : undefined,
      especificaciones: fila.material !== null || fila.color !== null
        ? {
            instrumento_id: fila.id,
            material: fila.material,
            color: fila.color,
            acabado: fila.acabado,
            meses_garantia: fila.meses_garantia,
            peso_kg: fila.peso_kg,
            finish: fila.acabado,
            warranty_months: fila.meses_garantia,
            weight_kg: fila.peso_kg,
          }
        : undefined,
      specs: fila.material !== null || fila.color !== null
        ? {
            instrument_id: fila.id,
            material: fila.material,
            color: fila.color,
            finish: fila.acabado,
            warranty_months: fila.meses_garantia,
            weight_kg: fila.peso_kg,
          }
        : undefined,
    }));

    res.json({
      success: true,
      paginacion: {
        pagina,
        limite,
        total,
        paginasTotales,
        tieneSiguiente: pagina < paginasTotales,
        tienePrevio: pagina > 1,
      },
      pagination: {
        page: pagina,
        limit: limite,
        total,
        totalPages: paginasTotales,
        hasNext: pagina < paginasTotales,
        hasPrev: pagina > 1,
      },
      data: instrumentos,
    });
  } catch (error) {
    next(error);
  }
}

export function getInstrumentById(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = Number(req.params.id);

    const sqlDetalle = `
      SELECT 
        i.*,
        c.nombre as categoria_nombre, c.slug as categoria_slug, c.descripcion as categoria_desc, c.icono as categoria_icono,
        m.nombre as marca_nombre, m.pais_origen as marca_pais, m.sitio_web as marca_web,
        s.id as spec_id, s.material, s.color, s.acabado, s.meses_garantia, s.peso_kg
      FROM instrumentos i
      LEFT JOIN categorias c ON i.categoria_id = c.id
      LEFT JOIN marcas m ON i.marca_id = m.id
      LEFT JOIN especificaciones_instrumento s ON i.id = s.instrumento_id
      WHERE i.id = ?
    `;

    const fila = db.prepare(sqlDetalle).get(id) as any;

    if (!fila) {
      throw new AppError('Instrumento no encontrado', 404);
    }

    const instrumento = {
      id: fila.id,
      nombre: fila.nombre,
      codigo_sku: fila.codigo_sku,
      categoria_id: fila.categoria_id,
      marca_id: fila.marca_id,
      precio: fila.precio,
      stock: fila.stock,
      condicion: fila.condicion,
      descripcion: fila.descripcion,
      imagen_url: fila.imagen_url,
      esta_activo: fila.esta_activo,
      creado_en: fila.creado_en,
      actualizado_en: fila.actualizado_en,
      
      name: fila.nombre,
      sku: fila.codigo_sku,
      price: fila.precio,
      condition: fila.condicion,
      description: fila.descripcion,
      image_url: fila.imagen_url,
      is_active: fila.esta_activo,
      created_at: fila.creado_en,
      updated_at: fila.actualizado_en,
      categoria: {
        id: fila.categoria_id,
        nombre: fila.categoria_nombre,
        slug: fila.categoria_slug,
        descripcion: fila.categoria_desc,
        icono: fila.categoria_icono,
        creado_en: '',
        name: fila.categoria_nombre,
        icon: fila.categoria_icono,
      },
      category: {
        id: fila.categoria_id,
        name: fila.categoria_nombre,
        slug: fila.categoria_slug,
        description: fila.categoria_desc,
        icon: fila.categoria_icono,
      },
      marca: {
        id: fila.marca_id,
        nombre: fila.marca_nombre,
        pais_origen: fila.marca_pais,
        sitio_web: fila.marca_web,
        creado_en: '',
        name: fila.marca_nombre,
        country: fila.marca_pais,
        website: fila.marca_web,
      },
      brand: {
        id: fila.marca_id,
        name: fila.marca_nombre,
        country: fila.marca_pais,
        website: fila.marca_web,
      },
      especificaciones: {
        id: fila.spec_id,
        instrumento_id: fila.id,
        material: fila.material ?? '',
        color: fila.color ?? '',
        acabado: fila.acabado ?? '',
        meses_garantia: fila.meses_garantia ?? 12,
        peso_kg: fila.peso_kg ?? 0,
        finish: fila.acabado ?? '',
        warranty_months: fila.meses_garantia ?? 12,
        weight_kg: fila.peso_kg ?? 0,
      },
      specs: {
        id: fila.spec_id,
        instrument_id: fila.id,
        material: fila.material ?? '',
        color: fila.color ?? '',
        finish: fila.acabado ?? '',
        warranty_months: fila.meses_garantia ?? 12,
        weight_kg: fila.peso_kg ?? 0,
      },
    };

    res.json({
      success: true,
      data: instrumento,
    });
  } catch (error) {
    next(error);
  }
}

export function createInstrument(req: Request, res: Response, next: NextFunction): void {
  try {
    const nombre = req.body.nombre || req.body.name;
    const codigo_sku = req.body.codigo_sku || req.body.sku;
    const categoria_id = req.body.categoria_id;
    const marca_id = req.body.marca_id;
    const precio = req.body.precio !== undefined ? req.body.precio : req.body.price;
    const stock = req.body.stock ?? 0;
    let condicion = req.body.condicion || req.body.condition || 'nuevo';
    if (condicion === 'new') condicion = 'nuevo';
    if (condicion === 'used') condicion = 'usado';
    if (condicion === 'refurbished') condicion = 'reacondicionado';

    const descripcion = req.body.descripcion || req.body.description || '';
    const imagen_url = req.body.imagen_url || req.body.image_url || '';
    const esta_activo = req.body.esta_activo !== undefined ? req.body.esta_activo : (req.body.is_active !== undefined ? req.body.is_active : 1);
    const specs = req.body.especificaciones || req.body.specs;

    
    const catExiste = db.prepare('SELECT id FROM categorias WHERE id = ?').get(categoria_id);
    if (!catExiste) {
      throw new AppError(`La categoría con ID ${categoria_id} no existe`, 400);
    }

    const marcaExiste = db.prepare('SELECT id FROM marcas WHERE id = ?').get(marca_id);
    if (!marcaExiste) {
      throw new AppError(`La marca con ID ${marca_id} no existe`, 400);
    }

    
    const skuExiste = db.prepare('SELECT id FROM instrumentos WHERE codigo_sku = ?').get(codigo_sku);
    if (skuExiste) {
      throw new AppError(`Ya existe un instrumento con el SKU '${codigo_sku}'`, 409);
    }

    const transaccionCrear = db.transaction(() => {
      const insertar = db.prepare(`
        INSERT INTO instrumentos (nombre, codigo_sku, categoria_id, marca_id, precio, stock, condicion, descripcion, imagen_url, esta_activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const resInsert = insertar.run(
        nombre,
        codigo_sku,
        categoria_id,
        marca_id,
        precio,
        stock,
        condicion,
        descripcion,
        imagen_url,
        esta_activo
      );

      const instrumentoId = Number(resInsert.lastInsertRowid);

      if (specs) {
        const insertarSpecs = db.prepare(`
          INSERT INTO especificaciones_instrumento (instrumento_id, material, color, acabado, meses_garantia, peso_kg)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        insertarSpecs.run(
          instrumentoId,
          specs.material || '',
          specs.color || '',
          specs.acabado || specs.finish || '',
          specs.meses_garantia ?? specs.warranty_months ?? 12,
          specs.peso_kg ?? specs.weight_kg ?? 0
        );
      }

      return instrumentoId;
    });

    const nuevoId = transaccionCrear();

    req.params.id = String(nuevoId);
    getInstrumentById(req, res, next);
  } catch (error) {
    next(error);
  }
}

export function updateInstrument(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = Number(req.params.id);

    const actual = db.prepare('SELECT * FROM instrumentos WHERE id = ?').get(id) as any;
    if (!actual) {
      throw new AppError('Instrumento no encontrado', 404);
    }

    const nombre = req.body.nombre || req.body.name || actual.nombre;
    const codigo_sku = req.body.codigo_sku || req.body.sku || actual.codigo_sku;
    const categoria_id = req.body.categoria_id || actual.categoria_id;
    const marca_id = req.body.marca_id || actual.marca_id;
    const precio = req.body.precio !== undefined ? req.body.precio : (req.body.price !== undefined ? req.body.price : actual.precio);
    const stock = req.body.stock !== undefined ? req.body.stock : actual.stock;
    let condicion = req.body.condicion || req.body.condition || actual.condicion;
    if (condicion === 'new') condicion = 'nuevo';
    if (condicion === 'used') condicion = 'usado';
    if (condicion === 'refurbished') condicion = 'reacondicionado';

    const descripcion = req.body.descripcion !== undefined ? req.body.descripcion : (req.body.description !== undefined ? req.body.description : actual.descripcion);
    const imagen_url = req.body.imagen_url !== undefined ? req.body.imagen_url : (req.body.image_url !== undefined ? req.body.image_url : actual.imagen_url);
    const esta_activo = req.body.esta_activo !== undefined ? req.body.esta_activo : (req.body.is_active !== undefined ? req.body.is_active : actual.esta_activo);
    const specs = req.body.especificaciones || req.body.specs;

    if (codigo_sku !== actual.codigo_sku) {
      const skuCheck = db.prepare('SELECT id FROM instrumentos WHERE codigo_sku = ? AND id != ?').get(codigo_sku, id);
      if (skuCheck) {
        throw new AppError(`Ya existe otro instrumento con el SKU '${codigo_sku}'`, 409);
      }
    }

    const transaccionActualizar = db.transaction(() => {
      db.prepare(`
        UPDATE instrumentos
        SET nombre = ?, codigo_sku = ?, categoria_id = ?, marca_id = ?, precio = ?, stock = ?,
            condicion = ?, descripcion = ?, imagen_url = ?, esta_activo = ?, actualizado_en = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        nombre,
        codigo_sku,
        categoria_id,
        marca_id,
        precio,
        stock,
        condicion,
        descripcion,
        imagen_url,
        esta_activo,
        id
      );

      if (specs) {
        const specActual = db.prepare('SELECT id FROM especificaciones_instrumento WHERE instrumento_id = ?').get(id);
        const material = specs.material ?? null;
        const color = specs.color ?? null;
        const acabado = specs.acabado ?? specs.finish ?? null;
        const garantia = specs.meses_garantia ?? specs.warranty_months ?? null;
        const peso = specs.peso_kg ?? specs.weight_kg ?? null;

        if (specActual) {
          db.prepare(`
            UPDATE especificaciones_instrumento
            SET material = COALESCE(?, material),
                color = COALESCE(?, color),
                acabado = COALESCE(?, acabado),
                meses_garantia = COALESCE(?, meses_garantia),
                peso_kg = COALESCE(?, peso_kg)
            WHERE instrumento_id = ?
          `).run(material, color, acabado, garantia, peso, id);
        } else {
          db.prepare(`
            INSERT INTO especificaciones_instrumento (instrumento_id, material, color, acabado, meses_garantia, peso_kg)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(id, material || '', color || '', acabado || '', garantia ?? 12, peso ?? 0);
        }
      }
    });

    transaccionActualizar();

    getInstrumentById(req, res, next);
  } catch (error) {
    next(error);
  }
}

export function deleteInstrument(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = Number(req.params.id);
    const permanente = req.query.permanente === 'true' || req.query.permanent === 'true';

    const actual = db.prepare('SELECT id, nombre FROM instrumentos WHERE id = ?').get(id) as { id: number; nombre: string } | undefined;
    if (!actual) {
      throw new AppError('Instrumento no encontrado', 404);
    }

    if (permanente) {
      
      const tienePedidos = db.prepare('SELECT id FROM detalles_pedido WHERE instrumento_id = ? LIMIT 1').get(id);
      if (tienePedidos) {
        throw new AppError(
          `No se puede eliminar permanentemente el instrumento '${actual.nombre}' porque forma parte de órdenes de compra registradas. Para ocultarlo del catálogo, usa la desactivación (eliminación lógica).`,
          409
        );
      }

      db.prepare('DELETE FROM instrumentos WHERE id = ?').run(id);
      res.json({
        success: true,
        mensaje: `Instrumento '${actual.nombre}' eliminado permanentemente`,
        message: `Instrumento '${actual.nombre}' eliminado permanentemente`,
      });
    } else {
      db.prepare('UPDATE instrumentos SET esta_activo = 0, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?').run(id);
      res.json({
        success: true,
        mensaje: `Instrumento '${actual.nombre}' desactivado exitosamente (eliminación lógica)`,
        message: `Instrumento '${actual.nombre}' desactivado exitosamente (eliminación lógica)`,
      });
    }
  } catch (error) {
    next(error);
  }
}
