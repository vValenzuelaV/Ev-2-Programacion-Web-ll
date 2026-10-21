import { clienteHttp } from './clienteHttp.js';
import { Pedido, ItemCrearPedido, RespuestaApi } from '../types/index.js';

export const servicioPedidos = {
  async listar(): Promise<Pedido[]> {
    const respuesta = await clienteHttp<RespuestaApi<Pedido[]>>('/pedidos', {
      method: 'GET',
      requiereAuth: true,
    });
    return respuesta.datos;
  },

  async obtenerPorId(id: number): Promise<Pedido> {
    const respuesta = await clienteHttp<RespuestaApi<Pedido>>(`/pedidos/${id}`, {
      method: 'GET',
      requiereAuth: true,
    });
    return respuesta.datos;
  },

  async crear(items: ItemCrearPedido[]): Promise<Pedido> {
    const respuesta = await clienteHttp<RespuestaApi<Pedido>>('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ items }),
      requiereAuth: true,
    });
    return respuesta.datos;
  },

  async actualizarEstado(id: number, estado: 'pendiente' | 'completado' | 'cancelado'): Promise<Pedido> {
    const respuesta = await clienteHttp<RespuestaApi<Pedido>>(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
      requiereAuth: true,
    });
    return respuesta.datos;
  },
};
