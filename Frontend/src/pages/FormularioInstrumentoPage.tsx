import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Instrumento, Categoria, Marca, CondicionInstrumento } from '../types/index.js';
import { servicioInstrumentos } from '../api/instrumentos.service.js';
import { servicioCategorias } from '../api/categorias.service.js';
import { servicioMarcas } from '../api/marcas.service.js';
import { Cargando } from '../components/Cargando.js';
import { Alerta } from '../components/Alerta.js';
import { ArrowLeft, Save, Sparkles, Sliders, Music, Check, UploadCloud, Trash2, RefreshCw } from 'lucide-react';
import { servicioSubidas } from '../api/subidas.service.js';

export const FormularioInstrumentoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [cargandoInicial, setCargandoInicial] = useState<boolean>(esEdicion);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  
  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({});

  
  const [nombre, setNombre] = useState<string>('');
  const [codigoSku, setCodigoSku] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [marcaId, setMarcaId] = useState<string>('');
  const [precio, setPrecio] = useState<string>('');
  const [stock, setStock] = useState<string>('0');
  const [condicion, setCondicion] = useState<CondicionInstrumento>('nuevo');
  const [descripcion, setDescripcion] = useState<string>('');
  const [imagenUrl, setImagenUrl] = useState<string>('');
  const [subiendoImagen, setSubiendoImagen] = useState<boolean>(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const [nombreArchivoSubido, setNombreArchivoSubido] = useState<string>('');
  const [modoUrlManual, setModoUrlManual] = useState<boolean>(false);
  const [estaActivo, setEstaActivo] = useState<boolean>(true);

  const handleSeleccionarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;

    const archivo = archivos[0];
    setErrorImagen(null);
    setSubiendoImagen(true);

    try {
      const res = await servicioSubidas.subirImagen(archivo);
      setImagenUrl(res.url);
      setNombreArchivoSubido(archivo.name);
    } catch (err: any) {
      setErrorImagen(err.message || 'Error al subir la imagen al servidor.');
    } finally {
      setSubiendoImagen(false);
      e.target.value = '';
    }
  };

  const handleEliminarImagen = () => {
    setImagenUrl('');
    setNombreArchivoSubido('');
    setErrorImagen(null);
  };

  
  const [material, setMaterial] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [acabado, setAcabado] = useState<string>('');
  const [mesesGarantia, setMesesGarantia] = useState<string>('12');
  const [pesoKg, setPesoKg] = useState<string>('0');

  
  useEffect(() => {
    async function inicializar() {
      try {
        const [cats, marcs] = await Promise.all([
          servicioCategorias.listar(),
          servicioMarcas.listar(),
        ]);
        setCategorias(cats);
        setMarcas(marcs);

        if (esEdicion && id) {
          const inst = await servicioInstrumentos.obtenerPorId(Number(id));
          setNombre(inst.nombre);
          setCodigoSku(inst.codigo_sku);
          setCategoriaId(String(inst.categoria_id));
          setMarcaId(String(inst.marca_id));
          setPrecio(String(inst.precio));
          setStock(String(inst.stock));
          setCondicion(inst.condicion);
          setDescripcion(inst.descripcion || '');
          setImagenUrl(inst.imagen_url || '');
          setEstaActivo(Boolean(inst.esta_activo));

          if (inst.especificaciones) {
            setMaterial(inst.especificaciones.material || '');
            setColor(inst.especificaciones.color || '');
            setAcabado(inst.especificaciones.acabado || '');
            setMesesGarantia(String(inst.especificaciones.meses_garantia || 12));
            setPesoKg(String(inst.especificaciones.peso_kg || 0));
          }
        }
      } catch (err: any) {
        setErrorGeneral(err.message || 'Error al cargar los datos del formulario');
      } finally {
        setCargandoInicial(false);
      }
    }
    inicializar();
  }, [id, esEdicion]);

  
  const validarCliente = (): boolean => {
    const errs: Record<string, string> = {};

    if (!nombre.trim()) errs['nombre'] = 'El nombre del instrumento es obligatorio.';
    if (esEdicion && !codigoSku.trim()) errs['codigo_sku'] = 'El código SKU es obligatorio.';
    if (!categoriaId) errs['categoria_id'] = 'Selecciona una categoría válida.';
    if (!marcaId) errs['marca_id'] = 'Selecciona una marca válida.';

    const p = parseFloat(precio);
    if (isNaN(p) || p < 0) errs['precio'] = 'El precio debe ser un número mayor o igual a 0.';

    const s = parseInt(stock, 10);
    if (isNaN(s) || s < 0) errs['stock'] = 'El stock debe ser un entero mayor o igual a 0.';

    setErroresCampos(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGeneral(null);
    setErroresCampos({});

    if (!validarCliente()) return;

    setGuardando(true);
    try {
      const cuerpo = {
        nombre: nombre.trim(),
        codigo_sku: codigoSku.trim() ? codigoSku.trim().toUpperCase() : undefined,
        categoria_id: Number(categoriaId),
        marca_id: Number(marcaId),
        precio: parseFloat(precio),
        stock: parseInt(stock, 10),
        condicion,
        descripcion: descripcion.trim() || undefined,
        imagen_url: imagenUrl.trim() || undefined,
        especificaciones: {
          material: material.trim(),
          color: color.trim(),
          acabado: acabado.trim(),
          meses_garantia: parseInt(mesesGarantia, 10) || 12,
          peso_kg: parseFloat(pesoKg) || 0,
        },
      };

      if (esEdicion && id) {
        await servicioInstrumentos.actualizar(Number(id), {
          ...cuerpo,
          esta_activo: estaActivo ? 1 : 0,
        });
      } else {
        await servicioInstrumentos.crear(cuerpo);
      }

      navigate('/admin/instrumentos');
    } catch (err: any) {
      setErrorGeneral(err.message || 'Ocurrió un error al guardar el instrumento.');

      
      if (err.erroresValidacion && Array.isArray(err.erroresValidacion)) {
        const erroresApiMap: Record<string, string> = {};
        err.erroresValidacion.forEach((e: { campo: string; mensaje: string }) => {
          erroresApiMap[e.campo] = e.mensaje;
        });
        setErroresCampos(erroresApiMap);
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoInicial) {
    return (
      <main className="contenedor" style={{ padding: '4rem 1rem' }}>
        <Cargando mensaje="Cargando formulario y catálogo de soporte..." />
      </main>
    );
  }

  return (
    <main id="contenido-principal" className="contenedor" style={{ padding: '2rem 1rem 5rem 1rem', maxWidth: '860px' }}>
      
      {}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/instrumentos" className="btn btn-secundario" style={{ display: 'inline-flex', padding: '0.5rem 1rem' }}>
          <ArrowLeft size={18} aria-hidden="true" />
          Volver a Inventario
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {esEdicion ? `Editar Instrumento #${id}` : 'Registrar Nuevo Instrumento'}
        </h1>
        <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9375rem' }}>
          Completa los campos del instrumento y sus especificaciones técnicas de fabricación.
        </p>
      </div>

      {errorGeneral && <Alerta tipo="error" mensaje={errorGeneral} alCerrar={() => setErrorGeneral(null)} />}

      <form onSubmit={handleSubmit} noValidate aria-label="Formulario de instrumento musical">
        
        {}
        <fieldset style={{ backgroundColor: 'var(--bg-tarjeta)', padding: '1.75rem', borderRadius: '0.75rem', border: '1px solid var(--borde-suave)', marginBottom: '2rem' }}>
          <legend style={{ padding: '0 0.5rem', fontWeight: 700, color: 'var(--color-dorado-brillante)', fontSize: '1.125rem' }}>
            1. Datos Comerciales del Instrumento
          </legend>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
            
            {}
            <div className="grupo-formulario" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="campo-nombre" className="etiqueta-formulario">
                Nombre del Instrumento <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="campo-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`campo-formulario ${erroresCampos['nombre'] ? 'campo-error' : ''}`}
                aria-invalid={Boolean(erroresCampos['nombre'])}
                aria-describedby={erroresCampos['nombre'] ? 'error-nombre' : undefined}
                placeholder="Ej. Fender American Professional II Stratocaster"
              />
              {erroresCampos['nombre'] && (
                <span id="error-nombre" className="texto-error" role="alert">{erroresCampos['nombre']}</span>
              )}
            </div>

            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-sku" className="etiqueta-formulario">
                Código SKU {esEdicion ? <span style={{ color: 'var(--color-error)' }}>*</span> : <span style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)', fontWeight: 'normal' }}>(automático si se deja vacío)</span>}
              </label>
              <input
                id="campo-sku"
                type="text"
                required={esEdicion}
                value={codigoSku}
                onChange={(e) => setCodigoSku(e.target.value.toUpperCase())}
                className={`campo-formulario ${erroresCampos['codigo_sku'] ? 'campo-error' : ''}`}
                aria-invalid={Boolean(erroresCampos['codigo_sku'])}
                aria-describedby={erroresCampos['codigo_sku'] ? 'error-sku' : undefined}
                placeholder={esEdicion ? "FEN-AMPRO2-STRAT-3TS" : "Generado automáticamente por el sistema"}
              />
              {erroresCampos['codigo_sku'] && (
                <span id="error-sku" className="texto-error" role="alert">{erroresCampos['codigo_sku']}</span>
              )}
            </div>

            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-categoria" className="etiqueta-formulario">
                Categoría <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                id="campo-categoria"
                required
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className={`campo-formulario ${erroresCampos['categoria_id'] ? 'campo-error' : ''}`}
                aria-invalid={Boolean(erroresCampos['categoria_id'])}
                aria-describedby={erroresCampos['categoria_id'] ? 'error-categoria' : undefined}
              >
                <option value="">Selecciona una categoría...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {erroresCampos['categoria_id'] && (
                <span id="error-categoria" className="texto-error" role="alert">{erroresCampos['categoria_id']}</span>
              )}
            </div>

            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-marca" className="etiqueta-formulario">
                Marca Fabricante <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                id="campo-marca"
                required
                value={marcaId}
                onChange={(e) => setMarcaId(e.target.value)}
                className={`campo-formulario ${erroresCampos['marca_id'] ? 'campo-error' : ''}`}
                aria-invalid={Boolean(erroresCampos['marca_id'])}
                aria-describedby={erroresCampos['marca_id'] ? 'error-marca' : undefined}
              >
                <option value="">Selecciona una marca...</option>
                {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
              {erroresCampos['marca_id'] && (
                <span id="error-marca" className="texto-error" role="alert">{erroresCampos['marca_id']}</span>
              )}
            </div>

            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-precio" className="etiqueta-formulario">
                Precio (CLP) <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="campo-precio"
                type="number"
                step="1"
                min="0"
                required
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className={`campo-formulario ${erroresCampos['precio'] ? 'campo-error' : ''}`}
                aria-invalid={Boolean(erroresCampos['precio'])}
                aria-describedby={erroresCampos['precio'] ? 'error-precio' : undefined}
                placeholder="1799.99"
              />
              {erroresCampos['precio'] && (
                <span id="error-precio" className="texto-error" role="alert">{erroresCampos['precio']}</span>
              )}
            </div>

            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-stock" className="etiqueta-formulario">
                Stock Inicial en Almacén <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="campo-stock"
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={`campo-formulario ${erroresCampos['stock'] ? 'campo-error' : ''}`}
                aria-invalid={Boolean(erroresCampos['stock'])}
                aria-describedby={erroresCampos['stock'] ? 'error-stock' : undefined}
                placeholder="8"
              />
              {erroresCampos['stock'] && (
                <span id="error-stock" className="texto-error" role="alert">{erroresCampos['stock']}</span>
              )}
            </div>

            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-condicion" className="etiqueta-formulario">
                Condición del Instrumento
              </label>
              <select
                id="campo-condicion"
                value={condicion}
                onChange={(e) => setCondicion(e.target.value as CondicionInstrumento)}
                className="campo-formulario"
              >
                <option value="nuevo">Nuevo de Fábrica</option>
                <option value="usado">Usado Certificado</option>
                <option value="reacondicionado">Reacondicionado (B-Stock)</option>
              </select>
            </div>

            {}
            <div className="grupo-formulario" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label htmlFor="campo-archivo-imagen" className="etiqueta-formulario">
                  Fotografía del Instrumento
                </label>
                <button
                  type="button"
                  onClick={() => setModoUrlManual(!modoUrlManual)}
                  className="btn-link"
                  style={{ background: 'none', border: 'none', color: 'var(--color-dorado-brillante)', fontSize: '0.8125rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {modoUrlManual ? '← Subir desde archivo de imagen' : '¿O ingresar enlace URL?'}
                </button>
              </div>

              {modoUrlManual ? (
                <div>
                  <input
                    id="campo-imagen-url"
                    type="url"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    className="campo-formulario"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <p className="texto-ayuda" style={{ marginTop: '0.25rem' }}>
                    Pega una URL pública de la imagen del instrumento.
                  </p>
                </div>
              ) : (
                <div>
                  {imagenUrl ? (
                    
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        padding: '1rem',
                        backgroundColor: 'var(--bg-superficie)',
                        border: '1px solid var(--borde-suave)',
                        borderRadius: '0.75rem',
                      }}
                    >
                      <img
                        src={imagenUrl}
                        alt="Vista previa de la fotografía del instrumento"
                        style={{
                          width: '100px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--borde-fuerte)',
                          backgroundColor: 'var(--bg-elevado)',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span className="insignia insignia-exito">Imagen Lista</span>
                          {nombreArchivoSubido && (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--texto-titulos)', fontWeight: 600 }}>
                              {nombreArchivoSubido}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--texto-secundario)', wordBreak: 'break-all', margin: 0 }}>
                          {imagenUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleEliminarImagen}
                        className="btn btn-secundario btn-peligro"
                        style={{ minHeight: '38px', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                        aria-label="Eliminar fotografía seleccionada"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        Quitar
                      </button>
                    </div>
                  ) : (
                    
                    <div>
                      <input
                        id="campo-archivo-imagen"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleSeleccionarArchivo}
                        disabled={subiendoImagen}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="campo-archivo-imagen"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2rem 1.5rem',
                          backgroundColor: 'var(--bg-superficie)',
                          border: '2px dashed var(--borde-fuerte)',
                          borderRadius: '0.75rem',
                          cursor: subiendoImagen ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                        }}
                      >
                        {subiendoImagen ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={32} color="var(--color-dorado-brillante)" className="animar-giro" aria-hidden="true" />
                            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--texto-titulos)' }}>
                              Subiendo archivo al servidor...
                            </span>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--texto-secundario)' }}>
                              Por favor espera un momento
                            </span>
                          </div>
                        ) : (
                          <>
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-dorado-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.75rem',
                                border: '1px solid rgba(217, 119, 6, 0.3)',
                              }}
                            >
                              <UploadCloud size={24} color="var(--color-dorado-brillante)" aria-hidden="true" />
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--texto-titulos)', marginBottom: '0.25rem' }}>
                              Haz clic aquí para seleccionar una foto desde tu dispositivo
                            </span>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--texto-secundario)' }}>
                              Formatos compatibles: JPG, PNG, WebP o GIF (Tamaño máximo: 5 MB)
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  )}

                  {errorImagen && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span className="texto-error" role="alert">{errorImagen}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {}
            <div className="grupo-formulario" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="campo-descripcion" className="etiqueta-formulario">
                Descripción Detallada
              </label>
              <textarea
                id="campo-descripcion"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="campo-formulario"
                style={{ height: 'auto', resize: 'vertical' }}
                placeholder="Describe las características sonoras, pastillas, sonido y maderas..."
              />
            </div>

            {}
            {esEdicion && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-superficie)', borderRadius: '0.5rem' }}>
                <input
                  id="campo-activo"
                  type="checkbox"
                  checked={estaActivo}
                  onChange={(e) => setEstaActivo(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--color-dorado-brillante)' }}
                />
                <label htmlFor="campo-activo" style={{ fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}>
                  Instrumento activo y visible en el catálogo público
                </label>
              </div>
            )}
          </div>
        </fieldset>

        {}
        <fieldset style={{ backgroundColor: 'var(--bg-tarjeta)', padding: '1.75rem', borderRadius: '0.75rem', border: '1px solid var(--borde-suave)', marginBottom: '2rem' }}>
          <legend style={{ padding: '0 0.5rem', fontWeight: 700, color: 'var(--color-dorado-brillante)', fontSize: '1.125rem' }}>
            2. Especificaciones Técnicas y Materiales
          </legend>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
            
            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-material" className="etiqueta-formulario">
                Materiales de Construcción
              </label>
              <input
                id="campo-material"
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="campo-formulario"
                placeholder="Cuerpo de Aliso, Mástil de Arce..."
              />
            </div>

            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-color" className="etiqueta-formulario">
                Color o Tonalidad
              </label>
              <input
                id="campo-color"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="campo-formulario"
                placeholder="3-Color Sunburst, Cherry, Black..."
              />
            </div>

            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-acabado" className="etiqueta-formulario">
                Tipo de Acabado
              </label>
              <input
                id="campo-acabado"
                type="text"
                value={acabado}
                onChange={(e) => setAcabado(e.target.value)}
                className="campo-formulario"
                placeholder="Poliuretano brillante, Nitrocelulosa..."
              />
            </div>

            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-garantia" className="etiqueta-formulario">
                Garantía (Meses)
              </label>
              <input
                id="campo-garantia"
                type="number"
                min="0"
                value={mesesGarantia}
                onChange={(e) => setMesesGarantia(e.target.value)}
                className="campo-formulario"
                placeholder="12, 24, 36..."
              />
            </div>

            {}
            <div className="grupo-formulario">
              <label htmlFor="campo-peso" className="etiqueta-formulario">
                Peso Estimado (kg)
              </label>
              <input
                id="campo-peso"
                type="number"
                step="0.01"
                min="0"
                value={pesoKg}
                onChange={(e) => setPesoKg(e.target.value)}
                className="campo-formulario"
                placeholder="3.60"
              />
            </div>
          </div>
        </fieldset>

        {}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/admin/instrumentos" className="btn btn-secundario">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={guardando}
            className="btn btn-primario"
            style={{ minWidth: '160px' }}
          >
            <Save size={18} aria-hidden="true" />
            {guardando ? 'Guardando...' : esEdicion ? 'Actualizar Instrumento' : 'Crear Instrumento'}
          </button>
        </div>
      </form>
    </main>
  );
};
