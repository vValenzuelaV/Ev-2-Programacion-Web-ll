import { ErrorApi } from '../types/index.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');

const CLAVE_TOKEN = 'harmonia_auth_token';

export function obtenerTokenAlmacenado(): string | null {
  try {
    return sessionStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export function guardarTokenAlmacenado(token: string): void {
  try {
    sessionStorage.setItem(CLAVE_TOKEN, token);
  } catch (e) {
    console.error('No se pudo almacenar el token en sessionStorage:', e);
  }
}

export function eliminarTokenAlmacenado(): void {
  try {
    sessionStorage.removeItem(CLAVE_TOKEN);
  } catch (e) {
    console.error('No se pudo eliminar el token de sessionStorage:', e);
  }
}

export class ErrorPeticion extends Error {
  public codigoEstado: number;
  public erroresValidacion?: { campo: string; mensaje: string }[];

  constructor(mensaje: string, codigoEstado: number, erroresValidacion?: { campo: string; mensaje: string }[]) {
    super(mensaje);
    this.name = 'ErrorPeticion';
    this.codigoEstado = codigoEstado;
    this.erroresValidacion = erroresValidacion;
  }
}

interface OpcionesPeticion extends RequestInit {
  requiereAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function clienteHttp<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { requiereAuth = true, params, headers: cabecerasPersonalizadas, ...restoOpciones } = opciones;

  
  let url = `${API_BASE_URL}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
  if (params) {
    const paramsLimpios = Object.entries(params).filter(([_, v]) => v !== undefined && v !== '');
    if (paramsLimpios.length > 0) {
      const searchParams = new URLSearchParams();
      paramsLimpios.forEach(([k, v]) => searchParams.append(k, String(v)));
      url += `?${searchParams.toString()}`;
    }
  }

  
  const cabeceras: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  
  if (requiereAuth) {
    const token = obtenerTokenAlmacenado();
    if (token) {
      cabeceras['Authorization'] = `Bearer ${token}`;
    }
  }

  
  if (cabecerasPersonalizadas) {
    Object.assign(cabeceras, cabecerasPersonalizadas);
  }

  try {
    const respuesta = await fetch(url, {
      ...restoOpciones,
      headers: cabeceras,
    });

    
    if (respuesta.status === 204) {
      return {} as T;
    }

    let datosRespuesta: any = null;
    const tipoContenido = respuesta.headers.get('content-type');
    if (tipoContenido && tipoContenido.includes('application/json')) {
      datosRespuesta = await respuesta.json();
    } else {
      datosRespuesta = { mensaje: await respuesta.text() };
    }

    if (!respuesta.ok) {
      
      if (respuesta.status === 401) {
        eliminarTokenAlmacenado();
        
        window.dispatchEvent(new CustomEvent('auth:expirada'));
      }

      
      if (respuesta.status === 429) {
        throw new ErrorPeticion(
          datosRespuesta?.mensaje || 'Demasiadas solicitudes. Por favor espera unos minutos antes de reintentar.',
          429
        );
      }

      
      const errorApi = datosRespuesta as ErrorApi;
      throw new ErrorPeticion(
        errorApi?.mensaje || `Error en la solicitud (Código ${respuesta.status})`,
        respuesta.status,
        errorApi?.errores
      );
    }

    
    return normalizarRespuesta(datosRespuesta) as T;
  } catch (error: any) {
    if (error instanceof ErrorPeticion) {
      throw error;
    }
    
    throw new ErrorPeticion(
      error.message === 'Failed to fetch'
        ? 'No se pudo conectar con el servidor de la tienda. Verifica que el backend esté en ejecución.'
        : error.message || 'Error inesperado de comunicación con la API.',
      0
    );
  }
}

function normalizarRespuesta(datos: any): any {
  if (!datos || typeof datos !== 'object') return datos;

  const resultado: any = { ...datos };

  
  if ('success' in resultado && !('exito' in resultado)) {
    resultado.exito = resultado.success;
  }

  
  if ('data' in resultado && !('datos' in resultado)) {
    resultado.datos = resultado.data;
  }

  
  if (resultado.paginacion) {
    const pag = resultado.paginacion;
    resultado.paginacion = {
      total: pag.total ?? 0,
      pagina: pag.pagina ?? 1,
      limite: pag.limite ?? 10,
      total_paginas: pag.paginasTotales ?? pag.total_paginas ?? 1,
    };
  }

  
  
  

  
  if (resultado.error && typeof resultado.error === 'object') {
    if (!resultado.mensaje && resultado.error.message) {
      resultado.mensaje = resultado.error.message;
    }
    if (!resultado.errores && resultado.error.details) {
      resultado.errores = resultado.error.details;
    }
  }

  return resultado;
}
