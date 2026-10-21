export type RolUsuario = 'administrador' | 'vendedor' | 'cliente';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  creado_en?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  icono?: string | null;
  creado_en?: string;
}

export interface Marca {
  id: number;
  nombre: string;
  pais_origen?: string | null;
  sitio_web?: string | null;
  creado_en?: string;
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

export type CondicionInstrumento = 'nuevo' | 'usado' | 'reacondicionado';

export interface Instrumento {
  id: number;
  nombre: string;
  codigo_sku: string;
  categoria_id: number;
  marca_id: number;
  precio: number;
  stock: number;
  condicion: CondicionInstrumento;
  descripcion?: string | null;
  imagen_url?: string | null;
  esta_activo: number | boolean;
  creado_en?: string;
  actualizado_en?: string;
  categoria?: Categoria;
  marca?: Marca;
  especificaciones?: EspecificacionInstrumento | null;
}

export interface EntradaCrearInstrumento {
  nombre: string;
  codigo_sku: string;
  categoria_id: number;
  marca_id: number;
  precio: number;
  stock: number;
  condicion: CondicionInstrumento;
  descripcion?: string;
  imagen_url?: string;
  especificaciones?: {
    material: string;
    color: string;
    acabado: string;
    meses_garantia: number;
    peso_kg: number;
  };
}

export interface EntradaActualizarInstrumento extends Partial<EntradaCrearInstrumento> {
  esta_activo?: number | boolean;
}

export interface RespuestaPaginada<T> {
  exito: boolean;
  datos: T[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
  };
}

export interface RespuestaApi<T> {
  exito: boolean;
  mensaje?: string;
  datos: T;
}

export interface ErrorValidacion {
  campo: string;
  mensaje: string;
}

export interface ErrorApi {
  exito: false;
  mensaje: string;
  errores?: ErrorValidacion[];
}

export type EstadoPedido = 'pendiente' | 'completado' | 'cancelado';

export interface DetallePedido {
  id: number;
  pedido_id: number;
  instrumento_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  instrumento?: {
    id: number;
    nombre: string;
    codigo_sku: string;
    imagen_url?: string;
  };
}

export interface Pedido {
  id: number;
  usuario_id: number;
  numero_pedido: string;
  total: number;
  estado: EstadoPedido;
  creado_en: string;
  items?: DetallePedido[];
  usuario?: {
    id: number;
    nombre: string;
    correo: string;
  };
}

export interface ItemCrearPedido {
  instrumento_id: number;
  cantidad: number;
}
