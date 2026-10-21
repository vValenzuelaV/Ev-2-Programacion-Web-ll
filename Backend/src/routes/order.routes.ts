import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authenticateJWT, hasRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
} from '../schemas/order.schema.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', validate({ body: createOrderSchema }), createOrder);
router.get('/', getOrders);
router.get('/:id', validate({ params: orderIdParamSchema }), getOrderById);

router.patch(
  '/:id/estado',
  hasRole('administrador', 'vendedor'),
  validate({ params: orderIdParamSchema, body: updateOrderStatusSchema }),
  updateOrderStatus
);

router.patch(
  '/:id/status',
  hasRole('administrador', 'vendedor'),
  validate({ params: orderIdParamSchema, body: updateOrderStatusSchema }),
  updateOrderStatus
);

export default router;
