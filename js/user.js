class UserManager {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('mathWarsUsers')) || {};
        this.guestId = 1;
        this.stats = JSON.parse(localStorage.getItem('mathWarsStats')) || {
            totalGames: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            totalCoins: 0,
            highestLevel: 1,
            longestStreak: 0
        };
    }

    register(username, password) {
        // Validate username
        if (username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters!' };
        }
        
        if (username.length > 20) {
            return { success: false, message: 'Username must be less than 20 characters!' };
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { success: false, message: 'Username can only contain letters, numbers, and underscores!' };
        }

        // Validate password
        if (password.length < 4) {
            return { success: false, message: 'Password must be at least 4 characters!' };
        }

        if (this.users[username]) {
            return { success: false, message: 'Username already exists!' };
        }

        this.users[username] = {
            password: password,
            level: 1,
            coins: 100, // Starting bonus
            streak: 0,
            bestStreak: 0,
            badges: ['welcome'],
            totalScore: 0,
            gamesPlayed: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            playTime: 0,
            createdAt: new Date().toISOString(),
            lastPlayed: new Date().toISOString()
        };

        this.saveUsers();
        return { 
            success: true, 
            message: 'Registration successful! You received 100 bonus coins! 🎉' 
        };
    }

    login(username, password) {
        const user = this.users[username];
        if (!user) {
            return { success: false, message: 'User not found!' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Invalid password!' };
        }

        this.currentUser = {
            username: username,
            ...user
        };

        // Update last played
        this.currentUser.lastPlayed = new Date().toISOString();
        this.users[username].lastPlayed = this.currentUser.lastPlayed;
        this.saveUsers();

        return { 
            success: true, 
            message: `Welcome back, ${username}! Ready for some math battles? ⚔️` 
        };
    }

    loginAsGuest() {
        const guestUsername = `Guest_${this.guestId++}`;
        this.currentUser = {
            username: guestUsername,
            level: 1,
            coins: 50, // Less coins for guests
            streak: 0,
            bestStreak: 0,
            badges: ['guest'],
            totalScore: 0,
            gamesPlayed: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            playTime: 0,
            isGuest: true,
            createdAt: new Date().toISOString()
        };
        return { 
            success: true, 
            message: `Playing as ${guestUsername}! Guest progress saves locally.` 
        };
    }

    updateUserProgress(level, coinsEarned, streak, score = 0, correctAnswers = 0, totalAnswers = 0, playTime = 0) {
        if (!this.currentUser) return;

        // Update current session
        this.currentUser.level = Math.max(this.currentUser.level, level);
        this.currentUser.coins += coinsEarned;
        this.currentUser.streak = streak;
        this.currentUser.totalScore += score;
        this.currentUser.correctAnswers += correctAnswers;
        this.currentUser.totalAnswers += totalAnswers;
        this.currentUser.playTime += playTime;
        this.currentUser.gamesPlayed++;
        
        if (streak > this.currentUser.bestStreak) {
            this.currentUser.bestStreak = streak;
        }

        // Update global stats
        this.stats.totalGames++;
        this.stats.totalQuestions += totalAnswers;
        this.stats.totalCorrect += correctAnswers;
        this.stats.totalCoins += coinsEarned;
        this.stats.highestLevel = Math.max(this.stats.highestLevel, level);
        this.stats.longestStreak = Math.max(this.stats.longestStreak, streak);

        // Check for badge achievements
        const newBadges = this.checkBadges();
        
        // Update in storage if not guest
        if (!this.currentUser.isGuest) {
            this.users[this.currentUser.username] = {
                ...this.users[this.currentUser.username],
                level: this.currentUser.level,
                coins: this.currentUser.coins,
                streak: this.currentUser.streak,
                bestStreak: this.currentUser.bestStreak,
                badges: this.currentUser.badges,
                totalScore: this.currentUser.totalScore,
                gamesPlayed: this.currentUser.gamesPlayed,
                correctAnswers: this.currentUser.correctAnswers,
                totalAnswers: this.currentUser.totalAnswers,
                playTime: this.currentUser.playTime,
                lastPlayed: new Date().toISOString()
            };

            this.saveUsers();
            this.saveStats();
        }

        return newBadges;
    }

    checkBadges() {
        const badges = [
            // Level badges
            { id: 'welcome', name: 'Welcome Warrior', condition: () => true, hidden: true },
            { id: 'guest', name: 'Guest Explorer', condition: () => this.currentUser.isGuest, hidden: true },
            { id: 'level_10', name: 'Novice Warrior', condition: () => this.currentUser.level >= 10 },
            { id: 'level_25', name: 'Math Knight', condition: () => this.currentUser.level >= 25 },
            { id: 'level_50', name: 'Algebra Master', condition: () => this.currentUser.level >= 50 },
            { id: 'level_100', name: 'Math Warlord', condition: () => this.currentUser.level >= 100 },
            
            // Streak badges
            { id: 'streak_5', name: 'Getting Hot', condition: () => this.currentUser.bestStreak >= 5 },
            { id: 'streak_10', name: 'Hot Streak', condition: () => this.currentUser.bestStreak >= 10 },
            { id: 'streak_25', name: 'Unstoppable', condition: () => this.currentUser.bestStreak >= 25 },
            { id: 'streak_50', name: 'Legendary Streak', condition: () => this.currentUser.bestStreak >= 50 },
            
            // Coin badges
            { id: 'coins_500', name: 'Wealthy Warrior', condition: () => this.currentUser.coins >= 500 },
            { id: 'coins_1000', name: 'Math Millionaire', condition: () => this.currentUser.coins >= 1000 },
            { id: 'coins_5000', name: 'Math Tycoon', condition: () => this.currentUser.coins >= 5000 },
            
            // Accuracy badges
            { id: 'accuracy_80', name: 'Precision Master', condition: () => this.getAccuracy() >= 80 },
            { id: 'accuracy_90', name: 'Math Genius', condition: () => this.getAccuracy() >= 90 },
            { id: 'accuracy_95', name: 'Perfect Calculator', condition: () => this.getAccuracy() >= 95 },
            
            // Gameplay badges
            { id: 'games_10', name: 'Battle Veteran', condition: () => this.currentUser.gamesPlayed >= 10 },
            { id: 'games_50', name: 'War Commander', condition: () => this.currentUser.gamesPlayed >= 50 },
            { id: 'score_10000', name: 'High Scorer', condition: () => this.currentUser.totalScore >= 10000 }
        ];

        const newBadges = [];
        badges.forEach(badge => {
            if (badge.condition() && !this.currentUser.badges.includes(badge.id)) {
                this.currentUser.badges.push(badge.id);
                if (!badge.hidden) {
                    newBadges.push(badge);
                }
            }
        });

        return newBadges;
    }

    getAccuracy() {
        if (this.currentUser.totalAnswers === 0) return 0;
        return Math.round((this.currentUser.correctAnswers / this.currentUser.totalAnswers) * 100);
    }

    getStats() {
        return {
            accuracy: this.getAccuracy(),
            averageScore: this.currentUser.gamesPlayed > 0 ? 
                Math.round(this.currentUser.totalScore / this.currentUser.gamesPlayed) : 0,
            playTime: this.formatPlayTime(this.currentUser.playTime),
            badgesCount: this.currentUser.badges.length
        };
    }

    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    useCoins(amount) {
        if (this.currentUser.coins >= amount) {
            this.currentUser.coins -= amount;
            
            if (!this.currentUser.isGuest) {
                this.users[this.currentUser.username].coins = this.currentUser.coins;
                this.saveUsers();
            }
            
            return true;
        }
        return false;
    }

    getLeaderboard() {
        const users = Object.entries(this.users)
            .map(([username, data]) => ({
                username,
                level: data.level,
                totalScore: data.totalScore,
                coins: data.coins,
                bestStreak: data.bestStreak,
                accuracy: data.totalAnswers > 0 ? 
                    Math.round((data.correctAnswers / data.totalAnswers) * 100) : 0
            }))
            .sort((a, b) => b.level - a.level || b.totalScore - a.totalScore);

        return users.slice(0, 10); // Top 10
    }

    saveUsers() {
        localStorage.setItem('mathWarsUsers', JSON.stringify(this.users));
    }

    saveStats() {
        localStorage.setItem('mathWarsStats', JSON.stringify(this.stats));
    }

    exportData() {
        return {
            user: this.currentUser,
            stats: this.stats,
            timestamp: new Date().toISOString()
        };
    }

    importData(data) {
        if (data.user) {
            this.currentUser = data.user;
        }
        if (data.stats) {
            this.stats = data.stats;
        }
        this.saveUsers();
        this.saveStats();
    }

    logout() {
        this.currentUser = null;
    }

    deleteAccount(username) {
        if (this.users[username]) {
            delete this.users[username];
            this.saveUsers();
            if (this.currentUser && this.currentUser.username === username) {
                this.logout();
            }
            return true;
        }
        return false;
    }
}