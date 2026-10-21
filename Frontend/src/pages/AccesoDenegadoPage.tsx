import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const AccesoDenegadoPage: React.FC = () => {
  const { usuario, esAutenticado } = useAuth();
  const location = useLocation();
  const rutaIntentada = (location.state as any)?.rutaIntentada || 'recurso restringido';

  return (
    <main
      id="contenido-principal"
      className="contenedor"
      style={{
        padding: '5rem 1rem',
        maxWidth: '640px',
        textAlign: 'center',
        margin: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-tarjeta)',
          border: '2px solid var(--color-error)',
          borderRadius: '1rem',
          padding: '2.5rem 1.5rem',
          boxShadow: 'var(--sombra-lg)',
        }}
        role="alert"
        aria-labelledby="titulo-403"
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '1rem',
            backgroundColor: 'var(--color-error-bg)',
            borderRadius: '50%',
            color: 'var(--color-error)',
            marginBottom: '1.25rem',
          }}
        >
          <ShieldAlert size={48} aria-hidden="true" />
        </div>

        <span className="insignia insignia-peligro" style={{ marginBottom: '1rem' }}>
          Error 403 - Forbidden
        </span>

        <h1 id="titulo-403" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
          Acceso Denegado
        </h1>

        <p style={{ color: 'var(--texto-cuerpo)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          No cuentas con los permisos o el rol necesario para acceder a: <code>{rutaIntentada}</code>.
        </p>

        {esAutenticado && usuario ? (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-superficie)',
              borderRadius: '0.5rem',
              border: '1px solid var(--borde-suave)',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              textAlign: 'left',
            }}
          >
            <p style={{ margin: 0, color: 'var(--texto-secundario)' }}>
              Estás conectado como: <strong>{usuario.nombre}</strong> ({usuario.correo})
            </p>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--texto-secundario)' }}>
              Tu rol actual es: <span className="insignia insignia-dorada">{usuario.rol}</span>
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem', color: 'var(--texto-atenuado)' }}>
              Esta restricción está respaldada por autorización en el cliente y validación obligatoria en cada endpoint de la API RESTful (Control de Acceso a Nivel de Función - OWASP API5:2023).
            </p>
          </div>
        ) : (
          <p style={{ color: 'var(--texto-secundario)', marginBottom: '2rem' }}>
            Inicia sesión con una cuenta autorizada (Administrador o Vendedor) para continuar.
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/" className="btn btn-primario">
            <Home size={18} aria-hidden="true" />
            Volver al Catálogo
          </Link>

          {!esAutenticado ? (
            <Link to="/iniciar-sesion" className="btn btn-secundario">
              <LogIn size={18} aria-hidden="true" />
              Iniciar Sesión con Otra Cuenta
            </Link>
          ) : (
            <Link to="/iniciar-sesion" className="btn btn-secundario">
              Cambiar de Cuenta
            </Link>
          )}
        </div>
      </div>
    </main>
  );
};
