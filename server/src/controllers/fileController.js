import {
    ensureProductDir,
    deleteProductDir,
    getProductFiles,
    deleteProductFile,
    getFileUrl
} from '../utils/fileUtils.js';
import Product from '../models/Product.js';

export const uploadProductImages = async (req, res) => {
    try {
        const { productId } = req.params;

        // Проверяем существование товара
        const product = await Product.findById(productId).populate('categories');
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        // Создаем директорию если не существует
        await ensureProductDir(productId);

        const files = await Promise.all(
            req.files.map(async (file) => {
                const url = await getFileUrl(productId, file.filename);
                return {
                    filename: file.filename,
                    url: url,
                    originalName: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype
                };
            })
        );

        // Обновляем товар (добавляем изображения)
        if (!product.images) product.images = [];
        const newUrls = files.map(f => f.url);
        product.images.push(...newUrls);
        await product.save();

        res.status(201).json({
            message: `Изображения успешно загружены (${files.length})`,
            files,
            product: {
                id: product._id,
                images: product.images
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки изображений:', error);

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Размер файла превышает 5MB' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Превышено максимальное количество файлов (10)' });
        }

        res.status(500).json({ error: 'Ошибка загрузки изображений' });
    }
};

export const getProductImages = async (req, res) => {
    try {
        const { productId } = req.params;

        // Проверяем существование товара
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        const files = await getProductFiles(productId);
        res.json({
            productId,
            images: files,
            total: files.length
        });
    } catch (error) {
        console.error('Ошибка получения изображений:', error);
        res.status(500).json({ error: 'Ошибка получения изображений' });
    }
};

export const deleteProductImage = async (req, res) => {
    try {
        const { productId, filename } = req.params;

        // Проверяем существование товара
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        const success = await deleteProductFile(productId, filename);

        if (!success) {
            return res.status(404).json({ error: 'Файл не найден' });
        }

        // Получаем полный URL для удаления из массива изображений
        const fileUrl = await getFileUrl(productId, filename);

        // Обновляем товар (удаляем ссылку на изображение)
        product.images = product.images.filter(img => img !== fileUrl);
        await product.save();

        res.json({
            message: 'Изображение успешно удалено',
            product: {
                id: product._id,
                images: product.images
            }
        });
    } catch (error) {
        console.error('Ошибка удаления изображения:', error);
        res.status(500).json({ error: 'Ошибка удаления изображения' });
    }
};

export const deleteAllProductImages = async (req, res) => {
    try {
        const { productId } = req.params;

        // Проверяем существование товара
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        const success = await deleteProductDir(productId);

        // Очищаем ссылки на изображения в товаре
        product.images = [];
        await product.save();

        res.json({
            message: 'Все изображения товара успешно удалены',
            product: {
                id: product._id,
                images: product.images
            }
        });
    } catch (error) {
        console.error('Ошибка удаления изображений:', error);
        res.status(500).json({ error: 'Ошибка удаления изображений' });
    }
};
