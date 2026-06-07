require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { getDb } = require('./config/db');

const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Мидлвары парсинга
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Отдача статических файлов фронтенда
app.use(express.static(path.join(__dirname, 'public')));

// Подключение роутов API
app.use('/api/auth', authRouter);
app.use('/api', apiRouter);
app.use('/api/admin', adminRouter);

// Для поддержки роутинга в SPA отдаем index.html на любой неизвестный роут
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера и инициализация БД
async function startServer() {
    try {
        console.log('Подключение к базе данных SQLite...');
        await getDb();
        console.log('База данных успешно инициализирована.');
        
        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT} в режиме ${process.env.NODE_ENV || 'development'}`);
            console.log(`Ссылка на приложение: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Ошибка при запуске сервера:', error);
        process.exit(1);
    }
}

startServer();
