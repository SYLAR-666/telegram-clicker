class TelegramClicker {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.init();
    }

    init() {
        // Инициализация Telegram Web App
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        
        // Получение данных пользователя
        const user = this.tg.initDataUnsafe.user;
        if (user) {
            this.displayUserInfo(user);
        }

        // Инициализация состояния игры
        this.gameState = {
            progress: 0,
            chestsOpened: 0,
            totalCoins: 0,
            chestOpen: false,
            waitingForAd: false
        };

        this.loadGameState();
        this.bindEvents();
        this.updateUI();
    }

    displayUserInfo(user) {
        const userName = user.first_name || user.username || 'Пользователь';
        document.getElementById('userName').textContent = userName;
    }

    bindEvents() {
        // Клик по сундуку
        document.getElementById('clickBtn').addEventListener('click', () => {
            this.handleChestClick();
        });

        // Кнопка просмотра рекламы
        document.getElementById('adBtn').addEventListener('click', () => {
            this.showAd();
        });

        // Закрытие рекламы
        document.getElementById('closeAdBtn').addEventListener('click', () => {
            this.closeAd();
        });
    }

    handleChestClick() {
        if (this.gameState.chestOpen || this.gameState.waitingForAd) {
            return;
        }

        // Увеличиваем прогресс
        this.gameState.progress += 10;
        
        if (this.gameState.progress >= 100) {
            this.gameState.progress = 100;
            this.openChest();
        }

        this.updateUI();
        this.saveGameState();
    }

    openChest() {
        this.gameState.chestOpen = true;
        this.gameState.chestsOpened++;
        this.gameState.totalCoins += 10;

        // Показываем сообщение о награде
        const rewardMessage = document.getElementById('rewardMessage');
        rewardMessage.classList.remove('hidden');
        
        // Анимация открытия сундука
        const chest = document.getElementById('chest');
        chest.classList.add('open');

        // После первого сундука показываем кнопку рекламы
        if (this.gameState.chestsOpened === 1) {
            setTimeout(() => {
                this.gameState.waitingForAd = true;
                this.updateUI();
            }, 2000);
        } else {
            // Автоматически сбрасываем после просмотра рекламы
            setTimeout(() => {
                this.resetChest();
            }, 2000);
        }
    }

    resetChest() {
        this.gameState.progress = 0;
        this.gameState.chestOpen = false;
        
        const chest = document.getElementById('chest');
        chest.classList.remove('open');
        
        const rewardMessage = document.getElementById('rewardMessage');
        rewardMessage.classList.add('hidden');

        this.updateUI();
        this.saveGameState();
    }

    showAd() {
        // В реальном приложении здесь будет вызов Telegram Ads SDK
        // Для демонстрации используем модальное окно с таймером
        
        const modal = document.getElementById('adModal');
        modal.classList.remove('hidden');

        // Симуляция просмотра рекламы (5 секунд)
        let timeLeft = 5;
        const timerElement = document.getElementById('adTimer');
        const closeButton = document.getElementById('closeAdBtn');

        const timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            closeButton.textContent = `Закрыть через ${timeLeft} сек.`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                closeButton.disabled = false;
                closeButton.textContent = 'Получить награду';
            }
        }, 1000);
    }

    closeAd() {
        const modal = document.getElementById('adModal');
        modal.classList.add('hidden');

        // Награда за просмотр рекламы
        this.gameState.waitingForAd = false;
        this.gameState.totalCoins += 5; // Бонус за рекламу
        
        this.resetChest();
        this.updateUI();
        this.saveGameState();

        // В реальном приложении здесь подтверждение просмотра рекламы
        console.log('Реклама просмотрена, награда выдана');
    }

    updateUI() {
        // Обновляем прогресс
        document.getElementById('progressValue').textContent = this.gameState.progress;
        document.getElementById('progressFill').style.width = `${this.gameState.progress}%`;

        // Обновляем статистику
        document.getElementById('chestsOpened').textContent = this.gameState.chestsOpened;
        document.getElementById('totalCoins').textContent = this.gameState.totalCoins;

        // Управляем видимостью кнопок
        const clickBtn = document.getElementById('clickBtn');
        const adBtn = document.getElementById('adBtn');

        if (this.gameState.chestOpen || this.gameState.waitingForAd) {
            clickBtn.disabled = true;
            clickBtn.textContent = 'Сундук открыт';
        } else {
            clickBtn.disabled = false;
            clickBtn.textContent = 'Открыть сундук';
        }

        if (this.gameState.waitingForAd) {
            adBtn.classList.remove('hidden');
        } else {
            adBtn.classList.add('hidden');
        }
    }

    saveGameState() {
        // В реальном приложении здесь будет отправка на бэкенд
        localStorage.setItem('telegramClickerState', JSON.stringify(this.gameState));
    }

    loadGameState() {
        // В реальном приложении здесь будет загрузка с бэкенда
        const savedState = localStorage.getItem('telegramClickerState');
        if (savedState) {
            this.gameState = { ...this.gameState, ...JSON.parse(savedState) };
        }
    }

    // Метод для интеграции с реальным SDK рекламы
    setupRealAds() {
        /* 
        // Пример интеграции с Telegram Ads SDK
        if (window.TelegramAds) {
            const ads = new TelegramAds();
            
            ads.on('rewarded_ad_completed', (reward) => {
                this.closeAd();
            });
            
            ads.on('rewarded_ad_failed', (error) => {
                console.error('Ad failed:', error);
            });
        }
        */
    }
}

// Инициализация игры когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new TelegramClicker();
});