const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function getDb() {
    if (dbInstance) return dbInstance;
    
    dbInstance = await open({
        filename: path.join(__dirname, '../knowledge_trainer.sqlite'),
        driver: sqlite3.Database
    });
    
    // Включение поддержки внешних ключей
    await dbInstance.exec(`PRAGMA foreign_keys = ON;`);
    
    // Создание таблиц
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'student',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT DEFAULT '',
            icon TEXT DEFAULT 'fa-brain',
            hue INTEGER DEFAULT 45
        );

        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_text TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            keywords TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            difficulty TEXT DEFAULT 'medium'
        );

        CREATE TABLE IF NOT EXISTS user_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            user_answer TEXT,
            is_correct BOOLEAN NOT NULL,
            time_spent_ms INTEGER DEFAULT 0,
            attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        -- Индексы для оптимизации
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_answers_user_id ON user_answers(user_id);
        CREATE INDEX IF NOT EXISTS idx_answers_question_id ON user_answers(question_id);
    `);

    // Проверим наличие колонок icon и hue в таблице categories для миграции существующих БД
    try {
        const columns = await dbInstance.all("PRAGMA table_info(categories)");
        const hasIcon = columns.some(c => c.name === 'icon');
        const hasHue = columns.some(c => c.name === 'hue');
        
        let altered = false;
        if (!hasIcon) {
            await dbInstance.exec("ALTER TABLE categories ADD COLUMN icon TEXT DEFAULT 'fa-brain'");
            altered = true;
        }
        if (!hasHue) {
            await dbInstance.exec("ALTER TABLE categories ADD COLUMN hue INTEGER DEFAULT 45");
            altered = true;
        }
        
        if (altered) {
            await dbInstance.run("UPDATE categories SET icon = 'fa-database', hue = 195 WHERE name = 'Базы данных'");
            await dbInstance.run("UPDATE categories SET icon = 'fa-code', hue = 250 WHERE name = 'Программирование'");
            await dbInstance.run("UPDATE categories SET icon = 'fa-network-wired', hue = 150 WHERE name = 'Сети'");
            await dbInstance.run("UPDATE categories SET icon = 'fa-laptop-code', hue = 320 WHERE name = 'Веб-разработка'");
        }
    } catch (err) {
        console.error("Ошибка при обновлении структуры таблицы categories:", err);
    }

    // Автонаполнение категорий, если таблица пуста
    const categoriesCount = await dbInstance.get('SELECT COUNT(*) as count FROM categories');
    if (categoriesCount.count === 0) {
        await dbInstance.exec(`
            INSERT INTO categories (name, description, icon, hue) VALUES
            ('Базы данных', 'Изучение реляционных БД, проектирования схем, индексов и транзакций.', 'fa-database', 195),
            ('Программирование', 'Основы ООП, структуры данных, алгоритмы и паттерны проектирования.', 'fa-code', 250),
            ('Сети', 'Компьютерные сети, протоколы TCP/IP, HTTP/HTTPS, DNS и маршрутизация.', 'fa-network-wired', 150),
            ('Веб-разработка', 'Полностраничные приложения, архитектура REST API, JWT-авторизация и безопасность.', 'fa-laptop-code', 320);
        `);
    }
    
    return dbInstance;
}

module.exports = { getDb };
