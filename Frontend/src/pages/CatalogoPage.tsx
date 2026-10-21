import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Instrumento, Categoria, Marca } from '../types/index.js';
import { servicioInstrumentos } from '../api/instrumentos.service.js';
import { servicioCategorias } from '../api/categorias.service.js';
import { servicioMarcas } from '../api/marcas.service.js';
import { servicioPedidos } from '../api/pedidos.service.js';
import { useAuth } from '../context/AuthContext.js';
import { TarjetaInstrumento } from '../components/TarjetaInstrumento.js';
import { Cargando } from '../components/Cargando.js';
import { EstadoVacio } from '../components/EstadoVacio.js';
import { Alerta } from '../components/Alerta.js';
import { ModalConfirmacion } from '../components/ModalConfirmacion.js';
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, Music, Sparkles } from 'lucide-react';

export const CatalogoPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { esAutenticado } = useAuth();

  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  
  const pagina = Number(searchParams.get('pagina')) || 1;
  const buscar = searchParams.get('buscar') || '';
  const categoriaId = searchParams.get('categoria_id') ? Number(searchParams.get('categoria_id')) : undefined;
  const marcaId = searchParams.get('marca_id') ? Number(searchParams.get('marca_id')) : undefined;
  const ordenarPor = searchParams.get('ordenar_por') || 'id';
  const orden = (searchParams.get('orden') as 'asc' | 'desc') || 'desc';

  
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [totalRegistros, setTotalRegistros] = useState<number>(0);

  
  const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState<Instrumento | null>(null);
  const [procesandoOrden, setProcesandoOrden] = useState<boolean>(false);

  
  useEffect(() => {
    async function cargarFiltros() {
      try {
        const [cats, marcs] = await Promise.all([
          servicioCategorias.listar(),
          servicioMarcas.listar(),
        ]);
        setCategorias(cats);
        setMarcas(marcs);
      } catch (err: any) {
        console.error('Error al cargar filtros:', err);
      }
    }
    cargarFiltros();
  }, []);

  
  const cargarInstrumentos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await servicioInstrumentos.listar({
        pagina,
        limite: 8,
        buscar: buscar || undefined,
        categoria_id: categoriaId,
        marca_id: marcaId,
        ordenar_por: ordenarPor,
        orden: orden,
        esta_activo: 1, 
      });
      setInstrumentos(res.datos);
      setTotalPaginas(res.paginacion.total_paginas);
      setTotalRegistros(res.paginacion.total);
    } catch (err: any) {
      setError(err.message || 'Error al obtener los instrumentos del catálogo');
    } finally {
      setCargando(false);
    }
  }, [pagina, buscar, categoriaId, marcaId, ordenarPor, orden]);

  useEffect(() => {
    cargarInstrumentos();
  }, [cargarInstrumentos]);

  
  const actualizarFiltro = useCallback((clave: string, valor: string | undefined) => {
    const nuevosParams = new URLSearchParams(searchParams);
    if (valor !== undefined && valor !== '') {
      nuevosParams.set(clave, valor);
    } else {
      nuevosParams.delete(clave);
    }
    
    if (clave !== 'pagina') {
      nuevosParams.set('pagina', '1');
    }
    setSearchParams(nuevosParams);
  }, [searchParams, setSearchParams]);

  
  const [textoBusqueda, setTextoBusqueda] = useState<string>(buscar);

  useEffect(() => {
    setTextoBusqueda(buscar);
  }, [buscar]);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      if (textoBusqueda !== buscar) {
        actualizarFiltro('buscar', textoBusqueda);
      }
    }, 350);

    return () => clearTimeout(temporizador);
  }, [textoBusqueda, buscar, actualizarFiltro]);

  const handleCrearPedido = async () => {
    if (!instrumentoSeleccionado) return;
    if (!esAutenticado) {
      setError('Debes iniciar sesión con una cuenta de cliente para realizar pedidos.');
      setInstrumentoSeleccionado(null);
      return;
    }

    setProcesandoOrden(true);
    try {
      const orden = await servicioPedidos.crear([
        { instrumento_id: instrumentoSeleccionado.id, cantidad: 1 },
      ]);
      setMensajeExito(`¡Pedido ${orden.numero_pedido} generado exitosamente! Stock actualizado.`);
      setInstrumentoSeleccionado(null);
      cargarInstrumentos(); 
    } catch (err: any) {
      setError(err.message || 'No se pudo procesar el pedido.');
    } finally {
      setProcesandoOrden(false);
    }
  };

  return (
    <main id="contenido-principal" className="contenedor" style={{ paddingBottom: '4rem' }}>
      
      {}
      <section
        style={{
          marginTop: '1.5rem',
          marginBottom: '2rem',
          padding: '2.5rem 1.5rem',
          backgroundColor: 'var(--bg-tarjeta)',
          borderRadius: '1rem',
          border: '1px solid var(--borde-suave)',
          backgroundImage: 'radial-gradient(ellipse at top right, rgba(217, 119, 6, 0.15), transparent 70%)',
          textAlign: 'center',
        }}
        aria-labelledby="titulo-banner"
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-dorado-bg)', padding: '0.375rem 0.875rem', borderRadius: '9999px', marginBottom: '1rem', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
          <Sparkles size={16} color="var(--color-dorado-brillante)" aria-hidden="true" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-dorado-brillante)' }}>
            Catálogo Oficial 2026
          </span>
        </div>
        <h1 id="titulo-banner" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>
          Encuentra el Sonido de tu Pasión
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--texto-secundario)', maxWidth: '640px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
          Explora guitarras legendarias, baterías acústicas, teclados de concierto y equipo de audio profesional con garantía oficial.
        </p>

        {}
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              
            }}
            role="search"
            aria-label="Búsqueda de instrumentos"
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <label htmlFor="campo-busqueda-catalogo" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
                Buscar instrumentos por nombre, SKU o descripción
              </label>
              <input
                id="campo-busqueda-catalogo"
                type="search"
                value={textoBusqueda}
                onChange={(e) => setTextoBusqueda(e.target.value)}
                placeholder="Buscar por nombre, modelo (ej. Stratocaster, Les Paul)..."
                className="campo-formulario"
                style={{ paddingLeft: '2.75rem', paddingRight: '1rem', height: '48px', borderRadius: '9999px', backgroundColor: 'var(--bg-principal)' }}
              />
              <Search
                size={20}
                color="var(--texto-secundario)"
                style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }}
                aria-hidden="true"
              />
            </div>
          </form>
        </div>
      </section>

      {}
      {mensajeExito && <Alerta tipo="exito" mensaje={mensajeExito} alCerrar={() => setMensajeExito(null)} />}
      {error && <Alerta tipo="error" mensaje={error} alCerrar={() => setError(null)} />}

      {}
      <section aria-label="Filtros del catálogo" style={{ marginBottom: '2rem' }}>
        
        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem' }} role="tablist" aria-label="Categorías de instrumentos">
          <button
            type="button"
            onClick={() => actualizarFiltro('categoria_id', undefined)}
            className={`btn ${categoriaId === undefined ? 'btn-primario' : 'btn-secundario'}`}
            style={{ borderRadius: '9999px', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            role="tab"
            aria-selected={categoriaId === undefined}
          >
            Todas las Categorías
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => actualizarFiltro('categoria_id', String(cat.id))}
              className={`btn ${categoriaId === cat.id ? 'btn-primario' : 'btn-secundario'}`}
              style={{ borderRadius: '9999px', fontSize: '0.875rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
              role="tab"
              aria-selected={categoriaId === cat.id}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-superficie)', borderRadius: '0.5rem', border: '1px solid var(--borde-suave)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="filtro-marca" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--texto-secundario)' }}>
                Marca:
              </label>
              <select
                id="filtro-marca"
                value={marcaId || ''}
                onChange={(e) => actualizarFiltro('marca_id', e.target.value || undefined)}
                className="campo-formulario"
                style={{ minHeight: '38px', height: '38px', padding: '0.25rem 0.75rem', fontSize: '0.875rem', width: 'auto' }}
              >
                <option value="">Todas las marcas</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="filtro-orden" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--texto-secundario)' }}>
                Ordenar por:
              </label>
              <select
                id="filtro-orden"
                value={`${ordenarPor}-${orden}`}
                onChange={(e) => {
                  const [campo, sentido] = e.target.value.split('-');
                  const nuevosParams = new URLSearchParams(searchParams);
                  nuevosParams.set('ordenar_por', campo);
                  nuevosParams.set('orden', sentido);
                  nuevosParams.set('pagina', '1');
                  setSearchParams(nuevosParams);
                }}
                className="campo-formulario"
                style={{ minHeight: '38px', height: '38px', padding: '0.25rem 0.75rem', fontSize: '0.875rem', width: 'auto' }}
              >
                <option value="id-desc">Más recientes</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre-asc">Nombre: A - Z</option>
                <option value="stock-desc">Mayor stock disponible</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--texto-secundario)' }}>
            Mostrando <strong>{instrumentos.length}</strong> de <strong>{totalRegistros}</strong> instrumentos
          </div>
        </div>
      </section>

      {}
      <section aria-label="Listado de instrumentos" aria-live="polite">
        {cargando ? (
          <Cargando mensaje="Cargando instrumentos de la tienda..." />
        ) : instrumentos.length === 0 ? (
          <EstadoVacio
            titulo="No se encontraron instrumentos"
            mensaje="No hay instrumentos que coincidan con los filtros o término de búsqueda seleccionado."
            esBusqueda={Boolean(buscar || categoriaId || marcaId)}
            accion={{
              texto: 'Limpiar todos los filtros',
              alHacerClic: () => setSearchParams(new URLSearchParams()),
            }}
          />
        ) : (
          <>
            <div className="cuadricula-productos">
              {instrumentos.map((inst) => (
                <TarjetaInstrumento
                  key={inst.id}
                  instrumento={inst}
                  alOrdenar={(instrumento) => setInstrumentoSeleccionado(instrumento)}
                />
              ))}
            </div>

            {}
            {totalPaginas > 1 && (
              <nav aria-label="Paginación de catálogo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                <button
                  type="button"
                  onClick={() => actualizarFiltro('pagina', String(pagina - 1))}
                  disabled={pagina <= 1}
                  className="btn btn-secundario"
                  aria-label="Ir a la página anterior"
                  style={{ minHeight: '44px', minWidth: '44px', padding: '0.5rem' }}
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => actualizarFiltro('pagina', String(num))}
                    className={`btn ${pagina === num ? 'btn-primario' : 'btn-secundario'}`}
                    style={{ minHeight: '44px', minWidth: '44px', padding: '0.5rem 0.875rem' }}
                    aria-current={pagina === num ? 'page' : undefined}
                    aria-label={`Página ${num}`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => actualizarFiltro('pagina', String(pagina + 1))}
                  disabled={pagina >= totalPaginas}
                  className="btn btn-secundario"
                  aria-label="Ir a la página siguiente"
                  style={{ minHeight: '44px', minWidth: '44px', padding: '0.5rem' }}
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      {}
      {instrumentoSeleccionado && (
        <ModalConfirmacion
          abierto={Boolean(instrumentoSeleccionado)}
          titulo="Generar Pedido de Compra"
          mensaje={`¿Deseas confirmar el pedido de 1 unidad de "${instrumentoSeleccionado.nombre}" por un total de $${instrumentoSeleccionado.precio.toLocaleString('es-CL')} CLP? El inventario se descontará de inmediato en el servidor.`}
          textoConfirmar="Confirmar Pedido"
          textoCancelar="Cancelar"
          cargando={procesandoOrden}
          alConfirmar={handleCrearPedido}
          alCerrar={() => setInstrumentoSeleccionado(null)}
        />
      )}
    </main>
  );
};
