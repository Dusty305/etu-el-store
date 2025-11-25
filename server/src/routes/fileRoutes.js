// src/routes/fileRoutes.js
import express from 'express';
import {
    uploadProductImages,
    getProductImages,
    deleteProductImage,
    deleteAllProductImages,
} from '../controllers/fileController.js';
import { requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Загрузка изображений товара
router.post('/products/:productId/upload', requireAdmin, upload.array('images', 10), uploadProductImages);

// Получение списка изображений товара
router.get('/products/:productId', getProductImages);

// Удаление конкретного изображения товара
router.delete('/products/:productId/:filename', requireAdmin, deleteProductImage);

// Удаление всех изображений товара
router.delete('/products/:productId', requireAdmin, deleteAllProductImages);

export default router;