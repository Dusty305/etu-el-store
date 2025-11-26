import mongoose from 'mongoose';

import CategoryModel from '../src/models/Category.js';
import ProductModel from '../src/models/Product.js';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/el-store-db')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Удаляем имеющиеся данные
await CategoryModel.deleteMany({});
await ProductModel.deleteMany({});

async function CreateCategories() {
    try {
        console.log('Начинаем заполнять данными о категориях...')

        // Создаем корневые категории
        const computers = await CategoryModel.create({ name: "Компьютеры и ноутбуки" });
        const mobile = await CategoryModel.create({ name: "Смартфоны и гаджеты" });
        const homeTech = await CategoryModel.create({ name: "Техника для дома" });
        const tv = await CategoryModel.create({ name: "Телевизоры и аудио" });

        // Создаем подкатегории
        await CategoryModel.create([
            // Подкатегории для компьютеров
            {
                name: "Ноутбуки",
                parentCategory: computers._id
            },
            {
                name: "Стационарные компьютеры",
                parentCategory: computers._id
            },
            {
                name: "Комплектующие",
                parentCategory: computers._id
            },
            {
                name: "Периферия",
                parentCategory: computers._id
            },
            
            // Подкатегории для мобильных устройств
            {
                name: "Смартфоны",
                parentCategory: mobile._id
            },
            {
                name: "Планшеты",
                parentCategory: mobile._id
            },
            {
                name: "Умные часы и фитнес-браслеты",
                parentCategory: mobile._id
            },
            {
                name: "Аксессуары",
                parentCategory: mobile._id
            },
            
            // Подкатегории для техники для дома
            {
                name: "Кухонная техника",
                parentCategory: homeTech._id
            },
            {
                name: "Техника для уборки",
                parentCategory: homeTech._id
            },
            {
                name: "Другая техника",
                parentCategory: homeTech._id
            },
            
            // Подкатегории для TV и аудио
            {
                name: "Телевизоры",
                parentCategory: tv._id
            },
            {
                name: "Аудиостанции",
                parentCategory: tv._id
            }
        ]);
        console.log('БД успешно заполнена даными о категориях!')
    } catch (error) {
        console.error('Ошибка при заполнении базы:', error);
    }
}

async function CreateProducts() {
    try {
        console.log('Начинаем заполнять данными о товарах...')
        
        // Находим ID категорий
        const computers = await CategoryModel.findOne({ name: "Компьютеры и ноутбуки" });
        const mobile = await CategoryModel.findOne({ name: "Смартфоны и гаджеты" });
        const homeTech = await CategoryModel.findOne({ name: "Техника для дома" });
        const tv = await CategoryModel.findOne({ name: "Телевизоры и аудио" });
        
        const laptops = await CategoryModel.findOne({ name: "Ноутбуки" });
        const pcs = await CategoryModel.findOne({ name: "Стационарные компьютеры" });
        const components = await CategoryModel.findOne({ name: "Комплектующие" });
        const peripherals = await CategoryModel.findOne({ name: "Периферия" });
        
        const smartphones = await CategoryModel.findOne({ name: "Смартфоны" });
        const tablets = await CategoryModel.findOne({ name: "Планшеты" });
        const smartwatches = await CategoryModel.findOne({ name: "Умные часы и фитнес-браслеты" });
        const mobileAccessories = await CategoryModel.findOne({ name: "Аксессуары" });
        
        const houseAppliances = await CategoryModel.findOne({ name: "Кухонная техника" });
        const cleaningTech = await CategoryModel.findOne({ name: "Техника для уборки" });
        const otherTech = await CategoryModel.findOne({ name: "Другая техника" });
        
        const televisions = await CategoryModel.findOne({ name: "Телевизоры" });
        const audioSystems = await CategoryModel.findOne({ name: "Аудиостанции" });

        // Создаем товары
        const products = await ProductModel.create([
            // ========== НОУТБУКИ ==========
            {
                name: "Apple MacBook Air 13 M2",
                description: "Ультратонкий ноутбук с чипом Apple M2, 13.6-дюймовым дисплеем Retina и до 18 часов автономной работы. Идеален для работы и творчества.",
                images: [],
                price: 119990,
                categories: [computers._id, laptops._id],
                stock: 15
            },
            {
                name: "ASUS ROG Strix G15",
                description: "Игровой ноутбук с процессором Intel Core i7, видеокартой NVIDIA RTX 4060 и 16 ГБ оперативной памяти. Высокая производительность для игр и монтажа видео.",
                images: [],
                price: 149990,
                categories: [computers._id, laptops._id],
                stock: 8
            },
            {
                name: "Lenovo ThinkPad X1 Carbon",
                description: "Бизнес-ноутбук с процессором Intel Core i5, 14-дюймовым дисплеем и премиальной сборкой. Надежность и производительность для деловых задач.",
                images: [],
                price: 135000,
                categories: [computers._id, laptops._id],
                stock: 12
            },

            // ========== СТАЦИОНАРНЫЕ КОМПЬЮТЕРЫ ==========
            {
                name: "HP Pavilion Gaming Desktop",
                description: "Игровой компьютер с процессором AMD Ryzen 5, видеокартой NVIDIA GTX 1660 Super и 512 ГБ SSD. Отличное решение для игр и работы.",
                images: [],
                price: 89990,
                categories: [computers._id, pcs._id],
                stock: 6
            },
            {
                name: "Apple iMac 24\" M3",
                description: "Моноблок с процессором Apple M3, 24-дюймовым 4.5K дисплеем и стильным дизайном. Идеален для творческих профессионалов.",
                images: [],
                price: 199990,
                categories: [computers._id, pcs._id],
                stock: 4
            },

            // ========== КОМПЛЕКТУЮЩИЕ ==========
            {
                name: "NVIDIA GeForce RTX 4070 Ti",
                description: "Игровая видеокарта с 12 ГБ GDDR6X памяти, поддержкой трассировки лучей и DLSS 3. Максимальная производительность в играх 4K.",
                images: [],
                price: 89990,
                categories: [computers._id, components._id],
                stock: 10
            },
            {
                name: "AMD Ryzen 7 7800X3D",
                description: "Процессор с технологией 3D V-Cache, 8 ядер и 16 потоков. Оптимизирован для игр с высокой частотой кадров.",
                images: [],
                price: 45990,
                categories: [computers._id, components._id],
                stock: 20
            },
            {
                name: "Kingston Fury 32GB DDR5",
                description: "Оперативная память DDR5 5600MHz для игровых ПК и рабочих станций. Низкие тайминги и высокая пропускная способность.",
                images: [],
                price: 12990,
                categories: [computers._id, components._id],
                stock: 25
            },

            // ========== СМАРТФОНЫ ==========
            {
                name: "iPhone 15 Pro Max",
                description: "Флагманский смартфон Apple с титановым корпусом, процессором A17 Pro и продвинутой камерой 48 МП. Лучшая производительность на рынке.",
                images: [],
                price: 129990,
                categories: [mobile._id, smartphones._id],
                stock: 18
            },
            {
                name: "Samsung Galaxy S24 Ultra",
                description: "Премиальный смартфон с S-Pen, камерой 200 МП и процессором Snapdragon 8 Gen 3. Искусственный интеллект для повышения продуктивности.",
                images: [],
                price: 109990,
                categories: [mobile._id, smartphones._id],
                stock: 14
            },
            {
                name: "Xiaomi Redmi Note 13 Pro",
                description: "Смартфон среднего класса с AMOLED дисплеем 120 Гц, камерой 200 МП и быстрой зарядкой 67 Вт. Отличное соотношение цены и качества.",
                images: [],
                price: 34990,
                categories: [mobile._id, smartphones._id],
                stock: 30
            },

            // ========== ПЛАНШЕТЫ ==========
            {
                name: "iPad Air 5 10.9\"",
                description: "Мощный планшет с чипом M1, поддержкой Apple Pencil и Magic Keyboard. Универсальное устройство для работы и творчества.",
                images: [],
                price: 69990,
                categories: [mobile._id, tablets._id],
                stock: 9
            },
            {
                name: "Samsung Galaxy Tab S9",
                description: "Флагманский планшет Android с AMOLED дисплеем, S-Pen в комплекте и защитой от воды. Идеален для заметок и мультимедиа.",
                images: [],
                price: 89990,
                categories: [mobile._id, tablets._id],
                stock: 7
            },

            // ========== УМНЫЕ ЧАСЫ И ФИТНЕС-БРАСЛЕТЫ ==========
            {
                name: "Apple Watch Series 9 45mm",
                description: "Умные часы с Always-On дисплеем, функцией измерения ЭКГ и трекингом сна. Интеграция с экосистемой Apple.",
                images: [],
                price: 45990,
                categories: [mobile._id, smartwatches._id],
                stock: 22
            },
            {
                name: "Samsung Galaxy Watch6 Classic",
                description: "Смарт-часы с вращающимся безелем, мониторингом здоровья и премиальным дизайном. Автономность до 40 часов.",
                images: [],
                price: 32990,
                categories: [mobile._id, smartwatches._id],
                stock: 16
            },

            // ========== ТЕЛЕВИЗОРЫ ==========
            {
                name: "Samsung QLED Q80C 65\"",
                description: "4K QLED телевизор с технологией Quantum HDR, поддержкой HDR10+ и игровым режимом 120 Гц. Яркое и контрастное изображение.",
                images: [],
                price: 129990,
                categories: [tv._id, televisions._id],
                stock: 5
            },
            {
                name: "LG OLED C3 55\"",
                description: "OLED телевизор с идеальным черным цветом, поддержкой Dolby Vision и встроенным голосовым помощником. Кинематографическое качество изображения.",
                images: [],
                price: 109990,
                categories: [tv._id, televisions._id],
                stock: 3
            },

            // ========== АУДИОСТАНАЦИИ ==========
            {
                name: "Sonos Beam Soundbar",
                description: "Компактная звуковая панель с Dolby Atmos, голосовыми помощниками и простой настройкой. Объемный звук для фильмов и музыки.",
                images: [],
                price: 49990,
                categories: [tv._id, audioSystems._id],
                stock: 11
            },

            // ========== КУХОННАЯ ТЕХНИКА ==========
            {
                name: "Philips Airfryer XXL",
                description: "Фритюрница горячим воздухом с технологией Rapid Air, объемом 1.4 кг. Приготовление с минимальным количеством масла.",
                images: [],
                price: 15990,
                categories: [homeTech._id, houseAppliances._id],
                stock: 15
            },
            {
                name: "De'Longhi Dinamica Plus ECAM370.95.T",
                description: "Полностью автоматическая кофемашина с технологией LatteCrema для идеального капучино. 13 степеней помола кофе.",
                images: [],
                price: 79990,
                categories: [homeTech._id, houseAppliances._id],
                stock: 4
            },

            // ========== ТЕХНИКА ДЛЯ УБОРКИ ==========
            {
                name: "Dyson V15 Detect Absolute",
                description: "Беспроводной пылесос с лазерной подсветкой пыли, автоматическим определением типа покрытия и мощной тягой.",
                images: [],
                price: 69990,
                categories: [homeTech._id, cleaningTech._id],
                stock: 8
            },
            {
                name: "iRobot Roomba j7+",
                description: "Робот-пылесос с самоочисткой, навигацией PrecisionVision и функцией избегания препятствий. Умная уборка без участия человека.",
                images: [],
                price: 89990,
                categories: [homeTech._id, cleaningTech._id],
                stock: 6
            },

            // ========== Другая техника ==========
            {
                name: "Xiaomi Smart Air Purifier 4",
                description: "Очиститель воздуха с HEPA фильтром, УФ-стерилизацией и подключением к умному дому. Эффективная очистка от аллергенов и бактерий.",
                images: [],
                price: 14990,
                categories: [homeTech._id, otherTech._id],
                stock: 12
            }
        ]);

        
        console.log('БД успешно заполнена данными о товарах!')
    } catch (error) {
        console.error('Ошибка заполнения базы:', error);
    }
}

await CreateCategories();
await CreateProducts();

mongoose.disconnect();