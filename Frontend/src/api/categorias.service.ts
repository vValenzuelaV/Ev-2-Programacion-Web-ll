import { clienteHttp } from './clienteHttp.js';
import { Categoria, RespuestaApi } from '../types/index.js';

export const servicioCategorias = {
  async listar(): Promise<Categoria[]> {
    const respuesta = await clienteHttp<RespuestaApi<Categoria[]>>('/categorias', {
      method: 'GET',
      requiereAuth: false,
    });
    return respuesta.datos;
  },

  async obtenerPorId(id: number): Promise<Categoria> {
    const respuesta = await clienteHttp<RespuestaApi<Categoria>>(`/categorias/${id}`, {
      method: 'GET',
      requiereAuth: false,
    });
    return respuesta.datos;
  },
};
