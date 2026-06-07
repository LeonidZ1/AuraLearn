const { getDb } = require('../config/db');

async function test() {
    try {
        const db = await getDb();
        console.log('Testing deleting question...');
        // Insert a dummy question
        const resQ = await db.run(
            `INSERT INTO questions (question_text, correct_answer, keywords, category, difficulty)
             VALUES (?, ?, ?, ?, ?)`,
            ['test question', 'test answer', '["test"]', 'Базы данных', 'medium']
        );
        const qId = resQ.lastID;
        console.log('Inserted dummy question with ID:', qId);
        
        // Delete it
        await db.run('DELETE FROM user_answers WHERE question_id = ?', [qId]);
        await db.run('DELETE FROM questions WHERE id = ?', [qId]);
        console.log('Successfully deleted question!');
        
        // Insert a dummy category
        console.log('Testing deleting category...');
        const resC = await db.run(
            'INSERT INTO categories (name, description, icon, hue) VALUES (?, ?, ?, ?)',
            ['DummyCategory', 'desc', 'fa-brain', 45]
        );
        const catId = resC.lastID;
        console.log('Inserted dummy category with ID:', catId);
        
        // Delete it
        await db.run('DELETE FROM user_answers WHERE question_id IN (SELECT id FROM questions WHERE category = ?)', ['DummyCategory']);
        await db.run('DELETE FROM questions WHERE category = ?', ['DummyCategory']);
        await db.run('DELETE FROM categories WHERE id = ?', [catId]);
        console.log('Successfully deleted category!');
        
        process.exit(0);
    } catch (e) {
        console.error('Database operation failed:', e);
        process.exit(1);
    }
}

test();
