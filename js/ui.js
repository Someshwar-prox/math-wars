class UIManager {
    constructor(game) {
        this.game = game;
        this.settings = {
            sound: true,
            music: true,
            animations: true
        };
        this.loadSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Settings panel toggle
        document.getElementById('settings-toggle').addEventListener('click', () => {
            this.toggleSettings();
        });

        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.settings.sound = e.target.checked;
            this.saveSettings();
        });

        // Music toggle
        document.getElementById('music-toggle').addEventListener('change', (e) => {
            this.settings.music = e.target.checked;
            this.saveSettings();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.game.returnToMainMenu();
        });
    }

    loadSettings() {
        const saved = localStorage.getItem('mathWarsSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('mathWarsSettings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        document.getElementById('sound-toggle').checked = this.settings.sound;
        document.getElementById('music-toggle').checked = this.settings.music;
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        // Special handling for different screens
        switch(screenId) {
            case 'splash-screen':
                this.animateSplashScreen();
                break;
            case 'game-screen':
                this.updatePlayerInfo();
                break;
            case 'level-complete-screen':
                this.animateLevelComplete();
                break;
        }
        
        // Clear forms when showing splash
        if (screenId === 'splash-screen') {
            document.getElementById('login-form').reset();
            document.getElementById('register-form').reset();
        }
    }

    animateSplashScreen() {
        const features = document.querySelectorAll('.feature');
        features.forEach((feature, index) => {
            feature.style.animationDelay = `${index * 0.2}s`;
            feature.classList.add('pulse');
        });

        const stats = document.querySelectorAll('.stat-preview');
        stats.forEach((stat, index) => {
            stat.style.animationDelay = `${index * 0.3 + 0.6}s`;
        });
    }

    updatePlayerInfo() {
        const user = this.game.userManager.currentUser;
        if (!user) return;

        document.getElementById('player-name').textContent = user.username;
        document.getElementById('player-icon').textContent = user.isGuest ? '🎮' : '🧠';
    }

    displayQuestion(questionData, questionNumber) {
        // Update question number and text
        document.getElementById('question-number').textContent = `Question ${questionNumber}/${this.game.totalQuestions}`;
        document.getElementById('question-text').textContent = questionData.question;
        
        // Update difficulty badge
        const difficultyBadge = document.getElementById('difficulty-badge');
        difficultyBadge.textContent = questionData.difficulty;
        difficultyBadge.style.background = this.getDifficultyColor(questionData.difficulty);
        
        // Generate answer buttons
        this.generateAnswerButtons(questionData.options);
        
        // Update timer circle
        this.updateTimerCircle(100); // Start full
        
        // Update streak display
        this.updateStreakDisplay(this.game.streak);
    }

    generateAnswerButtons(options) {
        const answersGrid = document.getElementById('answers-grid');
        answersGrid.innerHTML = '';
        
        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option;
            button.dataset.answer = option;
            button.addEventListener('click', (e) => {
                if (this.settings.sound) {
                    this.playSound('click');
                }
                this.game.checkAnswer(e.target.dataset.answer);
            });
            
            // Add animation delay
            button.style.animationDelay = `${index * 0.1}s`;
            
            answersGrid.appendChild(button);
        });
    }

    updateTimerCircle(percentage) {
        const timerPath = document.getElementById('timer-path');
        if (timerPath) {
            const circumference = 2 * Math.PI * 15.9155;
            const dasharray = `${(percentage / 100) * circumference} ${circumference}`;
            timerPath.style.strokeDasharray = dasharray;
        }
    }

    updateStreakDisplay(streak) {
        const streakFire = document.getElementById('streak-fire');
        const streakCount = document.getElementById('current-streak');
        
        if (streakFire && streakCount) {
            streakCount.textContent = streak;
            
            // Animate fire based on streak
            if (streak >= 10) {
                streakFire.textContent = '🔥';
                streakFire.style.animationDuration = '0.5s';
            } else if (streak >= 5) {
                streakFire.textContent = '🔥';
                streakFire.style.animationDuration = '1s';
            } else {
                streakFire.textContent = '🔥';
                streakFire.style.animationDuration = '2s';
            }
        }
    }

    showAnswerFeedback(isCorrect, correctAnswer) {
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        answerButtons.forEach(btn => {
            if (btn.dataset.answer === correctAnswer) {
                btn.classList.add('correct');
                if (this.settings.animations) {
                    btn.classList.add('pulse');
                }
            } else if (!isCorrect && btn.dataset.answer !== correctAnswer) {
                btn.classList.add('wrong');
            }
            
            btn.disabled = true;
        });
        
        // Play sound
        if (this.settings.sound) {
            this.playSound(isCorrect ? 'correct' : 'wrong');
        }
    }

    enableAnswerButtons() {
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong', 'pulse');
        });
    }

    showRoastMessage(roast) {
        const roastElement = document.getElementById('roast-message');
        if (!roastElement) return;
        
        roastElement.textContent = roast;
        roastElement.style.display = 'block';
        
        if (this.settings.animations) {
            roastElement.style.animation = 'roastAnimation 2.5s ease-in-out';
        }
        
        setTimeout(() => {
            roastElement.style.display = 'none';
        }, 2500);
    }

    showComboMessage(streak) {
        if (streak < 5) return; // Only show for significant streaks
        
        const comboElement = document.getElementById('combo-message');
        if (!comboElement) return;
        
        const messages = {
            5: "🔥 5x COMBO! 🔥",
            10: "⚡ 10x STREAK! ⚡", 
            15: "🌟 15x UNSTOPPABLE! 🌟",
            20: "💫 20x LEGENDARY! 💫"
        };
        
        const message = messages[streak] || `🔥 ${streak}x COMBO! 🔥`;
        comboElement.textContent = message;
        comboElement.style.display = 'block';
        
        if (this.settings.animations) {
            comboElement.style.animation = 'comboAnimation 1.5s ease-in-out';
        }
        
        setTimeout(() => {
            comboElement.style.display = 'none';
        }, 1500);
    }

    showLevelComplete(level, score, coinsEarned, timeBonus) {
        document.getElementById('completed-level').textContent = level;
        document.getElementById('level-score').textContent = score.toLocaleString();
        document.getElementById('coins-earned').textContent = coinsEarned;
        document.getElementById('time-bonus').textContent = timeBonus;
        
        // Calculate performance rating
        const performance = this.calculatePerformance(score, coinsEarned, this.game.streak);
        this.showPerformanceRating(performance);
        
        this.showScreen('level-complete-screen');
        
        if (this.settings.sound) {
            this.playSound('levelup');
        }
    }

    calculatePerformance(score, coins, streak) {
        let stars = 1;
        let text = "Good job!";
        
        if (score > 1500) {
            stars = 3;
            text = "Math Genius! 🌟";
        } else if (score > 1000) {
            stars = 2;
            text = "Excellent! ⭐";
        } else if (coins > 80) {
            stars = 2;
            text = "Wealthy Warrior! 💰";
        } else if (streak > 8) {
            stars = 2;
            text = "Hot Streak! 🔥";
        }
        
        return { stars, text };
    }

    showPerformanceRating(performance) {
        const starsElement = document.getElementById('rating-stars');
        const textElement = document.getElementById('performance-text');
        
        if (starsElement && textElement) {
            starsElement.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                const star = document.createElement('span');
                star.textContent = i < performance.stars ? '⭐' : '☆';
                starsElement.appendChild(star);
            }
            
            textElement.textContent = performance.text;
        }
    }

    showGameOver(level, coins, streak) {
        document.getElementById('final-level').textContent = level;
        document.getElementById('final-coins').textContent = coins;
        document.getElementById('final-streak').textContent = streak;
        
        const finalRoast = this.game.questionGenerator.getRandomRoast();
        document.getElementById('final-roast').textContent = finalRoast;
        
        this.showScreen('game-over-screen');
    }

    updateHealthBar(health) {
        const healthFill = document.getElementById('health-fill');
        if (!healthFill) return;
        
        healthFill.style.width = `${health}%`;
        
        // Update color based on health
        if (health > 60) {
            healthFill.style.background = 'linear-gradient(90deg, var(--success-color), #00ff7f)';
        } else if (health > 30) {
            healthFill.style.background = 'linear-gradient(90deg, var(--warning-color), #ffaa00)';
        } else {
            healthFill.style.background = 'linear-gradient(90deg, var(--primary-color), #ff0066)';
        }
        
        // Add pulse animation when health is low
        if (health <= 30 && this.settings.animations) {
            healthFill.classList.add('pulse');
        } else {
            healthFill.classList.remove('pulse');
        }
    }

    updateTimerDisplay(time) {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = time;
            
            // Update timer circle
            const percentage = (time / 30) * 100;
            this.updateTimerCircle(percentage);
            
            // Change color when time is running out
            if (time <= 10) {
                timerElement.style.color = 'var(--primary-color)';
                if (this.settings.animations && time <= 5) {
                    timerElement.classList.add('pulse');
                }
            } else {
                timerElement.style.color = 'var(--accent-color)';
                timerElement.classList.remove('pulse');
            }
        }
    }

    showPowerupEffect(powerupType) {
        const effects = {
            hint: { message: "💡 Hint Activated!", color: "var(--info-color)" },
            skip: { message: "⏩ Question Skipped!", color: "var(--warning-color)" },
            retry: { message: "🔄 Health Restored!", color: "var(--success-color)" },
            freeze: { message: "❄️ Time Frozen!", color: "var(--secondary-color)" }
        };
        
        const effect = effects[powerupType];
        if (effect && this.settings.animations) {
            this.showTempMessage(effect.message, effect.color);
        }
    }

    showTempMessage(message, color) {
        const tempMsg = document.createElement('div');
        tempMsg.textContent = message;
        tempMsg.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 1rem 2rem;
            border-radius: var(--border-radius);
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            z-index: 1000;
            animation: comboAnimation 1.5s ease-in-out;
        `;
        
        document.body.appendChild(tempMsg);
        
        setTimeout(() => {
            document.body.removeChild(tempMsg);
        }, 1500);
    }

    toggleSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        settingsPanel.classList.toggle('open');
    }

    playSound(type) {
        if (!this.settings.sound) return;
        
        const sounds = {
            correct: document.getElementById('correct-sound'),
            wrong: document.getElementById('wrong-sound'),
            levelup: document.getElementById('levelup-sound'),
            click: document.getElementById('click-sound')
        };
        
        const sound = sounds[type];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Sound play failed:', e));
        }
    }

    getDifficultyColor(difficulty) {
        const colors = {
            'Easy': 'var(--success-color)',
            'Medium': 'var(--warning-color)',
            'Hard': 'var(--error-color)',
            'Expert': '#cc00ff',
            'Master': 'var(--primary-color)'
        };
        
        return colors[difficulty] || 'var(--accent-color)';
    }

    showLoadingScreen() {
        this.showScreen('loading-screen');
        
        // Simulate loading progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.showScreen('splash-screen');
                }, 500);
            }
            
            const progressBar = document.querySelector('.loading-progress');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }, 200);
    }

    updateCoinsDisplay(coins) {
        const coinsElement = document.getElementById('coins-count');
        if (coinsElement) {
            // Animate coin change
            coinsElement.textContent = coins.toLocaleString();
            if (this.settings.animations) {
                coinsElement.classList.add('pulse');
                setTimeout(() => {
                    coinsElement.classList.remove('pulse');
                }, 500);
            }
        }
    }

    updateScoreDisplay(score) {
        const scoreElement = document.getElementById('score-count');
        if (scoreElement) {
            scoreElement.textContent = score.toLocaleString();
        }
    }

    showAchievement(badge) {
        if (!this.settings.animations) return;
        
        const achievement = document.createElement('div');
        achievement.className = 'achievement-popup';
        achievement.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${badge.name}</div>
            </div>
        `;
        
        achievement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gradient-accent);
            color: var(--dark-bg);
            padding: 1rem;
            border-radius: var(--border-radius);
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: var(--shadow-lg);
        `;
        
        document.body.appendChild(achievement);
        
        setTimeout(() => {
            achievement.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => {
                document.body.removeChild(achievement);
            }, 500);
        }, 3000);
    }
}

// Add CSS for achievement animations
const achievementStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.achievement-popup {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--gradient-accent);
    color: var(--dark-bg);
    padding: 1rem;
    border-radius: var(--border-radius);
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    z-index: 1000;
    animation: slideInRight 0.5s ease-out;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: var(--shadow-lg);
}

.achievement-icon {
    font-size: 2rem;
}

.achievement-content {
    display: flex;
    flex-direction: column;
}

.achievement-title {
    font-size: 0.8rem;
    opacity: 0.8;
}

.achievement-name {
    font-size: 1rem;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = achievementStyles;
document.head.appendChild(styleSheet);