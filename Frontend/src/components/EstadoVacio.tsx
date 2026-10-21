import React from 'react';
import { Music2, SearchX } from 'lucide-react';

interface PropsEstadoVacio {
  titulo?: string;
  mensaje?: string;
  accion?: {
    texto: string;
    alHacerClic: () => void;
  };
  esBusqueda?: boolean;
}

export const EstadoVacio: React.FC<PropsEstadoVacio> = ({
  titulo = 'No se encontraron resultados',
  mensaje = 'Intenta ajustar los filtros o el término de búsqueda.',
  accion,
  esBusqueda = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-tarjeta)',
        borderRadius: '0.75rem',
        border: '1px dashed var(--borde-fuerte)',
        margin: '2rem 0',
      }}
      role="region"
      aria-label="Resultados vacíos"
    >
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-elevado)',
          borderRadius: '50%',
          marginBottom: '1rem',
          color: 'var(--color-dorado-brillante)',
        }}
      >
        {esBusqueda ? <SearchX size={36} aria-hidden="true" /> : <Music2 size={36} aria-hidden="true" />}
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--texto-titulos)' }}>
        {titulo}
      </h3>
      <p style={{ color: 'var(--texto-secundario)', maxWidth: '420px', marginBottom: accion ? '1.5rem' : '0' }}>
        {mensaje}
      </p>
      {accion && (
        <button type="button" onClick={accion.alHacerClic} className="btn btn-primario">
          {accion.texto}
        </button>
      )}
    </div>
  );
};
