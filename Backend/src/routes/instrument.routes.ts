import { Router } from 'express';
import {
  getInstruments,
  getInstrumentById,
  createInstrument,
  updateInstrument,
  deleteInstrument,
} from '../controllers/instrument.controller.js';
import { authenticateJWT, hasRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createInstrumentSchema,
  updateInstrumentSchema,
  instrumentIdParamSchema,
  instrumentQuerySchema,
} from '../schemas/instrument.schema.js';

const router = Router();

router.get('/', validate({ query: instrumentQuerySchema }), getInstruments);
router.get('/:id', validate({ params: instrumentIdParamSchema }), getInstrumentById);

router.post(
  '/',
  authenticateJWT,
  hasRole('admin', 'seller'),
  validate({ body: createInstrumentSchema }),
  createInstrument
);

router.put(
  '/:id',
  authenticateJWT,
  hasRole('admin', 'seller'),
  validate({ params: instrumentIdParamSchema, body: updateInstrumentSchema }),
  updateInstrument
);

router.delete(
  '/:id',
  authenticateJWT,
  hasRole('admin'),
  validate({ params: instrumentIdParamSchema }),
  deleteInstrument
);

export default router;
