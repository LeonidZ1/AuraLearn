const express = require('express');
const stringSimilarity = require('string-similarity');
const { getDb } = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Получить список категорий
router.get('/categories', verifyToken, async (req, res) => {
    try {
        const db = await getDb();
        const categories = await db.all('SELECT * FROM categories ORDER BY name ASC');
        res.json({ categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении категорий.' });
    }
});

// Получить список вопросов по категории (без ответов и ключевых слов для безопасности)
router.get('/questions', verifyToken, async (req, res) => {
    try {
        const { category } = req.query;
        const db = await getDb();
        
        let query = 'SELECT id, question_text, category, difficulty FROM questions';
        const params = [];
        
        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }
        
        const questions = await db.all(query, params);
        res.json({ questions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении вопросов.' });
    }
});

// Получить один вопрос для тестирования (без ответов)
router.get('/questions/:id', verifyToken, async (req, res) => {
    try {
        const db = await getDb();
        const question = await db.get(
            'SELECT id, question_text, category, difficulty FROM questions WHERE id = ?',
            [req.params.id]
        );
        
        if (!question) {
            return res.status(404).json({ error: 'Вопрос не найден.' });
        }
        
        res.json({ question });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении вопроса.' });
    }
});

// Ядро: проверка ответа с использованием алгоритма нечеткого сравнения
router.post('/check', verifyToken, async (req, res) => {
    try {
        const { questionId, userAnswer } = req.body;
        const userId = req.user.userId;
        const timeSpentMs = req.body.timeSpentMs || 0;
        
        if (questionId === undefined || userAnswer === undefined) {
            return res.status(400).json({ error: 'Не все параметры переданы.' });
        }
        
        const db = await getDb();
        
        // Находим эталонный вопрос
        const question = await db.get('SELECT * FROM questions WHERE id = ?', [questionId]);
        if (!question) {
            return res.status(404).json({ error: 'Вопрос не найден.' });
        }

        const keywords = JSON.parse(question.keywords || '[]');
        const normalizedAnswer = String(userAnswer).toLowerCase().trim().replace(/[.,!?]/g, '');
        
        let matchCount = 0;
        let matchedWords = [];
        
        for (const keyword of keywords) {
            const lowerKeyword = keyword.toLowerCase().trim();
            // 1. Точное вхождение
            if (normalizedAnswer.includes(lowerKeyword)) {
                matchCount++;
                matchedWords.push(keyword);
            } else {
                // 2. Сравнение по коэффициенту Сёренсена-Дайса (порог 0.75)
                // Сплитим ответ по пробелам для точечного сравнения слов в ответе, если это фраза
                const answerWords = normalizedAnswer.split(/\s+/);
                let bestWordSimilarity = 0;
                
                for (const aWord of answerWords) {
                    if (aWord.length < 3 && lowerKeyword.length >= 3) continue; // исключаем предлоги
                    const sim = stringSimilarity.compareTwoStrings(aWord, lowerKeyword);
                    if (sim > bestWordSimilarity) {
                        bestWordSimilarity = sim;
                    }
                }
                
                // Проверяем схожесть и всей фразы тоже
                const fullSimilarity = stringSimilarity.compareTwoStrings(normalizedAnswer, lowerKeyword);
                const finalSimilarity = Math.max(bestWordSimilarity, fullSimilarity);
                
                if (finalSimilarity >= 0.75) {
                    matchCount++;
                    matchedWords.push(keyword);
                }
            }
        }
        
        // Условие успеха: найдено >= 60% ключевых слов
        const threshold = Math.ceil(keywords.length * 0.6);
        const isCorrect = keywords.length === 0 ? true : (matchCount >= threshold);
        
        // Запись попытки в СУБД с сохранением времени
        await db.run(
            `INSERT INTO user_answers (user_id, question_id, user_answer, is_correct, time_spent_ms)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, questionId, userAnswer, isCorrect ? 1 : 0, timeSpentMs]
        );
        
        res.json({
            isCorrect,
            matchCount,
            totalKeywords: keywords.length,
            matchedWords,
            correctAnswer: question.correct_answer
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера при проверке ответа.' });
    }
});

// Статистика и аналитика успеваемости пользователя
router.get('/analytics', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const db = await getDb();
        
        // Общая сводка
        const summary = await db.get(`
            SELECT 
                COUNT(*) as total_attempts,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
                AVG(time_spent_ms) as avg_time_spent
            FROM user_answers 
            WHERE user_id = ?
        `, [userId]);
        
        // История попыток
        const history = await db.all(`
            SELECT 
                a.id,
                a.user_answer,
                a.is_correct,
                a.time_spent_ms,
                a.attempt_date,
                q.question_text,
                q.correct_answer,
                q.category
            FROM user_answers a
            JOIN questions q ON a.question_id = q.id
            WHERE a.user_id = ?
            ORDER BY a.attempt_date DESC
            LIMIT 50
        `, [userId]);
        
        // Успеваемость по категориям
        const categoryStats = await db.all(`
            SELECT 
                c.name as category,
                COUNT(a.id) as total,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM categories c
            LEFT JOIN questions q ON q.category = c.name
            LEFT JOIN user_answers a ON a.question_id = q.id AND a.user_id = ?
            GROUP BY c.name
            ORDER BY c.name ASC
        `, [userId]);

        res.json({
            totalAttempts: summary.total_attempts || 0,
            correctAttempts: summary.correct_attempts || 0,
            avgTimeSpent: Math.round(summary.avg_time_spent || 0),
            history,
            categoryStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении аналитики.' });
    }
});

module.exports = router;
