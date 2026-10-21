import { z } from 'zod';

export const especificacionSchema = z.object({
  material: z.string().optional().default(''),
  color: z.string().optional().default(''),
  acabado: z.string().optional().default(''),
  finish: z.string().optional(),
  meses_garantia: z.coerce.number().int().min(0, 'Los meses de garantía no pueden ser negativos').optional().default(12),
  warranty_months: z.coerce.number().int().optional(),
  peso_kg: z.coerce.number().min(0, 'El peso en kg debe ser positivo').optional().default(0),
  weight_kg: z.coerce.number().optional(),
});

export const crearInstrumentoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150).optional(),
  name: z.string().min(2).max(150).optional(),
  codigo_sku: z.string().min(2, 'El código SKU debe tener al menos 2 caracteres').max(50).optional(),
  sku: z.string().min(2).max(50).optional(),
  categoria_id: z.coerce.number().int().positive('Debe seleccionar una categoría válida'),
  marca_id: z.coerce.number().int().positive('Debe seleccionar una marca válida'),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo').optional(),
  price: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo').default(0),
  condicion: z.enum(['nuevo', 'usado', 'reacondicionado', 'new', 'used', 'refurbished']).default('nuevo'),
  condition: z.enum(['nuevo', 'usado', 'reacondicionado', 'new', 'used', 'refurbished']).optional(),
  descripcion: z.string().optional().default(''),
  description: z.string().optional(),
  imagen_url: z.string().optional().default(''),
  image_url: z.string().optional(),
  esta_activo: z.coerce.number().int().min(0).max(1).optional().default(1),
  is_active: z.coerce.number().int().min(0).max(1).optional(),
  especificaciones: especificacionSchema.optional(),
  specs: especificacionSchema.optional(),
}).refine(data => data.nombre || data.name, {
  message: 'El nombre del instrumento es obligatorio',
  path: ['nombre'],
}).refine(data => data.codigo_sku || data.sku, {
  message: 'El código SKU es obligatorio',
  path: ['codigo_sku'],
}).refine(data => data.precio !== undefined || data.price !== undefined, {
  message: 'El precio es obligatorio',
  path: ['precio'],
});

export const actualizarInstrumentoSchema = z.object({
  nombre: z.string().min(2).max(150).optional(),
  name: z.string().min(2).max(150).optional(),
  codigo_sku: z.string().min(2).max(50).optional(),
  sku: z.string().min(2).max(50).optional(),
  categoria_id: z.coerce.number().int().positive().optional(),
  marca_id: z.coerce.number().int().positive().optional(),
  precio: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  condicion: z.enum(['nuevo', 'usado', 'reacondicionado', 'new', 'used', 'refurbished']).optional(),
  condition: z.enum(['nuevo', 'usado', 'reacondicionado', 'new', 'used', 'refurbished']).optional(),
  descripcion: z.string().optional(),
  description: z.string().optional(),
  imagen_url: z.string().optional(),
  image_url: z.string().optional(),
  esta_activo: z.coerce.number().int().min(0).max(1).optional(),
  is_active: z.coerce.number().int().min(0).max(1).optional(),
  especificaciones: especificacionSchema.optional(),
  specs: especificacionSchema.optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('El ID debe ser un número entero positivo'),
});

export const consultaInstrumentosSchema = z.object({
  pagina: z.coerce.number().int().min(1).optional().default(1),
  page: z.coerce.number().int().min(1).optional(),
  limite: z.coerce.number().int().min(1).max(100).optional().default(10),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().trim().optional(),
  buscar: z.string().trim().optional(),
  categoria_id: z.coerce.number().int().positive().optional(),
  marca_id: z.coerce.number().int().positive().optional(),
  precio_min: z.coerce.number().min(0).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  precio_max: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  condicion: z.enum(['nuevo', 'usado', 'reacondicionado', 'new', 'used', 'refurbished']).optional(),
  condition: z.enum(['nuevo', 'usado', 'reacondicionado', 'new', 'used', 'refurbished']).optional(),
  esta_activo: z.coerce.number().int().min(0).max(1).optional(),
  is_active: z.coerce.number().int().min(0).max(1).optional(),
  ordenar_por: z.enum(['id', 'nombre', 'precio', 'stock', 'creado_en']).optional().default('id'),
  sortBy: z.enum(['id', 'nombre', 'precio', 'stock', 'creado_en', 'name', 'price', 'created_at']).optional(),
  orden: z.enum(['asc', 'desc']).optional().default('desc'),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createInstrumentSchema = crearInstrumentoSchema;
export const updateInstrumentSchema = actualizarInstrumentoSchema;
export const instrumentIdParamSchema = idParamSchema;
export const instrumentQuerySchema = consultaInstrumentosSchema;
