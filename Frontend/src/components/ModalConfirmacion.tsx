import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface PropsModalConfirmacion {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  peligro?: boolean;
  cargando?: boolean;
  alConfirmar: () => void;
  alCerrar: () => void;
}

export const ModalConfirmacion: React.FC<PropsModalConfirmacion> = ({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligro = false,
  cargando = false,
  alConfirmar,
  alCerrar,
}) => {
  const botonCancelarRef = useRef<HTMLButtonElement>(null);

  
  useEffect(() => {
    if (!abierto) return;

    
    const timer = setTimeout(() => {
      botonCancelarRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        alCerrar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="modal-fondo"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal"
      aria-describedby="descripcion-modal"
      onClick={alCerrar}
    >
      <div
        className="modal-contenido"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: peligro ? '4px solid var(--color-error)' : '4px solid var(--color-dorado-brillante)' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {peligro && (
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-error-bg)', borderRadius: '0.375rem', color: 'var(--color-error)' }}>
                <AlertTriangle size={24} aria-hidden="true" />
              </div>
            )}
            <h2 id="titulo-modal" style={{ fontSize: '1.25rem', color: 'var(--texto-titulos)', margin: 0 }}>
              {titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="btn btn-secundario"
            style={{ minHeight: '36px', minWidth: '36px', padding: '0.25rem', borderRadius: '0.375rem' }}
            aria-label="Cerrar ventana modal"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <p id="descripcion-modal" style={{ color: 'var(--texto-cuerpo)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {mensaje}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            ref={botonCancelarRef}
            type="button"
            onClick={alCerrar}
            disabled={cargando}
            className="btn btn-secundario"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={alConfirmar}
            disabled={cargando}
            className={`btn ${peligro ? 'btn-peligro' : 'btn-primario'}`}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};
