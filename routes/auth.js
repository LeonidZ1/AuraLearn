const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Вспомогательная функция для создания сессии в cookie
function loginSession(res, userId, role) {
    const payload = { userId, role };
    const expires = 24 * 60 * 60 * 1000; // 24 часа
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: '24h' 
    });
    
    const isHttps = process.env.NODE_ENV === 'production';
    
    res.cookie('session', token, {
        maxAge: expires,
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        path: '/'
    });
    
    return token;
}

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Пожалуйста, введите имя пользователя и пароль.' });
        }
        
        const db = await getDb();
        
        // Проверка уникальности имени
        const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким именем уже существует.' });
        }
        
        // Хеширование пароля
        const passwordHash = await bcrypt.hash(password, 10);
        
        // По умолчанию первый пользователь — админ, остальные — студенты (для удобства отладки)
        // Или можно просто делать всех студентами, а в init_db создать админа. Сделаем роль student по умолчанию.
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        const role = userCount.count === 0 ? 'admin' : 'student';
        
        const result = await db.run(
            `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
            [username, email || null, passwordHash, role]
        );
        
        const userId = result.lastID;
        loginSession(res, userId, role);
        
        res.status(201).json({
            message: 'Регистрация успешна',
            user: { id: userId, username, role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера при регистрации.' });
    }
});

// Вход в систему
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Пожалуйста, введите имя пользователя и пароль.' });
        }
        
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!user) {
            return res.status(400).json({ error: 'Неверное имя пользователя или пароль.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Неверное имя пользователя или пароль.' });
        }
        
        loginSession(res, user.id, user.role);
        
        res.json({
            message: 'Вход выполнен успешно',
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера при входе.' });
    }
});

// Выход из системы
router.post('/logout', (req, res) => {
    res.clearCookie('session');
    res.json({ message: 'Выход выполнен успешно' });
});

// Проверка текущей сессии
router.get('/me', verifyToken, async (req, res) => {
    try {
        const db = await getDb();
        const user = await db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.user.userId]);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден.' });
        }
        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }
});

module.exports = router;
