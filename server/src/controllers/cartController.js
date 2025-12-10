import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Находим корзину пользователя и наполняем данными о товарах
        const cart = await Cart.findOne({ userId })
            .populate({
                path: 'items.productId',
                select: 'name description images price stock categories',
                populate: {
                    path: 'categories',
                    select: 'name'
                }
            });

        if (!cart) {
            // Если корзины нет, возвращаем пустую
            return res.json({
                items: [],
                totalItems: 0,
                totalPrice: 0
            });
        }

        // Рассчитываем общую стоимость
        let totalPrice = 0;
        let totalItems = 0;

        const enrichedItems = cart.items.map(item => {
            const itemTotal = item.productId.price * item.quantity;
            totalPrice += itemTotal;
            totalItems += item.quantity;

            return {
                productId: item.productId._id,
                quantity: item.quantity,
                product: {
                    _id: item.productId._id,
                    name: item.productId.name,
                    description: item.productId.description,
                    images: item.productId.images,
                    price: item.productId.price,
                    stock: item.productId.stock,
                    categories: item.productId.categories
                },
                itemTotal: itemTotal
            };
        });

        res.json({
            items: enrichedItems,
            totalItems,
            totalPrice,
            cartId: cart._id
        });
    } catch (error) {
        console.error('Ошибка получения корзины:', error);
        res.status(500).json({ error: 'Ошибка получения корзины' });
    }
};

export const addToCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId, quantity = 1 } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        if (!productId) {
            return res.status(400).json({ error: 'ID товара обязательно' });
        }

        // Проверяем существование товара
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        // Проверяем наличие на складе
        if (product.stock < quantity) {
            return res.status(400).json({
                error: 'Недостаточно товара на складе',
                available: product.stock
            });
        }

        // Ищем корзину пользователя
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Создаем новую корзину
            cart = new Cart({
                userId,
                items: [{ productId, quantity }]
            });
        } else {
            // Проверяем, есть ли товар уже в корзине
            const existingItemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId
            );

            if (existingItemIndex > -1) {
                // Увеличиваем количество
                const newQuantity = cart.items[existingItemIndex].quantity + quantity;

                // Проверяем доступность
                if (product.stock < newQuantity) {
                    return res.status(400).json({
                        error: 'Недостаточно товара на складе',
                        available: product.stock,
                        currentInCart: cart.items[existingItemIndex].quantity
                    });
                }

                cart.items[existingItemIndex].quantity = newQuantity;
            } else {
                // Добавляем новый товар
                cart.items.push({ productId, quantity });
            }
        }

        await cart.save();

        // Получаем обновленную корзину с полными данными
        const updatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.productId',
                select: 'name price images'
            });

        res.status(200).json({
            message: 'Товар добавлен в корзину',
            cart: updatedCart
        });
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        res.status(500).json({ error: 'Ошибка добавления в корзину' });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        if (!quantity || quantity < 0) {
            return res.status(400).json({ error: 'Количество должно быть положительным числом' });
        }

        // Проверяем существование товара
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        // Проверяем наличие на складе
        if (product.stock < quantity) {
            return res.status(400).json({
                error: 'Недостаточно товара на складе',
                available: product.stock
            });
        }

        // Ищем корзину пользователя
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }

        // Находим товар в корзине
        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Товар не найден в корзине' });
        }

        if (quantity === 0) {
            // Удаляем товар из корзины
            cart.items.splice(itemIndex, 1);
        } else {
            // Обновляем количество
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();

        // Если корзина пуста, удаляем её
        if (cart.items.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
        }

        res.json({
            message: quantity === 0 ? 'Товар удален из корзины' : 'Количество обновлено',
            cart
        });
    } catch (error) {
        console.error('Ошибка обновления корзины:', error);
        res.status(500).json({ error: 'Ошибка обновления корзины' });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { productId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            return res.status(404).json({ error: 'Товар не найден в корзине' });
        }

        await cart.save();

        // Если корзина пуста, удаляем её
        if (cart.items.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
        }

        res.json({
            message: 'Товар удален из корзины',
            cart
        });
    } catch (error) {
        console.error('Ошибка удаления из корзины:', error);
        res.status(500).json({ error: 'Ошибка удаления из корзины' });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const result = await Cart.deleteOne({ userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Корзина не найдена' });
        }

        res.json({
            message: 'Корзина очищена'
        });
    } catch (error) {
        console.error('Ошибка очистки корзины:', error);
        res.status(500).json({ error: 'Ошибка очистки корзины' });
    }
};