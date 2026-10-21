# 🎸 Harmonía - Frontend Tienda de Instrumentos Musicales

Aplicación frontend moderna desarrollada con **React 19**, **TypeScript** y **Vite**, que consume la API RESTful de la tienda de instrumentos con autenticación JWT, autorización por roles (RBAC), accesibilidad **WCAG 2.2 nivel AA**, mitigación de riesgos de seguridad OWASP y diseño responsivo *mobile-first*.

---

## 🏗️ 1. Arquitectura del Proyecto

El frontend está estructurado bajo un patrón por capas y componentes modulares:

```
Frontend/
├── src/
│   ├── api/                     # Capa de consumo HTTP centralizada y servicios
│   │   ├── clienteHttp.ts       # Wrapper fetch con interceptores de JWT y errores
│   │   ├── autenticacion.service.ts
│   │   ├── instrumentos.service.ts
│   │   ├── categorias.service.ts
│   │   ├── marcas.service.ts
│   │   └── pedidos.service.ts
│   ├── components/              # Componentes reutilizables y accesibles
│   │   ├── Navbar.tsx           # Barra de navegación responsive con menú móvil
│   │   ├── Footer.tsx           # Pie de página informativo y de accesibilidad
│   │   ├── TarjetaInstrumento.tsx # Tarjeta de producto con indicadores de stock
│   │   ├── ModalConfirmacion.tsx # Diálogo modal con trampa de foco y tecla Escape
│   │   ├── Alerta.tsx           # Notificaciones accesibles (role="alert" / "status")
│   │   ├── Cargando.tsx         # Indicador de carga accesible
│   │   ├── EstadoVacio.tsx      # Vistas para listas sin resultados
│   │   └── RutaProtegida.tsx    # Guardia de rutas privadas por roles (401/403)
│   ├── context/
│   │   └── AuthContext.tsx      # Estado global de sesión, token JWT y roles
│   ├── pages/                   # Vistas principales de la aplicación
│   │   ├── CatalogoPage.tsx     # Catálogo con paginación, filtros y búsqueda
│   │   ├── DetalleInstrumentoPage.tsx # Ficha técnica completa (materiales, garantía)
│   │   ├── IniciarSesionPage.tsx# Login accesible con accesos rápidos de prueba
│   │   ├── RegistroPage.tsx     # Creación de cuenta cliente
│   │   ├── AdminInstrumentosPage.tsx # Panel CRUD de inventario (tabla/tarjetas)
│   │   ├── FormularioInstrumentoPage.tsx # Crear y editar con validación 422
│   │   ├── MisPedidosPage.tsx   # Historial de compras del cliente
│   │   ├── AccesoDenegadoPage.tsx # Vista personalizada de error 403 Forbidden
│   │   └── NoEncontradoPage.tsx # Vista de error 404
│   ├── test/                    # Pruebas automatizadas con Vitest y Testing Library
│   │   ├── setup.ts
│   │   ├── Autenticacion.test.tsx
│   │   └── TarjetaInstrumento.test.tsx
│   ├── types/
│   │   └── index.ts             # DTOs, interfaces de dominio y contratos tipados
│   ├── App.tsx                  # Enrutador y layout principal con Skip Link
│   ├── index.css                # Sistema de diseño, tokens, WCAG 2.2 y responsive
│   └── main.tsx
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 2. Seguridad y Mitigaciones OWASP Implementadas

1. **Almacenamiento Justificado del Token**:
   - Se utiliza `sessionStorage` para aislar la persistencia a la pestaña activa del navegador, mitigando persistencias zombies y accesos cross-tab.
   - El token nunca se expone en URLs, trazas de consola (`console.log`) ni en variables de entorno públicas `VITE_*`.
2. **Mitigación de Cross-Site Scripting (XSS)**:
   - Se evita estrictamente el uso de `dangerouslySetInnerHTML`.
   - Todas las respuestas de la API son tratadas como no confiables y renderizadas mediante enlace de datos nativo de React que escapa caracteres automáticamente.
3. **Control de Acceso a Nivel de Función (OWASP API5:2023)**:
   - Rutas privadas en el cliente mediante `RutaProtegida` con verificación de roles (`administrador`, `vendedor`, `cliente`).
   - Manejo de respuestas `403 Forbidden` redirigiendo a la pantalla `AccesoDenegadoPage`.
   - La API en el servidor valida obligatoriamente el rol en cada endpoint sensible.
4. **Manejo de Límite de Peticiones (Rate Limiting - 429)**:
   - El cliente HTTP detecta el código de estado 429 y presenta un mensaje amigable al usuario solicitándole esperar.
5. **Cero Secretos en el Bundle**:
   - La variable `VITE_API_BASE_URL` solo contiene la URL de la API y ningún secreto ni llave criptográfica.

---

## ♿ 3. Accesibilidad (WCAG 2.2 Nivel AA)

- **HTML Semántico**: Landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **Navegación por Teclado**:
  - Enlace *Skip to content* (`enlace-saltar`) para saltar directamente al contenido principal con la tecla Tab.
  - Indicador de foco visible de alto contraste (`outline: 3px solid #f59e0b`).
  - Trampa de foco y cierre con la tecla `Escape` en ventanas modales.
- **Formularios Accesibles**:
  - Cada `<input>` y `<select>` cuenta con su `<label>` asociado mediante `htmlFor`.
  - Errores de validación vinculados a cada campo mediante `aria-describedby` y marcados con `aria-invalid="true"`.
  - Estados anunciados a lectores de pantalla mediante `aria-live="polite"` y `role="alert"`.
- **Contraste y Tamaño Táctil**:
  - Contraste de texto $\ge 4.5:1$ en todo el contenido (aquí $> 9:1$ con texto claro sobre fondo ébano).
  - Todos los botones y controles táctiles tienen un tamaño mínimo de **$44 \times 44\text{ px}$**.
  - La información no depende únicamente del color (iconos + etiquetas de texto).

---

## 📱 4. Diseño Responsivo Mobile-First

- Diseñado para adaptarse fluidamente desde móviles pequeños (**$320\text{ px}$**) hasta monitores ultra-anchos sin scroll horizontal.
- Menú de navegación accesible adaptativo (hamburguesa en móvil con `aria-expanded`).
- La tabla de gestión de inventario del CRUD se transforma automáticamente en tarjetas legibles en dispositivos móviles (`tabla-movil-tarjeta`).
- Cuadrícula de productos fluida (1 columna en móvil, 2 en tablet, 3-4 en escritorio).

---

## 🚀 5. Instalación y Ejecución

### Prerrequisitos
- Node.js 18 o superior.
- Backend en ejecución en `http://localhost:3000`.

### Pasos de Instalación
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (revisar .env.example)
# VITE_API_BASE_URL=http://localhost:3000/api

# 3. Ejecutar pruebas automatizadas con Vitest
npm test

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Compilar para producción
npm run build
```

---

## 🔑 Roles y Cuentas del Sistema

| Rol | Correo | Permisos en la Interfaz |
|---|---|---|
| **Administrador** | `admin@tienda.com` | Acceso completo: Catálogo, Gestión CRUD, creación, edición y eliminación de instrumentos. |
| **Vendedor** | `vendedor@tienda.com` | Catálogo, Gestión CRUD, creación y edición de instrumentos (sin permiso de eliminación física). |
| **Cliente** | `cliente@tienda.com` | Catálogo público, detalle técnico de instrumentos y generación de pedidos. |
