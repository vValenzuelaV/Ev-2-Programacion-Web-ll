**Modelos Utilizados:**

- Claude 3.7 Sonnet / Claude Opus 4.6 (Thinking) para arquitectura por capas, contratos de tipos y diseño de pruebas.  
- Gemini 3.8 Flash para refactorización de controladores, depuración de bases de datos y scripts de verificación.

**Tipo de Plan:** Plan Profesional / Individual de desarrollo.

**Prompts Empleados:**

1. **Pront 1**

"Diseña una capa de consumo HTTP centralizada en React con TypeScript que tome la URL base de variables de entorno VITE\_API\_BASE\_URL, inyecte automáticamente el token Bearer JWT desde sessionStorage y normalice las respuestas y los códigos de error (401, 403, 422, 429). Los componentes no deben hacer fetch directamente." 

**Qué se aceptó:** La separación estricta de responsabilidades, la inyección automática de la cabecera “Authorization: Bearer \<token\>” y el lanzamiento del evento personalizado auth:expirada ante respuestas 401.

**Qué se corrigió:** La IA inicialmente devolvía los errores en inglés. Se exigió un diccionario de errores 100% en español adaptado al contexto. Se implementó una función de normalización bilingüe porque la base de datos y endpoints devuelven propiedades tanto en español como en inglés, asegurando consistencia en la interfaz.

**2\.  Pront 2**

"Implementa la autenticación JWT con AuthContext en el frontend y un componente guardián “RutaProtegida” que evalúe si el usuario está autenticado y si su rol coincide con los roles permitidos. Si no está autenticado, redirige al login; si su rol es insuficiente, redirige a una página de acceso denegado y explícame la mejor estrategia para almacenar el token." 

**Qué se aceptó:** El patrón de guardián de rutas con redirección a ./acceso-denegado preservando la ruta previa en el estado de navegación (location.state).

**Qué se corrigió:** A sugerencia de los requerimientos de la rúbrica, se optó conscientemente por sessionStorage. Se justificó que sessionStorage aísla el token únicamente a la pestaña activa y se destruye al cerrar la ventana, reduciendo drásticamente la ventana de ataque frente a robo de tokens vía XSS en comparación con localStorage.

**3\. Pront 3**

"Revisa el backend y frontend para asegurar el cumplimiento de la matriz de riesgos OWASP. Restringe CORS al origen del frontend, aplica Helmet con cabeceras de seguridad, configura un límite de rango de 10 intentos por minuto y valida que las contraseñas nunca se guarden en texto plano."

**Qué se aceptó:** Las cabeceras HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, y el limitador de tasa de 10 peticiones por minuto.

**Qué se corrigió:** Al probar el límite de rango en consola, el script fallaba inicialmente porque la IA había puesto una URL relativa sin el puerto 3000 y contraseñas de menos de 6 caracteres que eran frenadas por el Zod antes del límite. Se corrigió la prueba enviando un body válido para evidenciar el código 429 real.

**4\. Pront 4**

"Ajusta la interfaz del catálogo y formularios para cumplir WCAG 2.2 2 nivel AA, HTML semántico con navegación por teclado con foco visible y controles táctiles mínimos sin scroll horizontal en móviles desde 320px." 

**Qué se aceptó:** El enlace de bypass de navegación, los atributos aria-invalid y aria-describedby vinculados dinámicamente a los mensajes de validación de campos, y los botones táctiles de 44×44 px.

**Qué se corrigió:** Se revisó el contraste tipográfico contra la paleta oscura de la tienda, ajustando los textos secundarios a \#cbd5e1 para garantizar un ratio de contraste superior a 7:1.

**5\. Pront 5**

"Genera pruebas de componentes con Vitest y React Testing Library que cubran formulario de login, guardián de rutas protegidas, tarjeta de producto con badge de stock, y operación CRUD con API simulada, además una prueba end-to-end." 

**Qué se aceptó:** El uso de mocks para no depender de la conectividad de la base de datos en las pruebas unitarias y garantizar una ejecución en menos de 3 segundos.

**Qué se corrigió:** Inicialmente Playwright generaba conflictos de tipos con Vitest al coincidir en las carpetas de escaneo, se modificó vite.config.ts agregando test: { include: \['src/\*\*/\*.{test,spec}.{ts,tsx}'\] } para aislar los tests de integración de los de navegación real.

