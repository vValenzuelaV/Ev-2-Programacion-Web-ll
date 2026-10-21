export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Tienda de Instrumentos Musicales Harmonia API',
    version: '1.0.0',
    description:
      'API RESTful robusta y documentada en Español para la gestión y e-commerce de una tienda de instrumentos musicales con autenticación JWT, control de acceso basado en roles (RBAC) y persistencia en Microsoft SQL Server / SQLite.',
    contact: {
      name: 'Soporte Técnico',
      email: 'soporte@tienda.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local de desarrollo',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT obtenido en /api/autenticacion/iniciar-sesion',
      },
    },
    schemas: {
      Categoria: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Cuerdas' },
          slug: { type: 'string', example: 'cuerdas' },
          descripcion: { type: 'string', example: 'Guitarras eléctricas, acústicas, bajos y ukeleles' },
          icono: { type: 'string', example: 'guitar' },
          creado_en: { type: 'string', format: 'date-time' },
        },
      },
      Marca: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Fender' },
          pais_origen: { type: 'string', example: 'Estados Unidos' },
          sitio_web: { type: 'string', example: 'https://www.fender.com' },
          creado_en: { type: 'string', format: 'date-time' },
        },
      },
      EspecificacionInstrumento: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          instrumento_id: { type: 'integer', example: 1 },
          material: { type: 'string', example: 'Cuerpo de Aliso, Mástil de Arce' },
          color: { type: 'string', example: 'Sunburst 3 Colores' },
          acabado: { type: 'string', example: 'Poliuretano brillante' },
          meses_garantia: { type: 'integer', example: 24 },
          peso_kg: { type: 'number', example: 3.6 },
        },
      },
      Instrumento: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Fender American Professional II Stratocaster' },
          codigo_sku: { type: 'string', example: 'FEN-AMPRO2-STRAT-3TS' },
          categoria_id: { type: 'integer', example: 1 },
          marca_id: { type: 'integer', example: 1 },
          precio: { type: 'number', example: 1799.99 },
          stock: { type: 'integer', example: 8 },
          condicion: { type: 'string', enum: ['nuevo', 'usado', 'reacondicionado'], example: 'nuevo' },
          descripcion: { type: 'string', example: 'Guitarra eléctrica profesional con pastillas V-Mod II' },
          imagen_url: { type: 'string', example: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f' },
          esta_activo: { type: 'integer', enum: [0, 1], example: 1 },
          creado_en: { type: 'string', format: 'date-time' },
          actualizado_en: { type: 'string', format: 'date-time' },
          categoria: { $ref: '#/components/schemas/Categoria' },
          marca: { $ref: '#/components/schemas/Marca' },
          especificaciones: { $ref: '#/components/schemas/EspecificacionInstrumento' },
        },
      },
      DetallePedido: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          pedido_id: { type: 'integer', example: 1 },
          instrumento_id: { type: 'integer', example: 1 },
          cantidad: { type: 'integer', example: 1 },
          precio_unitario: { type: 'number', example: 1799.99 },
          subtotal: { type: 'number', example: 1799.99 },
          instrumento_nombre: { type: 'string', example: 'Fender American Professional II Stratocaster' },
          instrumento_sku: { type: 'string', example: 'FEN-AMPRO2-STRAT-3TS' },
        },
      },
      Pedido: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          usuario_id: { type: 'integer', example: 3 },
          numero_pedido: { type: 'string', example: 'PED-1729000000-1234' },
          total: { type: 'number', example: 1799.99 },
          estado: { type: 'string', enum: ['pendiente', 'completado', 'cancelado'], example: 'pendiente' },
          creado_en: { type: 'string', format: 'date-time' },
          detalles: {
            type: 'array',
            items: { $ref: '#/components/schemas/DetallePedido' },
          },
        },
      },
      ErrorRespuesta: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Los datos proporcionados no son válidos' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string', example: 'correo' },
                    message: { type: 'string', example: 'Debe ser un correo electrónico válido' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/autenticacion/iniciar-sesion': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión y obtener token JWT',
        description: 'Autentica a un usuario por correo y clave. Límite de 10 intentos por cada 15 minutos.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['correo', 'clave'],
                properties: {
                  correo: { type: 'string', format: 'email', example: 'admin@tienda.com' },
                  clave: { type: 'string', format: 'password', example: '••••••••••••' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Autenticación exitosa con token Bearer' },
          401: { description: 'Credenciales inválidas' },
          429: { description: 'Demasiadas solicitudes' },
        },
      },
    },
    '/api/autenticacion/registro': {
      post: {
        tags: ['Autenticación'],
        summary: 'Registrar un nuevo usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'correo', 'clave'],
                properties: {
                  nombre: { type: 'string', example: 'Carlos Cliente' },
                  correo: { type: 'string', format: 'email', example: 'carlos2@tienda.com' },
                  clave: { type: 'string', minLength: 6, example: '••••••••••••' },
                  rol: { type: 'string', enum: ['cliente', 'vendedor', 'administrador'], default: 'cliente' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuario creado exitosamente' },
          409: { description: 'Correo ya registrado' },
          422: { description: 'Error de validación' },
        },
      },
    },
    '/api/autenticacion/perfil': {
      get: {
        tags: ['Autenticación'],
        summary: 'Obtener perfil del usuario autenticado',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Datos del usuario autenticado' },
          401: { description: 'No autorizado' },
        },
      },
    },
    '/api/instrumentos': {
      get: {
        tags: ['Instrumentos'],
        summary: 'Listar instrumentos con filtros, paginación y búsqueda',
        parameters: [
          { name: 'pagina', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limite', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'buscar', in: 'query', schema: { type: 'string' }, description: 'Búsqueda por texto en nombre, descripción o SKU' },
          { name: 'categoria_id', in: 'query', schema: { type: 'integer' } },
          { name: 'marca_id', in: 'query', schema: { type: 'integer' } },
          { name: 'precio_min', in: 'query', schema: { type: 'number' } },
          { name: 'precio_max', in: 'query', schema: { type: 'number' } },
          { name: 'condicion', in: 'query', schema: { type: 'string', enum: ['nuevo', 'usado', 'reacondicionado'] } },
          { name: 'esta_activo', in: 'query', schema: { type: 'integer', enum: [0, 1] } },
          { name: 'ordenar_por', in: 'query', schema: { type: 'string', enum: ['id', 'nombre', 'precio', 'stock', 'creado_en'], default: 'id' } },
          { name: 'orden', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Lista paginada de instrumentos con relaciones',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    paginacion: {
                      type: 'object',
                      properties: {
                        pagina: { type: 'integer' },
                        limite: { type: 'integer' },
                        total: { type: 'integer' },
                        paginasTotales: { type: 'integer' },
                      },
                    },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Instrumento' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Instrumentos'],
        summary: 'Crear nuevo instrumento (administrador o vendedor)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'codigo_sku', 'categoria_id', 'marca_id', 'precio', 'stock'],
                properties: {
                  nombre: { type: 'string', example: 'Gibson Les Paul Standard 50s' },
                  codigo_sku: { type: 'string', example: 'GIB-LP-STD50-HCS' },
                  categoria_id: { type: 'integer', example: 1 },
                  marca_id: { type: 'integer', example: 2 },
                  precio: { type: 'number', example: 2799.0 },
                  stock: { type: 'integer', example: 5 },
                  condicion: { type: 'string', enum: ['nuevo', 'usado', 'reacondicionado'], default: 'nuevo' },
                  descripcion: { type: 'string', example: 'Cuerpo de caoba con tapa de arce figurado' },
                  imagen_url: { type: 'string', example: 'https://images.unsplash.com/photo-1550985616-10810253b84d' },
                  esta_activo: { type: 'integer', enum: [0, 1], default: 1 },
                  especificaciones: {
                    type: 'object',
                    properties: {
                      material: { type: 'string', example: 'Caoba maciza' },
                      color: { type: 'string', example: 'Cereza Sunburst' },
                      acabado: { type: 'string', example: 'Laca nitrocelulósica brillante' },
                      meses_garantia: { type: 'integer', example: 24 },
                      peso_kg: { type: 'number', example: 4.2 },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Instrumento creado exitosamente' },
          401: { description: 'No autenticado' },
          403: { description: 'Rol no autorizado' },
          409: { description: 'Código SKU duplicado' },
          422: { description: 'Validación fallida' },
        },
      },
    },
    '/api/instrumentos/{id}': {
      get: {
        tags: ['Instrumentos'],
        summary: 'Detalle de un instrumento por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Detalle completo del instrumento' },
          404: { description: 'Instrumento no encontrado' },
        },
      },
      put: {
        tags: ['Instrumentos'],
        summary: 'Actualizar instrumento existente (administrador o vendedor)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  codigo_sku: { type: 'string' },
                  categoria_id: { type: 'integer' },
                  marca_id: { type: 'integer' },
                  precio: { type: 'number' },
                  stock: { type: 'integer' },
                  condicion: { type: 'string', enum: ['nuevo', 'usado', 'reacondicionado'] },
                  descripcion: { type: 'string' },
                  imagen_url: { type: 'string' },
                  esta_activo: { type: 'integer', enum: [0, 1] },
                  especificaciones: {
                    type: 'object',
                    properties: {
                      material: { type: 'string' },
                      color: { type: 'string' },
                      acabado: { type: 'string' },
                      meses_garantia: { type: 'integer' },
                      peso_kg: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Instrumento actualizado' },
          401: { description: 'No autenticado' },
          403: { description: 'Rol no autorizado' },
          404: { description: 'No encontrado' },
        },
      },
      delete: {
        tags: ['Instrumentos'],
        summary: 'Eliminar instrumento (lógico o físico con ?permanente=true) - Solo Administrador',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'permanente', in: 'query', schema: { type: 'boolean', default: false } },
        ],
        responses: {
          200: { description: 'Instrumento desactivado o eliminado' },
          401: { description: 'No autenticado' },
          403: { description: 'Solo administradores pueden eliminar' },
          404: { description: 'No encontrado' },
        },
      },
    },
    '/api/categorias': {
      get: {
        tags: ['Categorías'],
        summary: 'Listar todas las categorías',
        responses: { 200: { description: 'Lista de categorías' } },
      },
      post: {
        tags: ['Categorías'],
        summary: 'Crear categoría (administrador o vendedor)',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Categoría creada' } },
      },
    },
    '/api/marcas': {
      get: {
        tags: ['Marcas'],
        summary: 'Listar todas las marcas',
        responses: { 200: { description: 'Lista de marcas' } },
      },
      post: {
        tags: ['Marcas'],
        summary: 'Crear marca (administrador o vendedor)',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Marca creada' } },
      },
    },
    '/api/pedidos': {
      get: {
        tags: ['Pedidos'],
        summary: 'Listar pedidos (clientes ven solo los suyos, staff ve todos)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Lista de pedidos' } },
      },
      post: {
        tags: ['Pedidos'],
        summary: 'Crear un nuevo pedido con descuento atómico de inventario',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Pedido creado exitosamente' } },
      },
    },
    '/api/pedidos/{id}': {
      get: {
        tags: ['Pedidos'],
        summary: 'Detalle de pedido con productos asociados',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Detalle del pedido' } },
      },
    },
    '/api/pedidos/{id}/estado': {
      patch: {
        tags: ['Pedidos'],
        summary: 'Actualizar estado del pedido (administrador o vendedor)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Estado actualizado' } },
      },
    },
    '/api/subidas/imagen': {
      post: {
        tags: ['Subidas'],
        summary: 'Subir archivo de imagen para un instrumento (multipart/form-data)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['imagen'],
                properties: {
                  imagen: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo de imagen (JPG, PNG, WebP, GIF, máx 5MB)',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Imagen subida exitosamente con URL generada' },
          400: { description: 'Archivo inválido o tamaño excedido' },
          401: { description: 'No autenticado' },
        },
      },
    },
  },
};
