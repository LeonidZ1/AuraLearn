const { getDb } = require('../config/db');

async function test() {
    try {
        const db = await getDb();
        const questions = await db.all('SELECT id FROM questions');
        console.log('All question IDs in DB:', questions.map(q => q.id));
        if (questions.length > 0) {
            const firstIdStr = String(questions[0].id);
            const firstIdNum = Number(questions[0].id);
            const row1 = await db.get('SELECT id FROM questions WHERE id = ?', [firstIdStr]);
            console.log(`QueryResult with string "${firstIdStr}":`, row1);
            const row2 = await db.get('SELECT id FROM questions WHERE id = ?', [firstIdNum]);
            console.log(`QueryResult with number ${firstIdNum}:`, row2);
        } else {
            console.log('No questions in DB.');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

test();
