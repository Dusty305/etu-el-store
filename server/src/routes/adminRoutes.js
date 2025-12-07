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

// HACK мне кажется здесь не нужен администратор, чтобы категории смотреть, потому что переписывать
// код, чтобы у нас были разные API для пользователя и для админа, в данном случае слишком тупо
router.get('/categories/tree', /*requireAdmin,*/ getCategoryTree);

export default router;