import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RutaProtegida } from '../components/RutaProtegida';
import * as AuthContextModule from '../context/AuthContext';

describe('Componente RutaProtegida (Guard de Autorización)', () => {
  it('redirige al login si el usuario no está autenticado', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      usuario: null,
      esAutenticado: false,
      cargando: false,
      error: null,
      tieneRol: () => false,
      iniciarSesion: vi.fn(),
      cerrarSesion: vi.fn(),
      limpiarError: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/instrumentos']}>
        <Routes>
          <Route
            path="/admin/instrumentos"
            element={
              <RutaProtegida rolesPermitidos={['administrador']}>
                <div>Contenido Administrativo Protegido</div>
              </RutaProtegida>
            }
          />
          <Route path="/iniciar-sesion" element={<div>Pantalla de Inicio de Sesión</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Pantalla de Inicio de Sesión')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Administrativo Protegido')).not.toBeInTheDocument();
  });

  it('redirige a /acceso-denegado si el usuario tiene rol insuficiente (ej. cliente)', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      usuario: { id: 3, nombre: 'Cliente Demo', correo: 'cliente@tienda.com', rol: 'cliente' },
      esAutenticado: true,
      cargando: false,
      error: null,
      tieneRol: (...roles) => roles.includes('cliente'),
      iniciarSesion: vi.fn(),
      cerrarSesion: vi.fn(),
      limpiarError: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/instrumentos']}>
        <Routes>
          <Route
            path="/admin/instrumentos"
            element={
              <RutaProtegida rolesPermitidos={['administrador', 'vendedor']}>
                <div>Panel Solo para Vendedores o Administradores</div>
              </RutaProtegida>
            }
          />
          <Route path="/acceso-denegado" element={<div>403 - Acceso Denegado</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('403 - Acceso Denegado')).toBeInTheDocument();
    expect(screen.queryByText('Panel Solo para Vendedores o Administradores')).not.toBeInTheDocument();
  });

  it('permite el acceso y renderiza los hijos cuando el rol es autorizado', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      usuario: { id: 1, nombre: 'Admin Demo', correo: 'admin@tienda.com', rol: 'administrador' },
      esAutenticado: true,
      cargando: false,
      error: null,
      tieneRol: (...roles) => roles.includes('administrador'),
      iniciarSesion: vi.fn(),
      cerrarSesion: vi.fn(),
      limpiarError: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/instrumentos']}>
        <Routes>
          <Route
            path="/admin/instrumentos"
            element={
              <RutaProtegida rolesPermitidos={['administrador']}>
                <div>Bienvenido al Panel de Administración</div>
              </RutaProtegida>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Bienvenido al Panel de Administración')).toBeInTheDocument();
  });
});
