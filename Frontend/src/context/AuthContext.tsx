import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Usuario, RolUsuario } from '../types/index.js';
import { servicioAutenticacion, CredencialesLogin, DatosRegistro } from '../api/autenticacion.service.js';
import {
  obtenerTokenAlmacenado,
  guardarTokenAlmacenado,
  eliminarTokenAlmacenado,
} from '../api/clienteHttp.js';

interface ContextoAutenticacionTipo {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  error: string | null;
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => void;
  tieneRol: (...rolesPermitidos: RolUsuario[]) => boolean;
  esAutenticado: boolean;
  limpiarError: () => void;
}

const AuthContext = createContext<ContextoAutenticacionTipo | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(obtenerTokenAlmacenado());
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const limpiarError = useCallback(() => setError(null), []);

  const cerrarSesion = useCallback(() => {
    eliminarTokenAlmacenado();
    setToken(null);
    setUsuario(null);
    setError(null);
  }, []);

  
  useEffect(() => {
    let activo = true;

    async function verificarSesion() {
      const tokenGuardado = obtenerTokenAlmacenado();
      if (!tokenGuardado) {
        if (activo) {
          setCargando(false);
          setUsuario(null);
        }
        return;
      }

      try {
        const perfil = await servicioAutenticacion.obtenerPerfil();
        if (activo) {
          setUsuario(perfil);
          setToken(tokenGuardado);
        }
      } catch (err) {
        if (activo) {
          cerrarSesion();
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    verificarSesion();

    
    const handleAuthExpirada = () => {
      cerrarSesion();
    };

    window.addEventListener('auth:expirada', handleAuthExpirada);
    return () => {
      activo = false;
      window.removeEventListener('auth:expirada', handleAuthExpirada);
    };
  }, [cerrarSesion]);

  const iniciarSesion = async (credenciales: CredencialesLogin) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await servicioAutenticacion.iniciarSesion(credenciales);
      guardarTokenAlmacenado(respuesta.token);
      setToken(respuesta.token);
      setUsuario(respuesta.usuario);
    } catch (err: any) {
      const mensaje = err.message || 'Error al iniciar sesión';
      setError(mensaje);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const registrarse = async (datos: DatosRegistro) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await servicioAutenticacion.registrar(datos);
      guardarTokenAlmacenado(respuesta.token);
      setToken(respuesta.token);
      setUsuario(respuesta.usuario);
    } catch (err: any) {
      const mensaje = err.message || 'Error al registrar usuario';
      setError(mensaje);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const tieneRol = (...rolesPermitidos: RolUsuario[]): boolean => {
    if (!usuario) return false;
    return rolesPermitidos.includes(usuario.rol);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargando,
        error,
        iniciarSesion,
        registrarse,
        cerrarSesion,
        tieneRol,
        esAutenticado: Boolean(usuario && token),
        limpiarError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): ContextoAutenticacionTipo {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return contexto;
}
