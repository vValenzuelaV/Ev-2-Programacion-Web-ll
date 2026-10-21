import { z } from 'zod';

export const loginSchema = z.object({
  correo: z.string().email('Debe ser un correo electrónico válido').optional(),
  email: z.string().email('Debe ser un correo electrónico válido').optional(),
  clave: z.string().min(6, 'La clave debe tener al menos 6 caracteres').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
}).refine(data => data.correo || data.email, {
  message: 'El correo electrónico es obligatorio',
  path: ['correo'],
}).refine(data => data.clave || data.password, {
  message: 'La clave de acceso es obligatoria',
  path: ['clave'],
});

export const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
  correo: z.string().email('Debe ser un correo electrónico válido').optional(),
  email: z.string().email('Debe ser un correo electrónico válido').optional(),
  clave: z.string().min(6, 'La clave debe tener al menos 6 caracteres').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  rol: z.enum(['administrador', 'vendedor', 'cliente', 'admin', 'seller', 'customer']).default('cliente').optional(),
  role: z.enum(['administrador', 'vendedor', 'cliente', 'admin', 'seller', 'customer']).optional(),
}).refine(data => data.nombre || data.name, {
  message: 'El nombre es obligatorio',
  path: ['nombre'],
}).refine(data => data.correo || data.email, {
  message: 'El correo electrónico es obligatorio',
  path: ['correo'],
}).refine(data => data.clave || data.password, {
  message: 'La clave debe tener al menos 6 caracteres',
  path: ['clave'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
