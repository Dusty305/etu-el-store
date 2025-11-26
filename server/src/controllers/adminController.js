// src/controllers/adminController.js
import User from '../models/User.js';

export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const filter = {};
        if (search) {
            filter.$or = [
                { login: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-passwordHash')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({ error: 'Ошибка получения списка пользователей' });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['ПОКУПАТЕЛЬ', 'АДМИНИСТРАТОР'].includes(role)) {
            return res.status(400).json({ error: 'Некорректная роль' });
        }

        // Не позволяем изменять свою собственную роль
        if (userId === req.session.userId) {
            return res.status(400).json({ error: 'Нельзя изменить свою собственную роль' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json({
            message: 'Роль пользователя успешно обновлена',
            user
        });
    } catch (error) {
        console.error('Ошибка обновления роли:', error);
        res.status(500).json({ error: 'Ошибка обновления роли пользователя' });
    }
};