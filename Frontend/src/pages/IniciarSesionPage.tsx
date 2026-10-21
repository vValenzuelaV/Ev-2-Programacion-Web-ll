import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Alerta } from '../components/Alerta.js';
import { Lock, Mail, Music, ArrowRight } from 'lucide-react';

export const IniciarSesionPage: React.FC = () => {
  const { iniciarSesion, cargando, error, limpiarError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState<string>('');
  const [clave, setClave] = useState<string>('');
  const [erroresLocales, setErroresLocales] = useState<{ correo?: string; clave?: string }>({});

  
  const rutaRedireccion = (location.state as any)?.desde?.pathname || '/';

  const validarFormulario = (): boolean => {
    const errores: { correo?: string; clave?: string } = {};
    if (!correo.trim()) {
      errores.correo = 'El correo electrónico es requerido.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errores.correo = 'Ingresa un correo electrónico con formato válido.';
    }

    if (!clave) {
      errores.clave = 'La contraseña es requerida.';
    } else if (clave.length < 6) {
      errores.clave = 'La contraseña debe tener al menos 6 caracteres.';
    }

    setErroresLocales(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limpiarError();

    if (!validarFormulario()) return;

    try {
      await iniciarSesion({ correo, clave });
      navigate(rutaRedireccion, { replace: true });
    } catch {
      
    }
  };

  return (
    <main id="contenido-principal" className="contenedor" style={{ padding: '3rem 1rem 5rem 1rem', maxWidth: '520px' }}>
      
      {}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--color-dorado-bg)', borderRadius: '1rem', border: '1px solid rgba(217, 119, 6, 0.4)', marginBottom: '1rem' }}>
          <Music size={32} color="var(--color-dorado-brillante)" aria-hidden="true" />
        </div>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Iniciar Sesión</h1>
        <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9375rem' }}>
          Accede al sistema de Harmonía Instrumentos con tus credenciales seguras.
        </p>
      </div>

      {}
      {error && <Alerta tipo="error" mensaje={error} alCerrar={limpiarError} />}

      {}
      <div style={{ backgroundColor: 'var(--bg-tarjeta)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--borde-suave)', boxShadow: 'var(--sombra-lg)' }}>
        <form onSubmit={handleSubmit} noValidate aria-label="Formulario de inicio de sesión">
          
          {}
          <div className="grupo-formulario">
            <label htmlFor="correo-usuario" className="etiqueta-formulario">
              Correo Electrónico <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="correo-usuario"
                name="correo"
                type="email"
                autoComplete="email"
                required
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (erroresLocales.correo) setErroresLocales(prev => ({ ...prev, correo: undefined }));
                }}
                className={`campo-formulario ${erroresLocales.correo ? 'campo-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                aria-invalid={Boolean(erroresLocales.correo)}
                aria-describedby={erroresLocales.correo ? 'error-correo' : undefined}
                placeholder="ejemplo@tienda.com"
              />
              <Mail size={18} color="var(--texto-secundario)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
            </div>
            {erroresLocales.correo && (
              <span id="error-correo" className="texto-error" role="alert">
                {erroresLocales.correo}
              </span>
            )}
          </div>

          {}
          <div className="grupo-formulario">
            <label htmlFor="clave-usuario" className="etiqueta-formulario">
              Contraseña <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="clave-usuario"
                name="clave"
                type="password"
                autoComplete="current-password"
                required
                value={clave}
                onChange={(e) => {
                  setClave(e.target.value);
                  if (erroresLocales.clave) setErroresLocales(prev => ({ ...prev, clave: undefined }));
                }}
                className={`campo-formulario ${erroresLocales.clave ? 'campo-error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                aria-invalid={Boolean(erroresLocales.clave)}
                aria-describedby={erroresLocales.clave ? 'error-clave' : undefined}
                placeholder="••••••••"
              />
              <Lock size={18} color="var(--texto-secundario)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
            </div>
            {erroresLocales.clave && (
              <span id="error-clave" className="texto-error" role="alert">
                {erroresLocales.clave}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="btn btn-primario"
            style={{ width: '100%', marginTop: '0.5rem', height: '48px' }}
          >
            {cargando ? 'Autenticando...' : 'Entrar a la Tienda'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--texto-secundario)' }}>
          ¿No tienes una cuenta aún?{' '}
          <Link to="/registro" style={{ color: 'var(--color-dorado-brillante)', fontWeight: 600 }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
};
