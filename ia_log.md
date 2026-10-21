# 🤖 Bitácora y Declaración de Uso de Inteligencia Artificial Generativa (AI Log)

**Asignatura:** Lenguaje Programación Web II  
**Evaluación:** Trabajo 2 — Frontend, Consumo de APIs RESTful y Seguridad  
**Docente:** Enso Guidotti  
**Fecha:** Octubre 2026  

---

## 1. Declaración Formal del Uso de IA

En cumplimiento con las directrices académicas de la asignatura y la rúbrica de evaluación (*Criterio: Uso de IA: herramienta, plan y prompts*), se declara el uso asistido de herramientas de inteligencia artificial generativa como soporte en el diseño, desarrollo, pruebas y documentación técnica del proyecto:

* **Herramienta Principal:** Antigravity (Google DeepMind / Gemini Assistant)
* **Modelos Utilizados:** 
  * `Claude 3.7 Sonnet / Claude Opus 4.6 (Thinking)` para arquitectura por capas, contratos de tipos y diseño de pruebas.
  * `Gemini 3.8 Flash` para refactorización de controladores, depuración de bases de datos y scripts de verificación.
* **Tipo de Cuenta / Plan:** Plan Profesional / Individual de desarrollo.
* **Propósito y Alcance:** La IA fue utilizada como asistente de pair-programming para acelerar la estructuración de boilerplate, generación de esquemas de validación Zod, diseño de suites de pruebas con Vitest y verificación de lineamientos de seguridad OWASP y accesibilidad WCAG 2.2 AA. Todas las decisiones arquitectónicas y el código generado fueron revisados, comprendidos, adaptados y validados manualmente por el estudiante.

---

## 2. Registro de Prompts Relevantes y Decisiones del Estudiante

A continuación se documentan los prompts más relevantes organizados por cada fase del proyecto, indicando el objetivo técnico, la propuesta de la IA y la decisión crítica aplicada por el estudiante (qué se aceptó, qué se corrigió o descartó y por qué):

---

### Fase 1: Arquitectura y Consumo de la API

#### Prompt Relevante:
> *"Diseña una capa de consumo HTTP centralizada en React con TypeScript que tome la URL base de variables de entorno (VITE_API_BASE_URL), inyecte automáticamente el token Bearer JWT desde sessionStorage y normalice las respuestas y los códigos de error (401, 403, 422, 429). Los componentes no deben hacer fetch directamente."*

* **Qué sugirió la IA:** Un archivo `clienteHttp.ts` genérico basado en `fetch` nativo con tipado genérico `<T>`, un mapeador de errores que clasifica códigos HTTP en una clase personalizada `ErrorPeticion`, y servicios independientes por entidad (`instrumentos.service.ts`, `categorias.service.ts`, etc.).
* **Qué se aceptó:** La separación estricta de responsabilidades (las páginas llaman a los servicios, nunca a `fetch`), la inyección automática de la cabecera `Authorization: Bearer <token>` y el lanzamiento del evento personalizado `auth:expirada` ante respuestas 401.
* **Qué se corrigió / descartó y por qué:** 
  * La IA propuso inicialmente devolver errores en inglés (`statusText`). Se exigió un diccionario de errores 100% en español adaptado al contexto de la tienda chilena.
  * Se implementó una función de normalización bilingüe (`normalizarRespuesta`) porque la base de datos y endpoints devolvían propiedades tanto en español (`esta_activo`, `paginacion`) como en inglés (`is_active`, `pagination`), asegurando consistencia en la interfaz.

---

### Fase 2: Autenticación, Sesión y Autorización (RBAC)

#### Prompt Relevante:
> *"Implementa la autenticación JWT con AuthContext en el frontend y un componente guardián RutaProtegida que evalúe si el usuario está autenticado y si su rol coincide con los roles permitidos. Si no está autenticado, redirige al login; si su rol es insuficiente, redirige a una página de acceso denegado (403). Explícame la mejor estrategia para almacenar el token."*

* **Qué sugirió la IA:** Usar React Context API (`AuthContext`), guardar el token en `localStorage` o cookies, y crear el componente `<RutaProtegida rolesPermitidos={['administrador', 'vendedor']}>`.
* **Qué se aceptó:** El patrón de guardián de rutas con redirección a `/acceso-denegado` preservando la ruta previa en el estado de navegación (`location.state`).
* **Qué se corrigió / descartó y por qué:**
  * **Se rechazó `localStorage`:** A sugerencia de los requerimientos de la rúbrica, se optó conscientemente por `sessionStorage`. El estudiante justificó que `sessionStorage` aísla el token únicamente a la pestaña activa y se destruye al cerrar la ventana, reduciendo drásticamente la ventana de ataque frente a robo de tokens vía XSS en comparación con `localStorage`.

---

### Fase 3: Seguridad de Extremo a Extremo (OWASP)

#### Prompt Relevante:
> *"Revisa el backend y frontend para asegurar el cumplimiento de la matriz de riesgos OWASP: restringe CORS al origen del frontend, aplica Helmet con cabeceras de seguridad, configura rate limiting de 10 intentos por minuto en el login para mitigar fuerza bruta (HTTP 429), y valida que las contraseñas nunca se guarden en texto plano."*

* **Qué sugirió la IA:** Configuración de `cors` con validación de origen dinámico, middleware `helmet` con Content-Security-Policy relajada solo para Scalar docs, middleware `express-rate-limit` con mensaje estructurado para `authLimiter`, y hashing con `bcryptjs` (salt 10).
* **Qué se aceptó:** Las cabeceras HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, y el limitador de tasa de 10 peticiones por minuto.
* **Qué se corrigió / descartó y por qué:**
  * Al probar el rate limit en consola, el script fallaba inicialmente porque la IA había puesto una URL relativa sin el puerto 3000 y contraseñas de menos de 6 caracteres que eran frenadas por Zod antes del limiter. El estudiante corrigió la prueba enviando un body válido para evidenciar el código 429 real.
  * Se configuró el manejador global de errores (`error.middleware.ts`) para que nunca filtre trazas internas de la base de datos (`stack traces`) en respuestas JSON, previniendo fuga de información (API8: Security Misconfiguration).

---

### Fase 4: Accesibilidad (WCAG 2.2 AA) y Diseño Responsivo

#### Prompt Relevante:
> *"Ajusta la interfaz del catálogo y formularios para cumplir WCAG 2.2 nivel AA: HTML semántico, enlace de salto al contenido principal, navegación por teclado con foco visible, atributos aria-describedby y aria-live para errores de formulario, y controles táctiles mínimos de 44x44px sin scroll horizontal en móviles desde 320px."*

* **Qué sugirió la IA:** Inclusión de landmarks (`<header>`, `<nav>`, `<main id="contenido-principal">`, `<footer>`), estilos CSS para `.enlace-saltar` enfocado, contorno dorado de alto contraste (`outline: 3px solid #f59e0b`), y tablas con pseudo-elementos `data-label` para convertirse en tarjetas móviles.
* **Qué se aceptó:** El enlace de bypass de navegación, los atributos `aria-invalid` y `aria-describedby` vinculados dinámicamente a los mensajes de validación de campos, y los botones táctiles de 44×44 px.
* **Qué se corrigió / descartó y por qué:**
  * Se revisó el contraste tipográfico contra la paleta oscura de la tienda, ajustando los textos secundarios a `#cbd5e1` para garantizar un ratio de contraste superior a 7:1 (muy por encima del umbral obligatorio de 4.5:1).

---

### Fase 5: Pruebas Automatizadas (Vitest y Playwright)

#### Prompt Relevante:
> *"Genera pruebas de componentes con Vitest y React Testing Library usando mocks que cubran: formulario de login, guardián de rutas protegidas (no autenticado, rol no permitido, rol permitido), tarjeta de producto con badge de stock, y operación CRUD con API simulada. Además, una prueba end-to-end con Playwright."*

* **Qué sugirió la IA:** 4 suites de pruebas unitarias (`Autenticacion.test.tsx`, `RutaProtegida.test.tsx`, `TarjetaInstrumento.test.tsx`, `CrudOperaciones.test.tsx`) simulando servicios con `vi.spyOn()`, más el archivo `flujo-completo.spec.ts` en Playwright.
* **Qué se aceptó:** El uso de mocks con `vi.spyOn` para no depender de la conectividad de la base de datos en las pruebas unitarias y garantizar una ejecución en menos de 3 segundos.
* **Qué se corrigió / descartó y por qué:**
  * Inicialmente Playwright generaba conflictos de tipos con Vitest al coincidir en las carpetas de escaneo. El estudiante modificó `vite.config.ts` agregando `test: { include: ['src/**/*.{test,spec}.{ts,tsx}'] }` para aislar los tests de integración de los de navegación real.
  * Se corrigieron aserciones cuando se retiraron los botones de demostración rápida, asegurando que los tests comprueben el comportamiento real de interacción del usuario.

---

### Fase 6: Refactorización y Depuración de Datos

#### Prompt Relevante:
> *"Al realizar un pedido, la fecha se mostraba con 3 horas de desfase (4 AM en vez de 1 AM) y en el detalle decía 'Instrumento #11' en lugar del nombre. Además, había instrumentos desactivados que no se podían eliminar. Diagnostica y soluciona."*

* **Qué sugirió la IA:** Actualizar SQLite para usar `datetime('now', 'localtime')`, modificar el controlador de pedidos para empaquetar el objeto completo `instrumento: { id, nombre, codigo_sku }`, y limpiar registros de órdenes huérfanas bloqueadas por restricciones de clave foránea (`FOREIGN KEY ON DELETE RESTRICT`).
* **Qué se aceptó:** La corrección del huso horario chileno (UTC-3), la normalización del objeto anidado en el backend y la inclusión de validación preventiva en el controlador para informar amigablemente cuando un producto no puede borrarse físicamente por tener ventas asociadas.
* **Qué se comprendió:** La importancia de la integridad referencial en bases de datos relacionales: los productos comprados no deben borrarse físicamente de la base de datos para no alterar las facturas históricas, sino desactivarse lógicamente (`esta_activo = 0`).

---

## 3. Síntesis y Conclusiones del Uso de IA

1. **Eficiencia y Aprendizaje:** La IA operó como un catalizador para implementar patrones profesionales (inyección de dependencias en tests, esquemas Zod compartidos, control de concurrencia en SQLite).
2. **Criterio Técnico del Estudiante:** Ninguna solución generada fue adoptada a ciegas. Cada sugerencia requirió iteraciones de depuración, adecuación a la normativa chilena (CLP, huso horario local) y resolución de conflictos de dependencias y políticas de seguridad (CORS, CSP, claves foráneas).
3. **Dominio del Código:** La totalidad del código fuente, sus rutas, controladores, hooks y pruebas son comprendidos por el estudiante y están listos para ser explicados y modificados en vivo durante la defensa individual.
