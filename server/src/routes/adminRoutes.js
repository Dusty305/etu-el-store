// src/routes/adminRoutes.js
import express from 'express';
import { getUsers, updateUserRole } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', requireAdmin, getUsers);
router.patch('/users/:userId/role', requireAdmin, updateUserRole);

export default router;