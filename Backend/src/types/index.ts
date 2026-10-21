export type RolUsuario = 'administrador' | 'vendedor' | 'cliente';
export type CondicionInstrumento = 'nuevo' | 'usado' | 'reacondicionado';
export type EstadoPedido = 'pendiente' | 'completado' | 'cancelado';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  clave?: string;
  rol: RolUsuario;
  creado_en: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  icono: string;
  creado_en: string;
}

export interface Marca {
  id: number;
  nombre: string;
  pais_origen: string;
  sitio_web: string;
  creado_en: string;
}

export interface EspecificacionInstrumento {
  id?: number;
  instrumento_id?: number;
  material: string;
  color: string;
  acabado: string;
  meses_garantia: number;
  peso_kg: number;
}

export interface Instrumento {
  id: number;
  nombre: string;
  codigo_sku: string;
  categoria_id: number;
  marca_id: number;
  precio: number;
  stock: number;
  condicion: CondicionInstrumento | string;
  descripcion: string;
  imagen_url: string;
  esta_activo: number; 
  creado_en: string;
  actualizado_en: string;
  categoria?: Categoria;
  marca?: Marca;
  especificaciones?: EspecificacionInstrumento;
}

export interface DetallePedido {
  id?: number;
  pedido_id?: number;
  instrumento_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  instrumento_nombre?: string;
  instrumento_sku?: string;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  numero_pedido: string;
  total: number;
  estado: EstadoPedido;
  creado_en: string;
  detalles?: DetallePedido[];
  usuario_nombre?: string;
  usuario_correo?: string;
}

export interface PayloadJwt {
  usuarioId: number;
  correo: string;
  rol: RolUsuario;
  nombre: string;
}

export type UserRole = RolUsuario;
export type User = Usuario;
export type Category = Categoria;
export type Brand = Marca;
export type Instrument = Instrumento;
export type InstrumentSpec = EspecificacionInstrumento;
export type Order = Pedido;
export type OrderItem = DetallePedido;
export type JwtPayload = PayloadJwt;

declare global {
  namespace Express {
    interface Request {
      usuario?: PayloadJwt;
      user?: PayloadJwt;
    }
  }
}
