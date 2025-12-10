import express from 'express';
import { getUsers, updateUserRole } from '../controllers/adminController.js';
import {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryTree
} from '../controllers/adminCategoryController.js';

import {
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    markOrderAsDelivered
} from '../controllers/adminOrderController.js';

import {
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/adminProductController.js'

import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Управление пользователями
router.get('/users', requireAdmin, getUsers);
router.patch('/users/:userId/role', requireAdmin, updateUserRole);

// Управление категориями
router.post('/categories', requireAdmin, createCategory);
router.put('/categories/:categoryId', requireAdmin, updateCategory);
router.delete('/categories/:categoryId', requireAdmin, deleteCategory);
router.get('/categories/tree', /*requireAdmin,*/ getCategoryTree);

// Управление заказами
router.get('/orders', requireAdmin, getAllOrders);
router.get('/orders/:orderId', requireAdmin, getOrderDetails);
router.patch('/orders/:orderId/status', requireAdmin, updateOrderStatus);
router.post('/orders/:orderId/deliver', requireAdmin, markOrderAsDelivered);

// Управление продуктами
router.post('/products', createProduct)
router.put('/products/:productId', updateProduct)
router.delete('/products/:productId', deleteProduct)

export default router;