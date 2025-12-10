import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const createOrderFromCart = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // 1. Получаем корзину пользователя
        const cart = await Cart.findOne({ userId })
            .populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста' });
        }

        // 2. Проверяем наличие товаров на складе
        const stockIssues = [];
        let totalAmount = 0;

        for (const item of cart.items) {
            const product = item.productId;
            if (product.stock < item.quantity) {
                stockIssues.push({
                    productId: product._id,
                    name: product.name,
                    requested: item.quantity,
                    available: product.stock
                });
            }
            totalAmount += product.price * item.quantity;
        }

        if (stockIssues.length > 0) {
            return res.status(400).json({
                error: 'Недостаточно товаров на складе',
                issues: stockIssues
            });
        }

        // 3. Создаём заказ
        const order = new Order({
            userId,
            items: cart.items.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity
            })),
            deliveryInfo: {
                address: '',
                deliveryTime: null,
                courierNotes: ''
            },
            paymentInfo: {
                cardNumber: '',
                cvc: '',
                expirationDate: ''
            },
            status: 'НОВЫЙ',
            totalAmount
        });

        await order.save();

        // 4. Очищаем корзину (НЕ удаляем из БД, а очищаем items)
        cart.items = [];
        await cart.save();

        // 5. Заполняем ответ с информацией о товарах
        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: 'items.productId',
                select: 'name price images categories'
            });

        res.status(201).json({
            message: 'Заказ успешно создан',
            order: populatedOrder
        });

    } catch (error) {
        console.error('Ошибка создания заказа:', error);
        res.status(500).json({ error: 'Ошибка создания заказа' });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const { page = 1, limit = 10, status } = req.query;

        const filter = { userId };
        if (status && ['НОВЫЙ', 'ОПЛАЧЕН', 'ДОСТАВЛЕН', 'ОТМЕНЁН'].includes(status)) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
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
        console.error('Ошибка получения заказов:', error);
        res.status(500).json({ error: 'Ошибка получения заказов' });
    }
};

export const getOrderDetails = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { orderId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const order = await Order.findOne({ _id: orderId, userId })
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

export const updateOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { orderId } = req.params;
        const updateData = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // 1. Находим заказ
        const order = await Order.findOne({ _id: orderId, userId });

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        // 2. Проверяем возможность редактирования
        if (order.status === 'ДОСТАВЛЕН') {
            return res.status(400).json({ error: 'Заказ уже доставлен, редактирование невозможно' });
        }

        if (order.status === 'ОТМЕНЁН') {
            return res.status(400).json({ error: 'Заказ отменён' });
        }

        // 3. В зависимости от статуса разрешаем разные поля
        let allowedFields = [];

        if (order.status === 'НОВЫЙ') {
            // Можно менять всё, кроме статуса
            allowedFields = ['deliveryInfo', 'paymentInfo', 'items'];

            // Если меняем состав - проверяем наличие
            if (updateData.items) {
                for (const item of updateData.items) {
                    const product = await Product.findById(item.productId);
                    if (!product || product.stock < item.quantity) {
                        return res.status(400).json({
                            error: `Товар "${product?.name || item.productId}" недоступен в нужном количестве`
                        });
                    }
                }
            }
        } else if (order.status === 'ОПЛАЧЕН') {
            // Можно менять только доставку
            allowedFields = ['deliveryInfo'];
        }

        // 4. Фильтруем обновляемые поля
        const filteredUpdate = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredUpdate[field] = updateData[field];
            }
        });

        // 5. Если менялись товары - пересчитываем сумму
        if (updateData.items) {
            let totalAmount = 0;
            for (const item of updateData.items) {
                const product = await Product.findById(item.productId);
                totalAmount += product.price * item.quantity;
            }
            filteredUpdate.totalAmount = totalAmount;
        }

        // 6. Обновляем заказ
        Object.assign(order, filteredUpdate);
        order.updatedAt = new Date();
        await order.save();

        // 7. Возвращаем обновлённый заказ
        const updatedOrder = await Order.findById(orderId)
            .populate({
                path: 'items.productId',
                select: 'name price images'
            });

        res.json({
            message: 'Заказ успешно обновлён',
            order: updatedOrder
        });

    } catch (error) {
        console.error('Ошибка обновления заказа:', error);
        res.status(500).json({ error: 'Ошибка обновления заказа' });
    }
};

export const processPayment = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { orderId } = req.params;
        const { cardNumber, cvc, expirationDate } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Валидация данных карты (упрощённая)
        if (!cardNumber || !cardNumber.match(/^\d{16}$/)) {
            return res.status(400).json({ error: 'Неверный номер карты' });
        }
        if (!cvc || !cvc.match(/^\d{3}$/)) {
            return res.status(400).json({ error: 'Неверный CVC' });
        }
        if (!expirationDate || !expirationDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
            return res.status(400).json({ error: 'Неверный срок действия' });
        }

        // Находим заказ
        const order = await Order.findOne({ _id: orderId, userId })
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        if (order.status !== 'НОВЫЙ') {
            return res.status(400).json({
                error: `Заказ уже ${order.status === 'ОПЛАЧЕН' ? 'оплачен' : 'не может быть оплачен'}`
            });
        }

        // Проверяем наличие товаров (на случай, если запасы изменились)
        for (const item of order.items) {
            const product = item.productId;
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Товар "${product.name}" недоступен в нужном количестве`,
                    available: product.stock
                });
            }
        }

        // Уменьшаем остатки на складе
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.productId._id,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Обновляем заказ
        order.paymentInfo = { cardNumber, cvc, expirationDate };
        order.status = 'ОПЛАЧЕН';
        order.updatedAt = new Date();
        await order.save();

        res.json({
            message: 'Оплата успешно проведена',
            order: {
                id: order._id,
                status: order.status,
                totalAmount: order.totalAmount
            }
        });

    } catch (error) {
        console.error('Ошибка обработки оплаты:', error);
        res.status(500).json({ error: 'Ошибка обработки оплаты' });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { orderId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const order = await Order.findOne({ _id: orderId, userId })
            .populate('items.productId');

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        if (order.status === 'ДОСТАВЛЕН') {
            return res.status(400).json({ error: 'Доставленный заказ нельзя отменить' });
        }

        if (order.status === 'ОПЛАЧЕН') {
            // Возвращаем товары на склад
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.productId._id,
                    { $inc: { stock: item.quantity } }
                );
            }
        } else if (order.status === 'НОВЫЙ') {
            // Возвращаем товары в корзину
            let cart = await Cart.findOne({ userId });

            if (!cart) {
                cart = new Cart({ userId, items: [] });
            }

            for (const item of order.items) {
                const existingIndex = cart.items.findIndex(
                    i => i.productId.toString() === item.productId._id.toString()
                );

                if (existingIndex > -1) {
                    cart.items[existingIndex].quantity += item.quantity;
                } else {
                    cart.items.push({
                        productId: item.productId._id,
                        quantity: item.quantity
                    });
                }
            }

            await cart.save();
        }

        // Отменяем заказ
        order.status = 'ОТМЕНЁН';
        order.updatedAt = new Date();
        await order.save();

        res.json({
            message: 'Заказ успешно отменён',
            orderId: order._id,
            status: order.status
        });

    } catch (error) {
        console.error('Ошибка отмены заказа:', error);
        res.status(500).json({ error: 'Ошибка отмены заказа' });
    }
};

export const deliverOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { orderId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const order = await Order.findOne({ _id: orderId, userId });

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        if (order.status !== 'ОПЛАЧЕН') {
            return res.status(400).json({
                error: 'Заказ может быть доставлен только после оплаты'
            });
        }

        order.status = 'ДОСТАВЛЕН';
        order.updatedAt = new Date();
        await order.save();

        res.json({
            message: 'Заказ помечен как доставленный',
            orderId: order._id,
            status: order.status
        });

    } catch (error) {
        console.error('Ошибка обновления статуса доставки:', error);
        res.status(500).json({ error: 'Ошибка обновления статуса доставки' });
    }
};