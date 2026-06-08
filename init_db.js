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
        await         // Посев направлений обучения (категорий)
        await db.run("INSERT INTO categories (name, description) VALUES ('Базы данных', 'Изучение реляционных БД, проектирования схем, индексов и транзакций.')");
        await db.run("INSERT INTO categories (name, description) VALUES ('Программирование', 'Основы ООП, структуры данных, алгоритмы и паттерны проектирования.')");
        await db.run("INSERT INTO categories (name, description) VALUES ('Сети и безопасность', 'Компьютерные сети, протоколы TCP/IP, шифрование, брандмауэры и DDoS-атаки.')");
        await db.run("INSERT INTO categories (name, description) VALUES ('Веб-разработка', 'Полностраничные приложения, DOM-дерево, архитектура REST API и JWT-авторизация.')");
        await db.run("INSERT INTO categories (name, description) VALUES ('Искусственный интеллект', 'Основы машинного обучения, нейронные сети, тест Тьюринга и переобучение.')");
        
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
            // 1. Базы данных
            {
                question_text: 'Что такое индекс в реляционной базе данных и для чего он используется?',
                correct_answer: 'Индекс — это структура данных, предназначенная для ускорения поиска строк в таблице СУБД. Он работает аналогично указателю в книге, исключая необходимость полного сканирования таблицы.',
                keywords: JSON.stringify(['индекс', 'структура данных', 'ускорение поиска', 'таблица', 'СУБД', 'сканирование']),
                category: 'Базы данных',
                difficulty: 'medium'
            },
            {
                question_text: 'Что такое транзакция в базах данных и какими свойствами она должна обладать?',
                correct_answer: 'Транзакция — это последовательность операций с базой данных, выполняемая как единое целое. Она должна обладать свойствами ACID: атомарность, согласованность, изолированность, долговечность.',
                keywords: JSON.stringify(['транзакция', 'последовательность операций', 'единое целое', 'ACID', 'атомарность', 'согласованность', 'изолированность', 'долговечность']),
                category: 'Базы данных',
                difficulty: 'hard'
            },
            {
                question_text: 'Какая команда SQL используется для добавления новых записей в таблицу?',
                correct_answer: 'INSERT INTO',
                keywords: JSON.stringify(['INSERT INTO', 'insert', 'инсерт']),
                category: 'Базы данных',
                difficulty: 'easy'
            },
            {
                question_text: 'Что делает ограничение FOREIGN KEY (внешний ключ) в таблице базы данных?',
                correct_answer: 'Внешний ключ связывает две таблицы и обеспечивает ссылочную целостность данных, предотвращая действия, которые могут нарушить связи между таблицами.',
                keywords: JSON.stringify(['внешний ключ', 'связывает таблицы', 'целостность', 'ссылочную', 'связь']),
                category: 'Базы данных',
                difficulty: 'medium'
            },
            
            // 2. Программирование
            {
                question_text: 'Опишите концепцию инкапсуляции в ООП.',
                correct_answer: 'Инкапсуляция — это принцип ООП, заключающийся в объединении данных и методов, работающих с ними, внутри одного класса и ограничении прямого доступа к деталям реализации для защиты от некорректного использования.',
                keywords: JSON.stringify(['инкапсуляция', 'ООП', 'объединение', 'данные', 'методы', 'класс', 'скрытие', 'реализации', 'доступ']),
                category: 'Программирование',
                difficulty: 'easy'
            },
            {
                question_text: 'Какое свойство ООП позволяет объектам разных классов реагировать на один и тот же метод по-разному?',
                correct_answer: 'Полиморфизм',
                keywords: JSON.stringify(['полиморфизм', 'полиморфный']),
                category: 'Программирование',
                difficulty: 'medium'
            },
            {
                question_text: 'Что такое рекурсия в программировании?',
                correct_answer: 'Рекурсия — это вызов функции из самой себя, непосредственно или через другие функции, обычно с базовым случаем для предотвращения бесконечного цикла.',
                keywords: JSON.stringify(['рекурсия', 'вызов функции', 'самой себя', 'базовый случай', 'стек']),
                category: 'Программирование',
                difficulty: 'medium'
            },
            {
                question_text: 'Какой тип данных используется для хранения последовательности символов?',
                correct_answer: 'Строка (String)',
                keywords: JSON.stringify(['строка', 'string', 'str']),
                category: 'Программирование',
                difficulty: 'easy'
            },
            
            // 3. Сети и безопасность
            {
                question_text: 'Что такое протокол HTTPS и в чем его главное отличие от HTTP?',
                correct_answer: 'HTTPS — это расширение протокола HTTP, поддерживающее шифрование данных по протоколу SSL/TLS. Его отличие от HTTP заключается в безопасности: все данные передаются в зашифрованном виде.',
                keywords: JSON.stringify(['HTTPS', 'HTTP', 'шифрование', 'безопасность', 'SSL', 'TLS', 'зашифрованном']),
                category: 'Сети и безопасность',
                difficulty: 'easy'
            },
            {
                question_text: 'Какую роль играет DNS (Domain Name System) в компьютерных сетях?',
                correct_answer: 'DNS преобразует доменные имена сайтов в IP-адреса, необходимые для маршрутизации запросов.',
                keywords: JSON.stringify(['DNS', 'доменные имена', 'IP-адреса', 'преобразование', 'имя сайта']),
                category: 'Сети и безопасность',
                difficulty: 'easy'
            },
            {
                question_text: 'Что такое брандмауэр (firewall) и для чего он предназначен?',
                correct_answer: 'Брандмауэр — это сетевой фильтр, контролирующий входящий и исходящий трафик на основе правил безопасности для защиты сети.',
                keywords: JSON.stringify(['брандмауэр', 'firewall', 'фильтр', 'трафик', 'безопасность', 'защита']),
                category: 'Сети и безопасность',
                difficulty: 'medium'
            },
            {
                question_text: 'Что представляет собой DDoS-атака?',
                correct_answer: 'DDoS — это атака, при которой множество устройств одновременно отправляют огромное количество запросов к серверу, чтобы перегрузить его и сделать недоступным.',
                keywords: JSON.stringify(['DDoS', 'отказ в обслуживании', 'перегрузка', 'запросы', 'недоступность']),
                category: 'Сети и безопасность',
                difficulty: 'hard'
            },
            
            // 4. Веб-разработка
            {
                question_text: 'Какова цель использования JWT (JSON Web Token)?',
                correct_answer: 'JWT используется для безопасной передачи информации между клиентом и сервером. В веб-разработке он применяется для stateless-аутентификации пользователей без хранения сессий в БД.',
                keywords: JSON.stringify(['JWT', 'передача информации', 'аутентификация', 'сессия', 'токен', 'без хранения']),
                category: 'Веб-разработка',
                difficulty: 'hard'
            },
            {
                question_text: 'Для чего используется язык разметки HTML?',
                correct_answer: 'HTML используется для создания структуры и каркаса веб-страницы с помощью тегов, определяющих ее элементы.',
                keywords: JSON.stringify(['HTML', 'структура', 'каркас', 'разметка', 'веб-страница']),
                category: 'Веб-разработка',
                difficulty: 'easy'
            },
            {
                question_text: 'Что такое DOM (Document Object Model) в веб-разработке?',
                correct_answer: 'DOM — это объектное представление структуры HTML-документа, которое позволяет скриптам изменять содержимое и стили страницы.',
                keywords: JSON.stringify(['DOM', 'объектное представление', 'структура', 'изменять', 'HTML']),
                category: 'Веб-разработка',
                difficulty: 'medium'
            },
            {
                question_text: 'Какой HTTP-метод используется для обновления существующего ресурса на сервере?',
                correct_answer: 'PUT или PATCH',
                keywords: JSON.stringify(['PUT', 'PATCH', 'пут', 'патч']),
                category: 'Веб-разработка',
                difficulty: 'medium'
            },
            
            // 5. Искусственный интеллект
            {
                question_text: 'Что такое машинное обучение (Machine Learning)?',
                correct_answer: 'Машинное обучение — это область ИИ, которая позволяет компьютерам самостоятельно обучаться на основе данных и опыта.',
                keywords: JSON.stringify(['машинное обучение', 'обучаться', 'данные', 'алгоритмы', 'опыт']),
                category: 'Искусственный интеллект',
                difficulty: 'medium'
            },
            {
                question_text: 'Что такое нейронная сеть в контексте искусственного интеллекта?',
                correct_answer: 'Нейронная сеть — это математическая модель, имитирующая структуру и принципы работы биологической нервной системы.',
                keywords: JSON.stringify(['нейронная сеть', 'математическая модель', 'нейроны', 'нервная система']),
                category: 'Искусственный интеллект',
                difficulty: 'medium'
            },
            {
                question_text: 'Как называется популярный тест для определения способности машины демонстрировать разумное поведение?',
                correct_answer: 'Тест Тьюринга',
                keywords: JSON.stringify(['Тьюринга', 'Тьюринг', 'Turing']),
                category: 'Искусственный интеллект',
                difficulty: 'easy'
            },
            {
                question_text: 'Что такое переобучение (overfitting) в машинном обучении?',
                correct_answer: 'Переобучение — это ситуация, когда модель слишком хорошо запоминает тренировочные данные и шум, теряя способность к прогнозам на новых данных.',
                keywords: JSON.stringify(['переобучение', 'overfitting', 'тренировочные данные', 'новые данные', 'запоминает', 'шум']),
                category: 'Искусственный интеллект',
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
