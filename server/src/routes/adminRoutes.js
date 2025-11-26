// src/routes/adminRoutes.js
import express from 'express';
import { getUsers, updateUserRole } from '../controllers/adminController.js';
import {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryTree
} from '../controllers/adminCategoryController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Управление пользователями
router.get('/users', requireAdmin, getUsers);
router.patch('/users/:userId/role', requireAdmin, updateUserRole);

// Управление категориями
router.post('/categories', requireAdmin, createCategory);
router.put('/categories/:categoryId', requireAdmin, updateCategory);
router.delete('/categories/:categoryId', requireAdmin, deleteCategory);
router.get('/categories/tree', requireAdmin, getCategoryTree);

export default router;