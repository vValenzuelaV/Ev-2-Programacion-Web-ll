import { Router } from 'express';
import { login, register, getProfile } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.post('/iniciar-sesion', authLimiter, validate({ body: loginSchema }), login);

router.post('/register', validate({ body: registerSchema }), register);
router.post('/registro', validate({ body: registerSchema }), register);

router.get('/me', authenticateJWT, getProfile);
router.get('/perfil', authenticateJWT, getProfile);

export default router;
