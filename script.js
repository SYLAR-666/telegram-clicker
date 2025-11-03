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
            this.logUserData(user);
        } else {
            // Заглушка для тестирования вне Telegram
            this.displayUserInfo({ first_name: 'Тестовый пользователь' });
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

    logUserData(user) {
        // Логируем данные в консоль (в реальном приложении - отправляем на бэкенд)
        console.log('User data:', {
            id: user.id,
            firstName: user.first_name,
            username: user.username,
            language: user.language_code
        });
    }

    bindEvents() {
        document.getElementById('clickBtn').addEventListener('click', () => {
            this.handleChestClick();
        });

        document.getElementById('adBtn').addEventListener('click', () => {
            this.showAd();
        });

        document.getElementById('closeAdBtn').addEventListener('click', () => {
            this.closeAd();
        });
    }

    handleChestClick() {
        if (this.gameState.chestOpen || this.gameState.waitingForAd) {
            return;
        }

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

        const rewardMessage = document.getElementById('rewardMessage');
        rewardMessage.classList.remove('hidden');
        
        const chest = document.getElementById('chest');
        chest.classList.add('open');

        // Логируем открытие сундука
        console.log('Chest opened! Total chests:', this.gameState.chestsOpened);

        if (this.gameState.chestsOpened === 1) {
            setTimeout(() => {
                this.gameState.waitingForAd = true;
                this.updateUI();
            }, 2000);
        } else {
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
        const modal = document.getElementById('adModal');
        modal.classList.remove('hidden');

        let timeLeft = 5;
        const timerElement = document.getElementById('adTimer');
        const closeButton = document.getElementById('closeAdBtn');
        closeButton.disabled = true;

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

        this.gameState.waitingForAd = false;
        this.gameState.totalCoins += 5;
        
        console.log('Ad watched, bonus coins awarded');

        this.resetChest();
        this.updateUI();
        this.saveGameState();
    }

    updateUI() {
        document.getElementById('progressValue').textContent = this.gameState.progress;
        document.getElementById('progressFill').style.width = `${this.gameState.progress}%`;

        document.getElementById('chestsOpened').textContent = this.gameState.chestsOpened;
        document.getElementById('totalCoins').textContent = this.gameState.totalCoins;

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
        // Сохраняем в localStorage
        localStorage.setItem('telegramClickerState', JSON.stringify(this.gameState));
        
        // Логируем состояние
        console.log('Game state saved:', this.gameState);
    }

    loadGameState() {
        const savedState = localStorage.getItem('telegramClickerState');
        if (savedState) {
            this.gameState = { ...this.gameState, ...JSON.parse(savedState) };
            console.log('Game state loaded:', this.gameState);
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    new TelegramClicker();
});

// Функция для тестирования вне Telegram
if (typeof Telegram === 'undefined') {
    window.Telegram = {
        WebApp: {
            initDataUnsafe: {
                user: {
                    id: 123456,
                    first_name: 'Тестовый',
                    username: 'test_user'
                }
            },
            expand: () => console.log('App expanded'),
            enableClosingConfirmation: () => console.log('Closing confirmation enabled')
        }
    };
}
