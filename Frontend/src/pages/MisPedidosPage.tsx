import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pedido } from '../types/index.js';
import { servicioPedidos } from '../api/pedidos.service.js';
import { useAuth } from '../context/AuthContext.js';
import { Cargando } from '../components/Cargando.js';
import { Alerta } from '../components/Alerta.js';
import { EstadoVacio } from '../components/EstadoVacio.js';
import { Package, Calendar, Clock, ShoppingBag, Eye, ArrowRight } from 'lucide-react';

export const MisPedidosPage: React.FC = () => {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarPedidos() {
      setCargando(true);
      setError(null);
      try {
        const datos = await servicioPedidos.listar();
        setPedidos(datos);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el historial de pedidos.');
      } finally {
        setCargando(false);
      }
    }
    cargarPedidos();
  }, []);

  const formatearFecha = (fechaStr: string) => {
    try {
      if (!fechaStr) return '';
      
      const cadenaIso = fechaStr.includes('T') ? fechaStr : fechaStr.replace(' ', 'T');
      const f = new Date(cadenaIso);
      return new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(f);
    } catch {
      return fechaStr;
    }
  };

  const formatearMonto = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <main id="contenido-principal" className="contenedor" style={{ padding: '2rem 1rem 5rem 1rem', maxWidth: '960px' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-dorado-brillante)', marginBottom: '0.25rem' }}>
          <Package size={20} aria-hidden="true" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Historial de Compras
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Mis Pedidos</h1>
        <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          Consulta tus órdenes generadas y el estado del despacho.
        </p>
      </div>

      {error && <Alerta tipo="error" mensaje={error} alCerrar={() => setError(null)} />}

      {cargando ? (
        <Cargando mensaje="Consultando historial de pedidos en el servidor..." />
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          titulo="Aún no tienes pedidos registrados"
          mensaje="Explora nuestro catálogo de guitarras, teclados y micrófonos y genera tu primer pedido."
          accion={{
            texto: 'Explorar Catálogo',
            alHacerClic: () => {},
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pedidos.map((pedido) => (
            <article
              key={pedido.id}
              style={{
                backgroundColor: 'var(--bg-tarjeta)',
                borderRadius: '0.75rem',
                border: '1px solid var(--borde-suave)',
                padding: '1.5rem',
              }}
              aria-labelledby={`pedido-${pedido.numero_pedido}`}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--borde-suave)', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--texto-secundario)' }}>Número de Orden</span>
                  <h2 id={`pedido-${pedido.numero_pedido}`} style={{ fontSize: '1.25rem', color: 'var(--texto-titulos)', margin: '0.125rem 0 0 0' }}>
                    {pedido.numero_pedido}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--texto-secundario)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Calendar size={16} aria-hidden="true" />
                    <span>{formatearFecha(pedido.creado_en)}</span>
                  </div>

                  <span
                    className={`insignia ${
                      pedido.estado === 'completado'
                        ? 'insignia-exito'
                        : pedido.estado === 'cancelado'
                        ? 'insignia-peligro'
                        : 'insignia-alerta'
                    }`}
                  >
                    {pedido.estado}
                  </span>
                </div>
              </div>

              {}
              {pedido.items && pedido.items.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pedido.items.map((item) => (
                      <li
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem 0',
                          borderBottom: '1px dashed var(--borde-suave)',
                          fontSize: '0.9375rem',
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--texto-titulos)' }}>
                            {item.instrumento?.nombre || (item as any).instrumento_nombre || (item as any).instrument_name || `Instrumento #${item.instrumento_id}`}
                          </strong>
                          <span style={{ color: 'var(--texto-secundario)', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>
                            x{item.cantidad} ({formatearMonto(item.precio_unitario)} c/u)
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--texto-titulos)' }}>
                          {formatearMonto(item.subtotal)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--texto-secundario)' }}>
                  {pedido.usuario ? `Comprador: ${pedido.usuario.nombre}` : ''}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--texto-secundario)', display: 'block' }}>Total de la Orden</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-dorado-brillante)' }}>
                    {formatearMonto(pedido.total)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};
