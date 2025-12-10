import Order from '../models/Order.js';
import User from '../models/User.js';

export const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, userId } = req.query;

        // Строим фильтр
        const filter = {};

        if (status && ['НОВЫЙ', 'ОПЛАЧЕН', 'ДОСТАВЛЕН', 'ОТМЕНЁН'].includes(status)) {
            filter.status = status;
        }

        if (userId) {
            filter.userId = userId;
        }

        // Получаем заказы с пагинацией
        const orders = await Order.find(filter)
            .populate({
                path: 'userId',
                select: 'login displayName email'
            })
            .populate({
                path: 'items.productId',
                select: 'name price images'
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(filter);

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Ошибка получения списка заказов:', error);
        res.status(500).json({ error: 'Ошибка получения списка заказов' });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate({
                path: 'userId',
                select: 'login displayName email'
            })
            .populate({
                path: 'items.productId',
                select: 'name description price images stock categories',
                populate: {
                    path: 'categories',
                    select: 'name'
                }
            });

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        res.json({ order });
    } catch (error) {
        console.error('Ошибка получения деталей заказа:', error);
        res.status(500).json({ error: 'Ошибка получения деталей заказа' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Проверяем, что статус корректен
        if (!['НОВЫЙ', 'ОПЛАЧЕН', 'ДОСТАВЛЕН', 'ОТМЕНЁН'].includes(status)) {
            return res.status(400).json({ error: 'Некорректный статус заказа' });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        // Логика изменения статуса (можно добавить проверки переходов)
        if (status === 'ДОСТАВЛЕН' && order.status !== 'ОПЛАЧЕН') {
            return res.status(400).json({
                error: 'Заказ может быть отмечен как доставленный только после оплаты'
            });
        }

        // Обновляем статус
        order.status = status;
        order.updatedAt = new Date();

        await order.save();

        // Возвращаем обновленный заказ
        const updatedOrder = await Order.findById(orderId)
            .populate({
                path: 'userId',
                select: 'login displayName email'
            })
            .populate({
                path: 'items.productId',
                select: 'name price'
            });

        res.json({
            message: `Статус заказа успешно обновлен на "${status}"`,
            order: updatedOrder
        });
    } catch (error) {
        console.error('Ошибка обновления статуса заказа:', error);
        res.status(500).json({ error: 'Ошибка обновления статуса заказа' });
    }
};

export const markOrderAsDelivered = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        // Проверяем, что заказ оплачен
        if (order.status !== 'ОПЛАЧЕН') {
            return res.status(400).json({
                error: 'Заказ может быть отмечен как доставленный только после оплаты',
                currentStatus: order.status
            });
        }

        // Обновляем статус
        order.status = 'ДОСТАВЛЕН';
        order.updatedAt = new Date();

        await order.save();

        res.json({
            message: 'Заказ успешно отмечен как доставленный',
            orderId: order._id,
            status: order.status
        });
    } catch (error) {
        console.error('Ошибка отметки заказа как доставленного:', error);
        res.status(500).json({ error: 'Ошибка отметки заказа как доставленного' });
    }
};