import React from 'react';
import { Loader2 } from 'lucide-react';

interface PropsCargando {
  mensaje?: string;
}

export const Cargando: React.FC<PropsCargando> = ({ mensaje = 'Cargando contenido...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1rem',
        gap: '1rem',
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 size={40} color="var(--color-dorado-brillante)" className="animar-giro" aria-hidden="true" />
      <p style={{ fontSize: '1rem', color: 'var(--texto-secundario)', fontWeight: 500 }}>
        {mensaje}
      </p>

      <style>{`
        @keyframes girar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animar-giro {
          animation: girar 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
