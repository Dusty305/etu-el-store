import express from 'express';
import {
    products,
    oneProduct,
    search
} from '../controllers/productController.js';

const router = express.Router();

router.get('/all', products)
router.get('/search', search)
router.get('/id/:productId', oneProduct)

export default router;