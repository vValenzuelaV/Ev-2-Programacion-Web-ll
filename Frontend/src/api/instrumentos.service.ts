import { clienteHttp } from './clienteHttp.js';
import {
  Instrumento,
  RespuestaPaginada,
  RespuestaApi,
  EntradaCrearInstrumento,
  EntradaActualizarInstrumento,
} from '../types/index.js';

export interface ParametrosBusquedaInstrumentos {
  pagina?: number;
  limite?: number;
  buscar?: string;
  categoria_id?: number;
  marca_id?: number;
  precio_min?: number;
  precio_max?: number;
  condicion?: string;
  esta_activo?: number;
  ordenar_por?: string;
  orden?: 'asc' | 'desc';
}

export const servicioInstrumentos = {
  async listar(parametros: ParametrosBusquedaInstrumentos = {}): Promise<RespuestaPaginada<Instrumento>> {
    return await clienteHttp<RespuestaPaginada<Instrumento>>('/instrumentos', {
      method: 'GET',
      params: {
        pagina: parametros.pagina,
        limite: parametros.limite,
        buscar: parametros.buscar,
        categoria_id: parametros.categoria_id,
        marca_id: parametros.marca_id,
        precio_min: parametros.precio_min,
        precio_max: parametros.precio_max,
        condicion: parametros.condicion,
        esta_activo: parametros.esta_activo,
        ordenar_por: parametros.ordenar_por,
        orden: parametros.orden,
      },
      requiereAuth: false,
    });
  },

  async obtenerPorId(id: number): Promise<Instrumento> {
    const respuesta = await clienteHttp<RespuestaApi<Instrumento>>(`/instrumentos/${id}`, {
      method: 'GET',
      requiereAuth: false,
    });
    return respuesta.datos;
  },

  async crear(datos: EntradaCrearInstrumento): Promise<Instrumento> {
    const respuesta = await clienteHttp<RespuestaApi<Instrumento>>('/instrumentos', {
      method: 'POST',
      body: JSON.stringify(datos),
      requiereAuth: true,
    });
    return respuesta.datos;
  },

  async actualizar(id: number, datos: EntradaActualizarInstrumento): Promise<Instrumento> {
    const respuesta = await clienteHttp<RespuestaApi<Instrumento>>(`/instrumentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
      requiereAuth: true,
    });
    return respuesta.datos;
  },

  async eliminar(id: number, permanente: boolean = false): Promise<void> {
    await clienteHttp<RespuestaApi<{ id: number; eliminado: boolean }>>(`/instrumentos/${id}`, {
      method: 'DELETE',
      params: permanente ? { permanente: 'true' } : undefined,
      requiereAuth: true,
    });
  },
};
