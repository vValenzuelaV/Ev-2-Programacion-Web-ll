import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, ShoppingBag } from 'lucide-react';

export const NoEncontradoPage: React.FC = () => {
  return (
    <main id="contenido-principal" className="contenedor" style={{ padding: '6rem 1rem', textAlign: 'center', maxWidth: '560px' }}>
      <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--bg-elevado)', borderRadius: '50%', color: 'var(--color-dorado-brillante)', marginBottom: '1.5rem' }}>
        <HelpCircle size={48} aria-hidden="true" />
      </div>

      <span className="insignia insignia-dorada" style={{ marginBottom: '1rem' }}>
        Error 404
      </span>

      <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
        Página No Encontrada
      </h1>

      <p style={{ color: 'var(--texto-secundario)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        La ruta a la que intentas acceder no existe o fue movida en el sistema de la tienda.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/" className="btn btn-primario">
          <Home size={18} aria-hidden="true" />
          Ir al Catálogo Principal
        </Link>
      </div>
    </main>
  );
};
