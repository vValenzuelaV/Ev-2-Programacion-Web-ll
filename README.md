# Harmonía Music Store

Aplicación web full-stack para una tienda de instrumentos musicales. Frontend en React que consume una API RESTful con autenticación JWT, autorización por roles, seguridad OWASP, accesibilidad WCAG 2.2 AA y diseño responsivo.

**Asignatura:** Lenguaje Programación Web II — Evaluación 2  
**Caso de Negocio:** Tienda de Instrumentos Musicales

---

## Requisitos Previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (incluido con Node.js)

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/vValenzuelaV/Ev-2-Programacion-Web-ll.git
cd "Ev-2-Programacion-Web-ll"
```

### 2. Backend (API)

```bash
cd Backend
cp .env.example .env      # Copiar variables de entorno
npm install               # Instalar dependencias
npm run seed              # Poblar la base de datos con datos iniciales
npm run dev               # Iniciar servidor en http://localhost:3000
```

El backend queda disponible en `http://localhost:3000`.  
Documentación interactiva de la API en `http://localhost:3000/reference`.

### 3. Frontend

```bash
cd Frontend
cp .env.example .env      # Copiar variables de entorno
npm install               # Instalar dependencias
npx vite --port 5173      # Iniciar servidor en http://localhost:5173
```

La aplicación queda disponible en `http://localhost:5173`.

> **Importante:** El backend debe estar corriendo antes de iniciar el frontend.

---

## Usuarios del Sistema

| Rol | Correo | Descripción |
|:---|:---|:---|
| Administrador | `admin@tienda.com` | Acceso total al catálogo y panel de administración |
| Vendedor | `vendedor@tienda.com` | Gestión comercial y creación/edición de instrumentos |
| Cliente | `cliente@tienda.com` | Compras y consulta de catálogo público |

---

## Pruebas Automatizadas

### Frontend — Pruebas de Componentes (Vitest)
```bash
cd Frontend
npx vitest run --reporter=verbose
```

### Frontend — Prueba End-to-End (Playwright)
```bash
cd Frontend
npm run test:e2e
```

### Backend — Pruebas de Integración
```bash
cd Backend
npm test
```

---

## Estructura del Proyecto

```
├── Backend/                        # API RESTful (Express + TypeScript + SQLite)
│   ├── src/
│   │   ├── config/                 # Configuración de BD y variables de entorno
│   │   ├── controllers/            # Controladores por entidad
│   │   ├── middlewares/            # Auth JWT, roles, rate limiter, validación, errores
│   │   ├── routes/                 # Rutas de la API
│   │   ├── schemas/                # Esquemas de validación Zod
│   │   ├── scripts/                # Seed y verificación
│   │   ├── docs/                   # Especificación OpenAPI 3.1
│   │   └── app.ts                  # Configuración de Express (CORS, Helmet, etc.)
│   ├── .env.example
│   └── package.json
│
├── Frontend/                       # SPA (React 19 + Vite + TypeScript)
│   ├── src/
│   │   ├── api/                    # Cliente HTTP centralizado y servicios por entidad
│   │   ├── components/             # Componentes reutilizables y accesibles
│   │   ├── context/                # AuthContext (estado global de autenticación)
│   │   ├── pages/                  # Vistas vinculadas al enrutador
│   │   ├── types/                  # Tipos TypeScript / DTOs
│   │   └── test/                   # Pruebas Vitest + Testing Library
│   ├── e2e/                        # Pruebas Playwright E2E
│   ├── .env.example
│   └── package.json
│
├── Documentacion_Evaluacion_2/     # Documentación técnica y académica
│   ├── INFORME_TECNICO.md          # Decisiones de diseño y matriz OWASP
│   └── BITACORA_IA.md              # Bitácora de prompts y decisiones
│
├── .gitignore
└── README.md
```
