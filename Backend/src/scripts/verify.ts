import http from 'http';
import { app } from '../app.js';
import { initDatabase } from '../config/database.js';

async function runVerification() {
  console.log('🧪 Iniciando verificación integral de la API en Español...');

  await initDatabase();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3000;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`🔌 Servidor de prueba escuchando en ${baseUrl}`);

  let adminToken = '';
  let sellerToken = '';
  let customerToken = '';
  let testInstrumentId = 0;

  try {
    
    console.log('1️⃣ Probando GET /api/health...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json() as any;
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error(`Health check falló: ${JSON.stringify(healthData)}`);
    }
    console.log('   ✅ Health check OK');

    
    console.log('2️⃣ Probando GET /openapi.json...');
    const specRes = await fetch(`${baseUrl}/openapi.json`);
    const specData = await specRes.json() as any;
    if (specRes.status !== 200 || specData.openapi !== '3.1.0') {
      throw new Error(`OpenAPI spec falló: ${JSON.stringify(specData)}`);
    }
    console.log(`   ✅ OpenAPI 3.1.0 JSON generado con ${Object.keys(specData.paths).length} rutas`);

    
    console.log('3️⃣ Probando GET /reference y /docs...');
    const docsRes = await fetch(`${baseUrl}/reference`);
    if (docsRes.status !== 200) {
      throw new Error(`Scalar docs devolvió status ${docsRes.status}`);
    }
    console.log('   ✅ Documentación interactiva Scalar responde HTTP 200');

    
    console.log('4️⃣ Probando POST /api/autenticacion/iniciar-sesion (Administrador)...');
    const adminLoginRes = await fetch(`${baseUrl}/api/autenticacion/iniciar-sesion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'admin@tienda.com', clave: 'Admin123!' }),
    });
    const adminLoginData = await adminLoginRes.json() as any;
    if (adminLoginRes.status !== 200 || !adminLoginData.data.token) {
      throw new Error(`Login admin falló: ${JSON.stringify(adminLoginData)}`);
    }
    adminToken = adminLoginData.data.token;
    console.log(`   ✅ Administrador autenticado exitosamente (Rol: ${adminLoginData.data.usuario.rol})`);

    
    console.log('5️⃣ Probando POST /api/auth/login (Vendedor)...');
    const sellerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vendedor@tienda.com', password: 'Vendedor123!' }),
    });
    const sellerLoginData = await sellerLoginRes.json() as any;
    if (sellerLoginRes.status !== 200 || !sellerLoginData.data.token) {
      throw new Error(`Login vendedor falló: ${JSON.stringify(sellerLoginData)}`);
    }
    sellerToken = sellerLoginData.data.token;
    console.log(`   ✅ Vendedor autenticado exitosamente (Rol: ${sellerLoginData.data.usuario.rol})`);

    
    console.log('6️⃣ Probando POST /api/autenticacion/iniciar-sesion (Cliente)...');
    const custLoginRes = await fetch(`${baseUrl}/api/autenticacion/iniciar-sesion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'cliente@tienda.com', clave: 'Cliente123!' }),
    });
    const custLoginData = await custLoginRes.json() as any;
    if (custLoginRes.status !== 200 || !custLoginData.data.token) {
      throw new Error(`Login cliente falló: ${JSON.stringify(custLoginData)}`);
    }
    customerToken = custLoginData.data.token;
    console.log(`   ✅ Cliente autenticado exitosamente (Rol: ${custLoginData.data.usuario.rol})`);

    
    console.log('7️⃣ Probando clave incorrecta (debe responder 401)...');
    const failLoginRes = await fetch(`${baseUrl}/api/autenticacion/iniciar-sesion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'admin@tienda.com', clave: 'ClaveIncorrecta' }),
    });
    if (failLoginRes.status !== 401) {
      throw new Error(`Esperado 401 pero se recibió ${failLoginRes.status}`);
    }
    console.log('   ✅ Error 401 controlado correctamente');

    
    console.log('8️⃣ Probando GET /api/autenticacion/perfil con token Bearer...');
    const meRes = await fetch(`${baseUrl}/api/autenticacion/perfil`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meData = await meRes.json() as any;
    if (meRes.status !== 200 || meData.data.correo !== 'admin@tienda.com') {
      throw new Error(`GET perfil falló: ${JSON.stringify(meData)}`);
    }
    console.log('   ✅ Perfil del usuario obtenido con éxito');

    
    console.log('9️⃣ Probando GET /api/instrumentos con paginación...');
    const listRes = await fetch(`${baseUrl}/api/instrumentos?pagina=1&limite=5`);
    const listData = await listRes.json() as any;
    if (listRes.status !== 200 || listData.data.length !== 5) {
      throw new Error(`Listado instrumentos falló: ${JSON.stringify(listData)}`);
    }
    console.log(`   ✅ Listado paginado: ${listData.pagination.total} instrumentos en total, mostrando 5`);

    
    console.log('🔟 Probando GET /api/instrumentos?buscar=Stratocaster...');
    const searchRes = await fetch(`${baseUrl}/api/instrumentos?buscar=Stratocaster`);
    const searchData = await searchRes.json() as any;
    if (searchRes.status !== 200 || searchData.data.length === 0 || !searchData.data[0].nombre.includes('Stratocaster')) {
      throw new Error(`Búsqueda falló: ${JSON.stringify(searchData)}`);
    }
    console.log(`   ✅ Búsqueda exitosa: encontrado '${searchData.data[0].nombre}'`);

    
    console.log('1️⃣1️⃣ Probando GET /api/instrumentos/1...');
    const detailRes = await fetch(`${baseUrl}/api/instrumentos/1`);
    const detailData = await detailRes.json() as any;
    if (detailRes.status !== 200 || !detailData.data.categoria || !detailData.data.marca || !detailData.data.especificaciones) {
      throw new Error(`Detalle no incluye relaciones completas: ${JSON.stringify(detailData)}`);
    }
    console.log(`   ✅ Detalle OK: ${detailData.data.nombre} | Cat: ${detailData.data.categoria.nombre} | Marca: ${detailData.data.marca.nombre} | Color: ${detailData.data.especificaciones.color}`);

    
    console.log('1️⃣2️⃣ Probando POST /api/instrumentos con rol vendedor...');
    const newInstRes = await fetch(`${baseUrl}/api/instrumentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({
        nombre: 'Taylor 214ce Guitarra Electroacústica',
        codigo_sku: `TAY-214CE-${Date.now()}`,
        categoria_id: 1,
        marca_id: 1,
        precio: 1199.0,
        stock: 5,
        condicion: 'nuevo',
        descripcion: 'Guitarra electroacústica Grand Auditorium con tapa de abeto Sitka y electrónica ES2',
        imagen_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1',
        esta_activo: 1,
        especificaciones: {
          material: 'Tapa de abeto de Sitka macizo, fondo y aros de nogal',
          color: 'Natural',
          acabado: 'Satinado mate',
          meses_garantia: 24,
          peso_kg: 2.1,
        },
      }),
    });
    const newInstData = await newInstRes.json() as any;
    if (newInstRes.status !== 200 || !newInstData.data?.id) {
      throw new Error(`Creación de instrumento falló: ${JSON.stringify(newInstData)}`);
    }
    testInstrumentId = newInstData.data.id;
    console.log(`   ✅ Instrumento creado exitosamente con ID: ${testInstrumentId}`);

    
    console.log('1️⃣3️⃣ Probando POST /api/instrumentos con rol cliente (debe dar 403 Forbidden)...');
    const forbidRes = await fetch(`${baseUrl}/api/instrumentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        nombre: 'Intento Prohibido',
        codigo_sku: 'FAIL-SKU',
        categoria_id: 1,
        marca_id: 1,
        precio: 50,
        stock: 1,
      }),
    });
    if (forbidRes.status !== 403) {
      throw new Error(`Esperado 403 pero se recibió ${forbidRes.status}`);
    }
    console.log('   ✅ RBAC verificado: Cliente denegado con 403 Forbidden');

    
    console.log(`1️⃣4️⃣ Probando PUT /api/instrumentos/${testInstrumentId}...`);
    const updateRes = await fetch(`${baseUrl}/api/instrumentos/${testInstrumentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({
        precio: 1299.0,
        stock: 7,
        especificaciones: {
          color: 'Natural Brillante',
        },
      }),
    });
    const updateData = await updateRes.json() as any;
    if (updateRes.status !== 200 || updateData.data.precio !== 1299.0 || updateData.data.especificaciones.color !== 'Natural Brillante') {
      throw new Error(`Actualización falló: ${JSON.stringify(updateData)}`);
    }
    console.log('   ✅ Instrumento y especificaciones actualizados con éxito');

    
    console.log('1️⃣5️⃣ Probando POST /api/pedidos (Creación y deducción atómica de inventario)...');
    const orderRes = await fetch(`${baseUrl}/api/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        detalles: [{ instrumento_id: testInstrumentId, cantidad: 2 }],
      }),
    });
    const orderData = await orderRes.json() as any;
    if (orderRes.status !== 200 || !orderData.data?.numero_pedido) {
      throw new Error(`Creación de pedido falló: ${JSON.stringify(orderData)}`);
    }
    console.log(`   ✅ Pedido creado: ${orderData.data.numero_pedido} (Total: $${orderData.data.total})`);

    
    const stockCheckRes = await fetch(`${baseUrl}/api/instrumentos/${testInstrumentId}`);
    const stockCheckData = await stockCheckRes.json() as any;
    if (stockCheckData.data.stock !== 5) {
      throw new Error(`El stock no se redujo correctamente. Esperado 5, actual: ${stockCheckData.data.stock}`);
    }
    console.log(`   ✅ Deducción de inventario atómica verificada: 7 -> ${stockCheckData.data.stock}`);

    
    console.log(`1️⃣6️⃣ Probando DELETE /api/instrumentos/${testInstrumentId} (Eliminación lógica)...`);
    const deleteRes = await fetch(`${baseUrl}/api/instrumentos/${testInstrumentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteData = await deleteRes.json() as any;
    if (deleteRes.status !== 200) {
      throw new Error(`Eliminación falló: ${JSON.stringify(deleteData)}`);
    }
    console.log('   ✅ Eliminación lógica ejecutada con éxito');

    
    console.log('1️⃣7️⃣ Probando GET /api/categorias y GET /api/marcas...');
    const catRes = await fetch(`${baseUrl}/api/categorias`);
    const brandRes = await fetch(`${baseUrl}/api/marcas`);
    const catData = await catRes.json() as any;
    const brandData = await brandRes.json() as any;
    if (catRes.status !== 200 || brandRes.status !== 200 || catData.data.length < 5 || brandData.data.length < 7) {
      throw new Error('Categorías o marcas incompletas');
    }
    console.log(`   ✅ ${catData.data.length} Categorías y ${brandData.data.length} Marcas disponibles en Español`);

    console.log('\n🎉 ¡TODAS LAS PRUEBAS AUTOMÁTICAS EN ESPAÑOL PASARON EXITOSAMENTE!');
  } finally {
    server.close();
  }
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error en la verificación:', err);
    process.exit(1);
  });
