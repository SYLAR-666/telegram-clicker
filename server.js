const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

app.use(cors());
app.use(express.json());

// В реальном приложении используйте базу данных
const userSessions = new Map();

// Валидация данных от Telegram
function validateTelegramData(initData) {
    // Здесь должна быть реализована проверка подписи
    // Для демонстрации пропускаем
    return true;
}

// Сохранение состояния игры
app.post('/api/save-game', (req, res) => {
    const { userId, gameState } = req.body;
    
    if (userSessions.has(userId)) {
        userSessions.set(userId, { ...userSessions.get(userId), gameState });
    } else {
        userSessions.set(userId, { gameState });
    }
    
    res.json({ success: true });
});

// Загрузка состояния игры
app.get('/api/load-game/:userId', (req, res) => {
    const userId = req.params.userId;
    const userData = userSessions.get(userId);
    
    if (userData && userData.gameState) {
        res.json({ success: true, gameState: userData.gameState });
    } else {
        res.json({ success: false, gameState: null });
    }
});

// Логирование авторизации
app.post('/api/log-auth', (req, res) => {
    const { userId, userData } = req.body;
    console.log('User authenticated:', { userId, userData });
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});