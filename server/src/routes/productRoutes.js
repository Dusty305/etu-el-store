import express from 'express';
import {
    products
} from '../controllers/productController.js';

const router = express.Router();

// Публичные маршруты
router.get('/all', products)

// Защищенные маршруты

export default router;