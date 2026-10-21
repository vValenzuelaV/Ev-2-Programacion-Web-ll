import { z } from 'zod';

export const detalleItemSchema = z.object({
  instrumento_id: z.coerce.number().int().positive('instrumento_id debe ser un entero positivo').optional(),
  instrument_id: z.coerce.number().int().positive().optional(),
  cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a 0').optional().default(1),
  quantity: z.coerce.number().int().positive().optional(),
}).refine(data => data.instrumento_id || data.instrument_id, {
  message: 'El ID del instrumento es obligatorio',
  path: ['instrumento_id'],
});

export const crearPedidoSchema = z.object({
  detalles: z.array(detalleItemSchema).min(1, 'El pedido debe contener al menos un instrumento').optional(),
  items: z.array(detalleItemSchema).min(1).optional(),
}).refine(data => (data.detalles && data.detalles.length > 0) || (data.items && data.items.length > 0), {
  message: 'El pedido debe contener al menos un instrumento en detalles',
  path: ['detalles'],
});

export const actualizarEstadoPedidoSchema = z.object({
  estado: z.enum(['pendiente', 'completado', 'cancelado', 'pending', 'completed', 'cancelled'], {
    message: 'El estado debe ser pendiente, completado o cancelado',
  }).optional(),
  status: z.enum(['pendiente', 'completado', 'cancelado', 'pending', 'completed', 'cancelled']).optional(),
}).refine(data => data.estado || data.status, {
  message: 'El estado es obligatorio',
  path: ['estado'],
});

export const pedidoIdParamSchema = z.object({
  id: z.coerce.number().int().positive('El ID de pedido debe ser un entero positivo'),
});

export const createOrderSchema = crearPedidoSchema;
export const updateOrderStatusSchema = actualizarEstadoPedidoSchema;
export const orderIdParamSchema = pedidoIdParamSchema;
