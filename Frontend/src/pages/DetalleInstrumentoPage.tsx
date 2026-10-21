import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Instrumento } from '../types/index.js';
import { servicioInstrumentos } from '../api/instrumentos.service.js';
import { servicioPedidos } from '../api/pedidos.service.js';
import { useAuth } from '../context/AuthContext.js';
import { Cargando } from '../components/Cargando.js';
import { Alerta } from '../components/Alerta.js';
import { ModalConfirmacion } from '../components/ModalConfirmacion.js';
import {
  ArrowLeft,
  ShoppingCart,
  Edit,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Tag,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const DetalleInstrumentoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { esAutenticado, tieneRol } = useAuth();

  const [instrumento, setInstrumento] = useState<Instrumento | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [cantidad, setCantidad] = useState<number>(1);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);

  useEffect(() => {
    async function cargarDetalle() {
      if (!id) return;
      setCargando(true);
      setError(null);
      try {
        const datos = await servicioInstrumentos.obtenerPorId(Number(id));
        setInstrumento(datos);
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el instrumento solicitado.');
      } finally {
        setCargando(false);
      }
    }
    cargarDetalle();
  }, [id]);

  const handleComprar = async () => {
    if (!instrumento) return;
    if (!esAutenticado) {
      setError('Debes iniciar sesión con tu cuenta para procesar pedidos.');
      setModalAbierto(false);
      return;
    }

    setProcesando(true);
    try {
      const pedido = await servicioPedidos.crear([
        { instrumento_id: instrumento.id, cantidad },
      ]);
      setMensajeExito(`¡Pedido ${pedido.numero_pedido} generado exitosamente! Se descontaron ${cantidad} unidades.`);
      setModalAbierto(false);
      
      const actualizado = await servicioInstrumentos.obtenerPorId(instrumento.id);
      setInstrumento(actualizado);
    } catch (err: any) {
      setError(err.message || 'No se pudo generar el pedido.');
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <main className="contenedor" style={{ padding: '4rem 1rem' }}>
        <Cargando mensaje="Cargando detalles técnicos del instrumento..." />
      </main>
    );
  }

  if (error || !instrumento) {
    return (
      <main className="contenedor" style={{ padding: '3rem 1rem' }}>
        <Alerta tipo="error" mensaje={error || 'Instrumento no encontrado'} />
        <Link to="/" className="btn btn-secundario" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={18} aria-hidden="true" />
          Volver al Catálogo
        </Link>
      </main>
    );
  }

  const tieneStock = instrumento.stock > 0;
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);
  };
  const precioFormateado = formatearMoneda(instrumento.precio);

  return (
    <main id="contenido-principal" className="contenedor" style={{ padding: '2rem 1rem 4rem 1rem' }}>
      
      {}
      <nav aria-label="Migas de pan" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ol style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', listStyle: 'none', color: 'var(--texto-secundario)' }}>
          <li><Link to="/">Inicio</Link></li>
          <li aria-hidden="true">/</li>
          {instrumento.categoria && (
            <>
              <li><Link to={`/?categoria_id=${instrumento.categoria.id}`}>{instrumento.categoria.nombre}</Link></li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li style={{ color: 'var(--texto-titulos)', fontWeight: 600 }} aria-current="page">
            {instrumento.nombre}
          </li>
        </ol>
      </nav>

      {}
      {mensajeExito && <Alerta tipo="exito" mensaje={mensajeExito} alCerrar={() => setMensajeExito(null)} />}
      {error && <Alerta tipo="error" mensaje={error} alCerrar={() => setError(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        
        {}
        <div>
          <div style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--borde-suave)', backgroundColor: 'var(--bg-tarjeta)' }}>
            <img
              src={instrumento.imagen_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'}
              alt={`Fotografía detallada de ${instrumento.nombre}`}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
              <span className={`insignia ${tieneStock ? 'insignia-exito' : 'insignia-peligro'}`}>
                {tieneStock ? `${instrumento.stock} Disponibles` : 'Agotado temporalmente'}
              </span>
              <span className="insignia insignia-dorada">
                Condición: {instrumento.condicion}
              </span>
            </div>
          </div>
        </div>

        {}
        <div>
          {}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            {instrumento.marca && (
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-dorado-brillante)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {instrumento.marca.nombre}
              </span>
            )}
            <span style={{ color: 'var(--borde-fuerte)' }}>•</span>
            {instrumento.categoria && (
              <span style={{ fontSize: '0.875rem', color: 'var(--texto-secundario)' }}>
                {instrumento.categoria.nombre}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {instrumento.nombre}
          </h1>

          <div style={{ fontSize: '0.8125rem', color: 'var(--texto-atenuado)', marginBottom: '1.25rem' }}>
            SKU / Código Único: <code>{instrumento.codigo_sku}</code>
          </div>

          {}
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tarjeta)', borderRadius: '0.75rem', border: '1px solid var(--borde-suave)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-dorado-brillante)' }}>
                {precioFormateado}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--texto-secundario)' }}>CLP (IVA Incluido)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-exito)', fontSize: '0.875rem', fontWeight: 500 }}>
              <ShieldCheck size={18} aria-hidden="true" />
              <span>Garantía oficial del fabricante: {instrumento.especificaciones?.meses_garantia || 12} meses</span>
            </div>
          </div>

          {}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Descripción del Instrumento</h2>
            <p style={{ color: 'var(--texto-cuerpo)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              {instrumento.descripcion || 'Sin descripción adicional para este producto.'}
            </p>
          </div>

          {}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--bg-superficie)', borderRadius: '0.75rem', border: '1px solid var(--borde-suave)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="selector-cantidad" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Cantidad:
              </label>
              <select
                id="selector-cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                disabled={!tieneStock}
                className="campo-formulario"
                style={{ width: '80px', minHeight: '44px' }}
              >
                {Array.from({ length: Math.min(instrumento.stock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              disabled={!tieneStock}
              className="btn btn-primario"
              style={{ flex: '1 1 200px' }}
            >
              <ShoppingCart size={20} aria-hidden="true" />
              Realizar Pedido Ahora
            </button>

            {tieneRol('administrador', 'vendedor') && (
              <Link
                to={`/admin/instrumentos/${instrumento.id}/editar`}
                className="btn btn-secundario"
                aria-label={`Editar instrumento ${instrumento.nombre}`}
              >
                <Edit size={18} aria-hidden="true" />
                Editar
              </Link>
            )}
          </div>
        </div>
      </div>

      {}
      <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--borde-suave)' }} aria-labelledby="titulo-ficha-tecnica">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Sliders size={22} color="var(--color-dorado-brillante)" aria-hidden="true" />
          <h2 id="titulo-ficha-tecnica" style={{ fontSize: '1.5rem', margin: 0 }}>
            Especificaciones Técnicas y Ficha de Fabricación
          </h2>
        </div>

        <div style={{ backgroundColor: 'var(--bg-tarjeta)', borderRadius: '0.75rem', border: '1px solid var(--borde-suave)', overflow: 'hidden' }}>
          <table className="tabla-responsiva" aria-label="Tabla de especificaciones técnicas">
            <tbody>
              <tr>
                <th scope="row" style={{ width: '35%', color: 'var(--texto-secundario)' }}>Materiales de Construcción</th>
                <td>{instrumento.especificaciones?.material || 'No especificado'}</td>
              </tr>
              <tr>
                <th scope="row" style={{ color: 'var(--texto-secundario)' }}>Color</th>
                <td>{instrumento.especificaciones?.color || 'No especificado'}</td>
              </tr>
              <tr>
                <th scope="row" style={{ color: 'var(--texto-secundario)' }}>Tipo de Acabado</th>
                <td>{instrumento.especificaciones?.acabado || 'Estándar'}</td>
              </tr>
              <tr>
                <th scope="row" style={{ color: 'var(--texto-secundario)' }}>Peso Estimado</th>
                <td>{instrumento.especificaciones?.peso_kg ? `${instrumento.especificaciones.peso_kg} kg` : 'N/D'}</td>
              </tr>
              <tr>
                <th scope="row" style={{ color: 'var(--texto-secundario)' }}>Garantía Oficial</th>
                <td>{instrumento.especificaciones?.meses_garantia || 12} meses directos</td>
              </tr>
              <tr>
                <th scope="row" style={{ color: 'var(--texto-secundario)' }}>Marca y País de Origen</th>
                <td>
                  {instrumento.marca?.nombre} {instrumento.marca?.pais_origen ? `(${instrumento.marca.pais_origen})` : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {}
      <ModalConfirmacion
        abierto={modalAbierto}
        titulo="Confirmar Pedido de Instrumento"
        mensaje={`Estás a punto de emitir un pedido de ${cantidad} unidad(es) de "${instrumento.nombre}" por un total de ${formatearMoneda(instrumento.precio * cantidad)} CLP. El stock de la tienda se actualizará en tiempo real.`}
        textoConfirmar="Confirmar Compra"
        cargando={procesando}
        alConfirmar={handleComprar}
        alCerrar={() => setModalAbierto(false)}
      />
    </main>
  );
};
