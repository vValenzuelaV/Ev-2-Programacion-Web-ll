import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { AppError } from '../middlewares/error.middleware.js';

const router = Router();

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    
    const ext = path.extname(file.originalname).toLowerCase();
    const nombreLimpio = `instrumento-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, nombreLimpio);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de archivo no permitido. Solo se aceptan imágenes en formato JPG, PNG, WebP o GIF.', 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 1, 
  },
});

router.post(
  '/imagen',
  authenticateJWT,
  authorizeRoles('administrador', 'vendedor'),
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('imagen')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('El archivo excede el tamaño máximo permitido de 5 MB.', 400));
        }
        return next(new AppError(`Error al procesar el archivo: ${err.message}`, 400));
      } else if (err) {
        return next(err);
      }

      if (!req.file) {
        return next(new AppError('No se proporcionó ningún archivo de imagen para subir.', 400));
      }

      
      const protocolo = req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const urlCompleta = `${protocolo}://${host}/uploads/${req.file.filename}`;

      return res.status(201).json({
        success: true,
        mensaje: 'Imagen subida exitosamente al servidor',
        data: {
          url: urlCompleta,
          nombre_archivo: req.file.filename,
          tamano_bytes: req.file.size,
          tipo_mime: req.file.mimetype,
        },
      });
    });
  }
);

export default router;
