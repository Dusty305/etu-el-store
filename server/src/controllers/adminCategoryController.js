// src/controllers/adminCategoryController.js
import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const createCategory = async (req, res) => {
    try {
        const { name, parentCategory } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Название категории обязательно' });
        }

        if (parentCategory) {
            const parent = await Category.findById(parentCategory);
            if (!parent) {
                return res.status(400).json({ error: 'Родительская категория не найдена' });
            }
        }

        const category = new Category({
            name: name.trim(),
            parentCategory: parentCategory || null
        });

        await category.save();

        res.status(201).json({
            message: 'Категория успешно создана',
            category
        });
    } catch (error) {
        console.error('Ошибка создания категории:', error);
        res.status(500).json({ error: 'Ошибка создания категории' });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, parentCategory } = req.body;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }

        // Проверка на циклические ссылки
        if (parentCategory) {
            if (parentCategory === categoryId) {
                return res.status(400).json({ error: 'Категория не может быть родителем самой себя' });
            }

            const parent = await Category.findById(parentCategory);
            if (!parent) {
                return res.status(400).json({ error: 'Родительская категория не найдена' });
            }

            // Проверка на создание цикла
            let currentParent = parent.parentCategory;
            while (currentParent) {
                if (currentParent.toString() === categoryId) {
                    return res.status(400).json({ error: 'Невозможно создать циклическую ссылку в иерархии категорий' });
                }
                const nextParent = await Category.findById(currentParent);
                currentParent = nextParent ? nextParent.parentCategory : null;
            }
        }

        // Обновление полей
        if (name && name.trim().length > 0) {
            category.name = name.trim();
        }

        if (parentCategory !== undefined) {
            category.parentCategory = parentCategory || null;
        }

        await category.save();

        res.json({
            message: 'Категория успешно обновлена',
            category
        });
    } catch (error) {
        console.error('Ошибка обновления категории:', error);
        res.status(500).json({ error: 'Ошибка обновления категории' });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }

        const parentCategoryId = category.parentCategory;

        // 1. Обновляем подкатегории (перемещаем на уровень выше)
        await Category.updateMany(
            { parentCategory: categoryId },
            { parentCategory: parentCategoryId }
        );

        // 2. Обновляем товары - только удаляем категорию из массива
        const productsToUpdate = await Product.find({ categories: categoryId });

        for (const product of productsToUpdate) {
            // Удаляем удаляемую категорию из массива
            product.categories = product.categories.filter(
                catId => catId.toString() !== categoryId
            );

            // Если у товара не осталось категорий И есть родительская категория,
            // добавляем родительскую категорию
            if (product.categories.length === 0 && parentCategoryId) {
                product.categories.push(parentCategoryId);
            }

            await product.save();
        }

        // 3. Удаляем саму категорию
        await Category.findByIdAndDelete(categoryId);

        res.json({
            message: 'Категория успешно удалена',
            deletedCategory: {
                id: category._id,
                name: category.name
            }
        });
    } catch (error) {
        console.error('Ошибка удаления категории:', error);
        res.status(500).json({ error: 'Ошибка удаления категории' });
    }
};

export const getCategoryTree = async (req, res) => {
    try {
        const categories = await Category.find().lean();

        const buildTree = (parentId = null) => {
            return categories
                .filter(cat =>
                    (cat.parentCategory && cat.parentCategory.toString()) === parentId ||
                    (!cat.parentCategory && !parentId)
                )
                .map(cat => ({
                    ...cat,
                    children: buildTree(cat._id.toString())
                }));
        };

        const tree = buildTree();

        res.json({
            categories: tree,
            total: categories.length
        });
    } catch (error) {
        console.error('Ошибка получения дерева категорий:', error);
        res.status(500).json({ error: 'Ошибка получения дерева категорий' });
    }
};