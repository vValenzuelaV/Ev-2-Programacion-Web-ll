import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { Pedido, DetallePedido } from '../types/index.js';

export function createOrder(req: Request, res: Response, next: NextFunction): void {
  try {
    const usuarioAuth = req.usuario || req.user;
    if (!usuarioAuth) {
      throw new AppError('Usuario no autenticado', 401);
    }
    const usuarioId = usuarioAuth.usuarioId;

    const articulos = req.body.detalles || req.body.items || [];

    if (!articulos || articulos.length === 0) {
      throw new AppError('El pedido debe incluir al menos un producto', 400);
    }

    const transaccionPedido = db.transaction(() => {
      let granTotal = 0;
      const itemsParaInsertar: {
        instrumento_id: number;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
      }[] = [];

      for (const item of articulos) {
        const instId = item.instrumento_id || item.instrument_id;
        const cant = item.cantidad || item.quantity || 1;

        const inst = db
          .prepare('SELECT id, nombre, precio, stock, esta_activo FROM instrumentos WHERE id = ?')
          .get(instId) as { id: number; nombre: string; precio: number; stock: number; esta_activo: number } | undefined;

        if (!inst) {
          throw new AppError(`El instrumento con ID ${instId} no existe`, 404);
        }

        if (inst.esta_activo === 0) {
          throw new AppError(`El instrumento '${inst.nombre}' no está disponible para la venta`, 400);
        }

        if (inst.stock < cant) {
          throw new AppError(
            `Stock insuficiente para '${inst.nombre}'. Disponible: ${inst.stock}, Solicitado: ${cant}`,
            400
          );
        }

        const subtotal = inst.precio * cant;
        granTotal += subtotal;

        itemsParaInsertar.push({
          instrumento_id: instId,
          cantidad: cant,
          precio_unitario: inst.precio,
          subtotal,
        });

        
        db.prepare('UPDATE instrumentos SET stock = stock - ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?').run(
          cant,
          instId
        );
      }

      const numeroPedido = `PED-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      
      const insertPedido = db.prepare(`
        INSERT INTO pedidos (usuario_id, numero_pedido, total, estado, creado_en)
        VALUES (?, ?, ?, 'pendiente', datetime('now', 'localtime'))
      `);
      const resPedido = insertPedido.run(usuarioId, numeroPedido, granTotal);
      const pedidoId = Number(resPedido.lastInsertRowid);

      
      const insertDetalle = db.prepare(`
        INSERT INTO detalles_pedido (pedido_id, instrumento_id, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const d of itemsParaInsertar) {
        insertDetalle.run(pedidoId, d.instrumento_id, d.cantidad, d.precio_unitario, d.subtotal);
      }

      return pedidoId;
    });

    const nuevoPedidoId = transaccionPedido();

    req.params.id = String(nuevoPedidoId);
    getOrderById(req, res, next);
  } catch (error) {
    next(error);
  }
}

export function getOrders(req: Request, res: Response, next: NextFunction): void {
  try {
    const usuarioAuth = req.usuario || req.user!;
    const esStaff = usuarioAuth.rol === 'administrador' || usuarioAuth.rol === 'vendedor';

    let consulta = `
      SELECT p.*, u.nombre as usuario_nombre, u.correo as usuario_correo
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
    `;
    const params: (string | number)[] = [];

    if (!esStaff) {
      consulta += ' WHERE p.usuario_id = ?';
      params.push(usuarioAuth.usuarioId);
    } else if (req.query.usuario_id || req.query.user_id) {
      consulta += ' WHERE p.usuario_id = ?';
      params.push(Number(req.query.usuario_id || req.query.user_id));
    }

    consulta += ' ORDER BY p.creado_en DESC';

    const pedidos = db.prepare(consulta).all(...params) as any[];

    const getItems = db.prepare(`
      SELECT dp.*, i.nombre as instrumento_nombre, i.codigo_sku as instrumento_sku, i.imagen_url as instrumento_imagen
      FROM detalles_pedido dp
      JOIN instrumentos i ON dp.instrumento_id = i.id
      WHERE dp.pedido_id = ?
    `);

    const resultado = pedidos.map(ped => {
      const items = getItems.all(ped.id).map((it: any) => ({
        ...it,
        instrumento_nombre: it.instrumento_nombre,
        instrument_name: it.instrumento_nombre,
        instrument_sku: it.instrumento_sku,
        quantity: it.cantidad,
        unit_price: it.precio_unitario,
        instrumento: {
          id: it.instrumento_id,
          nombre: it.instrumento_nombre,
          codigo_sku: it.instrumento_sku,
          imagen_url: it.instrumento_imagen,
        },
      }));

      return {
        ...ped,
        order_number: ped.numero_pedido,
        status: ped.estado,
        created_at: ped.creado_en,
        detalles: items,
        items,
      };
    });

    res.json({
      success: true,
      total: resultado.length,
      count: resultado.length,
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
}

export function getOrderById(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = Number(req.params.id);
    const usuarioAuth = req.usuario || req.user!;

    const pedido = db
      .prepare(`
        SELECT p.*, u.nombre as usuario_nombre, u.correo as usuario_correo
        FROM pedidos p
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.id = ?
      `)
      .get(id) as any;

    if (!pedido) {
      throw new AppError('Pedido no encontrado', 404);
    }

    if (usuarioAuth.rol === 'cliente' && pedido.usuario_id !== usuarioAuth.usuarioId) {
      throw new AppError('No tienes permiso para ver este pedido', 403);
    }

    const items = db
      .prepare(`
        SELECT dp.*, i.nombre as instrumento_nombre, i.codigo_sku as instrumento_sku, i.imagen_url as instrumento_imagen
        FROM detalles_pedido dp
        JOIN instrumentos i ON dp.instrumento_id = i.id
        WHERE dp.pedido_id = ?
      `)
      .all(id)
      .map((it: any) => ({
        ...it,
        instrumento_nombre: it.instrumento_nombre,
        instrument_name: it.instrumento_nombre,
        instrument_sku: it.instrumento_sku,
        quantity: it.cantidad,
        unit_price: it.precio_unitario,
        instrumento: {
          id: it.instrumento_id,
          nombre: it.instrumento_nombre,
          codigo_sku: it.instrumento_sku,
          imagen_url: it.instrumento_imagen,
        },
      }));

    res.json({
      success: true,
      data: {
        ...pedido,
        order_number: pedido.numero_pedido,
        status: pedido.estado,
        created_at: pedido.creado_en,
        detalles: items,
        items,
      },
    });
  } catch (error) {
    next(error);
  }
}

export function updateOrderStatus(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = Number(req.params.id);
    let nuevoEstado = req.body.estado || req.body.status;
    if (nuevoEstado === 'pending') nuevoEstado = 'pendiente';
    if (nuevoEstado === 'completed') nuevoEstado = 'completado';
    if (nuevoEstado === 'cancelled') nuevoEstado = 'cancelado';

    const actual = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id) as any;
    if (!actual) {
      throw new AppError('Pedido no encontrado', 404);
    }

    if (nuevoEstado === 'cancelado' && actual.estado !== 'cancelado') {
      const lineas = db.prepare('SELECT instrumento_id, cantidad FROM detalles_pedido WHERE pedido_id = ?').all(id) as any[];

      const transaccionCancel = db.transaction(() => {
        for (const linea of lineas) {
          db.prepare('UPDATE instrumentos SET stock = stock + ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?').run(
            linea.cantidad,
            linea.instrumento_id
          );
        }
        db.prepare('UPDATE pedidos SET estado = ? WHERE id = ?').run(nuevoEstado, id);
      });
      transaccionCancel();
    } else {
      db.prepare('UPDATE pedidos SET estado = ? WHERE id = ?').run(nuevoEstado, id);
    }

    res.json({
      success: true,
      mensaje: `Estado del pedido actualizado a '${nuevoEstado}'`,
      message: `Estado del pedido actualizado a '${nuevoEstado}'`,
    });
  } catch (error) {
    next(error);
  }
}
