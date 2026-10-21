import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Alerta } from '../components/Alerta.js';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

export const RegistroPage: React.FC = () => {
  const { registrarse, cargando, error, limpiarError } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState<string>('');
  const [correo, setCorreo] = useState<string>('');
  const [clave, setClave] = useState<string>('');
  const [erroresLocales, setErroresLocales] = useState<{ nombre?: string; correo?: string; clave?: string }>({});

  const validar = (): boolean => {
    const err: { nombre?: string; correo?: string; clave?: string } = {};
    if (!nombre.trim()) err.nombre = 'Ingresa tu nombre completo.';
    if (!correo.trim()) {
      err.correo = 'El correo electrónico es requerido.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      err.correo = 'El formato del correo es inválido.';
    }
    if (!clave) {
      err.clave = 'La contraseña es requerida.';
    } else if (clave.length < 6) {
      err.clave = 'La contraseña debe contener al menos 6 caracteres.';
    }

    setErroresLocales(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limpiarError();
    if (!validar()) return;

    try {
      await registrarse({ nombre, correo, clave });
      navigate('/');
    } catch {
      
    }
  };

  return (
    <main id="contenido-principal" className="contenedor" style={{ padding: '3rem 1rem 5rem 1rem', maxWidth: '520px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--color-dorado-bg)', borderRadius: '1rem', border: '1px solid rgba(217, 119, 6, 0.4)', marginBottom: '1rem' }}>
          <UserPlus size={32} color="var(--color-dorado-brillante)" aria-hidden="true" />
        </div>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Crear Cuenta</h1>
        <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9375rem' }}>
          Únete a la comunidad de músicos de Harmonía y realiza pedidos en línea.
        </p>
      </div>

      {error && <Alerta tipo="error" mensaje={error} alCerrar={limpiarError} />}

      <div style={{ backgroundColor: 'var(--bg-tarjeta)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--borde-suave)', boxShadow: 'var(--sombra-lg)' }}>
        <form onSubmit={handleSubmit} noValidate aria-label="Formulario de registro">
          
          <div className="grupo-formulario">
            <label htmlFor="nombre-registro" className="etiqueta-formulario">
              Nombre Completo <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="nombre-registro"
                type="text"
                autoComplete="name"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`campo-formulario ${erroresLocales.nombre ? 'campo-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                aria-invalid={Boolean(erroresLocales.nombre)}
                aria-describedby={erroresLocales.nombre ? 'error-nombre' : undefined}
                placeholder="Juan Pérez"
              />
              <User size={18} color="var(--texto-secundario)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
            </div>
            {erroresLocales.nombre && <span id="error-nombre" className="texto-error" role="alert">{erroresLocales.nombre}</span>}
          </div>

          <div className="grupo-formulario">
            <label htmlFor="correo-registro" className="etiqueta-formulario">
              Correo Electrónico <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="correo-registro"
                type="email"
                autoComplete="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className={`campo-formulario ${erroresLocales.correo ? 'campo-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                aria-invalid={Boolean(erroresLocales.correo)}
                aria-describedby={erroresLocales.correo ? 'error-correo' : undefined}
                placeholder="juan@ejemplo.com"
              />
              <Mail size={18} color="var(--texto-secundario)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
            </div>
            {erroresLocales.correo && <span id="error-correo" className="texto-error" role="alert">{erroresLocales.correo}</span>}
          </div>

          <div className="grupo-formulario">
            <label htmlFor="clave-registro" className="etiqueta-formulario">
              Contraseña <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="clave-registro"
                type="password"
                autoComplete="new-password"
                required
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className={`campo-formulario ${erroresLocales.clave ? 'campo-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                aria-invalid={Boolean(erroresLocales.clave)}
                aria-describedby={erroresLocales.clave ? 'error-clave' : undefined}
                placeholder="Mínimo 6 caracteres"
              />
              <Lock size={18} color="var(--texto-secundario)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
            </div>
            {erroresLocales.clave && <span id="error-clave" className="texto-error" role="alert">{erroresLocales.clave}</span>}
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="btn btn-primario"
            style={{ width: '100%', marginTop: '0.5rem', height: '48px' }}
          >
            {cargando ? 'Creando cuenta...' : 'Completar Registro'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--texto-secundario)' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/iniciar-sesion" style={{ color: 'var(--color-dorado-brillante)', fontWeight: 600 }}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </main>
  );
};
