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
                images: [
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e4/6b66683c-691d-4caa-b312-b9a26c62a760.jpg',
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e4/774b3a1a-1135-48ed-bf13-680e91e4b7dc.jpg',
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e4/a8f8ce28-52c7-4742-bf45-15e0ea8e2892.jpg'
                ],
                price: 119990,
                categories: [computers._id, laptops._id],
                stock: 15
            },
            {
                name: "ASUS ROG Strix G15",
                description: "Игровой ноутбук с процессором Intel Core i7, видеокартой NVIDIA RTX 4060 и 16 ГБ оперативной памяти. Высокая производительность для игр и монтажа видео.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e5/3704dec1-a4b5-49fc-9f31-200c344923a9.jpeg'
                ],
                price: 149990,
                categories: [computers._id, laptops._id],
                stock: 8
            },
            {
                name: "Lenovo ThinkPad X1 Carbon",
                description: "Бизнес-ноутбук с процессором Intel Core i5, 14-дюймовым дисплеем и премиальной сборкой. Надежность и производительность для деловых задач.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e6/2d63b791-c320-4528-99a7-655caaef833f.jpeg',
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e6/26b3457a-ae7e-4233-aa52-eca63ed62f6b.jpeg'
                ],
                price: 135000,
                categories: [computers._id, laptops._id],
                stock: 12
            },

            // ========== СТАЦИОНАРНЫЕ КОМПЬЮТЕРЫ ==========
            {
                name: "HP Pavilion Gaming Desktop",
                description: "Игровой компьютер с процессором AMD Ryzen 5, видеокартой NVIDIA GTX 1660 Super и 512 ГБ SSD. Отличное решение для игр и работы.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e7/40617751-323c-4e9d-bb61-eecc95dae4bc.jpg',
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e7/ee2a6384-80fa-4270-a903-413e9bb38586.jpg',
                ],
                price: 89990,
                categories: [computers._id, pcs._id],
                stock: 6
            },
            {
                name: "Apple iMac 24\" M3",
                description: "Моноблок с процессором Apple M3, 24-дюймовым 4.5K дисплеем и стильным дизайном. Идеален для творческих профессионалов.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e8/63b07b52-6ed7-4a02-9be7-cb49e8f622ab.jpg',
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e8/275f5985-22ea-4d15-8713-8a2cccce6793.jpg',
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e8/849647ab-0764-4f9d-a8fc-075565f030d6.jpg',
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e8/a4a56cb8-d57c-4c86-aedc-0fb8b66982bc.jpg',
                ],
                price: 199990,
                categories: [computers._id, pcs._id],
                stock: 4
            },

            // ========== КОМПЛЕКТУЮЩИЕ ==========
            {
                name: "NVIDIA GeForce RTX 4070 Ti",
                description: "Игровая видеокарта с 12 ГБ GDDR6X памяти, поддержкой трассировки лучей и DLSS 3. Максимальная производительность в играх 4K.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7e9/0c1e7b38-7ed9-4945-a57a-4ced53a8fab9.jpeg'
                ],
                price: 89990,
                categories: [computers._id, components._id],
                stock: 10
            },
            {
                name: "AMD Ryzen 7 7800X3D",
                description: "Процессор с технологией 3D V-Cache, 8 ядер и 16 потоков. Оптимизирован для игр с высокой частотой кадров.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7ea/6ee5ef00-0bfa-4f4a-b902-03ada31a0f4f.jpg',
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7ea/70670cfe-c383-4479-b01f-c4f181e8c690.jpg',
                ],
                price: 45990,
                categories: [computers._id, components._id],
                stock: 20
            },
            {
                name: "Kingston Fury 32GB DDR5",
                description: "Оперативная память DDR5 5600MHz для игровых ПК и рабочих станций. Низкие тайминги и высокая пропускная способность.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b1/690881530df5e554cf6bb7eb/a5368fe4-63bc-4e23-a7f8-f9893135eef1.jpeg'
                ],
                price: 12990,
                categories: [computers._id, components._id],
                stock: 25
            },

            // ========== СМАРТФОНЫ ==========
            {
                name: "iPhone 15 Pro Max",
                description: "Флагманский смартфон Apple с титановым корпусом, процессором A17 Pro и продвинутой камерой 48 МП. Лучшая производительность на рынке.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ec/7cd70c37-1717-4b58-adec-c531dbbed8dd.jpeg',
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ec/84649a1d-657a-487b-bd9c-e1e188b19c2a.jpeg',
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ec/ebd9c694-9537-4c64-a4a4-3284d0bf1b5c.jpeg',
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ec/ed27fbff-6467-47ff-be22-251672514eac.jpeg',
                ],
                price: 129990,
                categories: [mobile._id, smartphones._id],
                stock: 18
            },
            {
                name: "Samsung Galaxy S24 Ultra",
                description: "Премиальный смартфон с S-Pen, камерой 200 МП и процессором Snapdragon 8 Gen 3. Искусственный интеллект для повышения продуктивности.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ed/19a47be1-1caa-4f4c-be26-1c5e8439f742.jpeg',
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ed/62ca6f04-7924-4ee8-bac3-afbfd757a39a.jpeg',
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ed/d0d22993-6a26-4604-b4c8-08b7098cb26f.jpeg'
                ],
                price: 109990,
                categories: [mobile._id, smartphones._id],
                stock: 14
            },
            {
                name: "Xiaomi Redmi Note 13 Pro",
                description: "Смартфон среднего класса с AMOLED дисплеем 120 Гц, камерой 200 МП и быстрой зарядкой 67 Вт. Отличное соотношение цены и качества.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ee/94b9a3d4-2e2b-4b1f-9404-82491ae07438.jpeg',
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ee/a388b3aa-1878-4c9f-bc9a-a834ee91b5e7.jpeg',
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ee/e552b733-f57a-44cb-9a77-fe17d26f17aa.jpeg'
                ],
                price: 34990,
                categories: [mobile._id, smartphones._id],
                stock: 30
            },

            // ========== ПЛАНШЕТЫ ==========
            {
                name: "iPad Air 5 10.9\"",
                description: "Мощный планшет с чипом M1, поддержкой Apple Pencil и Magic Keyboard. Универсальное устройство для работы и творчества.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ef/58f3a5c8-777f-4f0c-857f-d58c2dcc414d.jpeg',
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ef/42220d2e-8619-45d1-9f3f-ed4403814e1d.jpeg',
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7ef/941203a5-ddec-44dd-9d98-01b2f56e41ac.jpeg'
                ],
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
                images: [
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7f1/f98f1e9f-5fe9-4a37-aed7-27a27ee00503.jpeg'
                ],
                price: 45990,
                categories: [mobile._id, smartwatches._id],
                stock: 22
            },
            {
                name: "Samsung Galaxy Watch6 Classic",
                description: "Смарт-часы с вращающимся безелем, мониторингом здоровья и премиальным дизайном. Автономность до 40 часов.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7f2/a57f19fb-4dac-4c1c-a2fb-cf78550c3fa1.jpeg',
                    '/uploads/690881530df5e554cf6bb7b3/690881530df5e554cf6bb7f2/5c4fcfd9-0d7b-4721-bc98-b1d92f4bdaeb.jpeg'
                ],
                price: 32990,
                categories: [mobile._id, smartwatches._id],
                stock: 16
            },

            // ========== ТЕЛЕВИЗОРЫ ==========
            {
                name: "Samsung QLED Q80C 65\"",
                description: "4K QLED телевизор с технологией Quantum HDR, поддержкой HDR10+ и игровым режимом 120 Гц. Яркое и контрастное изображение.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b7/690881530df5e554cf6bb7f3/49664fbc-d1e8-4974-8757-e1bbba0c8913.jpeg',
                    '/uploads/690881530df5e554cf6bb7b7/690881530df5e554cf6bb7f3/141c3dab-fe79-461e-8264-dc780c17807e.jpeg'
                ],
                price: 129990,
                categories: [tv._id, televisions._id],
                stock: 5
            },
            {
                name: "LG OLED C3 55\"",
                description: "OLED телевизор с идеальным черным цветом, поддержкой Dolby Vision и встроенным голосовым помощником. Кинематографическое качество изображения.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b7/690881530df5e554cf6bb7f4/3f3f2b64-da77-49be-ab1b-a262af264342.jpeg'
                ],
                price: 109990,
                categories: [tv._id, televisions._id],
                stock: 3
            },

            // ========== АУДИОСТАНАЦИИ ==========
            {
                name: "Sonos Beam Soundbar",
                description: "Компактная звуковая панель с Dolby Atmos, голосовыми помощниками и простой настройкой. Объемный звук для фильмов и музыки.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b7/690881530df5e554cf6bb7f5/ce636aaf-a52c-49db-988e-8cb4ea391eb8.jpeg',
                    '/uploads/690881530df5e554cf6bb7b7/690881530df5e554cf6bb7f5/efbe7df9-5fed-4551-ad94-fe8b65847146.jpeg'
                ],
                price: 49990,
                categories: [tv._id, audioSystems._id],
                stock: 11
            },

            // ========== КУХОННАЯ ТЕХНИКА ==========
            {
                name: "Philips Airfryer XXL",
                description: "Фритюрница горячим воздухом с технологией Rapid Air, объемом 1.4 кг. Приготовление с минимальным количеством масла.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b5/690881530df5e554cf6bb7f6/63b33d63-5aeb-4dd1-9eed-0aff9262c3d6.jpeg'
                ],
                price: 15990,
                categories: [homeTech._id, houseAppliances._id],
                stock: 15
            },
            {
                name: "De'Longhi Dinamica Plus ECAM370.95.T",
                description: "Полностью автоматическая кофемашина с технологией LatteCrema для идеального капучино. 13 степеней помола кофе.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b5/690881530df5e554cf6bb7f7/2f767e10-765b-446e-9f28-8814e68f7797.jpeg'
                ],
                price: 79990,
                categories: [homeTech._id, houseAppliances._id],
                stock: 4
            },

            // ========== ТЕХНИКА ДЛЯ УБОРКИ ==========
            {
                name: "Dyson V15 Detect Absolute",
                description: "Беспроводной пылесос с лазерной подсветкой пыли, автоматическим определением типа покрытия и мощной тягой.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b5/690881530df5e554cf6bb7f8/5882914f-502c-48cc-9748-dd24005a5d1f.jpeg'
                ],
                price: 69990,
                categories: [homeTech._id, cleaningTech._id],
                stock: 8
            },
            {
                name: "iRobot Roomba j7+",
                description: "Робот-пылесос с самоочисткой, навигацией PrecisionVision и функцией избегания препятствий. Умная уборка без участия человека.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b5/690881530df5e554cf6bb7f9/8e187d80-1220-4363-bac9-e2430889e2e6.jpeg'
                ],
                price: 89990,
                categories: [homeTech._id, cleaningTech._id],
                stock: 6
            },

            // ========== Другая техника ==========
            {
                name: "Xiaomi Smart Air Purifier 4",
                description: "Очиститель воздуха с HEPA фильтром, УФ-стерилизацией и подключением к умному дому. Эффективная очистка от аллергенов и бактерий.",
                images: [
                    '/uploads/690881530df5e554cf6bb7b5/690881530df5e554cf6bb7fa/6a688f78-91ba-4c0b-a436-1af259dfba60.jpeg'
                ],
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