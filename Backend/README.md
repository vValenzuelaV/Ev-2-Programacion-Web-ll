# 🎵 Tienda de Música Harmonia - Backend REST API (100% en Español)

API RESTful profesional construida con **Node.js**, **Express**, **TypeScript**, **Microsoft SQL Server (T-SQL)**, **Scalar (OpenAPI 3.1)**, **JWT** y **Control de Acceso Basado en Roles (RBAC)**, con todas sus entidades, tablas, rutas y esquemas 100% en Español.

---

## 🚀 Características Principales

1. **Base de Datos Relacional Microsoft SQL Server (T-SQL)**:
   - **Script Principal**: [`database.sql`](./database.sql) y [`database_sqlserver.sql`](./database_sqlserver.sql) listos para ejecutar con **F5** en **SQL Server Management Studio (SSMS)**, **Azure Data Studio** o `sqlcmd`.
   - **Nombre de la base de datos**: `TiendaMusicaDB`.
   - **7 Tablas Normalizadas en Español**:
     - `dbo.usuarios` (`id`, `nombre`, `correo`, `clave`, `rol`: 'administrador' | 'vendedor' | 'cliente', `creado_en`)
     - `dbo.categorias` (`id`, `nombre`, `slug`, `descripcion`, `icono`, `creado_en`)
     - `dbo.marcas` (`id`, `nombre`, `pais_origen`, `sitio_web`, `creado_en`)
     - `dbo.instrumentos` (`id`, `nombre`, `codigo_sku`, `categoria_id`, `marca_id`, `precio`, `stock`, `condicion`: 'nuevo' | 'usado' | 'reacondicionado', `descripcion`, `imagen_url`, `esta_activo`, `creado_en`, `actualizado_en`)
     - `dbo.especificaciones_instrumento` (`id`, `instrumento_id`, `material`, `color`, `acabado`, `meses_garantia`, `peso_kg`)
     - `dbo.pedidos` (`id`, `usuario_id`, `numero_pedido`, `total`, `estado`: 'pendiente' | 'completado' | 'cancelado', `creado_en`)
     - `dbo.detalles_pedido` (`id`, `pedido_id`, `instrumento_id`, `cantidad`, `precio_unitario`, `subtotal`)
   - Restricciones (`CHECK`, `UNIQUE`, `FOREIGN KEY` con eliminación en cascada) e índices no agrupados (`NONCLUSTERED INDEX`).
   - Bloques `SET IDENTITY_INSERT` con datos de prueba realistas (usuarios con hashes bcrypt, 5 categorías, 7 marcas, 12 instrumentos con especificaciones completas y 3 pedidos).
   - Incluye motor de persistencia local de desarrollo para pruebas rápidas sin requerir levantar una instancia pesada de SQL Server.

2. **Seguridad y Middleware (OWASP Compliant)**:
   - **Helmet**: Cabeceras de seguridad HTTP con CSP adaptativo para la interfaz de Scalar.
   - **CORS Restringido**: Configurado para `http://localhost:5173` y orígenes parametrizables.
   - **Rate Limiting (`express-rate-limit`)**:
     - Global: 100 peticiones / 15 min por IP.
     - Login: 10 intentos / 15 min contra fuerza bruta.
   - **Manejador Global de Errores**: Sin filtrado de trazas internas ni stack traces.
   - **Validación con Zod**: Mensajes claros en español y reporte estructurado de campos.

3. **Autenticación y Autorización (RBAC)**:
   - Hashing de contraseñas con `bcryptjs` (salt 10).
   - Tokens Bearer JWT.
   - Middleware `hasRole('administrador', 'vendedor', 'cliente')`.

4. **Documentación Interactiva con Scalar**:
   - Interfaz interactiva disponible en: `http://localhost:3000/reference` y `http://localhost:3000/docs`.
   - Especificación OpenAPI 3.1 descargable en: `http://localhost:3000/openapi.json`.

---

## 🔑 Cuentas del Sistema (Seed Data)

| Rol | Correo Electrónico | Permisos |
|---|---|---|
| **Administrador** | `admin@tienda.com` | Acceso total (CRUD completo, borrado permanente/lógico, pedidos) |
| **Vendedor** | `vendedor@tienda.com` | Crear y editar instrumentos, actualizar estado de pedidos |
| **Cliente** | `cliente@tienda.com` | Ver catálogo, realizar pedidos, ver perfil y pedidos propios |
| **Cliente 2** | `carlos@tienda.com` | Ver catálogo, realizar pedidos y pedidos propios |

---

## 🛠️ Instalación y Ejecución

### 1. Variables de Entorno (`.env`)
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_music_store_2026_evaluacion2
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Base de datos: 'mssql' para Microsoft SQL Server o 'sqlite'
DB_DIALECT=sqlite
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourStrong@Password
DB_NAME=TiendaMusicaDB
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

DATABASE_PATH=./data/musicstore.sqlite
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 2. Ejecutar Script SQL en Microsoft SQL Server (SSMS)
1. Abre **SQL Server Management Studio (SSMS)** o **Azure Data Studio**.
2. Conéctate a tu servidor local (ej. `localhost` o `localhost\SQLEXPRESS`).
3. Abre el archivo [`database.sql`](./database.sql).
4. Presiona **F5** (o Ejecutar). Se creará la base de datos `TiendaMusicaDB` con las 7 tablas e inserts.

### 3. Cargar Datos de Prueba (Seed)
```bash
npm run seed
```

### 4. Ejecutar Suite de Pruebas de Integración (100% en Español)
```bash
npm test
```

### 5. Iniciar Servidor en Desarrollo
```bash
npm run dev
```

---

## 📡 Resumen de Endpoints en Español

### 🔐 Autenticación
- `POST /api/autenticacion/iniciar-sesion` (o `/api/auth/login`) - Iniciar sesión (Devuelve token JWT)
- `POST /api/autenticacion/registro` (o `/api/auth/register`) - Registro de clientes
- `GET /api/autenticacion/perfil` (o `/api/auth/me`) - Perfil de usuario (`Bearer <token>`)

### 🎸 Instrumentos (Recurso Principal)
- `GET /api/instrumentos` (o `/api/instruments`) - Listado con paginación (`pagina`, `limite`), filtros (`categoria_id`, `marca_id`, `precio_min`, `precio_max`, `condicion`, `esta_activo`), búsqueda (`buscar` o `q`) y ordenamiento (`ordenar_por`, `orden`).
- `GET /api/instrumentos/:id` - Detalle completo con categoría, marca y especificaciones técnicas.
- `POST /api/instrumentos` - Crear instrumento + especificaciones *(Administrador / Vendedor)*.
- `PUT /api/instrumentos/:id` - Editar instrumento y especificaciones *(Administrador / Vendedor)*.
- `DELETE /api/instrumentos/:id` - Desactivar lógicamente (`esta_activo = 0`) o eliminar físico con `?permanente=true` *(Solo Administrador)*.

### 📁 Categorías y Marcas
- `GET /api/categorias` - Listado de categorías
- `GET /api/categorias/:id` - Detalle de categoría
- `POST /api/categorias` - Crear categoría *(Administrador / Vendedor)*
- `GET /api/marcas` - Listado de marcas
- `GET /api/marcas/:id` - Detalle de marca
- `POST /api/marcas` - Crear marca *(Administrador / Vendedor)*

### 📦 Pedidos de Compra
- `POST /api/pedidos` - Crear pedido con descuento atómico de inventario *(Autenticado)*.
- `GET /api/pedidos` - Listar pedidos (Cliente ve los suyos; Administrador/Vendedor ven todos).
- `GET /api/pedidos/:id` - Detalle de pedido con productos asociados.
- `PATCH /api/pedidos/:id/estado` - Cambiar estado (`pendiente`, `completado`, `cancelado`) y reponer inventario si se cancela *(Administrador / Vendedor)*.
