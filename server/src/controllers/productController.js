import ProductModel from '../models/Product.js';

export const products = async (req, res) => {
    try {
        const products = await ProductModel.find();
        res.json({
            products: products
        });
    } catch (error) {
        console.error('Ошибка получения информации о продуктах:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
}