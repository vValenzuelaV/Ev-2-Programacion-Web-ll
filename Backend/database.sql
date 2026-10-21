-- ====================================================================
-- TIENDA DE MÚSICA HARMONIA - BASE DE DATOS MICROSOFT SQL SERVER (T-SQL)
-- Idioma: 100% Español (Tablas, Columnas, Restricciones y Datos)
-- Compatible con: SQL Server Management Studio (SSMS), Azure Data Studio y sqlcmd
-- ====================================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'TiendaMusicaDB')
BEGIN
    CREATE DATABASE [TiendaMusicaDB];
END
GO

USE [TiendaMusicaDB];
GO

-- 2. ELIMINACIÓN PREVIA DE TABLAS EN ORDEN DE DEPENDENCIAS
IF OBJECT_ID(N'dbo.detalles_pedido', N'U') IS NOT NULL DROP TABLE dbo.detalles_pedido;
IF OBJECT_ID(N'dbo.pedidos', N'U') IS NOT NULL DROP TABLE dbo.pedidos;
IF OBJECT_ID(N'dbo.especificaciones_instrumento', N'U') IS NOT NULL DROP TABLE dbo.especificaciones_instrumento;
IF OBJECT_ID(N'dbo.instrumentos', N'U') IS NOT NULL DROP TABLE dbo.instrumentos;
IF OBJECT_ID(N'dbo.marcas', N'U') IS NOT NULL DROP TABLE dbo.marcas;
IF OBJECT_ID(N'dbo.categorias', N'U') IS NOT NULL DROP TABLE dbo.categorias;
IF OBJECT_ID(N'dbo.usuarios', N'U') IS NOT NULL DROP TABLE dbo.usuarios;
GO

-- ====================================================================
-- 3. CREACIÓN DE TABLAS (7 TABLAS RELACIONADAS EN ESPAÑOL)
-- ====================================================================

-- TABLA 1: usuarios (Usuarios y roles RBAC)
CREATE TABLE dbo.usuarios (
    id INT IDENTITY(1,1) NOT NULL,
    nombre NVARCHAR(100) NOT NULL,
    correo NVARCHAR(150) NOT NULL,
    clave NVARCHAR(255) NOT NULL,
    rol NVARCHAR(20) NOT NULL CONSTRAINT DF_usuarios_rol DEFAULT 'cliente',
    creado_en DATETIME2 NOT NULL CONSTRAINT DF_usuarios_creado_en DEFAULT GETDATE(),
    CONSTRAINT PK_usuarios PRIMARY KEY CLUSTERED (id ASC),
    CONSTRAINT UQ_usuarios_correo UNIQUE NONCLUSTERED (correo ASC),
    CONSTRAINT CK_usuarios_rol CHECK (rol IN ('administrador', 'vendedor', 'cliente'))
);
GO

-- TABLA 2: categorias (Categorías de instrumentos)
CREATE TABLE dbo.categorias (
    id INT IDENTITY(1,1) NOT NULL,
    nombre NVARCHAR(100) NOT NULL,
    slug NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(MAX) NULL,
    icono NVARCHAR(50) NULL,
    creado_en DATETIME2 NOT NULL CONSTRAINT DF_categorias_creado_en DEFAULT GETDATE(),
    CONSTRAINT PK_categorias PRIMARY KEY CLUSTERED (id ASC),
    CONSTRAINT UQ_categorias_nombre UNIQUE NONCLUSTERED (nombre ASC),
    CONSTRAINT UQ_categorias_slug UNIQUE NONCLUSTERED (slug ASC)
);
GO

-- TABLA 3: marcas (Marcas comerciales)
CREATE TABLE dbo.marcas (
    id INT IDENTITY(1,1) NOT NULL,
    nombre NVARCHAR(100) NOT NULL,
    pais_origen NVARCHAR(100) NULL,
    sitio_web NVARCHAR(255) NULL,
    creado_en DATETIME2 NOT NULL CONSTRAINT DF_marcas_creado_en DEFAULT GETDATE(),
    CONSTRAINT PK_marcas PRIMARY KEY CLUSTERED (id ASC),
    CONSTRAINT UQ_marcas_nombre UNIQUE NONCLUSTERED (nombre ASC)
);
GO

-- TABLA 4: instrumentos (Recurso principal del inventario y CRUD)
CREATE TABLE dbo.instrumentos (
    id INT IDENTITY(1,1) NOT NULL,
    nombre NVARCHAR(150) NOT NULL,
    codigo_sku NVARCHAR(50) NOT NULL,
    categoria_id INT NOT NULL,
    marca_id INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL CONSTRAINT DF_instrumentos_precio DEFAULT 0.00,
    stock INT NOT NULL CONSTRAINT DF_instrumentos_stock DEFAULT 0,
    condicion NVARCHAR(20) NOT NULL CONSTRAINT DF_instrumentos_condicion DEFAULT 'nuevo',
    descripcion NVARCHAR(MAX) NULL,
    imagen_url NVARCHAR(500) NULL,
    esta_activo BIT NOT NULL CONSTRAINT DF_instrumentos_esta_activo DEFAULT 1,
    creado_en DATETIME2 NOT NULL CONSTRAINT DF_instrumentos_creado_en DEFAULT GETDATE(),
    actualizado_en DATETIME2 NOT NULL CONSTRAINT DF_instrumentos_actualizado_en DEFAULT GETDATE(),
    CONSTRAINT PK_instrumentos PRIMARY KEY CLUSTERED (id ASC),
    CONSTRAINT UQ_instrumentos_sku UNIQUE NONCLUSTERED (codigo_sku ASC),
    CONSTRAINT CK_instrumentos_precio CHECK (precio >= 0),
    CONSTRAINT CK_instrumentos_stock CHECK (stock >= 0),
    CONSTRAINT CK_instrumentos_condicion CHECK (condicion IN ('nuevo', 'usado', 'reacondicionado')),
    CONSTRAINT FK_instrumentos_categoria FOREIGN KEY (categoria_id) REFERENCES dbo.categorias (id) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT FK_instrumentos_marca FOREIGN KEY (marca_id) REFERENCES dbo.marcas (id) ON DELETE NO ACTION ON UPDATE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_instrumentos_categoria_id ON dbo.instrumentos (categoria_id ASC);
CREATE NONCLUSTERED INDEX IX_instrumentos_marca_id ON dbo.instrumentos (marca_id ASC);
CREATE NONCLUSTERED INDEX IX_instrumentos_precio ON dbo.instrumentos (precio ASC);
CREATE NONCLUSTERED INDEX IX_instrumentos_esta_activo ON dbo.instrumentos (esta_activo ASC);
GO

-- TABLA 5: especificaciones_instrumento (Relación 1:1 de ficha técnica)
CREATE TABLE dbo.especificaciones_instrumento (
    id INT IDENTITY(1,1) NOT NULL,
    instrumento_id INT NOT NULL,
    material NVARCHAR(150) NULL,
    color NVARCHAR(100) NULL,
    acabado NVARCHAR(100) NULL,
    meses_garantia INT NOT NULL CONSTRAINT DF_especificaciones_meses_garantia DEFAULT 12,
    peso_kg DECIMAL(5,2) NOT NULL CONSTRAINT DF_especificaciones_peso_kg DEFAULT 0.00,
    CONSTRAINT PK_especificaciones PRIMARY KEY CLUSTERED (id ASC),
    CONSTRAINT UQ_especificaciones_instrumento UNIQUE NONCLUSTERED (instrumento_id ASC),
    CONSTRAINT CK_especificaciones_garantia CHECK (meses_garantia >= 0),
    CONSTRAINT CK_especificaciones_peso CHECK (peso_kg >= 0),
    CONSTRAINT FK_especificaciones_instrumento FOREIGN KEY (instrumento_id) REFERENCES dbo.instrumentos (id) ON DELETE CASCADE ON UPDATE CASCADE
);
GO

-- TABLA 6: pedidos (Cabecera de órdenes de compra)
CREATE TABLE dbo.pedidos (
    id INT IDENTITY(1,1) NOT NULL,
    usuario_id INT NOT NULL,
    numero_pedido NVARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL CONSTRAINT DF_pedidos_total DEFAULT 0.00,
    estado NVARCHAR(20) NOT NULL CONSTRAINT DF_pedidos_estado DEFAULT 'pendiente',
    creado_en DATETIME2 NOT NULL CONSTRAINT DF_pedidos_creado_en DEFAULT GETDATE(),
    CONSTRAINT PK_pedidos PRIMARY KEY CLUSTERED (id ASC),
    CONSTRAINT UQ_pedidos_numero UNIQUE NONCLUSTERED (numero_pedido ASC),
    CONSTRAINT CK_pedidos_total CHECK (total >= 0),
    CONSTRAINT CK_pedidos_estado CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
    CONSTRAINT FK_pedidos_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios (id) ON DELETE NO ACTION ON UPDATE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_pedidos_usuario_id ON dbo.pedidos (usuario_id ASC);
CREATE NONCLUSTERED INDEX IX_pedidos_estado ON dbo.pedidos (estado ASC);
GO

-- TABLA 7: detalles_pedido (Líneas de productos del pedido)
CREATE TABLE dbo.detalles_pedido (
    id INT IDENTITY(1,1) NOT NULL,
    pedido_id INT NOT NULL,
    instrumento_id INT NOT NULL,
    cantidad INT NOT NULL CONSTRAINT DF_detalles_cantidad DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL CONSTRAINT DF_detalles_precio_unitario DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL CONSTRAINT DF_detalles_subtotal DEFAULT 0.00,
    CONSTRAINT PK_detalles_pedido PRIMARY KEY CLUSTERED (id ASC),
    CONSTRAINT CK_detalles_cantidad CHECK (cantidad > 0),
    CONSTRAINT CK_detalles_precio_unitario CHECK (precio_unitario >= 0),
    CONSTRAINT CK_detalles_subtotal CHECK (subtotal >= 0),
    CONSTRAINT FK_detalles_pedido FOREIGN KEY (pedido_id) REFERENCES dbo.pedidos (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_detalles_instrumento FOREIGN KEY (instrumento_id) REFERENCES dbo.instrumentos (id) ON DELETE NO ACTION ON UPDATE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_detalles_pedido_id ON dbo.detalles_pedido (pedido_id ASC);
CREATE NONCLUSTERED INDEX IX_detalles_instrumento_id ON dbo.detalles_pedido (instrumento_id ASC);
GO

-- ====================================================================
-- 4. INSERCIÓN DE DATOS DE PRUEBA (SEED DATA 100% EN ESPAÑOL)
-- ====================================================================

-- 4.1. Usuarios (Hashes criptográficos generados con bcrypt salt 10)

SET IDENTITY_INSERT dbo.usuarios ON;
INSERT INTO dbo.usuarios (id, nombre, correo, clave, rol) VALUES
(1, N'Administrador Principal', N'admin@tienda.com', N'$2b$10$CdSxh97ZR9tA0mL7szBsz.vmKMWppjHP754XF9fnJ1PnwAj2WHLIi', N'administrador'),
(2, N'Juan Vendedor', N'vendedor@tienda.com', N'$2b$10$NHrCZIpBmvzlUzT85EdR.Om9ijhzo4vbk3wO8rALg1Nwz1lFfxeJK', N'vendedor'),
(3, N'Ana Martínez', N'cliente@tienda.com', N'$2b$10$HCsIaXQPg6ycfs8wocbk9OH/AEFQgaJNlK1njoLzp8bKPe5pK6HBC', N'cliente'),
(4, N'Carlos Rodríguez', N'carlos@tienda.com', N'$2b$10$HCsIaXQPg6ycfs8wocbk9OH/AEFQgaJNlK1njoLzp8bKPe5pK6HBC', N'cliente');
SET IDENTITY_INSERT dbo.usuarios OFF;
GO

-- 4.2. Categorías
SET IDENTITY_INSERT dbo.categorias ON;
INSERT INTO dbo.categorias (id, nombre, slug, descripcion, icono) VALUES
(1, N'Cuerdas', N'cuerdas', N'Guitarras eléctricas, acústicas, bajos y ukeleles', N'guitar'),
(2, N'Viento', N'viento', N'Saxofones, flautas traversas, trompetas y clarinetes', N'wind'),
(3, N'Percusión', N'percusion', N'Baterías acústicas, electrónicas y percusión menor', N'drum'),
(4, N'Teclados y Pianos', N'teclados', N'Pianos de escenario, sintetizadores y controladores MIDI', N'keyboard'),
(5, N'Audio y Grabación', N'audio', N'Micrófonos de estudio, monitores y consolas de mezcla', N'headphones');
SET IDENTITY_INSERT dbo.categorias OFF;
GO

-- 4.3. Marcas
SET IDENTITY_INSERT dbo.marcas ON;
INSERT INTO dbo.marcas (id, nombre, pais_origen, sitio_web) VALUES
(1, N'Fender', N'Estados Unidos', N'https://www.fender.com'),
(2, N'Gibson', N'Estados Unidos', N'https://www.gibson.com'),
(3, N'Yamaha', N'Japón', N'https://www.yamaha.com'),
(4, N'Roland', N'Japón', N'https://www.roland.com'),
(5, N'Pearl', N'Japón', N'https://pearldrum.com'),
(6, N'Shure', N'Estados Unidos', N'https://www.shure.com'),
(7, N'Ibanez', N'Japón', N'https://www.ibanez.com');
SET IDENTITY_INSERT dbo.marcas OFF;
GO

-- 4.4. Instrumentos (12 instrumentos con catálogo variado)
SET IDENTITY_INSERT dbo.instrumentos ON;
INSERT INTO dbo.instrumentos (id, nombre, codigo_sku, categoria_id, marca_id, precio, stock, condicion, descripcion, imagen_url, esta_activo) VALUES
(1, N'Fender American Professional II Stratocaster', N'FEN-AMPRO2-STRAT-3TS', 1, 1, 1799990.00, 8, N'nuevo', N'Icónica guitarra eléctrica con pastillas V-Mod II Single-Coil, diapasón de arce suavemente biselado y trémolo de dos puntos.', N'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=800&q=80', 1),
(2, N'Gibson Les Paul Standard 50s', N'GIB-LP-STD50-HCS', 1, 2, 2799990.00, 5, N'nuevo', N'El clásico tono legendario del rock con cuerpo macizo de caoba, tapa de arce y pastillas BurstBucker 1 y 2.', N'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80', 1),
(3, N'Ibanez Steve Vai Signature JEM7V', N'IBA-JEM7V-WH', 1, 7, 2299990.00, 3, N'nuevo', N'Guitarra virtuosa con agarre Monkey Grip, diapasón con incrustaciones Tree of Life y puente Edge Pro trémolo.', N'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80', 1),
(4, N'Fender Player Precision Bass', N'FEN-PLAYER-PBASS-BLK', 1, 1, 849990.00, 10, N'nuevo', N'Bajo eléctrico de cuatro cuerdas con la legendaria pastilla split-coil de la serie Player para un sonido potente y definido.', N'https://images.unsplash.com/photo-1558098329-a11cff621064?auto=format&fit=crop&w=800&q=80', 1),
(5, N'Yamaha YAS-62III Saxofón Alto Profesional', N'YAM-YAS-62III-GOLD', 2, 3, 3450000.00, 4, N'nuevo', N'El estándar de oro en saxofones profesionales para conservatorio y solistas. Respuesta rápida y entonación perfecta.', N'https://images.unsplash.com/photo-1525994886773-080587e161c2?auto=format&fit=crop&w=800&q=80', 1),
(6, N'Yamaha YFL-222 Flauta Traversa de Estudio', N'YAM-YFL-222-SILV', 2, 3, 499990.00, 12, N'nuevo', N'Flauta traversa de platos cerrados con llaves desalineadas (Offset G), diseñada para ofrecer facilidad de emisión a estudiantes.', N'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', 1),
(7, N'Pearl Export EXX 5 Cuerpos Batería Acústica', N'PRL-EXX-725S-SMK', 3, 5, 929990.00, 6, N'nuevo', N'El set de batería más vendido del mundo con cascos de álamo y caoba asiática, tecnología SST y herrajes serie 830.', N'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=80', 1),
(8, N'Roland V-Drums TD-17KVX2 Batería Electrónica', N'ROL-TD17-KVX2', 3, 4, 1899990.00, 5, N'nuevo', N'Batería electrónica de alta gama con parches de malla de doble capa, Bluetooth integrado y pads de platillos delgados.', N'https://images.unsplash.com/photo-1543443436-1e646271cfa0?auto=format&fit=crop&w=800&q=80', 1),
(9, N'Yamaha P-125a Piano Digital Portátil 88 Teclas', N'YAM-P125A-BLK', 4, 3, 699990.00, 14, N'nuevo', N'Piano digital compacto con teclado Graded Hammer Standard (GHS) de 88 teclas y motor de sonido Pure CF.', N'https://images.unsplash.com/photo-1520523839898-507122858b99?auto=format&fit=crop&w=800&q=80', 1),
(10, N'Roland JUNO-DS88 Sintetizador Profesional', N'ROL-JUNODS88', 4, 4, 1199990.00, 7, N'nuevo', N'Sintetizador de escenario de 88 notas con acción de martillo ponderada, sonidos acústicos ultrarrealistas y pads de audio.', N'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80', 1),
(11, N'Shure SM7B Micrófono Dinámico Vocal de Estudio', N'SHU-SM7B-MIC', 5, 6, 399990.00, 25, N'nuevo', N'Micrófono dinámico cardioide de referencia para radiodifusión, podcasting y grabación vocal en estudio profesional.', N'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80', 1),
(12, N'Shure SM58 Micrófono Dinámico Vocal de Escenario', N'SHU-SM58-LC', 5, 6, 99990.00, 40, N'nuevo', N'El estándar mundial insuperable para voces en directo. Construcción blindada a prueba de caídas con filtro antipop interno.', N'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?auto=format&fit=crop&w=800&q=80', 1);
SET IDENTITY_INSERT dbo.instrumentos OFF;
GO

-- 4.5. Especificaciones Técnicas (especificaciones_instrumento)
SET IDENTITY_INSERT dbo.especificaciones_instrumento ON;
INSERT INTO dbo.especificaciones_instrumento (id, instrumento_id, material, color, acabado, meses_garantia, peso_kg) VALUES
(1, 1, N'Cuerpo de Aliso, Mástil de Arce', N'Sunburst 3 Colores', N'Poliuretano brillante', 24, 3.60),
(2, 2, N'Caoba maciza con tapa de arce figurado', N'Cereza Sunburst Heritage', N'Laca nitrocelulósica brillante', 24, 4.20),
(3, 3, N'Cuerpo de Aliso, mástil de 5 piezas Arce/Nogal', N'Blanco perla con herrajes dorados', N'Poliéster de alto brillo', 12, 3.50),
(4, 4, N'Aliso con diapasón de pau ferro', N'Negro Brillante', N'Poliéster brillante', 24, 4.00),
(5, 5, N'Latón amarillo grabado a mano', N'Laqueado dorado', N'Barniz epoxy horneado', 36, 2.50),
(6, 6, N'Cuerpo y cabeza de alpaca plateada', N'Plateado brillante', N'Bañado en plata pura', 24, 0.90),
(7, 7, N'Cascos de 6 capas de 7.5mm Álamo/Caoba', N'Cromado Ahumado', N'Wrap vinílico de alta resistencia', 24, 38.00),
(8, 8, N'Parches Mesh Head, estructura de aluminio reforzado', N'Negro mate', N'Anodizado industrial', 24, 24.70),
(9, 9, N'Polímero reforzado de alta densidad', N'Negro Satinado', N'Mate antihuellas', 24, 11.80),
(10, 10, N'Chasis híbrido aluminio/polímero', N'Negro con retroiluminación azul', N'Satinado', 24, 16.20),
(11, 11, N'Carcasa de aluminio esmaltado y acero inoxidable', N'Gris oscuro antirreflectante', N'Esmalte horneado mate', 24, 0.76),
(12, 12, N'Mango de fundición a presión esmaltado y rejilla de acero', N'Gris oscuro mate con rejilla plateada', N'Pintura mate antideslizante', 24, 0.30);
SET IDENTITY_INSERT dbo.especificaciones_instrumento OFF;
GO

-- 4.6. Pedidos
SET IDENTITY_INSERT dbo.pedidos ON;
INSERT INTO dbo.pedidos (id, usuario_id, numero_pedido, total, estado, creado_en) VALUES
(1, 3, N'PED-2026-0001', 1899980.00, N'completado', DATEADD(day, -5, GETDATE())),
(2, 3, N'PED-2026-0002', 1899990.00, N'pendiente', DATEADD(day, -1, GETDATE())),
(3, 4, N'PED-2026-0003', 1099980.00, N'completado', DATEADD(day, -2, GETDATE()));
SET IDENTITY_INSERT dbo.pedidos OFF;
GO

-- 4.7. Detalles de Pedido
SET IDENTITY_INSERT dbo.detalles_pedido ON;
INSERT INTO dbo.detalles_pedido (id, pedido_id, instrumento_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 1, 1799990.00, 1799990.00),
(2, 1, 12, 1, 99990.00, 99990.00),
(3, 2, 8, 1, 1899990.00, 1899990.00),
(4, 3, 9, 1, 699990.00, 699990.00),
(5, 3, 11, 1, 399990.00, 399990.00);
SET IDENTITY_INSERT dbo.detalles_pedido OFF;
GO

-- ====================================================================
-- FIN DEL SCRIPT T-SQL - Base de datos TiendaMusicaDB 100% en Español
-- ====================================================================
PRINT '✅ Base de datos TiendaMusicaDB creada y poblada exitosamente en Microsoft SQL Server.';
GO