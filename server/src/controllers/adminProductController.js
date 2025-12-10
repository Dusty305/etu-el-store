import Product from '../models/Product.js';

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, categories, stock } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Название продукта обязательно' });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({ error: 'Ожидается как минимум одна категория товара' });
        }

        const product = new Product({
            name: name.trim(),
            description: description.trim(),
            images: [],
            price: price,
            categories: categories,
            stock: stock
        });

        const doc = await product.save();

        res.status(201).json({
            message: 'Продукт успешно создан',
            productId: doc._id
        });
    } catch (error) {
        console.error('Ошибка создания продукта:', error);
        res.status(500).json({ error: 'Ошибка создания продукта' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Продукт не найден' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, req.body);

        res.status(201).json({
            message: 'Продукт успешно обновлен',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Ошибка обновления продукта:', error);
        res.status(500).json({ error: 'Ошибка обновления продукта' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Продукт не найден' });
        }

        await Product.findByIdAndDelete(productId);

        res.status(201).json({
            message: 'Продукт успешно удален',
            deletedProductId: productId
        });
    } catch (error) {
        console.error('Ошибка удаления продукта:', error);
        res.status(500).json({ error: 'Ошибка удаления продукта' });
    }
};