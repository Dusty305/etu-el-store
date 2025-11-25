// save-files-content.js
import fs from 'fs'
import path from 'path'

// Получаем аргумент - путь к директории
const inputPath = process.argv[2];

if (!inputPath) {
    console.error('Пожалуйста, укажите путь к директории как аргумент.');
    process.exit(1);
}

// Определяем, какие расширения файлов нас интересуют
const allowedExtensions = ['.js', '.css', '.vue'];

// Функция для рекурсивного обхода директории
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Пропускаем директорию node_modules
            if (file === 'node_modules') {
                return;
            }
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            const ext = path.extname(fullPath);
            if (allowedExtensions.includes(ext)) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

// Собираем все подходящие файлы
const files = getAllFiles(path.resolve(inputPath), []);

// Открываем поток записи в output.txt
const writeStream = fs.createWriteStream('output.txt');

files.forEach((filePath) => {
    // Записываем путь к файлу
    writeStream.write(`//${path.relative(inputPath, filePath)}\n`);
    // Читаем содержимое файла
    const content = fs.readFileSync(filePath, 'utf8');
    // Записываем содержимое файла
    writeStream.write(content);
    // Добавляем перенос строки между файлами (по желанию)
    writeStream.write('\n');
});

// Закрываем поток записи
writeStream.end();

console.log('Файлы успешно собраны в output.txt');