import { app } from './app.js';
import { config } from './config/env.js';
import { initDatabase } from './config/database.js';

async function startServer() {
  
  await initDatabase();

  const server = app.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(`🎵 Servidor API de Instrumentos Musicales`);
    console.log(`🚀 Corriendo en: http://localhost:${config.port}`);
    console.log(`📚 Documentación Scalar en: http://localhost:${config.port}/reference`);
    console.log(`🩺 Health check en: http://localhost:${config.port}/api/health`);
    console.log(`💾 Motor BD configurado: ${config.dbDialect.toUpperCase()}`);
    console.log(`===============================================`);
  });

  
  process.on('SIGTERM', () => {
    console.log('Cerrando servidor HTTP graciosamente...');
    server.close(() => {
      console.log('Servidor finalizado.');
      process.exit(0);
    });
  });
}

startServer().catch(err => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
