// src/utils/fileUtils.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Получение пути к директории товара
const getProductDir = async (productId) => {
    const product = await Product.findById(productId).populate('categories');
    const categoryId = product?.categories[0]?._id?.toString() || 'uncategorized';
    return path.join(UPLOADS_DIR, categoryId, productId);
};

// Получение пути к директории товара по указанной категории
const getProductDirByCategory = (categoryId, productId) => {
    const actualCategoryId = categoryId || 'uncategorized';
    return path.join(UPLOADS_DIR, actualCategoryId, productId);
};

// Создание директории для товара
export const ensureProductDir = async (productId) => {
    const dir = await getProductDir(productId);
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
    }
    return dir;
};

// Удаление директории с изображениями товара
export const deleteProductDir = async (productId) => {
    const dir = await getProductDir(productId);
    try {
        await fs.rm(dir, { recursive: true, force: true });
        return true;
    } catch (error) {
        console.error(`Ошибка удаления директории ${dir}:`, error);
        return false;
    }
};

// Получение списка файлов товара
export const getProductFiles = async (productId) => {
    const dir = await getProductDir(productId);
    try {
        const files = await fs.readdir(dir);

        // Получаем категорию для построения правильного URL
        const product = await Product.findById(productId).populate('categories');
        const categoryId = product?.categories[0]?._id?.toString() || 'uncategorized';

        return files.map(file => ({
            filename: file,
            url: `/uploads/${categoryId}/${productId}/${file}`
        }));
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
};

// Удаление конкретного файла товара
export const deleteProductFile = async (productId, filename) => {
    const dir = await getProductDir(productId);
    const filePath = path.join(dir, filename);
    try {
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') return false;
        throw error;
    }
};

// Получение URL для файла
export const getFileUrl = async (productId, filename) => {
    const product = await Product.findById(productId).populate('categories');
    const categoryId = product?.categories[0]?._id?.toString() || 'uncategorized';
    return `/uploads/${categoryId}/${productId}/${filename}`;
};

// Перемещение изображений товара при смене категории
export const moveProductImages = async (productId, oldCategoryId, newCategoryId) => {
    try {
        const oldDir = getProductDirByCategory(oldCategoryId, productId);
        const newDir = getProductDirByCategory(newCategoryId, productId);

        // Проверяем существует ли старая директория
        try {
            await fs.access(oldDir);
        } catch {
            console.log(`Старая директория не существует: ${oldDir}`);
            return false;
        }

        // Если директории одинаковые - не перемещаем
        if (oldDir === newDir) {
            return true;
        }

        // Создаем новую директорию
        await fs.mkdir(path.dirname(newDir), { recursive: true });

        // Перемещаем файлы
        const files = await fs.readdir(oldDir);

        for (const file of files) {
            const oldPath = path.join(oldDir, file);
            const newPath = path.join(newDir, file);
            await fs.rename(oldPath, newPath);
        }

        // Удаляем старую директорию если пуста
        try {
            await fs.rmdir(oldDir);
        } catch {
            // Игнорируем ошибку если директория не пуста
        }

        // Обновляем URL в продукте
        const product = await Product.findById(productId);
        if (product && product.images) {
            const oldBaseUrl = `/uploads/${oldCategoryId || 'uncategorized'}/${productId}/`;
            const newBaseUrl = `/uploads/${newCategoryId || 'uncategorized'}/${productId}/`;

            product.images = product.images.map(img =>
                img.replace(oldBaseUrl, newBaseUrl)
            );
            await product.save();
        }

        console.log(`Изображения товара ${productId} перемещены из ${oldDir} в ${newDir}`);
        return true;
    } catch (error) {
        console.error(`Ошибка перемещения изображений товара ${productId}:`, error);
        return false;
    }
};

// Получение текущей категории товара
export const getProductCategory = async (productId) => {
    const product = await Product.findById(productId).populate('categories');
    return product?.categories[0]?._id?.toString() || 'uncategorized';
};