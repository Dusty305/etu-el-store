import { User } from '../models/index.js';
import { hashPassword, comparePassword, validatePassword } from '../utils/password.js';

export const register = async (req, res) => {
    try {
        const { login, displayName, email, password } = req.body;

        if (!login || !displayName || !email || !password) {
            return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }

        const existingUser = await User.findOne({
            $or: [{ login }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким логином или email уже существует' });
        }

        // Создание пользователя
        const passwordHash = await hashPassword(password);
        const user = new User({
            login,
            displayName,
            email,
            passwordHash,
            role: 'ПОКУПАТЕЛЬ'
        });

        await user.save();

        // Автоматический логин после регистрации
        req.session.userId = user._id.toString();
        req.session.userLogin = user.login;
        req.session.userRole = user.role;

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: user._id,
                login: user.login,
                displayName: user.displayName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

export const login = async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ error: 'Логин и пароль обязательны' });
        }

        // Поиск пользователя
        const user = await User.findOne({
            $or: [{ login }, { email: login }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        // Проверка пароля
        const isPasswordValid = await comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        // Создание сессии
        req.session.userId = user._id.toString();
        req.session.userLogin = user.login;
        req.session.userRole = user.role;

        res.json({
            message: 'Успешный вход в систему',
            user: {
                id: user._id,
                login: user.login,
                displayName: user.displayName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при выходе' });
        }
        res.clearCookie('sessionId');
        res.json({ message: 'Успешный выход из системы' });
    });
};

export const getCurrentUser = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(200).json({ user: null });
        }

        const user = await User.findById(req.session.userId)
            .select('-passwordHash');

        if (!user) {
            // Если пользователь не найден, очищаем сессию
            req.session.destroy();
            return res.status(200).json({ user: null });
        }

        res.json({
            user: {
                id: user._id,
                login: user.login,
                displayName: user.displayName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};