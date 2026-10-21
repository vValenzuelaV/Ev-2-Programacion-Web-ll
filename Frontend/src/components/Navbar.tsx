import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { ShoppingBag, User, LogOut, LogIn, Menu, X, Shield, PlusCircle, Package } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { usuario, esAutenticado, tieneRol, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const handleCerrarSesion = () => {
    cerrarSesion();
    setMenuMovilAbierto(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header style={{ backgroundColor: 'var(--bg-superficie)', borderBottom: '1px solid var(--borde-suave)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="contenedor" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        
        {}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'var(--texto-titulos)' }}
          aria-label="Harmonía Tienda de Instrumentos Musicales - Inicio"
        >
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', display: 'block', lineHeight: 1.1 }}>
              HARMONÍA
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-dorado-brillante)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Instrumentos Musicales
            </span>
          </div>
        </Link>

        {}
        <nav aria-label="Navegación principal" style={{ display: 'none' }} className="nav-escritorio">
          <ul style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', listStyle: 'none' }}>
            <li>
              <Link
                to="/"
                style={{
                  color: isActive('/') ? 'var(--color-dorado-brillante)' : 'var(--texto-cuerpo)',
                  fontWeight: isActive('/') ? 700 : 500,
                  fontSize: '0.9375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <ShoppingBag size={18} aria-hidden="true" />
                Catálogo
              </Link>
            </li>

            {esAutenticado && (
              <li>
                <Link
                  to="/mis-pedidos"
                  style={{
                    color: isActive('/mis-pedidos') ? 'var(--color-dorado-brillante)' : 'var(--texto-cuerpo)',
                    fontWeight: isActive('/mis-pedidos') ? 700 : 500,
                    fontSize: '0.9375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <Package size={18} aria-hidden="true" />
                  Mis Pedidos
                </Link>
              </li>
            )}

            {}
            {tieneRol('administrador', 'vendedor') && (
              <li>
                <Link
                  to="/admin/instrumentos"
                  style={{
                    color: isActive('/admin/instrumentos') ? 'var(--color-dorado-brillante)' : 'var(--texto-cuerpo)',
                    fontWeight: isActive('/admin/instrumentos') ? 700 : 500,
                    fontSize: '0.9375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  <Shield size={18} aria-hidden="true" />
                  Gestión de Inventario
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="auth-escritorio">
          {esAutenticado && usuario ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', color: 'var(--texto-titulos)' }}>
                  {usuario.nombre}
                </span>
                <span className={`insignia ${usuario.rol === 'administrador' ? 'insignia-dorada' : usuario.rol === 'vendedor' ? 'insignia-info' : 'insignia-exito'}`}>
                  {usuario.rol}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCerrarSesion}
                className="btn btn-secundario"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
                aria-label="Cerrar sesión de usuario"
              >
                <LogOut size={16} aria-hidden="true" />
                Salir
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/iniciar-sesion" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <LogIn size={16} aria-hidden="true" />
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="btn btn-primario" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {}
        <button
          type="button"
          onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
          className="btn btn-secundario boton-menu-movil"
          aria-expanded={menuMovilAbierto}
          aria-controls="menu-movil"
          aria-label={menuMovilAbierto ? 'Cerrar menú principal' : 'Abrir menú principal'}
          style={{ minWidth: '44px', minHeight: '44px', padding: '0.5rem' }}
        >
          {menuMovilAbierto ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {}
      {menuMovilAbierto && (
        <div
          id="menu-movil"
          style={{
            backgroundColor: 'var(--bg-tarjeta)',
            borderTop: '1px solid var(--borde-suave)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <nav aria-label="Navegación móvil">
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <Link
                  to="/"
                  onClick={() => setMenuMovilAbierto(false)}
                  className="btn btn-secundario"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <ShoppingBag size={18} aria-hidden="true" />
                  Catálogo de Instrumentos
                </Link>
              </li>

              {esAutenticado && (
                <li>
                  <Link
                    to="/mis-pedidos"
                    onClick={() => setMenuMovilAbierto(false)}
                    className="btn btn-secundario"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <Package size={18} aria-hidden="true" />
                    Mis Pedidos
                  </Link>
                </li>
              )}

              {tieneRol('administrador', 'vendedor') && (
                <li>
                  <Link
                    to="/admin/instrumentos"
                    onClick={() => setMenuMovilAbierto(false)}
                    className="btn btn-secundario"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <Shield size={18} aria-hidden="true" />
                    Gestión de Inventario (CRUD)
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <hr style={{ borderColor: 'var(--borde-suave)', margin: '0.5rem 0' }} />

          {esAutenticado && usuario ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-superficie)', borderRadius: '0.375rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block' }}>{usuario.nombre}</span>
                <span className="insignia insignia-dorada" style={{ marginTop: '0.25rem' }}>{usuario.rol}</span>
              </div>
              <button
                type="button"
                onClick={handleCerrarSesion}
                className="btn btn-peligro"
                style={{ width: '100%' }}
              >
                <LogOut size={16} aria-hidden="true" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to="/iniciar-sesion"
                onClick={() => setMenuMovilAbierto(false)}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                <LogIn size={16} aria-hidden="true" />
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                onClick={() => setMenuMovilAbierto(false)}
                className="btn btn-primario"
                style={{ width: '100%' }}
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      )}

      {}
      <style>{`
        @media (min-width: 768px) {
          .nav-escritorio { display: block !important; }
          .auth-escritorio { display: flex !important; }
          .boton-menu-movil { display: none !important; }
        }
      `}</style>
    </header>
  );
};
