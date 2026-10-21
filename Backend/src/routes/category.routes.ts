import { Router } from 'express';
import { getAllCategories, getCategoryById, createCategory } from '../controllers/category.controller.js';
import { authenticateJWT, hasRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticateJWT, hasRole('admin', 'seller'), createCategory);

export default router;
