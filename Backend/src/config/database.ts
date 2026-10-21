import Database from 'better-sqlite3';
import sql from 'mssql';
import path from 'path';
import fs from 'fs';
import { config } from './env.js';

export const mssqlConfig: sql.config = {
  server: config.dbServer,
  port: config.dbPort,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  options: {
    encrypt: config.dbEncrypt,
    trustServerCertificate: config.dbTrustServerCertificate,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 5000,
  requestTimeout: 15000,
};

let mssqlPool: sql.ConnectionPool | null = null;
let isConnectedToSqlServer = false;

export async function getSqlServerPool(): Promise<sql.ConnectionPool | null> {
  if (mssqlPool && mssqlPool.connected) {
    return mssqlPool;
  }

  try {
    console.log(`🔌 Conectando a Microsoft SQL Server (${config.dbServer}:${config.dbPort}/${config.dbName})...`);
    mssqlPool = await new sql.ConnectionPool(mssqlConfig).connect();
    isConnectedToSqlServer = true;
    console.log('✅ Conexión establecida exitosamente con Microsoft SQL Server.');
    return mssqlPool;
  } catch (error: any) {
    console.warn('⚠️ No se pudo conectar a Microsoft SQL Server local:', error.message);
    console.warn('💡 Consejo: Importa el script database.sql o database_sqlserver.sql en SQL Server Management Studio (SSMS).');
    console.warn('🔄 Operando con motor de base de datos local como respaldo de alta disponibilidad.');
    isConnectedToSqlServer = false;
    return null;
  }
}

export function isSqlServerActive(): boolean {
  return isConnectedToSqlServer;
}

export { sql };

const dbPath = path.isAbsolute(config.databasePath)
  ? config.databasePath
  : path.resolve(process.cwd(), config.databasePath);

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export async function initDatabase(): Promise<void> {
  const schema = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      clave TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('administrador', 'vendedor', 'cliente')) DEFAULT 'cliente',
      creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      icono TEXT,
      creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS marcas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      pais_origen TEXT,
      sitio_web TEXT,
      creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS instrumentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      codigo_sku TEXT NOT NULL UNIQUE,
      categoria_id INTEGER NOT NULL,
      marca_id INTEGER NOT NULL,
      precio REAL NOT NULL CHECK(precio >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      condicion TEXT NOT NULL DEFAULT 'nuevo',
      descripcion TEXT,
      imagen_url TEXT,
      esta_activo INTEGER NOT NULL DEFAULT 1 CHECK(esta_activo IN (0, 1)),
      creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
      FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS especificaciones_instrumento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      instrumento_id INTEGER NOT NULL UNIQUE,
      material TEXT,
      color TEXT,
      acabado TEXT,
      meses_garantia INTEGER DEFAULT 12,
      peso_kg REAL DEFAULT 0,
      FOREIGN KEY (instrumento_id) REFERENCES instrumentos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      numero_pedido TEXT NOT NULL UNIQUE,
      total REAL NOT NULL DEFAULT 0 CHECK(total >= 0),
      estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'completado', 'cancelado')) DEFAULT 'pendiente',
      creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS detalles_pedido (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      instrumento_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL CHECK(cantidad > 0),
      precio_unitario REAL NOT NULL CHECK(precio_unitario >= 0),
      subtotal REAL NOT NULL CHECK(subtotal >= 0),
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
      FOREIGN KEY (instrumento_id) REFERENCES instrumentos(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_instrumentos_categoria ON instrumentos(categoria_id);
    CREATE INDEX IF NOT EXISTS idx_instrumentos_marca ON instrumentos(marca_id);
    CREATE INDEX IF NOT EXISTS idx_instrumentos_activo ON instrumentos(esta_activo);
    CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_detalles_pedido ON detalles_pedido(pedido_id);
  `;

  db.exec(schema);

  if (config.dbDialect === 'mssql') {
    await getSqlServerPool();
  }
}
