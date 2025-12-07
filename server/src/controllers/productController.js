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

export const oneProduct = async (req, res) => {
    try {
        const product = await ProductModel.findOne({ _id: req.params.productId });
        if (!product) {
            throw new Error('No such product!')
        }
        res.json({
            product: product
        });
    } catch (error) {
        console.error('Ошибка получения информации о продукте:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
}

export const search = async (req, res) => {
    try {
        const word = req.query.w
        const cats = req.query.c

        var searchObj = {};

        if (word)
        {
            searchObj.$or = [
                { name: { $regex: word, $options: "i" } },
                { description: { $regex: word, $options: "i" } }
            ]
        }

        if (cats)
        {
            searchObj.categories = { $in: cats.split(',') }
        }

        const products = await ProductModel.find(searchObj);
        res.json({
            products: products
        });
    } catch (error) {
        console.error('Ошибка получения информации о продукте:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
}