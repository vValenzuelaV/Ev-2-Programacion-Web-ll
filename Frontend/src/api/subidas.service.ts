import { obtenerTokenAlmacenado } from './clienteHttp.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export interface ResultadoSubida {
  url: string;
  nombre_archivo: string;
  tamano_bytes: number;
  tipo_mime: string;
}

export const servicioSubidas = {
  
  async subirImagen(archivo: File): Promise<ResultadoSubida> {
    
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!tiposPermitidos.includes(archivo.type)) {
      throw new Error('Solo se permiten imágenes en formato JPG, PNG, WebP o GIF.');
    }

    
    if (archivo.size > 5 * 1024 * 1024) {
      throw new Error('El archivo excede el tamaño máximo permitido de 5 MB.');
    }

    const formData = new FormData();
    formData.append('imagen', archivo);

    const token = obtenerTokenAlmacenado();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const respuesta = await fetch(`${API_BASE_URL}/subidas/imagen`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos?.mensaje || datos?.error?.message || 'Error al subir la imagen al servidor');
    }

    return datos.data || datos.datos;
  },
};
