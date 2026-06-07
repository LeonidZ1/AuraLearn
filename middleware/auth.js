const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    let token = (req.cookies && req.cookies.session) || req.headers['authorization'];
    
    if (token && token.startsWith('Bearer ')) {
        token = token.substring(7);
    }
    
    if (!token) {
        return res.status(401).json({ error: 'Доступ запрещен. Отсутствует токен авторизации.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, role }
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Недействительный или просроченный токен сессии.' });
    }
}

const requireAuth = verifyToken;

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    next();
}

module.exports = { verifyToken, requireAuth, requireAdmin };
