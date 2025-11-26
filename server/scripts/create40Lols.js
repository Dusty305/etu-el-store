import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { hashPassword } from '../src/utils/password.js';

async function createUsers() {
    try {
        console.log('Подключение к MongoDB...');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/el-store-db');
        console.log('Успешное подключение к MongoDB');

        // Проверяем, существуют ли уже такие пользователи
        const existingUsers = await User.find({
            login: { $regex: /^lol\d+$/ }
        });

        if (existingUsers.length > 0) {
            console.log(`Найдено ${existingUsers.length} существующих пользователей с логинами lol*. Удаление...`);
            await User.deleteMany({ login: { $regex: /^lol\d+$/ } });
        }

        console.log('Создание 40 пользователей...');

        const users = [];

        for (let i = 1; i <= 40; i++) {
            const userData = {
                login: `lol${i}`,
                displayName: `Покупатель ${i}`,
                email: `user${i}@el-store.ru`,
                password: `lol${i}`,
                role: 'ПОКУПАТЕЛЬ'
            };

            const passwordHash = await hashPassword(userData.password);

            users.push({
                login: userData.login,
                displayName: userData.displayName,
                email: userData.email,
                passwordHash: passwordHash,
                role: userData.role
            });
        }

        // Создаем всех пользователей одним запросом
        await User.insertMany(users);

        console.log('Успешно создано 40 пользователей:');

    } catch (error) {
        console.error('Ошибка при создании пользователей:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Отключение от MongoDB');
        process.exit(0);
    }
}

await createUsers();