import { Router } from 'express';
import { getAllBrands, getBrandById, createBrand } from '../controllers/brand.controller.js';
import { authenticateJWT, hasRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getAllBrands);
router.get('/:id', getBrandById);
router.post('/', authenticateJWT, hasRole('admin', 'seller'), createBrand);

export default router;
