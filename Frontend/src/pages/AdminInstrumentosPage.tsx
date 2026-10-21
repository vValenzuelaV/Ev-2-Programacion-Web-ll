import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Instrumento, Categoria, Marca } from '../types/index.js';
import { servicioInstrumentos } from '../api/instrumentos.service.js';
import { servicioCategorias } from '../api/categorias.service.js';
import { servicioMarcas } from '../api/marcas.service.js';
import { useAuth } from '../context/AuthContext.js';
import { Cargando } from '../components/Cargando.js';
import { Alerta } from '../components/Alerta.js';
import { EstadoVacio } from '../components/EstadoVacio.js';
import { ModalConfirmacion } from '../components/ModalConfirmacion.js';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export const AdminInstrumentosPage: React.FC = () => {
  const { usuario, tieneRol } = useAuth();

  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  
  const [buscar, setBuscar] = useState<string>('');
  const [textoBusqueda, setTextoBusqueda] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [marcaId, setMarcaId] = useState<string>('');
  const [filtroActivo, setFiltroActivo] = useState<string>(''); 

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscar(textoBusqueda);
    }, 350);
    return () => clearTimeout(timer);
  }, [textoBusqueda]);

  
  const [instrumentoAEliminar, setInstrumentoAEliminar] = useState<Instrumento | null>(null);
  const [eliminacionPermanente, setEliminacionPermanente] = useState<boolean>(false);
  const [procesandoEliminacion, setProcesandoEliminacion] = useState<boolean>(false);

  
  useEffect(() => {
    async function inicializarFiltros() {
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
    inicializarFiltros();
  }, []);

  const cargarInstrumentos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await servicioInstrumentos.listar({
        pagina: 1,
        limite: 100, 
        buscar: buscar || undefined,
        categoria_id: categoriaId ? Number(categoriaId) : undefined,
        marca_id: marcaId ? Number(marcaId) : undefined,
        esta_activo: filtroActivo !== '' ? Number(filtroActivo) : undefined,
        ordenar_por: 'id',
        orden: 'desc',
      });
      setInstrumentos(res.datos);
    } catch (err: any) {
      setError(err.message || 'Error al obtener la lista de inventario');
    } finally {
      setCargando(false);
    }
  }, [buscar, categoriaId, marcaId, filtroActivo]);

  useEffect(() => {
    cargarInstrumentos();
  }, [cargarInstrumentos]);

  const confirmarEliminar = async () => {
    if (!instrumentoAEliminar) return;

    setProcesandoEliminacion(true);
    setError(null);
    try {
      await servicioInstrumentos.eliminar(instrumentoAEliminar.id, eliminacionPermanente);
      setMensajeExito(
        eliminacionPermanente
          ? `Instrumento "${instrumentoAEliminar.nombre}" eliminado permanentemente.`
          : `Instrumento "${instrumentoAEliminar.nombre}" desactivado lógicamente (esta_activo = 0).`
      );
      setInstrumentoAEliminar(null);
      setEliminacionPermanente(false);
      cargarInstrumentos();
    } catch (err: any) {
      setError(err.message || 'No se pudo eliminar el instrumento');
    } finally {
      setProcesandoEliminacion(false);
    }
  };

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const esAdmin = tieneRol('administrador');

  return (
    <main id="contenido-principal" className="contenedor" style={{ padding: '2rem 1rem 5rem 1rem' }}>
      
      {}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-dorado-brillante)', marginBottom: '0.25rem' }}>
            <Shield size={20} aria-hidden="true" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Panel de Control Staff
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Gestión de Inventario (CRUD)</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={cargarInstrumentos}
            className="btn btn-secundario"
            aria-label="Refrescar lista de inventario"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Actualizar
          </button>

          <Link to="/admin/instrumentos/nuevo" className="btn btn-primario">
            <Plus size={18} aria-hidden="true" />
            Nuevo Instrumento
          </Link>
        </div>
      </div>

      {}
      {mensajeExito && <Alerta tipo="exito" mensaje={mensajeExito} alCerrar={() => setMensajeExito(null)} />}
      {error && <Alerta tipo="error" mensaje={error} alCerrar={() => setError(null)} />}

      {}
      <div style={{ backgroundColor: 'var(--bg-tarjeta)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--borde-suave)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
        
        {}
        <div style={{ flex: '1 1 240px' }}>
          <label htmlFor="busqueda-admin" className="etiqueta-formulario">Buscar:</label>
          <div style={{ position: 'relative' }}>
            <input
              id="busqueda-admin"
              type="search"
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              placeholder="Buscar por nombre, SKU..."
              className="campo-formulario"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} color="var(--texto-secundario)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
          </div>
        </div>

        {}
        <div style={{ flex: '1 1 180px' }}>
          <label htmlFor="categoria-admin" className="etiqueta-formulario">Categoría:</label>
          <select
            id="categoria-admin"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="campo-formulario"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        {}
        <div style={{ flex: '1 1 180px' }}>
          <label htmlFor="marca-admin" className="etiqueta-formulario">Marca:</label>
          <select
            id="marca-admin"
            value={marcaId}
            onChange={(e) => setMarcaId(e.target.value)}
            className="campo-formulario"
          >
            <option value="">Todas las marcas</option>
            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>

        {}
        <div style={{ flex: '1 1 140px' }}>
          <label htmlFor="estado-admin" className="etiqueta-formulario">Estado:</label>
          <select
            id="estado-admin"
            value={filtroActivo}
            onChange={(e) => setFiltroActivo(e.target.value)}
            className="campo-formulario"
          >
            <option value="">Todos los estados</option>
            <option value="1">Solo Activos</option>
            <option value="0">Solo Desactivados</option>
          </select>
        </div>
      </div>

      {}
      {cargando ? (
        <Cargando mensaje="Cargando catálogo de inventario..." />
      ) : instrumentos.length === 0 ? (
        <EstadoVacio
          titulo="Sin instrumentos registrados"
          mensaje="No se encontraron registros que coincidan con los filtros aplicados."
          accion={{
            texto: 'Crear primer instrumento',
            alHacerClic: () => {},
          }}
        />
      ) : (
        <div style={{ backgroundColor: 'var(--bg-tarjeta)', borderRadius: '0.75rem', border: '1px solid var(--borde-suave)', overflow: 'hidden' }}>
          <table className="tabla-responsiva tabla-movil-tarjeta" aria-label="Inventario de instrumentos musicales">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Instrumento / SKU</th>
                <th scope="col">Categoría</th>
                <th scope="col">Marca</th>
                <th scope="col">Precio</th>
                <th scope="col">Stock</th>
                <th scope="col">Estado</th>
                <th scope="col" style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {instrumentos.map((inst) => {
                const activo = Boolean(inst.esta_activo);
                return (
                  <tr key={inst.id} style={{ opacity: activo ? 1 : 0.65 }}>
                    <td data-label="ID">#{inst.id}</td>
                    
                    <td data-label="Instrumento">
                      <div>
                        <strong style={{ color: 'var(--texto-titulos)', display: 'block' }}>{inst.nombre}</strong>
                        <code style={{ fontSize: '0.75rem' }}>{inst.codigo_sku}</code>
                      </div>
                    </td>

                    <td data-label="Categoría">
                      {inst.categoria?.nombre || '-'}
                    </td>

                    <td data-label="Marca">
                      {inst.marca?.nombre || '-'}
                    </td>

                    <td data-label="Precio" style={{ fontWeight: 700, color: 'var(--color-dorado-brillante)' }}>
                      {formatearPrecio(inst.precio)}
                    </td>

                    <td data-label="Stock">
                      <span className={`insignia ${inst.stock > 0 ? 'insignia-exito' : 'insignia-peligro'}`}>
                        {inst.stock} uds
                      </span>
                    </td>

                    <td data-label="Estado">
                      <span className={`insignia ${activo ? 'insignia-exito' : 'insignia-peligro'}`}>
                        {activo ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>

                    <td data-label="Acciones" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <Link
                          to={`/instrumento/${inst.id}`}
                          className="btn btn-secundario"
                          style={{ minHeight: '38px', minWidth: '38px', padding: '0.375rem' }}
                          aria-label={`Ver detalle público de ${inst.nombre}`}
                          title="Ver detalle"
                        >
                          <Eye size={16} aria-hidden="true" />
                        </Link>

                        <Link
                          to={`/admin/instrumentos/${inst.id}/editar`}
                          className="btn btn-secundario"
                          style={{ minHeight: '38px', minWidth: '38px', padding: '0.375rem', color: 'var(--color-dorado-brillante)' }}
                          aria-label={`Editar instrumento ${inst.nombre}`}
                          title="Editar instrumento"
                        >
                          <Edit size={16} aria-hidden="true" />
                        </Link>

                        {}
                        {esAdmin ? (
                          <button
                            type="button"
                            onClick={() => {
                              setInstrumentoAEliminar(inst);
                              setEliminacionPermanente(false);
                            }}
                            className="btn btn-secundario"
                            style={{ minHeight: '38px', minWidth: '38px', padding: '0.375rem', color: 'var(--color-error)' }}
                            aria-label={`Eliminar o desactivar instrumento ${inst.nombre}`}
                            title="Eliminar o desactivar"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="btn btn-secundario"
                            style={{ minHeight: '38px', minWidth: '38px', padding: '0.375rem', opacity: 0.3 }}
                            title="Eliminación restringida al rol Administrador (RBAC)"
                            aria-label="Eliminación no permitida para vendedores"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {}
      {instrumentoAEliminar && (
        <ModalConfirmacion
          abierto={Boolean(instrumentoAEliminar)}
          titulo={eliminacionPermanente ? '¿Eliminar Permanentemente?' : '¿Desactivar Instrumento?'}
          mensaje={
            eliminacionPermanente
              ? `ADVERTENCIA: La eliminación física borrará el instrumento "${instrumentoAEliminar.nombre}" y sus especificaciones de la base de datos de forma irreversible.`
              : `El instrumento "${instrumentoAEliminar.nombre}" pasará a estado inactivo (esta_activo = 0). Dejará de mostrarse en el catálogo público pero conservará su historial de órdenes.`
          }
          textoConfirmar={eliminacionPermanente ? 'Eliminar Definitivamente' : 'Desactivar Instrumento'}
          peligro={true}
          cargando={procesandoEliminacion}
          alConfirmar={confirmarEliminar}
          alCerrar={() => {
            setInstrumentoAEliminar(null);
            setEliminacionPermanente(false);
          }}
        />
      )}
    </main>
  );
};
