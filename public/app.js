// ==========================================
// Глобальное состояние приложения
const state = {
    currentUser: null,      // { id, username, role }
    activeScreen: 'auth',   // auth, dashboard, trainer, analytics, admin
    
    // Состояние тренажера
    trainer: {
        category: '',
        questions: [],
        currentIndex: 0,
        startTime: null,
        timerInterval: null,
        elapsedSeconds: 0
    },
    
    // Состояние редактирования (админ)
    adminTab: 'categories',   // categories, questions, stats
    analyticsData: null
};

// ==========================================
// Селекторы элементов DOM
// ==========================================
const DOM = {
    header: document.getElementById('main-header'),
    logoButton: document.getElementById('logo-button'),
    navHome: document.getElementById('nav-home'),
    navProfile: document.getElementById('nav-profile'),
    navAdmin: document.getElementById('nav-admin'),
    navLogout: document.getElementById('nav-logout'),
    avatarDisplay: document.getElementById('avatar-display'),
    usernameDisplay: document.getElementById('username-display'),
    
    // Экраны
    screens: {
        auth: document.getElementById('screen-auth'),
        dashboard: document.getElementById('screen-dashboard'),
        trainer: document.getElementById('screen-trainer'),
        analytics: document.getElementById('screen-analytics'),
        admin: document.getElementById('screen-admin')
    },
    
    // Экран авторизации
    authForm: document.getElementById('auth-form'),
    authTitleText: document.getElementById('auth-title-text'),
    authSubtitleText: document.getElementById('auth-subtitle-text'),
    authUsername: document.getElementById('auth-username'),
    authEmail: document.getElementById('auth-email'),
    authPassword: document.getElementById('auth-password'),
    emailGroup: document.getElementById('email-group'),
    authSubmitBtn: document.getElementById('auth-submit-btn'),
    authToggleBtn: document.getElementById('auth-toggle-btn'),
    authToggleLabel: document.getElementById('auth-toggle-label'),
    authErrorMsg: document.getElementById('auth-error-msg'),
    authSuccessMsg: document.getElementById('auth-success-msg'),
    
    // Экран дашборда
    dashboardUserName: document.getElementById('dashboard-user-name'),
    dashboardTotalTests: document.getElementById('dashboard-total-tests'),
    dashboardSuccessRate: document.getElementById('dashboard-success-rate'),
    categoriesContainer: document.getElementById('categories-container'),
    
    // Экран тренажера
    trainerCategoryBadge: document.getElementById('trainer-category-badge'),
    trainerDifficultyBadge: document.getElementById('trainer-difficulty-badge'),
    trainerTimerDisplay: document.getElementById('trainer-timer-display'),
    trainerQuestionText: document.getElementById('trainer-question-text'),
    trainerAnswerInput: document.getElementById('trainer-answer-input'),
    trainerCharCount: document.getElementById('trainer-char-count'),
    trainerCancelBtn: document.getElementById('trainer-cancel-btn'),
    trainerSubmitBtn: document.getElementById('trainer-submit-btn'),
    trainerResultPanel: document.getElementById('trainer-result-panel'),
    resultStatusTitle: document.getElementById('result-status-title'),
    resultMatchSummary: document.getElementById('result-match-summary'),
    resultKeywordsContainer: document.getElementById('result-keywords-container'),
    resultCorrectAnswer: document.getElementById('result-correct-answer'),
    trainerNextBtn: document.getElementById('trainer-next-btn'),
    
    // Экран аналитики
    statsTotalAttempts: document.getElementById('stats-total-attempts'),
    statsSuccessAttempts: document.getElementById('stats-success-attempts'),
    statsPercentRatio: document.getElementById('stats-percent-ratio'),
    statsAvgTime: document.getElementById('stats-avg-time'),
    statsHistoryBody: document.getElementById('stats-history-body'),
    statsRefreshBtn: document.getElementById('stats-refresh-btn'),
    statsCategoryFilter: document.getElementById('stats-category-filter'),
    statsCategoriesPerformanceBody: document.getElementById('stats-categories-performance-body'),
    
    // Экран админа
    adminTabCategories: document.getElementById('admin-tab-categories'),
    adminTabQuestions: document.getElementById('admin-tab-questions'),
    adminTabStats: document.getElementById('admin-tab-stats'),
    adminContentCategories: document.getElementById('admin-content-categories'),
    adminContentQuestions: document.getElementById('admin-content-questions'),
    adminContentStats: document.getElementById('admin-content-stats'),
    adminCategoriesTable: document.getElementById('admin-categories-table'),
    adminCategoriesBody: document.getElementById('admin-categories-body'),
    adminAddCategoryBtn: document.getElementById('admin-add-category-btn'),
    adminQuestionCategoryFilter: document.getElementById('admin-question-category-filter'),
    adminQuestionsBody: document.getElementById('admin-questions-body'),
    adminAddQuestionBtn: document.getElementById('admin-add-question-btn'),
    globalUsersCount: document.getElementById('global-users-count'),
    globalQuestionsCount: document.getElementById('global-questions-count'),
    globalTotalAnswers: document.getElementById('global-total-answers'),
    globalSuccessRatio: document.getElementById('global-success-ratio'),
    globalWorstQuestionsBody: document.getElementById('global-worst-questions-body'),
    globalCategoriesPerformanceBody: document.getElementById('global-categories-performance-body'),
    globalStudentsRankingBody: document.getElementById('global-students-ranking-body'),
    
    // Модалка админа вопросов
    questionModal: document.getElementById('question-modal'),
    modalTitle: document.getElementById('modal-title'),
    questionForm: document.getElementById('question-form'),
    modalQuestionId: document.getElementById('modal-question-id'),
    modalQuestionText: document.getElementById('modal-question-text'),
    modalCategory: document.getElementById('modal-category'),
    modalDifficulty: document.getElementById('modal-difficulty'),
    modalCorrectAnswer: document.getElementById('modal-correct-answer'),
    modalKeywords: document.getElementById('modal-keywords'),
    modalErrorMsg: document.getElementById('modal-error-msg'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
 
    // Модалка админа категорий
    categoryModal: document.getElementById('category-modal'),
    categoryModalTitle: document.getElementById('category-modal-title'),
    categoryForm: document.getElementById('category-form'),
    categoryModalId: document.getElementById('category-modal-id'),
    categoryModalName: document.getElementById('category-modal-name'),
    categoryModalDesc: document.getElementById('category-modal-desc'),
    categoryModalIcon: document.getElementById('category-modal-icon'),
    categoryModalHue: document.getElementById('category-modal-hue'),
    categoryModalErrorMsg: document.getElementById('category-modal-error-msg'),
    categoryModalCloseBtn: document.getElementById('category-modal-close-btn'),
    categoryModalCancelBtn: document.getElementById('category-modal-cancel-btn')
};

// ==========================================
// Логика Роутинга и Навигации (SPA)
// ==========================================

function showScreen(screenName) {
    state.activeScreen = screenName;
    
    // Скрываем все экраны
    Object.keys(DOM.screens).forEach(key => {
        DOM.screens[key].style.display = 'none';
    });
    
    // Показываем целевой
    DOM.screens[screenName].style.display = 'block';
    
    // Настраиваем видимость хедера
    if (screenName === 'auth') {
        DOM.header.style.display = 'none';
    } else {
        DOM.header.style.display = 'block';
        updateHeaderNavigation();
    }
    
    // Сбрасываем активные классы в меню
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Специфическая логика при загрузке экранов
    if (screenName === 'dashboard') {
        DOM.navHome.classList.add('active');
        loadDashboardData();
    } else if (screenName === 'analytics') {
        DOM.navProfile.classList.add('active');
        loadAnalyticsData();
    } else if (screenName === 'admin') {
        DOM.navAdmin.classList.add('active');
        loadAdminData();
    }
}

function updateHeaderNavigation() {
    if (!state.currentUser) return;
    
    // Заполняем виджет пользователя
    DOM.usernameDisplay.textContent = state.currentUser.username;
    DOM.avatarDisplay.textContent = state.currentUser.username.substring(0, 2).toUpperCase();
    
    // Настройка пунктов меню
    if (state.currentUser.role === 'admin') {
        DOM.navAdmin.style.display = 'flex';
        DOM.navProfile.style.display = 'flex';
    } else {
        DOM.navAdmin.style.display = 'none';
        DOM.navProfile.style.display = 'flex';
    }
}

// ==========================================
// API Запросы (HTTP Клиент)
// ==========================================

async function apiRequest(url, options = {}) {
    // Настройки по умолчанию
    options.headers = options.headers || {};
    if (options.body && typeof options.body === 'object') {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Произошла непредвиденная ошибка.');
        }
        
        return data;
    } catch (error) {
        console.error(`Ошибка запроса к ${url}:`, error);
        throw error;
    }
}

// Проверка сессии при запуске
async function checkAuth() {
    try {
        const data = await apiRequest('/api/auth/me');
        if (data.user) {
            state.currentUser = data.user;
            showScreen('dashboard');
        }
    } catch (e) {
        // Не авторизован - показываем форму логина
        showScreen('auth');
    }
}

// ==========================================
// Авторизация / Регистрация
// ==========================================

let isLoginMode = true;

DOM.authToggleBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    DOM.authErrorMsg.style.display = 'none';
    DOM.authSuccessMsg.style.display = 'none';
    
    if (isLoginMode) {
        DOM.authTitleText.textContent = 'Вход в систему';
        DOM.authSubtitleText.textContent = 'Добро пожаловать в интеллектуальный адаптивный тренажер';
        DOM.emailGroup.style.display = 'none';
        DOM.authSubmitBtn.querySelector('span').textContent = 'Войти';
        DOM.authSubmitBtn.querySelector('i').className = 'fa-solid fa-right-to-bracket';
        DOM.authToggleLabel.textContent = 'Еще нет аккаунта?';
        DOM.authToggleBtn.textContent = 'Создать аккаунт';
    } else {
        DOM.authTitleText.textContent = 'Регистрация';
        DOM.authSubtitleText.textContent = 'Создайте аккаунт для начала индивидуального обучения';
        DOM.emailGroup.style.display = 'flex';
        DOM.authSubmitBtn.querySelector('span').textContent = 'Зарегистрироваться';
        DOM.authSubmitBtn.querySelector('i').className = 'fa-solid fa-user-plus';
        DOM.authToggleLabel.textContent = 'Уже есть аккаунт?';
        DOM.authToggleBtn.textContent = 'Войти';
    }
});

DOM.authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    DOM.authErrorMsg.style.display = 'none';
    DOM.authSuccessMsg.style.display = 'none';
    
    const username = DOM.authUsername.value.trim();
    const password = DOM.authPassword.value.trim();
    const email = DOM.authEmail.value.trim();
    
    if (!username || !password) {
        DOM.authErrorMsg.textContent = 'Заполните обязательные поля.';
        DOM.authErrorMsg.style.display = 'block';
        return;
    }
    
    const url = isLoginMode ? '/api/auth/login' : '/api/auth/register';
    const body = isLoginMode ? { username, password } : { username, email, password };
    
    try {
        const data = await apiRequest(url, { method: 'POST', body });
        state.currentUser = data.user;
        
        DOM.authSuccessMsg.textContent = isLoginMode ? 'Вход выполнен!' : 'Регистрация успешна!';
        DOM.authSuccessMsg.style.display = 'block';
        
        // Очищаем форму
        DOM.authUsername.value = '';
        DOM.authPassword.value = '';
        DOM.authEmail.value = '';
        
        setTimeout(() => {
            showScreen('dashboard');
        }, 800);
    } catch (err) {
        DOM.authErrorMsg.textContent = err.message;
        DOM.authErrorMsg.style.display = 'block';
    }
});

// Выход из системы
DOM.navLogout.addEventListener('click', async () => {
    try {
        await apiRequest('/api/auth/logout', { method: 'POST' });
        state.currentUser = null;
        // Очистим черновики тренировки
        localStorage.removeItem('active-trainer-state');
        showScreen('auth');
    } catch (e) {
        alert('Ошибка при выходе из системы.');
    }
});

// ==========================================
// Логика Дашборда (Dashboard)
// ==========================================

async function loadDashboardData() {
    try {
        DOM.dashboardUserName.textContent = state.currentUser.username;
        
        // Подгружаем мини-аналитику для дашборда
        const analytics = await apiRequest('/api/analytics');
        DOM.dashboardTotalTests.textContent = analytics.totalAttempts;
        
        if (analytics.totalAttempts > 0) {
            const percent = Math.round((analytics.correctAttempts / analytics.totalAttempts) * 100);
            DOM.dashboardSuccessRate.textContent = `${percent}%`;
        } else {
            DOM.dashboardSuccessRate.textContent = '0%';
        }
        
        // Подгружаем список категорий
        const { categories } = await apiRequest('/api/categories');
        
        DOM.categoriesContainer.innerHTML = '';
        
        if (categories.length === 0) {
            DOM.categoriesContainer.innerHTML = `
                <div class="glass-card" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">
                    <i class="fa-solid fa-database" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>База знаний пуста. Обратитесь к администратору для добавления вопросов.</p>
                </div>
            `;
            return;
        }
        
        categories.forEach(cat => {
            const icon = cat.icon || 'fa-brain';
            const hue = cat.hue !== undefined && cat.hue !== null ? cat.hue : 45;
            
            // Создаем карточку категории
            const card = document.createElement('div');
            card.className = 'glass-card category-card';
            
            // Расчет цвета на основе HSL тона категории
            const iconBg = `hsla(${hue}, 100%, 65%, 0.15)`;
            const iconColor = `hsl(${hue}, 100%, 65%)`;
            
            card.innerHTML = `
                <div class="category-header">
                    <div class="cat-icon-wrapper" style="background: ${iconBg}; color: ${iconColor};">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                </div>
                <h4 class="category-title">${cat.name}</h4>
                <p class="category-desc">${cat.description || `Интеллектуальная проверка знаний терминов и ключевых принципов направления «${cat.name}».`}</p>
                <div class="category-actions">
                    <button class="action-btn btn-start-trainer btn-start-trainer" data-category="${cat.name}" style="background: linear-gradient(135deg, hsl(${hue}, 100%, 60%) 0%, hsl(${hue + 30}, 100%, 50%) 100%);">
                        Начать тренаж <i class="fa-solid fa-play"></i>
                    </button>
                </div>
            `;
            
            DOM.categoriesContainer.appendChild(card);
        });
        
        // Вешаем события на кнопки старта
        document.querySelectorAll('.btn-start-trainer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = btn.getAttribute('data-category');
                startTrainerSession(category);
            });
        });
        
    } catch (error) {
        console.error('Ошибка рендеринга дашборда:', error);
    }
}

// ==========================================
// Логика Тренажера (Trainer Session)
// ==========================================

async function startTrainerSession(category) {
    try {
        const { questions } = await apiRequest(`/api/questions?category=${encodeURIComponent(category)}`);
        
        if (questions.length === 0) {
            alert('В этой категории пока нет вопросов.');
            return;
        }
        
        // Перемешиваем вопросы для адаптивности
        state.trainer.questions = questions.sort(() => Math.random() - 0.5);
        state.trainer.category = category;
        state.trainer.currentIndex = 0;
        
        showScreen('trainer');
        loadTrainerQuestion();
    } catch (e) {
        alert('Не удалось загрузить вопросы для тренировки.');
    }
}

function loadTrainerQuestion() {
    const session = state.trainer;
    const question = session.questions[session.currentIndex];
    
    // Сбрасываем панели результатов и поле ввода
    DOM.trainerResultPanel.style.display = 'none';
    DOM.trainerAnswerInput.value = '';
    DOM.trainerAnswerInput.disabled = false;
    DOM.trainerSubmitBtn.style.display = 'flex';
    DOM.trainerCharCount.textContent = '0 символов';
    
    // Заполняем данные вопроса
    DOM.trainerCategoryBadge.textContent = question.category;
    DOM.trainerDifficultyBadge.textContent = getDifficultyText(question.difficulty);
    DOM.trainerDifficultyBadge.className = `badge difficulty-badge ${question.difficulty}`;
    DOM.trainerQuestionText.textContent = question.question_text;
    
    // Проверяем localStorage на предмет сохраненного прогресса
    const savedState = localStorage.getItem('active-trainer-state');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        // Если это тот же вопрос в той же категории, восстанавливаем текст и таймер
        if (parsed.questionId === question.id) {
            DOM.trainerAnswerInput.value = parsed.userAnswer || '';
            DOM.trainerCharCount.textContent = `${DOM.trainerAnswerInput.value.length} символов`;
            session.elapsedSeconds = parsed.elapsedSeconds || 0;
        } else {
            session.elapsedSeconds = 0;
        }
    } else {
        session.elapsedSeconds = 0;
    }
    
    // Запускаем таймер
    session.startTime = Date.now() - (session.elapsedSeconds * 1000);
    startTimer();
}

function getDifficultyText(diff) {
    switch (diff) {
        case 'easy': return 'Легкий';
        case 'hard': return 'Сложный';
        default: return 'Средний';
    }
}

function startTimer() {
    clearInterval(state.trainer.timerInterval);
    updateTimerDisplay();
    
    state.trainer.timerInterval = setInterval(() => {
        state.trainer.elapsedSeconds = Math.floor((Date.now() - state.trainer.startTime) / 1000);
        updateTimerDisplay();
        
        // Кэшируем текущее состояние в localStorage каждые секунду
        saveTrainerProgressToLocalStorage();
    }, 1000);
}

function updateTimerDisplay() {
    const totalSec = state.trainer.elapsedSeconds;
    const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    DOM.trainerTimerDisplay.textContent = `${mins}:${secs}`;
    
    // Если пользователь отвечает дольше 3 минут, предупреждаем
    if (totalSec >= 180) {
        document.getElementById('trainer-timer-wrapper').classList.add('low-time');
    } else {
        document.getElementById('trainer-timer-wrapper').classList.remove('low-time');
    }
}

// Автосохранение черновика
DOM.trainerAnswerInput.addEventListener('input', () => {
    DOM.trainerCharCount.textContent = `${DOM.trainerAnswerInput.value.length} символов`;
    saveTrainerProgressToLocalStorage();
});

function saveTrainerProgressToLocalStorage() {
    const session = state.trainer;
    if (session.questions.length === 0) return;
    
    const question = session.questions[session.currentIndex];
    const dataToSave = {
        questionId: question.id,
        userAnswer: DOM.trainerAnswerInput.value,
        elapsedSeconds: session.elapsedSeconds
    };
    localStorage.setItem('active-trainer-state', JSON.stringify(dataToSave));
}

// Отмена и выход из тренажера
DOM.trainerCancelBtn.addEventListener('click', () => {
    cleanupTrainerSession();
    showScreen('dashboard');
});

function cleanupTrainerSession() {
    clearInterval(state.trainer.timerInterval);
    localStorage.removeItem('active-trainer-state');
    state.trainer.questions = [];
    state.trainer.elapsedSeconds = 0;
}

// Проверка ответа (Отправка на backend)
DOM.trainerSubmitBtn.addEventListener('click', async () => {
    const answer = DOM.trainerAnswerInput.value.trim();
    if (!answer) {
        alert('Пожалуйста, введите ваш ответ перед отправкой.');
        return;
    }
    
    clearInterval(state.trainer.timerInterval);
    DOM.trainerSubmitBtn.disabled = true;
    
    const session = state.trainer;
    const question = session.questions[session.currentIndex];
    const timeSpentMs = session.elapsedSeconds * 1000;
    
    try {
        const result = await apiRequest('/api/check', {
            method: 'POST',
            body: {
                questionId: question.id,
                userAnswer: answer,
                timeSpentMs
            }
        });
        
        // Показываем панель обратной связи
        DOM.trainerAnswerInput.disabled = true;
        DOM.trainerSubmitBtn.style.display = 'none';
        
        // Стилизуем панель результата
        DOM.trainerResultPanel.style.display = 'block';
        
        if (result.isCorrect) {
            DOM.resultStatusTitle.textContent = 'Ответ Зачтен! 🎉';
            DOM.resultStatusTitle.className = 'result-status-title text-success';
        } else {
            DOM.resultStatusTitle.textContent = 'Ответ Не Зачтен ❌';
            DOM.resultStatusTitle.className = 'result-status-title text-error';
        }
        
        DOM.resultMatchSummary.textContent = `Распознано ключевых слов: ${result.matchCount} из ${result.totalKeywords}`;
        
        // Рендерим пилюли ключевых слов
        DOM.resultKeywordsContainer.innerHTML = '';
        
        // Нам прилетают matchedWords с бэкенда.
        // Запросим оригинальные ключевые слова из вопроса, чтобы отобразить и упущенные
        // Так как оригинальные ключевые слова лежат в БД и не отдаются в GET /questions для защиты,
        // но теперь в ответе /check мы можем собрать список.
        // Передадим в matchedWords те слова, которые совпали.
        
        // С бэкенда API /check нам прилетает correctAnswer.
        // Для рендеринга ключевых слов мы можем разобрать список ключевых слов.
        // Нам нужно знать все ключевые слова. Но мы можем вывести matchedWords.
        // Сделаем так: воссоздадим оригинальный список keywords (он был в question, но скрыт).
        // Нам в check API вернется matchedWords. Мы можем вывести все совпавшие зелеными.
        // А чтобы отобразить все, бэкенд может вернуть список всех keywords в ответе check!
        // Но даже если бэкенд возвращает только matchedWords, мы можем вывести их.
        // Давайте обновим отображение. Наш бэкенд /api/check возвращает matchedWords и correctAnswer.
        // Давайте выведем их красиво.
        
        if (result.matchedWords && result.matchedWords.length > 0) {
            result.matchedWords.forEach(kw => {
                const pill = document.createElement('span');
                pill.className = 'keyword-pill matched';
                pill.innerHTML = `<i class="fa-solid fa-check"></i> ${kw}`;
                DOM.resultKeywordsContainer.appendChild(pill);
            });
        } else {
            DOM.resultKeywordsContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">Ни одного ключевого слова не найдено</span>`;
        }
        
        DOM.resultCorrectAnswer.textContent = result.correctAnswer;
        
        // Проверяем, последний ли это вопрос в сессии
        if (session.currentIndex >= session.questions.length - 1) {
            DOM.trainerNextBtn.innerHTML = 'Завершить тренировку <i class="fa-solid fa-flag-checkered"></i>';
        } else {
            DOM.trainerNextBtn.innerHTML = 'Следующий вопрос <i class="fa-solid fa-chevron-right"></i>';
        }
        
        // Удаляем сохраненное временное состояние
        localStorage.removeItem('active-trainer-state');
        
    } catch (e) {
        alert('Ошибка при проверке ответа на сервере.');
        DOM.trainerSubmitBtn.disabled = false;
        startTimer();
    }
});

// Кнопка "Следующий вопрос" / "Завершить"
DOM.trainerNextBtn.addEventListener('click', () => {
    const session = state.trainer;
    DOM.trainerSubmitBtn.disabled = false;
    
    if (session.currentIndex >= session.questions.length - 1) {
        cleanupTrainerSession();
        showScreen('analytics'); // Редирект в личный кабинет, чтобы студент сразу увидел результаты
    } else {
        session.currentIndex++;
        loadTrainerQuestion();
    }
});

// ==========================================
// Личная аналитика студента (Analytics)
// ==========================================

async function loadAnalyticsData() {
    try {
        const data = await apiRequest('/api/analytics');
        state.analyticsData = data;
        
        // Заполняем фильтр категорий
        const filterSel = DOM.statsCategoryFilter;
        if (filterSel) {
            const prevFilterVal = filterSel.value || 'all';
            filterSel.innerHTML = '<option value="all">🔍 Все направления</option>';
            
            const { categories } = await apiRequest('/api/categories');
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.name;
                opt.textContent = cat.name;
                filterSel.appendChild(opt);
            });
            
            if (Array.from(filterSel.options).some(o => o.value === prevFilterVal)) {
                filterSel.value = prevFilterVal;
            } else {
                filterSel.value = 'all';
            }
            
            if (!filterSel.dataset.listenerAttached) {
                filterSel.addEventListener('change', () => {
                    renderFilteredAnalytics(state.analyticsData);
                });
                filterSel.dataset.listenerAttached = 'true';
            }
        }
        
        renderFilteredAnalytics(data);
    } catch (e) {
        console.error('Не удалось загрузить аналитику:', e);
    }
}

function renderFilteredAnalytics(data) {
    if (!data) return;
    
    const selectedCategory = DOM.statsCategoryFilter ? DOM.statsCategoryFilter.value : 'all';
    
    // 1. Фильтруем историю
    const filteredHistory = selectedCategory === 'all'
        ? data.history
        : data.history.filter(row => row.category === selectedCategory);
        
    // 2. Рассчитываем и обновляем виджеты на основе отфильтрованной истории
    const totalAttempts = filteredHistory.length;
    const correctAttempts = filteredHistory.filter(row => row.is_correct).length;
    
    DOM.statsTotalAttempts.textContent = totalAttempts;
    DOM.statsSuccessAttempts.textContent = correctAttempts;
    
    if (totalAttempts > 0) {
        const percent = Math.round((correctAttempts / totalAttempts) * 100);
        DOM.statsPercentRatio.textContent = `${percent}%`;
        
        const totalTime = filteredHistory.reduce((sum, row) => sum + row.time_spent_ms, 0);
        const seconds = Math.round((totalTime / totalAttempts) / 1000);
        DOM.statsAvgTime.textContent = `${seconds} сек`;
    } else {
        DOM.statsPercentRatio.textContent = '0%';
        DOM.statsAvgTime.textContent = '0 сек';
    }
    
    // 3. Заполняем таблицу истории
    DOM.statsHistoryBody.innerHTML = '';
    
    if (filteredHistory.length === 0) {
        DOM.statsHistoryBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
                    В этой категории пока нет попыток. Начните обучение на главной странице!
                </td>
            </tr>
        `;
    } else {
        filteredHistory.forEach(row => {
            const tr = document.createElement('tr');
            
            const date = new Date(row.attempt_date).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const timeSec = Math.round(row.time_spent_ms / 1000);
            const statusClass = row.is_correct ? 'success' : 'fail';
            const statusText = row.is_correct ? 'Зачтено' : 'Не зачтено';
            
            tr.innerHTML = `
                <td><strong>${row.category}</strong></td>
                <td><span title="${row.question_text}">${truncateString(row.question_text, 40)}</span></td>
                <td><span title="${row.user_answer || ''}">${truncateString(row.user_answer || '', 30)}</span></td>
                <td><span class="table-badge ${statusClass}">${statusText}</span></td>
                <td>${timeSec} сек</td>
                <td><small>${date}</small></td>
            `;
            
            DOM.statsHistoryBody.appendChild(tr);
        });
    }
    
    // 4. Заполняем таблицу успеваемости по направлениям
    DOM.statsCategoriesPerformanceBody.innerHTML = '';
    
    if (!data.categoryStats || data.categoryStats.length === 0) {
        DOM.statsCategoriesPerformanceBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">
                    Нет данных по направлениям.
                </td>
            </tr>
        `;
    } else {
        data.categoryStats.forEach(row => {
            const tr = document.createElement('tr');
            const rate = row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0;
            
            tr.innerHTML = `
                <td><strong>${row.category}</strong></td>
                <td>${row.total}</td>
                <td><span class="text-success">${row.correct}</span></td>
                <td><span class="table-badge ${row.total > 0 ? (rate >= 60 ? 'success' : 'fail') : 'fail'}" style="background: ${row.total > 0 ? '' : 'rgba(255,255,255,0.05)'}; color: ${row.total > 0 ? '' : 'var(--text-muted)'};">${row.total > 0 ? `${rate}%` : '—'}</span></td>
            `;
            DOM.statsCategoriesPerformanceBody.appendChild(tr);
        });
    }
}

DOM.statsRefreshBtn.addEventListener('click', loadAnalyticsData);

function truncateString(str, num) {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
}

// ==========================================
// Панель администратора (Admin Dashboard)
// ==========================================

// Переключение вкладок в админке
DOM.adminTabCategories.addEventListener('click', () => {
    DOM.adminTabCategories.classList.add('active');
    DOM.adminTabQuestions.classList.remove('active');
    DOM.adminTabStats.classList.remove('active');
    DOM.adminContentCategories.style.display = 'block';
    DOM.adminContentQuestions.style.display = 'none';
    DOM.adminContentStats.style.display = 'none';
    state.adminTab = 'categories';
    loadAdminCategoriesTable();
});

DOM.adminTabQuestions.addEventListener('click', () => {
    DOM.adminTabCategories.classList.remove('active');
    DOM.adminTabQuestions.classList.add('active');
    DOM.adminTabStats.classList.remove('active');
    DOM.adminContentCategories.style.display = 'none';
    DOM.adminContentQuestions.style.display = 'block';
    DOM.adminContentStats.style.display = 'none';
    state.adminTab = 'questions';
    loadCategorySelects().then(() => {
        loadAdminQuestionsTable();
    });
});

DOM.adminTabStats.addEventListener('click', () => {
    DOM.adminTabCategories.classList.remove('active');
    DOM.adminTabQuestions.classList.remove('active');
    DOM.adminTabStats.classList.add('active');
    DOM.adminContentCategories.style.display = 'none';
    DOM.adminContentQuestions.style.display = 'none';
    DOM.adminContentStats.style.display = 'block';
    state.adminTab = 'stats';
    loadAdminGlobalStats();
});

async function loadAdminData() {
    await loadCategorySelects();
    
    if (state.adminTab === 'categories') {
        DOM.adminTabCategories.classList.add('active');
        DOM.adminTabQuestions.classList.remove('active');
        DOM.adminTabStats.classList.remove('active');
        DOM.adminContentCategories.style.display = 'block';
        DOM.adminContentQuestions.style.display = 'none';
        DOM.adminContentStats.style.display = 'none';
        loadAdminCategoriesTable();
    } else if (state.adminTab === 'questions') {
        DOM.adminTabCategories.classList.remove('active');
        DOM.adminTabQuestions.classList.add('active');
        DOM.adminTabStats.classList.remove('active');
        DOM.adminContentCategories.style.display = 'none';
        DOM.adminContentQuestions.style.display = 'block';
        DOM.adminContentStats.style.display = 'none';
        loadAdminQuestionsTable();
    } else {
        DOM.adminTabCategories.classList.remove('active');
        DOM.adminTabQuestions.classList.remove('active');
        DOM.adminTabStats.classList.add('active');
        DOM.adminContentCategories.style.display = 'none';
        DOM.adminContentQuestions.style.display = 'none';
        DOM.adminContentStats.style.display = 'block';
        loadAdminGlobalStats();
    }
}

// Рендеринг таблицы вопросов с фильтрацией по категориям
async function loadAdminQuestionsTable() {
    try {
        const { questions } = await apiRequest('/api/admin/questions');
        DOM.adminQuestionsBody.innerHTML = '';
        
        const filterVal = DOM.adminQuestionCategoryFilter.value || 'all';
        const filteredQuestions = filterVal === 'all'
            ? questions
            : questions.filter(q => q.category === filterVal);
        
        if (filteredQuestions.length === 0) {
            DOM.adminQuestionsBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">
                        В данной категории пока нет вопросов. Нажмите кнопку выше для добавления.
                    </td>
                </tr>
            `;
            return;
        }
        
        filteredQuestions.forEach(q => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td><strong>#${q.id}</strong></td>
                <td><span class="badge category-badge">${q.category}</span></td>
                <td><span class="badge difficulty-badge ${q.difficulty}">${getDifficultyText(q.difficulty)}</span></td>
                <td>${truncateString(q.question_text, 80)}</td>
                <td class="table-actions-cell">
                    <button class="action-icon-btn edit btn-edit-question" data-id="${q.id}" title="Редактировать">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-icon-btn delete btn-delete-question" data-id="${q.id}" title="Удалить">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            
            DOM.adminQuestionsBody.appendChild(tr);
        });
        
    } catch (e) {
        alert('Не удалось загрузить список вопросов для панели админа.');
    }
}

// Загрузка глобальной статистики
async function loadAdminGlobalStats() {
    try {
        const stats = await apiRequest('/api/admin/stats');
        
        DOM.globalUsersCount.textContent = stats.studentsCount;
        DOM.globalQuestionsCount.textContent = stats.questionsCount;
        DOM.globalTotalAnswers.textContent = stats.totalAnswers;
        
        if (stats.totalAnswers > 0) {
            const percent = Math.round((stats.correctAnswers / stats.totalAnswers) * 100);
            DOM.globalSuccessRatio.textContent = `${percent}%`;
        } else {
            DOM.globalSuccessRatio.textContent = '0%';
        }
        
        // 1. Успеваемость по направлениям обучения
        DOM.globalCategoriesPerformanceBody.innerHTML = '';
        if (!stats.categoryPerformance || stats.categoryPerformance.length === 0) {
            DOM.globalCategoriesPerformanceBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">
                        Нет статистики успеваемости по направлениям.
                    </td>
                </tr>
            `;
        } else {
            stats.categoryPerformance.forEach(row => {
                const tr = document.createElement('tr');
                const rate = row.attempts > 0 ? Math.round((row.correct / row.attempts) * 100) : 0;
                const timeStr = row.attempts > 0 ? `${row.avg_time} сек` : '-';
                
                tr.innerHTML = `
                    <td><strong>${row.category}</strong></td>
                    <td>${row.attempts}</td>
                    <td><span class="text-success">${row.correct}</span></td>
                    <td><span class="table-badge ${rate >= 60 ? 'success' : 'fail'}">${rate}%</span></td>
                    <td>${timeStr}</td>
                `;
                DOM.globalCategoriesPerformanceBody.appendChild(tr);
            });
        }
        
        // 2. Рейтинг успеваемости студентов
        DOM.globalStudentsRankingBody.innerHTML = '';
        if (!stats.studentsRanking || stats.studentsRanking.length === 0) {
            DOM.globalStudentsRankingBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">
                        Нет зарегистрированных студентов с попытками ответов.
                    </td>
                </tr>
            `;
        } else {
            stats.studentsRanking.forEach(row => {
                const tr = document.createElement('tr');
                const regDate = new Date(row.created_at).toLocaleDateString('ru-RU');
                
                tr.innerHTML = `
                    <td><strong>${row.username}</strong></td>
                    <td><small>${regDate}</small></td>
                    <td>${row.attempts}</td>
                    <td><span class="text-success">${row.correct}</span></td>
                    <td><span class="table-badge ${row.success_rate >= 60 ? 'success' : 'fail'}">${row.success_rate}%</span></td>
                `;
                DOM.globalStudentsRankingBody.appendChild(tr);
            });
        }
        
        // 3. Сложные вопросы
        DOM.globalWorstQuestionsBody.innerHTML = '';
        
        if (stats.worstQuestions.length === 0) {
            DOM.globalWorstQuestionsBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">
                        Нет статистики ответов пользователей.
                    </td>
                </tr>
            `;
            return;
        }
        
        stats.worstQuestions.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${truncateString(row.question_text, 60)}</strong></td>
                <td><span class="badge category-badge">${row.category}</span></td>
                <td>${row.attempts}</td>
                <td><span class="text-error">${row.fails}</span></td>
                <td><span class="table-badge fail">${row.fail_rate}%</span></td>
            `;
            DOM.globalWorstQuestionsBody.appendChild(tr);
        });
        
    } catch (e) {
        console.error('Ошибка получения глобальной статистики:', e);
    }
}

// ==========================================
// Модалка добавления/редактирования вопроса
// ==========================================

function openCreateQuestionModal() {
    DOM.modalTitle.textContent = 'Добавить новый вопрос';
    DOM.modalQuestionId.value = '';
    DOM.modalQuestionText.value = '';
    
    // Предустановка категории на основе выбранного фильтра
    const currentFilter = DOM.adminQuestionCategoryFilter.value;
    if (currentFilter && currentFilter !== 'all') {
        DOM.modalCategory.value = currentFilter;
    } else {
        DOM.modalCategory.value = '';
    }
    
    DOM.modalDifficulty.value = 'medium';
    DOM.modalCorrectAnswer.value = '';
    DOM.modalKeywords.value = '';
    DOM.modalErrorMsg.style.display = 'none';
    
    DOM.questionModal.style.display = 'flex';
}

async function openEditQuestionModal(id) {
    try {
        // Подгружаем исходные данные вопроса
        const { questions } = await apiRequest('/api/admin/questions');
        const q = questions.find(item => item.id == id);
        
        if (!q) {
            alert('Вопрос не найден в локальном кэше.');
            return;
        }
        
        DOM.modalTitle.textContent = `Редактировать вопрос #${q.id}`;
        DOM.modalQuestionId.value = q.id;
        DOM.modalQuestionText.value = q.question_text;
        DOM.modalCategory.value = q.category;
        DOM.modalDifficulty.value = q.difficulty;
        DOM.modalCorrectAnswer.value = q.correct_answer;
        
        // Ключевые слова хранятся как JSON-строка
        let kws = q.keywords;
        try {
            const arr = JSON.parse(q.keywords);
            kws = arr.join(', ');
        } catch (e) {}
        DOM.modalKeywords.value = kws;
        
        DOM.modalErrorMsg.style.display = 'none';
        DOM.questionModal.style.display = 'flex';
    } catch (e) {
        alert('Не удалось открыть форму редактирования.');
    }
}

function closeModal() {
    DOM.questionModal.style.display = 'none';
}

DOM.adminAddQuestionBtn.addEventListener('click', openCreateQuestionModal);
DOM.modalCloseBtn.addEventListener('click', closeModal);
DOM.modalCancelBtn.addEventListener('click', closeModal);

// Сохранение вопроса (Create / Update)
DOM.questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    DOM.modalErrorMsg.style.display = 'none';
    
    const id = DOM.modalQuestionId.value;
    const question_text = DOM.modalQuestionText.value.trim();
    const category = DOM.modalCategory.value;
    const difficulty = DOM.modalDifficulty.value;
    const correct_answer = DOM.modalCorrectAnswer.value.trim();
    const keywordsRaw = DOM.modalKeywords.value;
    
    if (!question_text || !category || !correct_answer || !keywordsRaw) {
        DOM.modalErrorMsg.textContent = 'Пожалуйста, заполните все обязательные поля (выберите категорию).';
        DOM.modalErrorMsg.style.display = 'block';
        return;
    }
    
    // Парсим ключевые слова (сплитим по запятым)
    const keywords = keywordsRaw.split(',').map(s => s.trim()).filter(Boolean);
    
    if (keywords.length === 0) {
        DOM.modalErrorMsg.textContent = 'Введите хотя бы одно ключевое слово.';
        DOM.modalErrorMsg.style.display = 'block';
        return;
    }
    
    const isEdit = !!id;
    const url = isEdit ? `/api/admin/questions/${id}` : '/api/admin/questions';
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
        await apiRequest(url, {
            method,
            body: {
                question_text,
                correct_answer,
                keywords,
                category,
                difficulty
            }
        });
        
        closeModal();
        loadAdminQuestionsTable();
    } catch (err) {
        DOM.modalErrorMsg.textContent = err.message;
        DOM.modalErrorMsg.style.display = 'block';
    }
});

// Удаление вопроса
async function deleteQuestion(id) {
    if (confirm(`Вы уверены, что хотите удалить вопрос #${id}? Это безвозвратно удалит всю связанную историю попыток.`)) {
        try {
            await apiRequest(`/api/admin/questions/${id}`, { method: 'DELETE' });
            loadAdminQuestionsTable();
        } catch (e) {
            alert('Не удалось удалить вопрос.');
        }
    }
}

// ==========================================
// Управление направлениями (категориями)
// ==========================================

async function loadAdminCategoriesTable() {
    try {
        const { categories } = await apiRequest('/api/admin/categories');
        DOM.adminCategoriesBody.innerHTML = '';
        
        if (categories.length === 0) {
            DOM.adminCategoriesBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">
                        Направления обучения пока не созданы. Нажмите кнопку выше для добавления.
                    </td>
                </tr>
            `;
            return;
        }
        
        categories.forEach(cat => {
            const icon = cat.icon || 'fa-brain';
            const hue = cat.hue !== undefined && cat.hue !== null ? cat.hue : 45;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${cat.id}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="display: inline-flex; width: 32px; height: 32px; border-radius: 50%; background: hsla(${hue}, 100%, 65%, 0.15); color: hsl(${hue}, 100%, 65%); align-items: center; justify-content: center; font-size: 0.95rem;">
                            <i class="fa-solid ${icon}"></i>
                        </span>
                        <strong>${cat.name}</strong>
                    </div>
                </td>
                <td>${truncateString(cat.description || '', 60)}</td>
                <td><span class="badge category-badge">${cat.question_count || 0}</span></td>
                <td class="table-actions-cell">
                    <button class="action-icon-btn edit btn-edit-category" data-id="${cat.id}" title="Редактировать">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-icon-btn delete btn-delete-category" data-id="${cat.id}" title="Удалить">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            DOM.adminCategoriesBody.appendChild(tr);
        });
        
    } catch (e) {
        alert('Не удалось загрузить список направлений.');
    }
}

async function loadCategorySelects() {
    try {
        const { categories } = await apiRequest('/api/admin/categories');
        
        // Заполняем фильтр
        const filterSel = DOM.adminQuestionCategoryFilter;
        const prevFilterVal = filterSel.value || 'all';
        filterSel.innerHTML = '<option value="all">🔍 Все направления</option>';
        
        // Заполняем селектор в модальном окне
        const modalSel = DOM.modalCategory;
        const prevModalVal = modalSel.value;
        modalSel.innerHTML = '<option value="" disabled selected>Выберите направление...</option>';
        
        categories.forEach(cat => {
            const optFilter = document.createElement('option');
            optFilter.value = cat.name;
            optFilter.textContent = cat.name;
            filterSel.appendChild(optFilter);
            
            const optModal = document.createElement('option');
            optModal.value = cat.name;
            optModal.textContent = cat.name;
            modalSel.appendChild(optModal);
        });
        
        if (Array.from(filterSel.options).some(o => o.value === prevFilterVal)) {
            filterSel.value = prevFilterVal;
        }
        if (prevModalVal && Array.from(modalSel.options).some(o => o.value === prevModalVal)) {
            modalSel.value = prevModalVal;
        }
    } catch (e) {
        console.error('Ошибка при загрузке селекторов категорий:', e);
    }
}

function openCreateCategoryModal() {
    DOM.categoryModalTitle.textContent = 'Добавить новое направление';
    DOM.categoryModalId.value = '';
    DOM.categoryModalName.value = '';
    DOM.categoryModalDesc.value = '';
    DOM.categoryModalIcon.value = 'fa-brain';
    DOM.categoryModalHue.value = '45';
    DOM.categoryModalErrorMsg.style.display = 'none';
    DOM.categoryModal.style.display = 'flex';
}

async function openEditCategoryModal(id) {
    try {
        const { categories } = await apiRequest('/api/admin/categories');
        const cat = categories.find(item => item.id == id);
        
        if (!cat) {
            alert('Направление не найдено.');
            return;
        }
        
        DOM.categoryModalTitle.textContent = `Редактировать направление #${cat.id}`;
        DOM.categoryModalId.value = cat.id;
        DOM.categoryModalName.value = cat.name;
        DOM.categoryModalDesc.value = cat.description || '';
        DOM.categoryModalIcon.value = cat.icon || 'fa-brain';
        DOM.categoryModalHue.value = cat.hue !== undefined && cat.hue !== null ? cat.hue.toString() : '45';
        DOM.categoryModalErrorMsg.style.display = 'none';
        DOM.categoryModal.style.display = 'flex';
    } catch (e) {
        alert('Не удалось открыть форму редактирования.');
    }
}

function closeCategoryModal() {
    DOM.categoryModal.style.display = 'none';
}

DOM.adminAddCategoryBtn.addEventListener('click', openCreateCategoryModal);
DOM.categoryModalCloseBtn.addEventListener('click', closeCategoryModal);
DOM.categoryModalCancelBtn.addEventListener('click', closeCategoryModal);

DOM.categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    DOM.categoryModalErrorMsg.style.display = 'none';
    
    const id = DOM.categoryModalId.value;
    const name = DOM.categoryModalName.value.trim();
    const description = DOM.categoryModalDesc.value.trim();
    const icon = DOM.categoryModalIcon.value;
    const hue = parseInt(DOM.categoryModalHue.value);
    
    if (!name) {
        DOM.categoryModalErrorMsg.textContent = 'Название направления обязательно.';
        DOM.categoryModalErrorMsg.style.display = 'block';
        return;
    }
    
    const isEdit = !!id;
    const url = isEdit ? `/api/admin/categories/${id}` : '/api/admin/categories';
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
        await apiRequest(url, {
            method,
            body: { name, description, icon, hue }
        });
        closeCategoryModal();
        loadAdminCategoriesTable();
        loadCategorySelects();
    } catch (err) {
        DOM.categoryModalErrorMsg.textContent = err.message;
        DOM.categoryModalErrorMsg.style.display = 'block';
    }
});

async function deleteCategory(id) {
    if (confirm(`Вы уверены, что хотите удалить это направление? Это безвозвратно удалит направление и ВСЕ входящие в него вопросы!`)) {
        try {
            await apiRequest(`/api/admin/categories/${id}`, { method: 'DELETE' });
            loadAdminCategoriesTable();
            loadCategorySelects();
        } catch (e) {
            alert('Не удалось удалить направление.');
        }
    }
}

// Делегирование кликов для таблицы вопросов
DOM.adminQuestionsBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit-question');
    const deleteBtn = e.target.closest('.btn-delete-question');
    
    if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        openEditQuestionModal(id);
    } else if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        deleteQuestion(id);
    }
});

// Делегирование кликов для таблицы категорий
DOM.adminCategoriesBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit-category');
    const deleteBtn = e.target.closest('.btn-delete-category');
    
    if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        openEditCategoryModal(id);
    } else if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        deleteCategory(id);
    }
});

// При изменении фильтра вопросов
DOM.adminQuestionCategoryFilter.addEventListener('change', () => {
    loadAdminQuestionsTable();
});

// ==========================================
// Навигация (Header Buttons)
// ==========================================

DOM.logoButton.addEventListener('click', () => {
    if (state.currentUser) showScreen('dashboard');
});

DOM.navHome.addEventListener('click', () => {
    if (state.currentUser) showScreen('dashboard');
});

DOM.navProfile.addEventListener('click', () => {
    if (state.currentUser) showScreen('analytics');
});

DOM.navAdmin.addEventListener('click', () => {
    if (state.currentUser) showScreen('admin');
});

// Запуск инициализации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
