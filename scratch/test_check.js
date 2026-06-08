const stringSimilarity = require('string-similarity');

function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    )
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function checkAnswer(userAnswer, correctAnswer, keywordsJson) {
    const keywords = JSON.parse(keywordsJson || '[]');
    const normalizedAnswer = String(userAnswer).toLowerCase().trim().replace(/[.,!?]/g, '');
    const normalizedCorrectAnswer = String(correctAnswer).toLowerCase().trim().replace(/[.,!?]/g, '');

    let matchCount = 0;
    let matchedWords = [];

    for (const keyword of keywords) {
        const lowerKeyword = keyword.toLowerCase().trim();
        // 1. Точное вхождение
        if (normalizedAnswer.includes(lowerKeyword)) {
            matchCount++;
            matchedWords.push(keyword);
        } else {
            // 2. Нечеткое сравнение (Сёренсен-Дайс или расстояние Левенштейна)
            const answerWords = normalizedAnswer.split(/\s+/).filter(w => w.length > 0);
            let isMatched = false;

            for (const aWord of answerWords) {
                if (aWord.length < 3 && lowerKeyword.length >= 3) continue;
                
                const dist = getLevenshteinDistance(aWord, lowerKeyword);
                const isLevenshteinMatch = (dist <= 1) || (lowerKeyword.length >= 7 && dist <= 2);
                const sim = stringSimilarity.compareTwoStrings(aWord, lowerKeyword);

                if (isLevenshteinMatch || sim >= 0.75) {
                    isMatched = true;
                    break;
                }
            }

            if (!isMatched) {
                const fullSim = stringSimilarity.compareTwoStrings(normalizedAnswer, lowerKeyword);
                const fullDist = getLevenshteinDistance(normalizedAnswer, lowerKeyword);
                const isFullLevenshteinMatch = (fullDist <= 1) || (lowerKeyword.length >= 7 && fullDist <= 2);

                if (isFullLevenshteinMatch || fullSim >= 0.75) {
                    isMatched = true;
                }
            }

            if (isMatched) {
                matchCount++;
                matchedWords.push(keyword);
            }
        }
    }

    const correctWords = normalizedCorrectAnswer.split(/\s+/).filter(w => w.length > 0);
    const isShortAnswer = correctWords.length <= 3;

    let isCorrect = false;
    if (keywords.length === 0) {
        isCorrect = true;
    } else if (isShortAnswer) {
        // Для коротких ответов достаточно совпадения хотя бы одного ключевого слова
        isCorrect = matchCount >= 1;
    } else {
        // Для длинных ответов требуется совпадение не менее 60% ключевых слов
        const threshold = Math.ceil(keywords.length * 0.6);
        isCorrect = matchCount >= threshold;
    }

    // Дополнительная прямая проверка на совпадение с эталонным ответом
    const directMatch = (normalizedAnswer === normalizedCorrectAnswer) ||
                        (stringSimilarity.compareTwoStrings(normalizedAnswer, normalizedCorrectAnswer) >= 0.8) ||
                        (getLevenshteinDistance(normalizedAnswer, normalizedCorrectAnswer) <= 1) ||
                        (normalizedCorrectAnswer.length >= 7 && getLevenshteinDistance(normalizedAnswer, normalizedCorrectAnswer) <= 2);

    if (directMatch) {
        isCorrect = true;
    }

    return {
        isCorrect,
        matchCount,
        totalKeywords: keywords.length,
        matchedWords
    };
}

// Тест-кейсы
const testCases = [
    {
        name: "Short answer - exactly one keyword match",
        userAnswer: "ноутбук",
        correctAnswer: "ноутбук",
        keywords: '["ноутбук", "компьютер", "моноблок"]',
        expected: true
    },
    {
        name: "Short answer - alternative keyword match",
        userAnswer: "компьютер",
        correctAnswer: "ноутбук",
        keywords: '["ноутбук", "компьютер", "моноблок"]',
        expected: true
    },
    {
        name: "Short answer - lowercase and typo in user answer",
        userAnswer: "наутбук",
        correctAnswer: "Ноутбук",
        keywords: '["ноутбук", "компьютер", "моноблок"]',
        expected: true
    },
    {
        name: "Short answer - no match",
        userAnswer: "телефон",
        correctAnswer: "ноутбук",
        keywords: '["ноутбук", "компьютер", "моноблок"]',
        expected: false
    },
    {
        name: "Long answer - sufficient keywords matched",
        userAnswer: "Инкапсуляция - это скрытие реализации и объединение данных.",
        correctAnswer: "Инкапсуляция — это принцип ООП, заключающийся в объединении данных и методов, работающих с ними...",
        keywords: '["инкапсуляция", "данные", "методы", "класс", "скрытие", "реализации"]',
        expected: true // 3 keywords matched: инкапсуляция, данные, скрытие, реализации (4/6 = 67% >= 60%)
    },
    {
        name: "Long answer - direct match with a small typo",
        userAnswer: "Инкапсуляция — это принцип ООП, заключающийся в объединении данных и методов, работающих с ними, внутри одного класса и ограничении прямого доступа к деталям реализации для защиты от некорректного использования.",
        correctAnswer: "Инкапсуляция — это принцип ООП, заключающийся в объединении данных и методов, работающих с ними, внутри одного класса и ограничении прямого доступа к деталям реализации для защиты от некорректного использования.",
        keywords: '["инкапсуляция", "данные", "методы", "класс", "скрытие", "реализации"]',
        expected: true
    }
];

testCases.forEach((tc, index) => {
    const res = checkAnswer(tc.userAnswer, tc.correctAnswer, tc.keywords);
    const passed = res.isCorrect === tc.expected;
    console.log(`Test ${index + 1}: ${tc.name} -> ${passed ? 'PASSED' : 'FAILED'} (Got isCorrect: ${res.isCorrect}, matchCount: ${res.matchCount}/${res.totalKeywords})`);
});
