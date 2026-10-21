import bcrypt from 'bcryptjs';
import { db, initDatabase } from '../config/database.js';

async function seed(): Promise<void> {
  console.log('🌱 Iniciando carga de datos de prueba en Español (Seed)...');

  
  await initDatabase();

  
  db.exec(`
    DELETE FROM detalles_pedido;
    DELETE FROM pedidos;
    DELETE FROM especificaciones_instrumento;
    DELETE FROM instrumentos;
    DELETE FROM marcas;
    DELETE FROM categorias;
    DELETE FROM usuarios;
    DELETE FROM sqlite_sequence;
  `);

  console.log('🧹 Tablas limpiadas.');

  
  console.log('👤 Insertando usuarios...');
  const salt = 10;
  const adminPassword = await bcrypt.hash('Admin123!', salt);
  const sellerPassword = await bcrypt.hash('Vendedor123!', salt);
  const customerPassword = await bcrypt.hash('Cliente123!', salt);

  const insertUsuario = db.prepare(`
    INSERT INTO usuarios (nombre, correo, clave, rol)
    VALUES (?, ?, ?, ?)
  `);

  const adminId = insertUsuario.run('Administrador Principal', 'admin@tienda.com', adminPassword, 'administrador').lastInsertRowid;
  const sellerId = insertUsuario.run('Juan Vendedor', 'vendedor@tienda.com', sellerPassword, 'vendedor').lastInsertRowid;
  const customer1Id = insertUsuario.run('Ana Martínez', 'cliente@tienda.com', customerPassword, 'cliente').lastInsertRowid;
  const customer2Id = insertUsuario.run('Carlos Rodríguez', 'carlos@tienda.com', customerPassword, 'cliente').lastInsertRowid;

  
  console.log('📁 Insertando categorías...');
  const insertCategoria = db.prepare(`
    INSERT INTO categorias (nombre, slug, descripcion, icono)
    VALUES (?, ?, ?, ?)
  `);

  const catCuerdasId = insertCategoria.run('Cuerdas', 'cuerdas', 'Guitarras eléctricas, acústicas, bajos y ukeleles', 'guitar').lastInsertRowid;
  const catVientoId = insertCategoria.run('Viento', 'viento', 'Saxofones, flautas traversas, trompetas y clarinetes', 'wind').lastInsertRowid;
  const catPercusionId = insertCategoria.run('Percusión', 'percusion', 'Baterías acústicas, electrónicas y percusión menor', 'drum').lastInsertRowid;
  const catTecladosId = insertCategoria.run('Teclados y Pianos', 'teclados', 'Pianos de escenario, sintetizadores y controladores MIDI', 'keyboard').lastInsertRowid;
  const catAudioId = insertCategoria.run('Audio y Grabación', 'audio', 'Micrófonos de estudio, monitores y consolas de mezcla', 'headphones').lastInsertRowid;

  
  console.log('🏷️ Insertando marcas...');
  const insertMarca = db.prepare(`
    INSERT INTO marcas (nombre, pais_origen, sitio_web)
    VALUES (?, ?, ?)
  `);

  const marcaFender = insertMarca.run('Fender', 'Estados Unidos', 'https://www.fender.com').lastInsertRowid;
  const marcaGibson = insertMarca.run('Gibson', 'Estados Unidos', 'https://www.gibson.com').lastInsertRowid;
  const marcaYamaha = insertMarca.run('Yamaha', 'Japón', 'https://www.yamaha.com').lastInsertRowid;
  const marcaRoland = insertMarca.run('Roland', 'Japón', 'https://www.roland.com').lastInsertRowid;
  const marcaPearl = insertMarca.run('Pearl', 'Japón', 'https://pearldrum.com').lastInsertRowid;
  const marcaShure = insertMarca.run('Shure', 'Estados Unidos', 'https://www.shure.com').lastInsertRowid;
  const marcaIbanez = insertMarca.run('Ibanez', 'Japón', 'https://www.ibanez.com').lastInsertRowid;

  
  console.log('🎸 Insertando instrumentos y especificaciones técnicas...');
  const insertInstrumento = db.prepare(`
    INSERT INTO instrumentos (nombre, codigo_sku, categoria_id, marca_id, precio, stock, condicion, descripcion, imagen_url, esta_activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSpec = db.prepare(`
    INSERT INTO especificaciones_instrumento (instrumento_id, material, color, acabado, meses_garantia, peso_kg)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const datosInstrumentos = [
    {
      nombre: 'Fender American Professional II Stratocaster',
      sku: 'FEN-AMPRO2-STRAT-3TS',
      catId: catCuerdasId,
      marcaId: marcaFender,
      precio: 1799990,
      stock: 8,
      condicion: 'nuevo',
      descripcion: 'Icónica guitarra eléctrica con pastillas V-Mod II Single-Coil, diapasón de arce suavemente biselado y trémolo de dos puntos.',
      imagen: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=800&q=80',
      material: 'Cuerpo de Aliso, Mástil de Arce',
      color: 'Sunburst 3 Colores',
      acabado: 'Poliuretano brillante',
      garantia: 24,
      peso: 3.6,
    },
    {
      nombre: 'Gibson Les Paul Standard 50s',
      sku: 'GIB-LP-STD50-HCS',
      catId: catCuerdasId,
      marcaId: marcaGibson,
      precio: 2799990,
      stock: 5,
      condicion: 'nuevo',
      descripcion: 'El clásico tono legendario del rock con cuerpo macizo de caoba, tapa de arce y pastillas BurstBucker 1 y 2.',
      imagen: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80',
      material: 'Caoba maciza con tapa de arce figurado',
      color: 'Cereza Sunburst Heritage',
      acabado: 'Laca nitrocelulósica brillante',
      garantia: 24,
      peso: 4.2,
    },
    {
      nombre: 'Ibanez Steve Vai Signature JEM7V',
      sku: 'IBA-JEM7V-WH',
      catId: catCuerdasId,
      marcaId: marcaIbanez,
      precio: 2299990,
      stock: 3,
      condicion: 'nuevo',
      descripcion: 'Guitarra virtuosa con agarre Monkey Grip, diapasón con incrustaciones Tree of Life y puente Edge Pro trémolo.',
      imagen: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80',
      material: 'Cuerpo de Aliso, mástil de 5 piezas Arce/Nogal',
      color: 'Blanco perla con herrajes dorados',
      acabado: 'Poliéster de alto brillo',
      garantia: 12,
      peso: 3.5,
    },
    {
      nombre: 'Fender Player Precision Bass',
      sku: 'FEN-PLAYER-PBASS-BLK',
      catId: catCuerdasId,
      marcaId: marcaFender,
      precio: 849990,
      stock: 10,
      condicion: 'nuevo',
      descripcion: 'Bajo eléctrico de cuatro cuerdas con la legendaria pastilla split-coil de la serie Player para un sonido potente y definido.',
      imagen: 'https://images.unsplash.com/photo-1558098329-a11cff621064?auto=format&fit=crop&w=800&q=80',
      material: 'Aliso con diapasón de pau ferro',
      color: 'Negro Brillante',
      acabado: 'Poliéster brillante',
      garantia: 24,
      peso: 4.0,
    },
    {
      nombre: 'Yamaha YAS-62III Saxofón Alto Profesional',
      sku: 'YAM-YAS-62III-GOLD',
      catId: catVientoId,
      marcaId: marcaYamaha,
      precio: 3450000,
      stock: 4,
      condicion: 'nuevo',
      descripcion: 'El estándar de oro en saxofones profesionales para conservatorio y solistas. Respuesta rápida y entonación perfecta.',
      imagen: 'https://images.unsplash.com/photo-1525994886773-080587e161c2?auto=format&fit=crop&w=800&q=80',
      material: 'Latón amarillo grabado a mano',
      color: 'Laqueado dorado',
      acabado: 'Barniz epoxy horneado',
      garantia: 36,
      peso: 2.5,
    },
    {
      nombre: 'Yamaha YFL-222 Flauta Traversa de Estudio',
      sku: 'YAM-YFL-222-SILV',
      catId: catVientoId,
      marcaId: marcaYamaha,
      precio: 499990,
      stock: 12,
      condicion: 'nuevo',
      descripcion: 'Flauta traversa de platos cerrados con llaves desalineadas (Offset G), diseñada para ofrecer facilidad de emisión a estudiantes.',
      imagen: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      material: 'Cuerpo y cabeza de alpaca plateada',
      color: 'Plateado brillante',
      acabado: 'Bañado en plata pura',
      garantia: 24,
      peso: 0.9,
    },
    {
      nombre: 'Pearl Export EXX 5 Cuerpos Batería Acústica',
      sku: 'PRL-EXX-725S-SMK',
      catId: catPercusionId,
      marcaId: marcaPearl,
      precio: 929990,
      stock: 6,
      condicion: 'nuevo',
      descripcion: 'El set de batería más vendido del mundo con cascos de álamo y caoba asiática, tecnología SST y herrajes serie 830.',
      imagen: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=80',
      material: 'Cascos de 6 capas de 7.5mm Álamo/Caoba',
      color: 'Cromado Ahumado',
      acabado: 'Wrap vinílico de alta resistencia',
      garantia: 24,
      peso: 38.0,
    },
    {
      nombre: 'Roland V-Drums TD-17KVX2 Batería Electrónica',
      sku: 'ROL-TD17-KVX2',
      catId: catPercusionId,
      marcaId: marcaRoland,
      precio: 1899990,
      stock: 5,
      condicion: 'nuevo',
      descripcion: 'Batería electrónica de alta gama con parches de malla de doble capa, Bluetooth integrado y pads de platillos delgados.',
      imagen: 'https://images.unsplash.com/photo-1543443436-1e646271cfa0?auto=format&fit=crop&w=800&q=80',
      material: 'Parches Mesh Head, estructura de aluminio reforzado',
      color: 'Negro mate',
      acabado: 'Anodizado industrial',
      garantia: 24,
      peso: 24.7,
    },
    {
      nombre: 'Yamaha P-125a Piano Digital Portátil 88 Teclas',
      sku: 'YAM-P125A-BLK',
      catId: catTecladosId,
      marcaId: marcaYamaha,
      precio: 699990,
      stock: 14,
      condicion: 'nuevo',
      descripcion: 'Piano digital compacto con teclado Graded Hammer Standard (GHS) de 88 teclas y motor de sonido Pure CF.',
      imagen: 'https://images.unsplash.com/photo-1520523839898-507122858b99?auto=format&fit=crop&w=800&q=80',
      material: 'Polímero reforzado de alta densidad',
      color: 'Negro Satinado',
      acabado: 'Mate antihuellas',
      garantia: 24,
      peso: 11.8,
    },
    {
      nombre: 'Roland JUNO-DS88 Sintetizador Profesional',
      sku: 'ROL-JUNODS88',
      catId: catTecladosId,
      marcaId: marcaRoland,
      precio: 1199990,
      stock: 7,
      condicion: 'nuevo',
      descripcion: 'Sintetizador de escenario de 88 notas con acción de martillo ponderada, sonidos acústicos ultrarrealistas y pads de audio.',
      imagen: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
      material: 'Chasis híbrido aluminio/polímero',
      color: 'Negro con retroiluminación azul',
      acabado: 'Satinado',
      garantia: 24,
      peso: 16.2,
    },
    {
      nombre: 'Shure SM7B Micrófono Dinámico Vocal de Estudio',
      sku: 'SHU-SM7B-MIC',
      catId: catAudioId,
      marcaId: marcaShure,
      precio: 399990,
      stock: 25,
      condicion: 'nuevo',
      descripcion: 'Micrófono dinámico cardioide de referencia para radiodifusión, podcasting y grabación vocal en estudio profesional.',
      imagen: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
      material: 'Carcasa de aluminio esmaltado y acero inoxidable',
      color: 'Gris oscuro antirreflectante',
      acabado: 'Esmalte horneado mate',
      garantia: 24,
      peso: 0.76,
    },
    {
      nombre: 'Shure SM58 Micrófono Dinámico Vocal de Escenario',
      sku: 'SHU-SM58-LC',
      catId: catAudioId,
      marcaId: marcaShure,
      precio: 99990,
      stock: 40,
      condicion: 'nuevo',
      descripcion: 'El estándar mundial insuperable para voces en directo. Construcción blindada a prueba de caídas con filtro antipop interno.',
      imagen: 'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?auto=format&fit=crop&w=800&q=80',
      material: 'Mango de fundición a presión esmaltado y rejilla de acero',
      color: 'Gris oscuro mate con rejilla plateada',
      acabado: 'Pintura mate antideslizante',
      garantia: 24,
      peso: 0.3,
    },
  ];

  const instrumentosCreados: { id: number; precio: number; nombre: string }[] = [];

  for (const item of datosInstrumentos) {
    const resInst = insertInstrumento.run(
      item.nombre,
      item.sku,
      item.catId,
      item.marcaId,
      item.precio,
      item.stock,
      item.condicion,
      item.descripcion,
      item.imagen,
      1
    );

    const instId = Number(resInst.lastInsertRowid);
    instrumentosCreados.push({ id: instId, precio: item.precio, nombre: item.nombre });

    insertSpec.run(
      instId,
      item.material,
      item.color,
      item.acabado,
      item.garantia,
      item.peso
    );
  }

  
  console.log('📦 Insertando pedidos y detalles de compra...');
  const insertPedido = db.prepare(`
    INSERT INTO pedidos (usuario_id, numero_pedido, total, estado, creado_en)
    VALUES (?, ?, ?, ?, datetime('now', ?))
  `);

  const insertDetalle = db.prepare(`
    INSERT INTO detalles_pedido (pedido_id, instrumento_id, cantidad, precio_unitario, subtotal)
    VALUES (?, ?, ?, ?, ?)
  `);

  
  const totalP1 = 1799990 + 99990;
  const p1Id = Number(insertPedido.run(customer1Id, 'PED-2026-0001', totalP1, 'completado', '-5 days').lastInsertRowid);
  insertDetalle.run(p1Id, instrumentosCreados[0].id, 1, 1799990, 1799990);
  insertDetalle.run(p1Id, instrumentosCreados[11].id, 1, 99990, 99990);

  
  const totalP2 = 1899990;
  const p2Id = Number(insertPedido.run(customer1Id, 'PED-2026-0002', totalP2, 'pendiente', '-1 days').lastInsertRowid);
  insertDetalle.run(p2Id, instrumentosCreados[7].id, 1, 1899990, 1899990);

  
  const totalP3 = 699990 + 399990;
  const p3Id = Number(insertPedido.run(customer2Id, 'PED-2026-0003', totalP3, 'completado', '-2 days').lastInsertRowid);
  insertDetalle.run(p3Id, instrumentosCreados[8].id, 1, 699990, 699990);
  insertDetalle.run(p3Id, instrumentosCreados[10].id, 1, 399990, 399990);

  console.log('✅ Seed en Español completado con éxito:');
  console.log('   - 4 Usuarios (admin@tienda.com, vendedor@tienda.com, cliente@tienda.com, carlos@tienda.com)');
  console.log('   - 5 Categorías');
  console.log('   - 7 Marcas');
  console.log(`   - ${instrumentosCreados.length} Instrumentos con especificaciones técnicas completas`);
  console.log('   - 3 Pedidos con sus detalles');
  console.log('--------------------------------------------------');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error al ejecutar seed:', err);
    process.exit(1);
  });
