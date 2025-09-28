class MathWarsGame {
    constructor() {
        this.userManager = new UserManager();
        this.questionGenerator = new QuestionGenerator();
        this.uiManager = new UIManager(this);
        
        // Game state
        this.currentLevel = 1;
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.score = 0;
        this.coins = 0;
        this.streak = 0;
        this.health = 100;
        this.timer = 30;
        this.timerInterval = null;
        this.currentQuestionData = null;
        this.gameStartTime = null;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        
        // Powerups
        this.powerups = {
            freezeTime: { active: false, duration: 0 }
        };
        
        // Initialize after DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initialize();
            });
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.uiManager.showLoadingScreen();
        setTimeout(() => {
            this.initializeEventListeners();
            this.loadGameState();
        }, 2000);
    }

    initializeEventListeners() {
        console.log('Initializing Math Wars...');
        
        // Splash screen
        document.getElementById('login-btn').addEventListener('click', () => this.uiManager.showScreen('login-screen'));
        document.getElementById('register-btn').addEventListener('click', () => this.uiManager.showScreen('register-screen'));
        document.getElementById('guest-btn').addEventListener('click', () => this.startAsGuest());
        
        // Login/Register forms
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('back-to-splash').addEventListener('click', () => this.uiManager.showScreen('splash-screen'));
        document.getElementById('back-to-splash-register').addEventListener('click', () => this.uiManager.showScreen('splash-screen'));
        
        // Game buttons
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('retry-level-btn').addEventListener('click', () => this.retryLevel());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.returnToMainMenu());
        
        // Powerups
        document.getElementById('hint-btn').addEventListener('click', () => this.useHint());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('retry-btn').addEventListener('click', () => this.buyRetry());
        document.getElementById('freeze-btn').addEventListener('click', () => this.freezeTime());
        
        console.log('Event listeners initialized successfully');
    }

    startAsGuest() {
        const result = this.userManager.loginAsGuest();
        if (result.success) {
            this.startGame();
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const result = this.userManager.login(username, password);
        if (result.success) {
            alert(result.message);
            this.startGame();
        } else {
            alert(result.message);
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        
        const result = this.userManager.register(username, password);
        if (result.success) {
            alert(result.message);
            this.uiManager.showScreen('login-screen');
        } else {
            alert(result.message);
        }
    }

    startGame() {
        this.currentLevel = this.userManager.currentUser.level;
        this.coins = this.userManager.currentUser.coins;
        this.streak = this.userManager.currentUser.streak || 0;
        this.gameStartTime = Date.now();
        
        this.uiManager.showScreen('game-screen');
        this.startLevel();
    }

    startLevel() {
        this.currentQuestion = 0;
        this.health = 100;
        this.score = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        
        this.updateUI();
        
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset powerups
        this.powerups.freezeTime.active = false;
        
        this.loadQuestion();
    }

    loadQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion > this.totalQuestions) {
            this.levelComplete();
            return;
        }
        
        this.currentQuestionData = this.questionGenerator.generateQuestion(this.currentLevel);
        this.uiManager.displayQuestion(this.currentQuestionData, this.currentQuestion);
        this.uiManager.enableAnswerButtons();
        this.startTimer();
    }

    startTimer() {
        this.timer = this.currentQuestionData?.timeLimit || 30;
        this.uiManager.updateTimerDisplay(this.timer);
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            if (!this.powerups.freezeTime.active) {
                this.timer--;
                this.uiManager.updateTimerDisplay(this.timer);
                
                if (this.timer <= 0) {
                    this.timeUp();
                }
            }
        }, 1000);
    }

    checkAnswer(selectedAnswer) {
        if (!this.currentQuestionData) return;
        
        clearInterval(this.timerInterval);
        this.totalAnswers++;
        
        const correctAnswer = this.currentQuestionData.answer;
        const isCorrect = selectedAnswer === correctAnswer;
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
        
        // Show correct answer
        this.uiManager.showAnswerFeedback(isCorrect, correctAnswer);
        
        // Move to next question after delay
        setTimeout(() => {
            if (this.health > 0) {
                this.loadQuestion();
            }
        }, 2000);
    }

    handleCorrectAnswer() {
        this.correctAnswers++;
        this.streak++;
        
        // Base score
        let points = 100;
        
        // Streak bonus
        points += this.streak * 20;
        
        // Time bonus
        const timeBonus = Math.floor(this.timer * 3);
        points += timeBonus;
        
        // Difficulty multiplier
        const difficultyMultiplier = this.getDifficultyMultiplier();
        points = Math.floor(points * difficultyMultiplier);
        
        this.score += points;
        
        // Coins earned
        const baseCoins = 10;
        const streakCoins = Math.floor(this.streak / 2);
        const coinsEarned = baseCoins + streakCoins;
        this.coins += coinsEarned;
        
        // Show combo message for significant streaks
        if (this.streak % 5 === 0) {
            this.uiManager.showComboMessage(this.streak);
        }
        
        // Update UI
        this.updateUI();
    }

    handleWrongAnswer() {
        this.streak = 0;
        this.health -= 20;
        
        if (this.health <= 0) {
            this.gameOver();
            return;
        }
        
        // Show roast message
        const roast = this.questionGenerator.getRandomRoast();
        this.uiManager.showRoastMessage(roast);
        
        // Update UI
        this.updateUI();
    }

    timeUp() {
        clearInterval(this.timerInterval);
        this.handleWrongAnswer();
        
        setTimeout(() => {
            if (this.health > 0) {
                this.loadQuestion();
            }
        }, 2000);
    }

    levelComplete() {
        clearInterval(this.timerInterval);
        
        const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        // Calculate final bonuses
        const levelBonus = this.currentLevel * 50;
        const streakBonus = this.streak * 15;
        const accuracyBonus = Math.floor((this.correctAnswers / this.totalAnswers) * 100);
        
        this.score += levelBonus + streakBonus + accuracyBonus;
        
        const totalCoins = this.coins - this.userManager.currentUser.coins;
        
        // Update user progress and get new badges
        const newBadges = this.userManager.updateUserProgress(
            this.currentLevel + 1,
            totalCoins,
            this.streak,
            this.score,
            this.correctAnswers,
            this.totalAnswers,
            playTime
        );
        
        // Show new badges
        if (newBadges && newBadges.length > 0) {
            newBadges.forEach(badge => {
                this.uiManager.showAchievement(badge);
            });
        }
        
        // Show level complete screen
        this.uiManager.showLevelComplete(this.currentLevel, this.score, totalCoins, levelBonus + streakBonus);
        
        // Save game state
        this.saveGameState();
    }

    gameOver() {
        clearInterval(this.timerInterval);
        
        const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        // Update user stats even on game over
        this.userManager.updateUserProgress(
            this.currentLevel,
            0, // No coins on game over
            this.streak,
            this.score,
            this.correctAnswers,
            this.totalAnswers,
            playTime
        );
        
        this.uiManager.showGameOver(this.currentLevel, this.coins, this.streak);
        this.saveGameState();
    }

    nextLevel() {
        this.currentLevel++;
        this.uiManager.showScreen('game-screen');
        this.startLevel();
    }

    retryLevel() {
        this.uiManager.showScreen('game-screen');
        this.startLevel();
    }

    returnToMainMenu() {
        this.saveGameState();
        this.uiManager.showScreen('splash-screen');
        this.resetGame();
    }

    resetGame() {
        this.currentLevel = 1;
        this.currentQuestion = 0;
        this.score = 0;
        this.coins = this.userManager.currentUser?.coins || 0;
        this.streak = 0;
        this.health = 100;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Powerup Methods
    useHint() {
        const cost = 10;
        if (this.coins >= cost) {
            this.coins -= cost;
            this.userManager.useCoins(cost);
            
            let hint = "Look carefully at the question!";
            if (this.currentQuestionData) {
                const answer = this.currentQuestionData.answer;
                if (!isNaN(answer)) {
                    const range = Math.max(1, Math.floor(parseInt(answer) * 0.2));
                    hint = `The answer is between ${parseInt(answer) - range} and ${parseInt(answer) + range}`;
                } else if (this.currentQuestionData.explanation) {
                    hint = this.currentQuestionData.explanation;
                }
            }
            
            this.uiManager.showPowerupEffect('hint');
            alert(`💡 Hint: ${hint}`);
            this.updateUI();
        } else {
            alert("Not enough coins!");
        }
    }

    skipQuestion() {
        const cost = 25;
        if (this.coins >= cost) {
            this.coins -= cost;
            this.userManager.useCoins(cost);
            
            clearInterval(this.timerInterval);
            this.uiManager.showPowerupEffect('skip');
            this.loadQuestion();
            this.updateUI();
        } else {
            alert("Not enough coins!");
        }
    }

    buyRetry() {
        const cost = 50;
        if (this.coins >= cost) {
            this.coins -= cost;
            this.userManager.useCoins(cost);
            
            this.health = Math.min(100, this.health + 40);
            this.uiManager.showPowerupEffect('retry');
            this.updateUI();
        } else {
            alert("Not enough coins!");
        }
    }

    freezeTime() {
        const cost = 30;
        if (this.coins >= cost) {
            this.coins -= cost;
            this.userManager.useCoins(cost);
            
            this.powerups.freezeTime.active = true;
            this.powerups.freezeTime.duration = 10; // 10 seconds
            
            this.uiManager.showPowerupEffect('freeze');
            this.updateUI();
            
            // Auto-disable after duration
            setTimeout(() => {
                this.powerups.freezeTime.active = false;
            }, 10000);
        } else {
            alert("Not enough coins!");
        }
    }

    getDifficultyMultiplier() {
        const multipliers = {
            'Easy': 1,
            'Medium': 1.2,
            'Hard': 1.5,
            'Expert': 2,
            'Master': 3
        };
        
        return multipliers[this.currentQuestionData?.difficulty] || 1;
    }

    updateUI() {
        // Update basic stats
        document.getElementById('current-level').textContent = this.currentLevel;
        document.getElementById('coins-count').textContent = this.coins;
        document.getElementById('streak-count').textContent = this.streak;
        document.getElementById('score-count').textContent = this.score;
        
        // Update health bar
        this.uiManager.updateHealthBar(this.health);
        
        // Update coin display with animation
        this.uiManager.updateCoinsDisplay(this.coins);
        this.uiManager.updateScoreDisplay(this.score);
        this.uiManager.updateStreakDisplay(this.streak);
        
        // Update powerup buttons state
        this.updatePowerupButtons();
    }

    updatePowerupButtons() {
        const powerups = ['hint', 'skip', 'retry', 'freeze'];
        powerups.forEach(powerup => {
            const btn = document.getElementById(`${powerup}-btn`);
            if (btn) {
                const cost = parseInt(btn.dataset.cost);
                btn.disabled = this.coins < cost;
            }
        });
    }

    saveGameState() {
        const gameState = {
            currentLevel: this.currentLevel,
            coins: this.coins,
            streak: this.streak,
            timestamp: Date.now()
        };
        localStorage.setItem('mathWarsGameState', JSON.stringify(gameState));
    }

    loadGameState() {
        const saved = localStorage.getItem('mathWarsGameState');
        if (saved) {
            const state = JSON.parse(saved);
            // Only load if saved recently (within 1 hour)
            if (Date.now() - state.timestamp < 3600000) {
                this.currentLevel = state.currentLevel;
                this.coins = state.coins;
                this.streak = state.streak;
            }
        }
    }

    getGameStats() {
        return this.userManager.getStats();
    }

    exportGameData() {
        return this.userManager.exportData();
    }

    importGameData(data) {
        this.userManager.importData(data);
        this.startGame();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    window.mathWarsGame = new MathWarsGame();
});