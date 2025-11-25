// src/middleware/upload.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import Product from '../models/Product.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Создаем директорию uploads если не существует
const ensureUploadsDir = async () => {
    try {
        await fs.access(UPLOADS_DIR);
    } catch {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
    }
};

ensureUploadsDir();

// Конфигурация хранилища
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const { productId } = req.params;

            // Находим товар чтобы получить первую категорию
            const product = await Product.findById(productId).populate('categories');
            if (!product) {
                return cb(new Error('Товар не найден'));
            }

            // Берем первую категорию для создания пути или используем 'uncategorized'
            const categoryId = product.categories[0]?._id?.toString() || 'uncategorized';

            const dir = path.join(UPLOADS_DIR, categoryId, productId);

            // Создаем директорию если не существует
            await fs.mkdir(dir, { recursive: true });

            cb(null, dir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Фильтр файлов - только изображения
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Разрешены только файлы изображений'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 10 // максимум 10 файлов за раз
    }
});

// Обработчик ошибок multer
upload.errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Размер файла превышает 5MB' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Превышено максимальное количество файлов (10)' });
        }
    }
    next(err);
};

export default upload;