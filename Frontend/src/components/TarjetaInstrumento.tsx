import React from 'react';
import { Link } from 'react-router-dom';
import { Instrumento } from '../types/index.js';
import { ShoppingCart, Eye, Tag } from 'lucide-react';

interface PropsTarjetaInstrumento {
  instrumento: Instrumento;
  alOrdenar?: (instrumento: Instrumento) => void;
}

export const TarjetaInstrumento: React.FC<PropsTarjetaInstrumento> = ({ instrumento, alOrdenar }) => {
  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const tieneStock = instrumento.stock > 0;

  return (
    <article
      className="tarjeta-producto"
      aria-labelledby={`titulo-inst-${instrumento.id}`}
    >
      {}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={instrumento.imagen_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'}
          alt={`Fotografía del instrumento musical: ${instrumento.nombre}`}
          className="imagen-tarjeta"
          loading="lazy"
        />
        {}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          {instrumento.marca && (
            <span className="insignia insignia-dorada">
              {instrumento.marca.nombre}
            </span>
          )}
          <span className={`insignia ${tieneStock ? 'insignia-exito' : 'insignia-peligro'}`}>
            {tieneStock ? `${instrumento.stock} en stock` : 'Agotado'}
          </span>
        </div>
      </div>

      <div className="cuerpo-tarjeta">
        {}
        {instrumento.categoria && (
          <span style={{ fontSize: '0.75rem', color: 'var(--texto-secundario)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Tag size={12} aria-hidden="true" />
            {instrumento.categoria.nombre}
          </span>
        )}

        {}
        <h3 id={`titulo-inst-${instrumento.id}`} style={{ fontSize: '1.125rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          <Link
            to={`/instrumento/${instrumento.id}`}
            style={{ color: 'var(--texto-titulos)', textDecoration: 'none' }}
          >
            {instrumento.nombre}
          </Link>
        </h3>

        {}
        <p style={{ fontSize: '0.875rem', color: 'var(--texto-secundario)', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {instrumento.descripcion || 'Instrumento musical de calidad profesional disponible en tienda.'}
        </p>

        {}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--borde-suave)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--texto-atenuado)', display: 'block' }}>Precio</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dorado-brillante)' }}>
              {formatearPrecio(instrumento.precio)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to={`/instrumento/${instrumento.id}`}
              className="btn btn-secundario"
              style={{ minHeight: '44px', minWidth: '44px', padding: '0.5rem' }}
              aria-label={`Ver detalles técnicos de ${instrumento.nombre}`}
              title="Ver detalle"
            >
              <Eye size={18} aria-hidden="true" />
            </Link>

            {alOrdenar && (
              <button
                type="button"
                onClick={() => alOrdenar(instrumento)}
                disabled={!tieneStock}
                className="btn btn-primario"
                style={{ minHeight: '44px', padding: '0.5rem 0.875rem' }}
                aria-label={`Comprar o pedir ${instrumento.nombre}`}
              >
                <ShoppingCart size={18} aria-hidden="true" />
                <span className="texto-boton">Pedir</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
