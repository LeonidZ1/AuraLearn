const express = require('express');
const { getDb } = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Применяем middleware авторизации админа ко всем маршрутам здесь
router.use(verifyToken, requireAdmin);

// Получить все вопросы со всеми деталями (включая эталоны и ключевые слова)
router.get('/questions', async (req, res) => {
    try {
        const db = await getDb();
        const questions = await db.all('SELECT * FROM questions ORDER BY id DESC');
        res.json({ questions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении вопросов.' });
    }
});

// Создать новый вопрос
router.post('/questions', async (req, res) => {
    try {
        const { question_text, correct_answer, keywords, category, difficulty } = req.body;
        
        if (!question_text || !correct_answer || !keywords) {
            return res.status(400).json({ error: 'Необходимо заполнить текст вопроса, правильный ответ и ключевые слова.' });
        }
        
        // keywords ожидается как массив, но если прислали строку - парсим ее
        let parsedKeywords = keywords;
        if (typeof keywords === 'string') {
            try {
                parsedKeywords = JSON.parse(keywords);
            } catch (e) {
                // Если не JSON, разбиваем по запятым
                parsedKeywords = keywords.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        
        if (!Array.isArray(parsedKeywords)) {
            return res.status(400).json({ error: 'Ключевые слова должны быть массивом.' });
        }
        
        const db = await getDb();
        const result = await db.run(
            `INSERT INTO questions (question_text, correct_answer, keywords, category, difficulty)
             VALUES (?, ?, ?, ?, ?)`,
            [question_text, correct_answer, JSON.stringify(parsedKeywords), category || 'General', difficulty || 'medium']
        );
        
        res.status(201).json({
            message: 'Вопрос успешно добавлен.',
            question: {
                id: result.lastID,
                question_text,
                correct_answer,
                keywords: JSON.stringify(parsedKeywords),
                category: category || 'General',
                difficulty: difficulty || 'medium'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера при добавлении вопроса.' });
    }
});

// Редактировать вопрос
router.put('/questions/:id', async (req, res) => {
    try {
        const { question_text, correct_answer, keywords, category, difficulty } = req.body;
        const questionId = req.params.id;
        
        if (!question_text || !correct_answer || !keywords) {
            return res.status(400).json({ error: 'Необходимо заполнить текст вопроса, правильный ответ и ключевые слова.' });
        }
        
        let parsedKeywords = keywords;
        if (typeof keywords === 'string') {
            try {
                parsedKeywords = JSON.parse(keywords);
            } catch (e) {
                parsedKeywords = keywords.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        
        if (!Array.isArray(parsedKeywords)) {
            return res.status(400).json({ error: 'Ключевые слова должны быть массивом.' });
        }
        
        const db = await getDb();
        const question = await db.get('SELECT id FROM questions WHERE id = ?', [questionId]);
        if (!question) {
            return res.status(404).json({ error: 'Вопрос не найден.' });
        }
        
        await db.run(
            `UPDATE questions 
             SET question_text = ?, correct_answer = ?, keywords = ?, category = ?, difficulty = ?
             WHERE id = ?`,
            [question_text, correct_answer, JSON.stringify(parsedKeywords), category || 'General', difficulty || 'medium', questionId]
        );
        
        res.json({
            message: 'Вопрос успешно обновлен.',
            question: {
                id: questionId,
                question_text,
                correct_answer,
                keywords: JSON.stringify(parsedKeywords),
                category,
                difficulty
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера при редактировании вопроса.' });
    }
});

// Удалить вопрос
router.delete('/questions/:id', async (req, res) => {
    try {
        const questionId = req.params.id;
        const db = await getDb();
        
        const question = await db.get('SELECT id FROM questions WHERE id = ?', [questionId]);
        if (!question) {
            return res.status(404).json({ error: 'Вопрос не найден.' });
        }
        
        // Вручную очищаем связанные попытки ответов
        await db.run('DELETE FROM user_answers WHERE question_id = ?', [questionId]);
        await db.run('DELETE FROM questions WHERE id = ?', [questionId]);
        
        res.json({ message: 'Вопрос и связанные с ним попытки успешно удалены.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера при удалении вопроса.' });
    }
});

// Получить все категории
router.get('/categories', async (req, res) => {
    try {
        const db = await getDb();
        const categories = await db.all(`
            SELECT c.id, c.name, c.description, c.icon, c.hue,
                   (SELECT COUNT(*) FROM questions q WHERE q.category = c.name) as question_count 
            FROM categories c 
            ORDER BY c.name ASC
        `);
        res.json({ categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении категорий.' });
    }
});

// Создать новую категорию
router.post('/categories', async (req, res) => {
    try {
        const { name, description, icon, hue } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Название категории обязательно.' });
        }
        const db = await getDb();
        
        const existing = await db.get('SELECT id FROM categories WHERE name = ?', [name]);
        if (existing) {
            return res.status(400).json({ error: 'Категория с таким названием уже существует.' });
        }
        
        const result = await db.run(
            'INSERT INTO categories (name, description, icon, hue) VALUES (?, ?, ?, ?)',
            [name, description || '', icon || 'fa-brain', hue !== undefined && hue !== null ? parseInt(hue) : 45]
        );
        
        res.status(201).json({
            message: 'Категория успешно создана.',
            category: {
                id: result.lastID,
                name,
                description: description || '',
                icon: icon || 'fa-brain',
                hue: hue !== undefined && hue !== null ? parseInt(hue) : 45
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера при создании категории.' });
    }
});

// Редактировать категорию
router.put('/categories/:id', async (req, res) => {
    try {
        const { name, description, icon, hue } = req.body;
        const catId = req.params.id;
        
        if (!name) {
            return res.status(400).json({ error: 'Название категории обязательно.' });
        }
        
        const db = await getDb();
        const existing = await db.get('SELECT id, name FROM categories WHERE id = ?', [catId]);
        if (!existing) {
            return res.status(404).json({ error: 'Категория не найдена.' });
        }
        
        if (name !== existing.name) {
            const duplicate = await db.get('SELECT id FROM categories WHERE name = ?', [name]);
            if (duplicate) {
                return res.status(400).json({ error: 'Категория с таким названием уже существует.' });
            }
        }
        
        await db.run(
            'UPDATE categories SET name = ?, description = ?, icon = ?, hue = ? WHERE id = ?',
            [name, description || '', icon || 'fa-brain', hue !== undefined && hue !== null ? parseInt(hue) : 45, catId]
        );
        
        await db.run(
            'UPDATE questions SET category = ? WHERE category = ?',
            [name, existing.name]
        );
        
        res.json({
            message: 'Категория успешно обновлена.',
            category: {
                id: catId,
                name,
                description: description || '',
                icon: icon || 'fa-brain',
                hue: hue !== undefined && hue !== null ? parseInt(hue) : 45
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера при обновлении категории.' });
    }
});

// Удалить категорию
router.delete('/categories/:id', async (req, res) => {
    try {
        const catId = req.params.id;
        const db = await getDb();
        
        const existing = await db.get('SELECT id, name FROM categories WHERE id = ?', [catId]);
        if (!existing) {
            return res.status(404).json({ error: 'Категория не найдена.' });
        }
        
        // 1. Сначала удаляем все попытки ответов на вопросы этой категории вручную
        await db.run('DELETE FROM user_answers WHERE question_id IN (SELECT id FROM questions WHERE category = ?)', [existing.name]);
        
        // 2. Затем каскадно удаляем вопросы
        await db.run('DELETE FROM questions WHERE category = ?', [existing.name]);
        
        // 3. И наконец удаляем саму категорию
        await db.run('DELETE FROM categories WHERE id = ?', [catId]);
        
        res.json({ message: 'Категория и все связанные вопросы успешно удалены.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера при удалении категории.' });
    }
});

// Общая статистика системы для администратора
router.get('/stats', async (req, res) => {
    try {
        const db = await getDb();
        
        const usersCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
        const questionsCount = await db.get("SELECT COUNT(*) as count FROM questions");
        const answersStats = await db.get(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM user_answers
        `);
        
        const popularCategories = await db.all(`
            SELECT category, COUNT(*) as count 
            FROM questions 
            GROUP BY category
        `);
        
        const worstQuestions = await db.all(`
            SELECT 
                q.id,
                q.question_text,
                q.category,
                COUNT(a.id) as attempts,
                SUM(CASE WHEN a.is_correct = 0 THEN 1 ELSE 0 END) as fails,
                ROUND(CAST(SUM(CASE WHEN a.is_correct = 0 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(a.id) * 100, 1) as fail_rate
            FROM user_answers a
            JOIN questions q ON a.question_id = q.id
            GROUP BY q.id
            HAVING attempts > 0
            ORDER BY fail_rate DESC
            LIMIT 5
        `);

        // Новое: Успеваемость по направлениям
        const categoryPerformance = await db.all(`
            SELECT 
                c.name as category,
                COUNT(a.id) as attempts,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct,
                ROUND(AVG(a.time_spent_ms) / 1000, 1) as avg_time
            FROM categories c
            LEFT JOIN questions q ON q.category = c.name
            LEFT JOIN user_answers a ON a.question_id = q.id
            GROUP BY c.name
        `);

        // Новое: Рейтинг студентов
        const studentsRanking = await db.all(`
            SELECT 
                u.username,
                u.created_at,
                COUNT(a.id) as attempts,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct,
                CASE WHEN COUNT(a.id) > 0 
                     THEN ROUND(CAST(SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(a.id) * 100, 1)
                     ELSE 0.0 
                END as success_rate
            FROM users u
            LEFT JOIN user_answers a ON a.user_id = u.id
            WHERE u.role = 'student'
            GROUP BY u.id
            ORDER BY attempts DESC, success_rate DESC
            LIMIT 10
        `);
        
        res.json({
            studentsCount: usersCount.count,
            questionsCount: questionsCount.count,
            totalAnswers: answersStats.total || 0,
            correctAnswers: answersStats.correct || 0,
            popularCategories,
            worstQuestions,
            categoryPerformance,
            studentsRanking
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении системной статистики.' });
    }
});

module.exports = router;
