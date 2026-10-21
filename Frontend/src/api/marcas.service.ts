import { clienteHttp } from './clienteHttp.js';
import { Marca, RespuestaApi } from '../types/index.js';

export const servicioMarcas = {
  async listar(): Promise<Marca[]> {
    const respuesta = await clienteHttp<RespuestaApi<Marca[]>>('/marcas', {
      method: 'GET',
      requiereAuth: false,
    });
    return respuesta.datos;
  },

  async obtenerPorId(id: number): Promise<Marca> {
    const respuesta = await clienteHttp<RespuestaApi<Marca>>(`/marcas/${id}`, {
      method: 'GET',
      requiereAuth: false,
    });
    return respuesta.datos;
  },
};
