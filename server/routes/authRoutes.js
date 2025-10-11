import express from 'express';
import {
    register,
    login,
    logout,
    getCurrentUser
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);

// Защищенные маршруты
router.post('/logout', requireAuth, logout);
router.get('/me', getCurrentUser);

export default router;