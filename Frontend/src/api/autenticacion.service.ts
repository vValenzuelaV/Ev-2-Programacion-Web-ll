import { clienteHttp } from './clienteHttp.js';
import { Usuario, RespuestaApi } from '../types/index.js';

export interface CredencialesLogin {
  correo: string;
  clave: string;
}

export interface DatosRegistro {
  nombre: string;
  correo: string;
  clave: string;
}

export interface RespuestaLogin {
  usuario: Usuario;
  token: string;
}

export const servicioAutenticacion = {
  async iniciarSesion(credenciales: CredencialesLogin): Promise<RespuestaLogin> {
    const respuesta = await clienteHttp<RespuestaApi<RespuestaLogin>>('/autenticacion/iniciar-sesion', {
      method: 'POST',
      body: JSON.stringify(credenciales),
      requiereAuth: false,
    });
    return respuesta.datos;
  },

  async registrar(datos: DatosRegistro): Promise<{ usuario: Usuario; token: string }> {
    const respuesta = await clienteHttp<RespuestaApi<{ usuario: Usuario; token: string }>>('/autenticacion/registro', {
      method: 'POST',
      body: JSON.stringify(datos),
      requiereAuth: false,
    });
    return respuesta.datos;
  },

  async obtenerPerfil(): Promise<Usuario> {
    const respuesta = await clienteHttp<RespuestaApi<Usuario>>('/autenticacion/perfil', {
      method: 'GET',
      requiereAuth: true,
    });
    return respuesta.datos;
  },
};
