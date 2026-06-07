const { getDb } = require('./config/db');
const bcrypt = require('bcryptjs');

async function init() {
    try {
        console.log('Инициализация и заполнение базы данных начальными данными...');
        const db = await getDb();
        
        // Очистим существующие данные для чистого старта
        await db.run('DELETE FROM users');
        await db.run('DELETE FROM categories');
        await db.run('DELETE FROM questions');
        await db.run('DELETE FROM user_answers');
        
        // Сбросим счетчики AUTOINCREMENT
        await db.run("DELETE FROM sqlite_sequence WHERE name IN ('users', 'categories', 'questions', 'user_answers')");

        // Посев направлений обучения (категорий)
        await db.run("INSERT INTO categories (name, description) VALUES ('Базы данных', 'Изучение реляционных БД, проектирования схем, индексов и транзакций.')");
        await db.run("INSERT INTO categories (name, description) VALUES ('Программирование', 'Основы ООП, структуры данных, алгоритмы и паттерны проектирования.')");
        await db.run("INSERT INTO categories (name, description) VALUES ('Сети', 'Компьютерные сети, протоколы TCP/IP, HTTP/HTTPS, DNS и маршрутизация.')");
        await db.run("INSERT INTO categories (name, description) VALUES ('Веб-разработка', 'Полностраничные приложения, архитектура REST API, JWT-авторизация и безопасность.')");
        
        // Создание пользователей
        const adminHash = await bcrypt.hash('admin123', 10);
        const studentHash = await bcrypt.hash('student123', 10);
        
        await db.run(
            `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
            ['admin', 'admin@trainer.ru', adminHash, 'admin']
        );
        
        await db.run(
            `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
            ['student', 'student@trainer.ru', studentHash, 'student']
        );
        
        console.log('Созданы пользователи:');
        console.log(' - Администратор: admin / admin123');
        console.log(' - Студент: student / student123');
        
        // Добавление вопросов
        const questions = [
            {
                question_text: 'Что такое индекс в реляционной базе данных и для чего он используется?',
                correct_answer: 'Индекс — это структура данных, предназначенная для ускорения поиска строк в таблице СУБД. Он работает аналогично указателю в книге, исключая необходимость полного сканирования таблицы.',
                keywords: JSON.stringify(['индекс', 'структура данных', 'ускорение поиска', 'таблица', 'СУБД', 'сканирование']),
                category: 'Базы данных',
                difficulty: 'medium'
            },
            {
                question_text: 'Опишите концепцию инкапсуляции в ООП.',
                correct_answer: 'Инкапсуляция — это принцип ООП, заключающийся в объединении данных и методов, работающих с ними, внутри одного класса и ограничении прямого доступа к деталям реализации для защиты от некорректного использования.',
                keywords: JSON.stringify(['инкапсуляция', 'ООП', 'объединение', 'данные', 'методы', 'класс', 'скрытие', 'реализации', 'доступ']),
                category: 'Программирование',
                difficulty: 'easy'
            },
            {
                question_text: 'Что такое протокол HTTPS и в чем его главное отличие от HTTP?',
                correct_answer: 'HTTPS — это расширение протокола HTTP, поддерживающее шифрование данных по протоколу SSL/TLS. Его отличие от HTTP заключается в безопасности: все данные передаются в зашифрованном виде.',
                keywords: JSON.stringify(['HTTPS', 'HTTP', 'шифрование', 'безопасность', 'SSL', 'TLS', 'зашифрованном']),
                category: 'Сети',
                difficulty: 'easy'
            },
            {
                question_text: 'Какова цель использования JWT (JSON Web Token)?',
                correct_answer: 'JWT используется для безопасной передачи информации между клиентом и сервером. В веб-разработке он применяется для stateless-аутентификации пользователей без хранения сессий в БД.',
                keywords: JSON.stringify(['JWT', 'передача информации', 'аутентификация', 'сессия', 'токен', 'без хранения']),
                category: 'Веб-разработка',
                difficulty: 'hard'
            },
            {
                question_text: 'Что такое транзакция в базах данных и какими свойствами она должна обладать?',
                correct_answer: 'Транзакция — это последовательность операций с базой данных, выполняемая как единое целое. Она должна обладать свойствами ACID: атомарность, согласованность, изолированность, долговечность.',
                keywords: JSON.stringify(['транзакция', 'последовательность операций', 'единое целое', 'ACID', 'атомарность', 'согласованность', 'изолированность', 'долговечность']),
                category: 'Базы данных',
                difficulty: 'hard'
            }
        ];
        
        for (const q of questions) {
            await db.run(
                `INSERT INTO questions (question_text, correct_answer, keywords, category, difficulty)
                 VALUES (?, ?, ?, ?, ?)`,
                [q.question_text, q.correct_answer, q.keywords, q.category, q.difficulty]
            );
        }
        
        console.log(`Успешно добавлено ${questions.length} тестовых вопросов.`);
        console.log('Инициализация базы данных завершена успешно.');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка инициализации базы данных:', error);
        process.exit(1);
    }
}

init();
