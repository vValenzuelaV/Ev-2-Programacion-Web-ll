import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function generateSQL() {
  const salt = 10;
  const adminHash = await bcrypt.hash('Admin123!', salt);
  const sellerHash = await bcrypt.hash('Vendedor123!', salt);
  const customerHash = await bcrypt.hash('Cliente123!', salt);

  console.log('Admin Hash:', adminHash);
  console.log('Seller Hash:', sellerHash);
  console.log('Customer Hash:', customerHash);

  
  const mysqlScript = `-- ====================================================================
-- HARMONIA MUSIC STORE - BASE DE DATOS RELACIONAL (MySQL / MariaDB)
-- Motor: InnoDB | Cotejamiento: utf8mb4_unicode_ci
-- Compatible con: phpMyAdmin, MySQL Workbench, DBeaver, HeidiSQL
-- ====================================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS \`musicstore_db\` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE \`musicstore_db\`;

-- Desactivar verificación de claves foráneas temporalmente para limpieza segura
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS \`order_items\`;
DROP TABLE IF EXISTS \`orders\`;
DROP TABLE IF EXISTS \`instrument_specs\`;
DROP TABLE IF EXISTS \`instruments\`;
DROP TABLE IF EXISTS \`brands\`;
DROP TABLE IF EXISTS \`categories\`;
DROP TABLE IF EXISTS \`users\`;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- 2. DEFINICIÓN DE TABLAS (7 TABLAS RELACIONADAS)
-- ====================================================================

-- TABLA 1: users (Usuarios y autenticación RBAC)
CREATE TABLE \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL COMMENT 'Nombre completo del usuario',
  \`email\` VARCHAR(150) NOT NULL UNIQUE COMMENT 'Correo electrónico único de inicio de sesión',
  \`password\` VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
  \`role\` ENUM('admin', 'seller', 'customer') NOT NULL DEFAULT 'customer' COMMENT 'Rol en el sistema',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_users_email\` (\`email\`),
  INDEX \`idx_users_role\` (\`role\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 2: categories (Categorías de instrumentos)
CREATE TABLE \`categories\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre legible de la categoría',
  \`slug\` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador URL slug amigable',
  \`description\` TEXT NULL COMMENT 'Descripción de la categoría',
  \`icon\` VARCHAR(50) NULL COMMENT 'Nombre o clase de ícono para frontend',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_categories_slug\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 3: brands (Marcas de instrumentos)
CREATE TABLE \`brands\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre comercial de la marca',
  \`country\` VARCHAR(100) NULL COMMENT 'País de origen',
  \`website\` VARCHAR(255) NULL COMMENT 'Sitio web oficial',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_brands_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 4: instruments (Recurso principal del CRUD)
CREATE TABLE \`instruments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL COMMENT 'Nombre comercial del instrumento',
  \`sku\` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único de inventario SKU',
  \`category_id\` INT NOT NULL COMMENT 'Referencia a la categoría',
  \`brand_id\` INT NOT NULL COMMENT 'Referencia a la marca',
  \`price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio unitario de venta',
  \`stock\` INT NOT NULL DEFAULT 0 COMMENT 'Existencias en inventario',
  \`condition\` ENUM('new', 'used', 'refurbished') NOT NULL DEFAULT 'new' COMMENT 'Condición del producto',
  \`description\` TEXT NULL COMMENT 'Descripción detallada para la ficha técnica',
  \`image_url\` VARCHAR(500) NULL COMMENT 'URL de la imagen del producto',
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Activo (disponible), 0 = Desactivado (borrado lógico)',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_instruments_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT \`fk_instruments_brand\` FOREIGN KEY (\`brand_id\`) REFERENCES \`brands\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX \`idx_instruments_category\` (\`category_id\`),
  INDEX \`idx_instruments_brand\` (\`brand_id\`),
  INDEX \`idx_instruments_price\` (\`price\`),
  INDEX \`idx_instruments_active\` (\`is_active\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 5: instrument_specs (Especificaciones técnicas 1:1)
CREATE TABLE \`instrument_specs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`instrument_id\` INT NOT NULL UNIQUE COMMENT 'Relación 1 a 1 con el instrumento',
  \`material\` VARCHAR(150) NULL COMMENT 'Maderas o materiales principales',
  \`color\` VARCHAR(100) NULL COMMENT 'Color o acabado visual',
  \`finish\` VARCHAR(100) NULL COMMENT 'Tipo de terminación (laca, poliuretano, satinado)',
  \`warranty_months\` INT NOT NULL DEFAULT 12 COMMENT 'Garantía en meses',
  \`weight_kg\` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Peso en kilogramos',
  CONSTRAINT \`fk_specs_instrument\` FOREIGN KEY (\`instrument_id\`) REFERENCES \`instruments\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 6: orders (Cabecera de órdenes de compra)
CREATE TABLE \`orders\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT NOT NULL COMMENT 'Cliente que realizó la orden',
  \`order_number\` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único visible de seguimiento',
  \`total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Monto total facturado',
  \`status\` ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Estado del pedido',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_orders_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX \`idx_orders_user\` (\`user_id\`),
  INDEX \`idx_orders_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 7: order_items (Líneas de detalle de la orden)
CREATE TABLE \`order_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`order_id\` INT NOT NULL COMMENT 'Referencia a la orden',
  \`instrument_id\` INT NOT NULL COMMENT 'Referencia al instrumento comprado',
  \`quantity\` INT NOT NULL DEFAULT 1 COMMENT 'Cantidad de unidades',
  \`unit_price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio unitario histórico al momento de la compra',
  \`subtotal\` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Subtotal de la línea (unit_price * quantity)',
  CONSTRAINT \`fk_items_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_items_instrument\` FOREIGN KEY (\`instrument_id\`) REFERENCES \`instruments\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX \`idx_items_order\` (\`order_id\`),
  INDEX \`idx_items_instrument\` (\`instrument_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 3. INSERCIÓN DE DATOS DE PRUEBA (SEED DATA REALISTA)
-- ====================================================================

-- 3.1. Usuarios (Hashes criptográficos generados con bcrypt)
INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password\`, \`role\`) VALUES
(1, 'Administrador Principal', 'admin@tienda.com', '${adminHash}', 'admin'),
(2, 'Juan Vendedor', 'vendedor@tienda.com', '${sellerHash}', 'seller'),
(3, 'Ana Martínez', 'cliente@tienda.com', '${customerHash}', 'customer'),
(4, 'Carlos Rodríguez', 'carlos@tienda.com', '${customerHash}', 'customer');

-- 3.2. Categorías
INSERT INTO \`categories\` (\`id\`, \`name\`, \`slug\`, \`description\`, \`icon\`) VALUES
(1, 'Cuerdas', 'cuerdas', 'Guitarras eléctricas, acústicas, bajos y accesorios', 'guitar'),
(2, 'Viento', 'viento', 'Saxofones, flautas, trompetas y clarinetes', 'wind'),
(3, 'Percusión', 'percusion', 'Baterías acústicas, electrónicas y percusión menor', 'drum'),
(4, 'Teclados y Pianos', 'teclados', 'Pianos de escenario, sintetizadores y teclados controladores', 'keyboard'),
(5, 'Audio y Grabación', 'audio', 'Micrófonos de estudio, monitores y equipos de mezcla', 'headphones');

-- 3.3. Marcas
INSERT INTO \`brands\` (\`id\`, \`name\`, \`country\`, \`website\`) VALUES
(1, 'Fender', 'Estados Unidos', 'https://www.fender.com'),
(2, 'Gibson', 'Estados Unidos', 'https://www.gibson.com'),
(3, 'Yamaha', 'Japón', 'https://www.yamaha.com'),
(4, 'Roland', 'Japón', 'https://www.roland.com'),
(5, 'Pearl', 'Japón', 'https://pearldrum.com'),
(6, 'Shure', 'Estados Unidos', 'https://www.shure.com'),
(7, 'Ibanez', 'Japón', 'https://www.ibanez.com');

-- 3.4. Instrumentos (12 instrumentos en todas las categorías)
INSERT INTO \`instruments\` (\`id\`, \`name\`, \`sku\`, \`category_id\`, \`brand_id\`, \`price\`, \`stock\`, \`condition\`, \`description\`, \`image_url\`, \`is_active\`) VALUES
(1, 'Fender American Professional II Stratocaster', 'FEN-AMPRO2-STRAT-3TS', 1, 1, 1799.99, 8, 'new', 'Icónica guitarra eléctrica con pastillas V-Mod II Single-Coil, diapasón de arce suavemente biselado y trémolo de dos puntos.', 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=800&q=80', 1),
(2, 'Gibson Les Paul Standard 50s', 'GIB-LP-STD50-HCS', 1, 2, 2799.00, 5, 'new', 'El clásico tono legendario del rock con cuerpo macizo de caoba, tapa de arce y pastillas BurstBucker 1 y 2.', 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80', 1),
(3, 'Ibanez Steve Vai Signature JEM7V', 'IBA-JEM7V-WH', 1, 7, 2299.00, 3, 'new', 'Guitarra virtuosa con mango Monkey Grip, diapasón con incrustaciones Tree of Life y puente Edge Pro tremolo.', 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80', 1),
(4, 'Fender Player Precision Bass', 'FEN-PLAYER-PBASS-BLK', 1, 1, 849.99, 10, 'new', 'Bajo eléctrico de cuatro cuerdas con la legendaria pastilla split-coil de la serie Player para un sonido potente y definido.', 'https://images.unsplash.com/photo-1558098329-a11cff621064?auto=format&fit=crop&w=800&q=80', 1),
(5, 'Yamaha YAS-62III Saxofón Alto Profesional', 'YAM-YAS-62III-GOLD', 2, 3, 3450.00, 4, 'new', 'El estándar de oro en saxofones profesionales para conservatorio y solistas. Respuesta rápida y entonación perfecta.', 'https://images.unsplash.com/photo-1525994886773-080587e161c2?auto=format&fit=crop&w=800&q=80', 1),
(6, 'Yamaha YFL-222 Flauta Traversa de Estudio', 'YAM-YFL-222-SILV', 2, 3, 499.00, 12, 'new', 'Flauta traversa de platos cerrados con llaves desalineadas (Offset G), diseñada para ofrecer facilidad de emisión a estudiantes.', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', 1),
(7, 'Pearl Export EXX 5 Cuerpos Batería Acústica', 'PRL-EXX-725S-SMK', 3, 5, 929.00, 6, 'new', 'El set de batería más vendido del mundo con cascos de álamo y caoba asiática, tecnología SST y herrajes serie 830.', 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=80', 1),
(8, 'Roland V-Drums TD-17KVX2 Batería Electrónica', 'ROL-TD17-KVX2', 3, 4, 1899.99, 5, 'new', 'Batería electrónica de alta gama con parches de malla de doble capa, Bluetooth integrado y pads de platillos delgados.', 'https://images.unsplash.com/photo-1543443436-1e646271cfa0?auto=format&fit=crop&w=800&q=80', 1),
(9, 'Yamaha P-125a Piano Digital Portátil 88 Teclas', 'YAM-P125A-BLK', 4, 3, 699.99, 14, 'new', 'Piano digital compacto con teclado Graded Hammer Standard (GHS) de 88 teclas y motor de sonido Pure CF.', 'https://images.unsplash.com/photo-1520523839898-507122858b99?auto=format&fit=crop&w=800&q=80', 1),
(10, 'Roland JUNO-DS88 Sintetizador Profesional', 'ROL-JUNODS88', 4, 4, 1199.00, 7, 'new', 'Sintetizador portátil de 88 notas con acción de martillo ponderada, sonidos acústicos ultrarrealistas y pads de disparo de audio.', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80', 1),
(11, 'Shure SM7B Micrófono Dinámico Vocal de Estudio', 'SHU-SM7B-MIC', 5, 6, 399.00, 25, 'new', 'Micrófono dinámico cardioide de referencia para radiodifusión, podcasting y grabación vocal en estudio profesional.', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80', 1),
(12, 'Shure SM58 Micrófono Dinámico Vocal de Escenario', 'SHU-SM58-LC', 5, 6, 99.00, 40, 'new', 'El estándar mundial insuperable para voces en directo. Construcción blindada a prueba de caídas con filtro antipop interno.', 'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?auto=format&fit=crop&w=800&q=80', 1);

-- 3.5. Especificaciones Técnicas (instrument_specs)
INSERT INTO \`instrument_specs\` (\`id\`, \`instrument_id\`, \`material\`, \`color\`, \`finish\`, \`warranty_months\`, \`weight_kg\`) VALUES
(1, 1, 'Cuerpo de Aliso, Mástil de Arce', '3-Color Sunburst', 'Poliuretano brillante', 24, 3.60),
(2, 2, 'Caoba maciza con tapa de arce figurado', 'Heritage Cherry Sunburst', 'Laca nitrocelulósica brillante', 24, 4.20),
(3, 3, 'Cuerpo de Aliso, mástil de 5 piezas Arce/Nogal', 'Blanco perla con herrajes dorados', 'Poliéster de alto brillo', 12, 3.50),
(4, 4, 'Aliso con diapasón de pau ferro', 'Negro Brillante', 'Poliéster brillante', 24, 4.00),
(5, 5, 'Latón amarillo grabado a mano', 'Laqueado dorado', 'Barniz epoxy horneado', 36, 2.50),
(6, 6, 'Cuerpo y cabeza de alpaca plateada', 'Plateado brillante', 'Bañado en plata pura', 24, 0.90),
(7, 7, 'Cascos de 6 capas de 7.5mm Álamo/Caoba', 'Smokey Chrome', 'Wrap vinílico de alta resistencia', 24, 38.00),
(8, 8, 'Parches Mesh Head, estructura de aluminio reforzado', 'Negro mate', 'Anodizado industrial', 24, 24.70),
(9, 9, 'Polímero reforzado de alta densidad', 'Negro Satinado', 'Mate antihuellas', 24, 11.80),
(10, 10, 'Chasis híbrido aluminio/polímero', 'Negro con retroiluminación azul', 'Satinado', 24, 16.20),
(11, 11, 'Carcasa de aluminio esmaltado y acero inoxidable', 'Gris oscuro antirreflectante', 'Esmalte horneado mate', 24, 0.76),
(12, 12, 'Mango de fundición a presión esmaltado y rejilla de acero', 'Gris oscuro mate con rejilla plateada', 'Pintura mate antideslizante', 24, 0.30);

-- 3.6. Órdenes de compra
INSERT INTO \`orders\` (\`id\`, \`user_id\`, \`order_number\`, \`total\`, \`status\`, \`created_at\`) VALUES
(1, 3, 'ORD-2026-0001', 1898.99, 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 3, 'ORD-2026-0002', 1899.99, 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 4, 'ORD-2026-0003', 1098.99, 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 3.7. Ítems de órdenes
INSERT INTO \`order_items\` (\`id\`, \`order_id\`, \`instrument_id\`, \`quantity\`, \`unit_price\`, \`subtotal\`) VALUES
(1, 1, 1, 1, 1799.99, 1799.99),
(2, 1, 12, 1, 99.00, 99.00),
(3, 2, 8, 1, 1899.99, 1899.99),
(4, 3, 9, 1, 699.99, 699.99),
(5, 3, 11, 1, 399.00, 399.00);

-- ====================================================================
-- FIN DEL SCRIPT SQL - BASE DE DATOS PREPARADA
-- ====================================================================
`;

  
  const pgScript = `-- ====================================================================
-- HARMONIA MUSIC STORE - BASE DE DATOS RELACIONAL (PostgreSQL)
-- Compatible con: PostgreSQL 12+, pgAdmin 4, DBeaver, Supabase
-- ====================================================================

-- 1. CREACIÓN DE TIPOS ENUM PERSONALIZADOS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'seller', 'customer');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'instrument_condition') THEN
    CREATE TYPE instrument_condition AS ENUM ('new', 'used', 'refurbished');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');
  END IF;
END $$;

-- Limpieza previa de tablas
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS instrument_specs CASCADE;
DROP TABLE IF EXISTS instruments CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ====================================================================
-- 2. DEFINICIÓN DE TABLAS (7 TABLAS RELACIONADAS)
-- ====================================================================

-- TABLA 1: users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- TABLA 2: categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_categories_slug ON categories(slug);

-- TABLA 3: brands
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  country VARCHAR(100),
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_brands_name ON brands(name);

-- TABLA 4: instruments
CREATE TABLE instruments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  brand_id INT NOT NULL REFERENCES brands(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  condition instrument_condition NOT NULL DEFAULT 'new',
  description TEXT,
  image_url VARCHAR(500),
  is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_instruments_category ON instruments(category_id);
CREATE INDEX idx_instruments_brand ON instruments(brand_id);
CREATE INDEX idx_instruments_price ON instruments(price);
CREATE INDEX idx_instruments_active ON instruments(is_active);

-- TABLA 5: instrument_specs
CREATE TABLE instrument_specs (
  id SERIAL PRIMARY KEY,
  instrument_id INT NOT NULL UNIQUE REFERENCES instruments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  material VARCHAR(150),
  color VARCHAR(100),
  finish VARCHAR(100),
  warranty_months INT NOT NULL DEFAULT 12 CHECK (warranty_months >= 0),
  weight_kg DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (weight_kg >= 0)
);

-- TABLA 6: orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- TABLA 7: order_items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
  instrument_id INT NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0)
);
CREATE INDEX idx_items_order ON order_items(order_id);
CREATE INDEX idx_items_instrument ON order_items(instrument_id);

-- ====================================================================
-- 3. INSERCIÓN DE DATOS DE PRUEBA (SEED DATA REALISTA)
-- ====================================================================

INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Administrador Principal', 'admin@tienda.com', '${adminHash}', 'admin'),
(2, 'Juan Vendedor', 'vendedor@tienda.com', '${sellerHash}', 'seller'),
(3, 'Ana Martínez', 'cliente@tienda.com', '${customerHash}', 'customer'),
(4, 'Carlos Rodríguez', 'carlos@tienda.com', '${customerHash}', 'customer');

INSERT INTO categories (id, name, slug, description, icon) VALUES
(1, 'Cuerdas', 'cuerdas', 'Guitarras eléctricas, acústicas, bajos y accesorios', 'guitar'),
(2, 'Viento', 'viento', 'Saxofones, flautas, trompetas y clarinetes', 'wind'),
(3, 'Percusión', 'percusion', 'Baterías acústicas, electrónicas y percusión menor', 'drum'),
(4, 'Teclados y Pianos', 'teclados', 'Pianos de escenario, sintetizadores y teclados controladores', 'keyboard'),
(5, 'Audio y Grabación', 'audio', 'Micrófonos de estudio, monitores y equipos de mezcla', 'headphones');

INSERT INTO brands (id, name, country, website) VALUES
(1, 'Fender', 'Estados Unidos', 'https://www.fender.com'),
(2, 'Gibson', 'Estados Unidos', 'https://www.gibson.com'),
(3, 'Yamaha', 'Japón', 'https://www.yamaha.com'),
(4, 'Roland', 'Japón', 'https://www.roland.com'),
(5, 'Pearl', 'Japón', 'https://pearldrum.com'),
(6, 'Shure', 'Estados Unidos', 'https://www.shure.com'),
(7, 'Ibanez', 'Japón', 'https://www.ibanez.com');

INSERT INTO instruments (id, name, sku, category_id, brand_id, price, stock, condition, description, image_url, is_active) VALUES
(1, 'Fender American Professional II Stratocaster', 'FEN-AMPRO2-STRAT-3TS', 1, 1, 1799.99, 8, 'new', 'Icónica guitarra eléctrica con pastillas V-Mod II Single-Coil, diapasón de arce suavemente biselado y trémolo de dos puntos.', 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=800&q=80', 1),
(2, 'Gibson Les Paul Standard 50s', 'GIB-LP-STD50-HCS', 1, 2, 2799.00, 5, 'new', 'El clásico tono legendario del rock con cuerpo macizo de caoba, tapa de arce y pastillas BurstBucker 1 y 2.', 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80', 1),
(3, 'Ibanez Steve Vai Signature JEM7V', 'IBA-JEM7V-WH', 1, 7, 2299.00, 3, 'new', 'Guitarra virtuosa con mango Monkey Grip, diapasón con incrustaciones Tree of Life y puente Edge Pro tremolo.', 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80', 1),
(4, 'Fender Player Precision Bass', 'FEN-PLAYER-PBASS-BLK', 1, 1, 849.99, 10, 'new', 'Bajo eléctrico de cuatro cuerdas con la legendaria pastilla split-coil de la serie Player para un sonido potente y definido.', 'https://images.unsplash.com/photo-1558098329-a11cff621064?auto=format&fit=crop&w=800&q=80', 1),
(5, 'Yamaha YAS-62III Saxofón Alto Profesional', 'YAM-YAS-62III-GOLD', 2, 3, 3450.00, 4, 'new', 'El estándar de oro en saxofones profesionales para conservatorio y solistas. Respuesta rápida y entonación perfecta.', 'https://images.unsplash.com/photo-1525994886773-080587e161c2?auto=format&fit=crop&w=800&q=80', 1),
(6, 'Yamaha YFL-222 Flauta Traversa de Estudio', 'YAM-YFL-222-SILV', 2, 3, 499.00, 12, 'new', 'Flauta traversa de platos cerrados con llaves desalineadas (Offset G), diseñada para ofrecer facilidad de emisión a estudiantes.', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', 1),
(7, 'Pearl Export EXX 5 Cuerpos Batería Acústica', 'PRL-EXX-725S-SMK', 3, 5, 929.00, 6, 'new', 'El set de batería más vendido del mundo con cascos de álamo y caoba asiática, tecnología SST y herrajes serie 830.', 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=80', 1),
(8, 'Roland V-Drums TD-17KVX2 Batería Electrónica', 'ROL-TD17-KVX2', 3, 4, 1899.99, 5, 'new', 'Batería electrónica de alta gama con parches de malla de doble capa, Bluetooth integrado y pads de platillos delgados.', 'https://images.unsplash.com/photo-1543443436-1e646271cfa0?auto=format&fit=crop&w=800&q=80', 1),
(9, 'Yamaha P-125a Piano Digital Portátil 88 Teclas', 'YAM-P125A-BLK', 4, 3, 699.99, 14, 'new', 'Piano digital compacto con teclado Graded Hammer Standard (GHS) de 88 teclas y motor de sonido Pure CF.', 'https://images.unsplash.com/photo-1520523839898-507122858b99?auto=format&fit=crop&w=800&q=80', 1),
(10, 'Roland JUNO-DS88 Sintetizador Profesional', 'ROL-JUNODS88', 4, 4, 1199.00, 7, 'new', 'Sintetizador portátil de 88 notas con acción de martillo ponderada, sonidos acústicos ultrarrealistas y pads de disparo de audio.', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80', 1),
(11, 'Shure SM7B Micrófono Dinámico Vocal de Estudio', 'SHU-SM7B-MIC', 5, 6, 399.00, 25, 'new', 'Micrófono dinámico cardioide de referencia para radiodifusión, podcasting y grabación vocal en estudio profesional.', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80', 1),
(12, 'Shure SM58 Micrófono Dinámico Vocal de Escenario', 'SHU-SM58-LC', 5, 6, 99.00, 40, 'new', 'El estándar mundial insuperable para voces en directo. Construcción blindada a prueba de caídas con filtro antipop interno.', 'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?auto=format&fit=crop&w=800&q=80', 1);

INSERT INTO instrument_specs (id, instrument_id, material, color, finish, warranty_months, weight_kg) VALUES
(1, 1, 'Cuerpo de Aliso, Mástil de Arce', '3-Color Sunburst', 'Poliuretano brillante', 24, 3.60),
(2, 2, 'Caoba maciza con tapa de arce figurado', 'Heritage Cherry Sunburst', 'Laca nitrocelulósica brillante', 24, 4.20),
(3, 3, 'Cuerpo de Aliso, mástil de 5 piezas Arce/Nogal', 'Blanco perla con herrajes dorados', 'Poliéster de alto brillo', 12, 3.50),
(4, 4, 'Aliso con diapasón de pau ferro', 'Negro Brillante', 'Poliéster brillante', 24, 4.00),
(5, 5, 'Latón amarillo grabado a mano', 'Laqueado dorado', 'Barniz epoxy horneado', 36, 2.50),
(6, 6, 'Cuerpo y cabeza de alpaca plateada', 'Plateado brillante', 'Bañado en plata pura', 24, 0.90),
(7, 7, 'Cascos de 6 capas de 7.5mm Álamo/Caoba', 'Smokey Chrome', 'Wrap vinílico de alta resistencia', 24, 38.00),
(8, 8, 'Parches Mesh Head, estructura de aluminio reforzado', 'Negro mate', 'Anodizado industrial', 24, 24.70),
(9, 9, 'Polímero reforzado de alta densidad', 'Negro Satinado', 'Mate antihuellas', 24, 11.80),
(10, 10, 'Chasis híbrido aluminio/polímero', 'Negro con retroiluminación azul', 'Satinado', 24, 16.20),
(11, 11, 'Carcasa de aluminio esmaltado y acero inoxidable', 'Gris oscuro antirreflectante', 'Esmalte horneado mate', 24, 0.76),
(12, 12, 'Mango de fundición a presión esmaltado y rejilla de acero', 'Gris oscuro mate con rejilla plateada', 'Pintura mate antideslizante', 24, 0.30);

INSERT INTO orders (id, user_id, order_number, total, status, created_at) VALUES
(1, 3, 'ORD-2026-0001', 1898.99, 'completed', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(2, 3, 'ORD-2026-0002', 1899.99, 'pending', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 4, 'ORD-2026-0003', 1098.99, 'completed', CURRENT_TIMESTAMP - INTERVAL '2 days');

INSERT INTO order_items (id, order_id, instrument_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 1, 1799.99, 1799.99),
(2, 1, 12, 1, 99.00, 99.00),
(3, 2, 8, 1, 1899.99, 1899.99),
(4, 3, 9, 1, 699.99, 699.99),
(5, 3, 11, 1, 399.00, 399.00);

-- Ajustar secuencias seriales al último ID insertado
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('brands_id_seq', (SELECT MAX(id) FROM brands));
SELECT setval('instruments_id_seq', (SELECT MAX(id) FROM instruments));
SELECT setval('instrument_specs_id_seq', (SELECT MAX(id) FROM instrument_specs));
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
`;

  const backendDir = path.resolve(process.cwd());
  fs.writeFileSync(path.join(backendDir, 'database.sql'), mysqlScript.trim());
  fs.writeFileSync(path.join(backendDir, 'database_postgres.sql'), pgScript.trim());
  console.log('✅ Archivos database.sql y database_postgres.sql creados con éxito!');
}

generateSQL().catch(console.error);
