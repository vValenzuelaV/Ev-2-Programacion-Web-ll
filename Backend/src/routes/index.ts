import { Router } from 'express';
import authRoutes from './auth.routes.js';
import instrumentRoutes from './instrument.routes.js';
import categoryRoutes from './category.routes.js';
import brandRoutes from './brand.routes.js';
import orderRoutes from './order.routes.js';
import uploadRoutes from './upload.routes.js';

const apiRouter = Router();

apiRouter.use('/autenticacion', authRoutes);
apiRouter.use('/instrumentos', instrumentRoutes);
apiRouter.use('/categorias', categoryRoutes);
apiRouter.use('/marcas', brandRoutes);
apiRouter.use('/pedidos', orderRoutes);
apiRouter.use('/subidas', uploadRoutes);

apiRouter.use('/auth', authRoutes);
apiRouter.use('/instruments', instrumentRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/brands', brandRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/upload', uploadRoutes);

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    estado: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default apiRouter;
