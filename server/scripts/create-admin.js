import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { hashPassword } from '../src/utils/password.js';


const ADMIN_DATA = {
    login: 'admin',
    displayName: 'Администратор',
    email: 'admin@el-store.ru',
    password: 'admin123',
    role: 'АДМИНИСТРАТОР'
};

async function createAdmin() {
    try {
        console.log('Подключение к MongoDB...');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/el-store-db');
        console.log('✅ Успешное подключение к MongoDB');

        const existingAdmin = await User.findOne({
            $or: [
                { login: ADMIN_DATA.login },
                { email: ADMIN_DATA.email },
                { role: 'АДМИНИСТРАТОР' }
            ]
        });

        if (existingAdmin) {
            console.log('Администратор уже существует:');
            return;
        }

        const passwordHash = await hashPassword(ADMIN_DATA.password);

        // Создаем пользователя администратора
        const adminUser = new User({
            login: ADMIN_DATA.login,
            displayName: ADMIN_DATA.displayName,
            email: ADMIN_DATA.email,
            passwordHash: passwordHash,
            role: ADMIN_DATA.role
        });

        await adminUser.save();

    } catch (error) {
        console.error('Ошибка при создании администратора:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Отключение от MongoDB');
        process.exit(0);
    }
}

await createAdmin();