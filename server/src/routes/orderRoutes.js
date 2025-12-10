import express from 'express';
import {
    createOrderFromCart,
    getUserOrders,
    getOrderDetails,
    updateOrder,
    processPayment,
    cancelOrder,
    deliverOrder
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createOrderFromCart);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderDetails);
router.put('/:orderId', updateOrder);
router.post('/:orderId/pay', processPayment);
router.post('/:orderId/cancel', cancelOrder);

router.post('/:orderId/deliver', deliverOrder);

export default router;