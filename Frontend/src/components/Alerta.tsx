import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface PropsAlerta {
  tipo?: 'error' | 'exito' | 'alerta' | 'info';
  mensaje: string;
  alCerrar?: () => void;
}

export const Alerta: React.FC<PropsAlerta> = ({ tipo = 'error', mensaje, alCerrar }) => {
  if (!mensaje) return null;

  const config = {
    error: {
      clase: 'alerta-error',
      icono: <AlertCircle size={20} aria-hidden="true" />,
      titulo: 'Error',
    },
    exito: {
      clase: 'alerta-exito',
      icono: <CheckCircle size={20} aria-hidden="true" />,
      titulo: 'Éxito',
    },
    alerta: {
      clase: 'alerta-alerta',
      icono: <AlertTriangle size={20} aria-hidden="true" />,
      titulo: 'Atención',
    },
    info: {
      clase: 'alerta-info',
      icono: <Info size={20} aria-hidden="true" />,
      titulo: 'Información',
    },
  }[tipo];

  return (
    <div
      className={`alerta ${config.clase}`}
      role={tipo === 'error' ? 'alert' : 'status'}
      aria-live={tipo === 'error' ? 'assertive' : 'polite'}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{config.icono}</div>
      <div style={{ flex: 1, fontSize: '0.9375rem', lineHeight: 1.5 }}>
        {mensaje}
      </div>
      {alCerrar && (
        <button
          type="button"
          onClick={alCerrar}
          style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}
          aria-label="Cerrar notificación"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
