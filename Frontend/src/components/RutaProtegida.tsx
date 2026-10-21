import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { RolUsuario } from '../types/index.js';
import { Cargando } from './Cargando.js';

interface PropsRutaProtegida {
  children: ReactNode;
  rolesPermitidos?: RolUsuario[];
}

export const RutaProtegida: React.FC<PropsRutaProtegida> = ({ children, rolesPermitidos }) => {
  const { esAutenticado, usuario, cargando, tieneRol } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <Cargando mensaje="Verificando permisos y credenciales de acceso..." />;
  }

  
  if (!esAutenticado || !usuario) {
    return <Navigate to="/iniciar-sesion" state={{ desde: location }} replace />;
  }

  
  if (rolesPermitidos && rolesPermitidos.length > 0 && !tieneRol(...rolesPermitidos)) {
    return <Navigate to="/acceso-denegado" state={{ rutaIntentada: location.pathname }} replace />;
  }

  return <>{children}</>;
};
