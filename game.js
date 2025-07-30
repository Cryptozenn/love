// Game state variables
let score = 0;
let currentLevel = 1;
let timeLeft = 60;
let gameActive = false;
let bonusProgress = 0;
let bonusReady = false;
let rainProgress = 0;
let rainReady = false;
let gameTimer;
let itemSpawnTimer;
let backgroundTimer;

// Bonus game variables
let bonusActive = false;
let bonusTimeLeft = 15;
let bonusTimer;
let bubbleHearts = [];
let currentShooterHeart = '💕';
let bonusScore = 0;

// Rain bonus variables
let rainActive = false;
let rainTimeLeft = 15;
let rainTimer;
let rainItemTimer;
let rainScore = 0;

// High score variables - using session storage for shared scores
let highScores = [];
let isNewRecord = false;

// Sound variables
let soundEnabled = true;
let audioContext;

// DOM elements
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const currentLevelElement = document.getElementById('currentLevel');
const loveLevelElement = document.getElementById('loveLevel');
const heartFillElement = document.getElementById('heartFill');
const levelProgressElement = document.getElementById('levelProgress');
const bonusFillElement = document.getElementById('bonusFill');
const bonusProgressElement = document.getElementById('bonusProgress');
const bonusIndicatorElement = document.getElementById('bonusIndicator');
const rainFillElement = document.getElementById('rainFill');
const rainProgressElement = document.getElementById('rainProgress');
const rainIndicatorElement = document.getElementById('rainIndicator');
const gameArea = document.getElementById('gameArea');
const bonusGame = document.getElementById('bonusGame');
const rainBonus = document.getElementById('rainBonus');
const bonusTimerElement = document.getElementById('bonusTimer');
const rainTimerElement = document.getElementById('rainTimer');
const shooterElement = document.getElementById('shooter');
const floatingHeartsContainer = document.querySelector('.floating-hearts');
const confettiContainer = document.getElementById('confettiContainer');
const startScreen = document.getElementById('startScreen');
const soundToggle = document.getElementById('soundToggle');
const highScoresModal = document.getElementById('highScoresModal');
const highScoresList = document.getElementById('highScoresList');
const scoreStats = document.getElementById('scoreStats');
const gameOverModal = document.getElementById('gameOverModal');

// Game data
const hearts = ['💖', '💕', '💗', '💝', '💘', '💞'];
const kisses = ['💋', '😘', '😗', '💏'];
const bonusHeartColors = ['💖', '💕', '💗', '💝', '💘'];
const timerItems = ['⏰', '⏱️', '⌚'];
const rainTriggerItems = ['🎀', '💎', '🎁💜'];

const loveLevels = [
    { level: 1, name: "Beginner", pointsNeeded: 100 },
    { level: 2, name: "A Little in Love", pointsNeeded: 200 },
    { level: 3, name: "In Love", pointsNeeded: 350 },
    { level: 4, name: "Very Much in Love", pointsNeeded: 550 },
    { level: 5, name: "Head Over Heels", pointsNeeded: 800 },
    { level: 6, name: "Unconditional Love", pointsNeeded: 1100 },
    { level: 7, name: "Soulmates", pointsNeeded: 1500 },
    { level: 8, name: "Eternal Love", pointsNeeded: 2000 },
    { level: 9, name: "Cosmic Connection", pointsNeeded: 2600 },
    { level: 10, name: "Ultimate Love", pointsNeeded: 3300 }
];

// Sound functions
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
        soundEnabled = false;
    }
}

function playSound(frequency, type = 'sine', duration = 0.2, volume = 0.1) {
    if (!soundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Sound play error:', e);
    }
}

function playClickSound() {
    playSound(800, 'sine', 0.15, 0.08);
}

function playBonusSound() {
    setTimeout(() => playSound(523, 'sine', 0.2, 0.1), 0);
    setTimeout(() => playSound(659, 'sine', 0.2, 0.1), 100);
    setTimeout(() => playSound(784, 'sine', 0.3, 0.1), 200);
}

function playLevelUpSound() {
    setTimeout(() => playSound(440, 'square', 0.15, 0.1), 0);
    setTimeout(() => playSound(554, 'square', 0.15, 0.1), 150);
    setTimeout(() => playSound(659, 'square', 0.15, 0.1), 300);
    setTimeout(() => playSound(880, 'square', 0.3, 0.1), 450);
}

function playRainSound() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            playSound(200 + Math.random() * 400, 'sawtooth', 0.1, 0.05);
        }, i * 50);
    }
}

function playTimeSound() {
    playSound(1000, 'triangle', 0.25, 0.08);
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled && !audioContext) {
        initAudio();
    }
}

// High score functions - using both localStorage and sessionStorage for better sharing
function loadHighScores() {
    try {
        // Try to load from localStorage first
        let saved = localStorage.getItem('loveGameHighScores');
        if (!saved) {
            // If not found, try sessionStorage
            saved = sessionStorage.getItem('loveGameHighScores');
        }
        
        if (saved) {
            highScores = JSON.parse(saved);
        } else {
            // Default high scores
            highScores = [
                { name: "Emma", score: 400, level: 4, date: new Date().toLocaleDateString('en-US') },
                { name: "Alex", score: 350, level: 3, date: new Date().toLocaleDateString('en-US') },
                { name: "Sam", score: 300, level: 3, date: new Date().toLocaleDateString('en-US') }
            ];
            saveHighScores();
        }
    } catch (e) {
        console.log('Could not load high scores:', e);
        highScores = [
            { name: "Emma", score: 400, level: 4, date: new Date().toLocaleDateString('en-US') },
            { name: "Alex", score: 350, level: 3, date: new Date().toLocaleDateString('en-US') },
            { name: "Sam", score: 300, level: 3, date: new Date().toLocaleDateString('en-US') }
        ];
    }
}

function saveHighScores() {
    try {
        // Save to both localStorage and sessionStorage
        const scoresData = JSON.stringify(highScores);
        localStorage.setItem('loveGameHighScores', scoresData);
        sessionStorage.setItem('loveGameHighScores', scoresData);
    } catch (e) {
        console.log('Could not save high scores:', e);
    }
}

function addHighScore(name, score, level) {
    const finalLevel = loveLevels.find(l => l.level === level);
    const newScore = {
        name: name.trim() || 'Anonymous Love Knight',
        score: score,
        level: level,
        levelName: finalLevel ? finalLevel.name : 'Unknown',
        date: new Date().toLocaleDateString('en-US')
    };

    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 10);
    
    saveHighScores();
    return highScores.findIndex(s => s === newScore) + 1;
}

function isHighScore(score) {
    return highScores.length < 10 || score > highScores[highScores.length - 1].score;
}

function showHighScores() {
    highScoresModal.style.display = 'flex';
    updateHighScoresDisplay();
}

function hideHighScores() {
    highScoresModal.style.display = 'none';
}

function clearHighScores() {
    if (confirm('Are you sure you want to clear all high scores? This cannot be undone!')) {
        highScores = [];
        saveHighScores();
        updateHighScoresDisplay();
        updateTopThreeDisplay();
    }
}

function updateHighScoresDisplay() {
    if (highScores.length === 0) {
        highScoresList.innerHTML = '<div class="no-scores">No scores yet! Play the game to be the first! 💕</div>';
        scoreStats.innerHTML = '';
        return;
    }

    let html = '';
    highScores.forEach((score, index) => {
        const rank = index + 1;
        let rankClass = '';
        let badge = '';
        
        if (rank === 1) {
            rankClass = 'mvp';
            badge = '👑';
        } else if (rank <= 3) {
            rankClass = 'top3';
            badge = rank === 2 ? '🥈' : '🥉';
        } else if (rank <= 5) {
            badge = '⭐';
        } else {
            badge = '💕';
        }

        html += `
            <div class="score-entry ${rankClass}">
                <div class="rank ${rankClass}">#${rank}</div>
                <div class="player-name">${score.name}</div>
                <div class="player-score">${score.score}</div>
                <div class="badge">${badge}</div>
            </div>
        `;
    });

    highScoresList.innerHTML = html;

    const totalGames = highScores.length;
    const averageScore = Math.round(highScores.reduce((sum, s) => sum + s.score, 0) / totalGames);
    const highestScore = highScores[0].score;
    
    scoreStats.innerHTML = `
        <strong>📊 Statistics</strong><br>
        👑 MVP: ${highScores[0].name} (${highestScore} points)<br>
        📈 Average Score: ${averageScore}<br>
        🎮 Games Played: ${totalGames}
    `;
}

function updateTopThreeDisplay() {
    const topThreeList = document.getElementById('topThreeList');
    if (!topThreeList) return;
    
    const topThree = highScores.slice(0, 3);
    
    if (topThree.length === 0) {
        topThreeList.innerHTML = '<div style="text-align: center; color: #999;">No scores yet!</div>';
        return;
    }
    
    let html = '';
    topThree.forEach((entry, index) => {
        const badge = index === 0 ? '👑' : index === 1 ? '🥈' : '🥉';
        const title = index === 0 ? 'MVP' : index === 1 ? '2nd place' : '3rd place';
        html += `<div>${badge} <strong>${entry.name}</strong>: ${entry.score} points (${title})</div>`;
    });
    
    topThreeList.innerHTML = html;
}

function updateBonusDisplay() {
    const percentage = Math.min(100, (bonusProgress / 15) * 100);
    bonusFillElement.style.width = percentage + '%';
    bonusProgressElement.textContent = `${bonusProgress}/15`;
    
    if (bonusReady) {
        bonusProgressElement.textContent = 'READY!';
        bonusIndicatorElement.style.display = 'block';
    } else {
        bonusIndicatorElement.style.display = 'none';
    }
}

function updateRainDisplay() {
    const percentage = Math.min(100, (rainProgress / 8) * 100);
    rainFillElement.style.width = percentage + '%';
    rainProgressElement.textContent = `${rainProgress}/8`;
    
    if (rainReady) {
        rainProgressElement.textContent = 'READY!';
        rainIndicatorElement.style.display = 'block';
    } else {
        rainIndicatorElement.style.display = 'none';
    }
}

// Game functions
function startGame() {
    if (!audioContext) {
        initAudio();
    }
    
    startScreen.style.display = 'none';
    gameActive = true;
    score = 0;
    currentLevel = 1;
    timeLeft = 60;
    bonusProgress = 0;
    bonusReady = false;
    rainProgress = 0;
    rainReady = false;
    isNewRecord = false;
    
    updateDisplay();
    updateBonusDisplay();
    updateRainDisplay();
    
    playLevelUpSound();
    
    gameTimer = setInterval(() => {
        if (!bonusActive && !rainActive) {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                endGame();
            }
        }
    }, 1000);
    
    const spawnRate = window.innerWidth <= 768 ? 900 : 700;
    itemSpawnTimer = setInterval(createFallingItem, spawnRate);
    backgroundTimer = setInterval(createBackgroundHeart, 2000);
    
    for (let i = 0; i < 5; i++) {
        setTimeout(createBackgroundHeart, i * 400);
    }
}

function endGame() {
    gameActive = false;
    bonusActive = false;
    rainActive = false;
    clearInterval(gameTimer);
    clearInterval(itemSpawnTimer);
    clearInterval(backgroundTimer);
    clearInterval(bonusTimer);
    clearInterval(rainTimer);
    clearInterval(rainItemTimer);
    
    document.querySelectorAll('.falling-item').forEach(item => item.remove());
    bonusGame.style.display = 'none';
    rainBonus.style.display = 'none';
    
    showGameOver();
}

function restartGame() {
    gameOverModal.style.display = 'none';
    highScoresModal.style.display = 'none';
    startScreen.style.display = 'flex';
}

function updateScore(points) {
    score += points;
    scoreElement.textContent = score;
    checkLevelUp();
    updateLevelProgress();
}

function addTime(seconds) {
    timeLeft += seconds;
    timerElement.textContent = timeLeft;
    showTimeBonus(seconds);
    playTimeSound();
}

function showTimeBonus(seconds) {
    const popup = document.createElement('div');
    popup.classList.add('time-bonus-popup');
    popup.textContent = `+${seconds}s`;
    popup.style.left = '50%';
    popup.style.top = '100px';
    popup.style.transform = 'translateX(-50%)';
    
    gameArea.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 1500);
}

// Bonus game functions
function triggerBonusGame() {
    if (!bonusReady || bonusActive || rainActive) return;
    
    bonusActive = true;
    bonusReady = false;
    bonusProgress = 0;
    bonusTimeLeft = 15;
    bonusScore = 0;
    bubbleHearts = [];
    
    updateBonusDisplay();
    
    bonusGame.style.display = 'block';
    setupBonusGame();
    
    bonusTimer = setInterval(() => {
        bonusTimeLeft--;
        bonusTimerElement.textContent = bonusTimeLeft;
        
        if (bonusTimeLeft <= 0) {
            endBonusGame();
        }
    }, 1000);
}

function setupBonusGame() {
    // Clear any existing bubbles
    document.querySelectorAll('.bubble-heart').forEach(el => el.remove());
    bubbleHearts = [];
    
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 12; col++) {
            if (Math.random() > 0.3) {
                const bubble = document.createElement('div');
                bubble.classList.add('bubble-heart');
                
                const heartType = bonusHeartColors[Math.floor(Math.random() * bonusHeartColors.length)];
                bubble.textContent = heartType;
                bubble.dataset.color = heartType;
                
                const x = 100 + col * 60;
                const y = 150 + row * 60;
                
                bubble.style.left = x + 'px';
                bubble.style.top = y + 'px';
                bubble.style.transform = 'translate(-50%, -50%)';
                
                bubble.addEventListener('click', () => shootHeart(x, y, heartType));
                
                bonusGame.appendChild(bubble);
                bubbleHearts.push({ element: bubble, x, y, color: heartType });
            }
        }
    }
    
    currentShooterHeart = bonusHeartColors[Math.floor(Math.random() * bonusHeartColors.length)];
    shooterElement.textContent = currentShooterHeart;
}

function shootHeart(targetX, targetY, targetColor) {
    if (!bonusActive) return;
    
    const shootingHeart = document.createElement('div');
    shootingHeart.classList.add('shooting-heart');
    shootingHeart.textContent = currentShooterHeart;
    
    const shooterRect = shooterElement.getBoundingClientRect();
    const startX = shooterRect.left + shooterRect.width / 2;
    const startY = shooterRect.top;
    
    shootingHeart.style.left = startX + 'px';
    shootingHeart.style.top = startY + 'px';
    
    bonusGame.appendChild(shootingHeart);
    
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const duration = 500;
    
    shootingHeart.animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${deltaX}px, ${deltaY}px)` }
    ], {
        duration: duration,
        easing: 'ease-out'
    }).addEventListener('finish', () => {
        checkMatch(targetX, targetY, currentShooterHeart);
        shootingHeart.remove();
    });
}

function checkMatch(x, y, shooterColor) {
    const matchedBubbles = bubbleHearts.filter(bubble => {
        const distance = Math.sqrt((bubble.x - x) ** 2 + (bubble.y - y) ** 2);
        return distance < 80 && bubble.color === shooterColor;
    });
    
    if (matchedBubbles.length > 0) {
        matchedBubbles.forEach(bubble => {
            bonusScore += 50;
            
            const explosion = document.createElement('div');
            explosion.classList.add('match-explosion');
            explosion.textContent = '💥';
            explosion.style.left = bubble.x + 'px';
            explosion.style.top = bubble.y + 'px';
            bonusGame.appendChild(explosion);
            
            setTimeout(() => explosion.remove(), 1000);
            
            bubble.element.remove();
            bubbleHearts = bubbleHearts.filter(b => b !== bubble);
        });
        
        showPointsPopup(matchedBubbles.length * 50, x, y);
        playClickSound();
    }
    
    currentShooterHeart = bonusHeartColors[Math.floor(Math.random() * bonusHeartColors.length)];
    shooterElement.textContent = currentShooterHeart;
}

function endBonusGame() {
    bonusActive = false;
    clearInterval(bonusTimer);
    
    score += bonusScore;
    scoreElement.textContent = score;
    
    document.querySelectorAll('.bubble-heart, .shooting-heart, .match-explosion').forEach(el => el.remove());
    
    bonusGame.style.display = 'none';
    
    if (bonusScore > 0) {
        playBonusSound();
        
        const popup = document.createElement('div');
        popup.classList.add('bonus-popup');
        popup.innerHTML = `
            🎉 BONUS COMPLETE! 🎉<br>
            <div style="font-size: 18px; margin-top: 10px;">+${bonusScore} bonus points!</div>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 2000);
        
        createConfettiExplosion();
    }
    
    checkLevelUp();
    updateLevelProgress();
}

function showBonusReadyPopup() {
    playBonusSound();
    
    const popup = document.createElement('div');
    popup.classList.add('bonus-popup');
    popup.innerHTML = `
        🎯 BONUS READY! 🎯<br>
        <div style="font-size: 18px; margin-top: 10px;">Click anywhere to start Heart Shooter!</div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 2000);
}

function createConfettiExplosion() {
    const colors = ['#ff6b9d', '#ffc3e0', '#ff9ff3', '#f368e0', '#ffeb3b', '#4caf50', '#2196f3'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            
            confettiContainer.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 20);
    }
}

function showGameOver() {
    const finalLevel = loveLevels.find(level => level.level === currentLevel);
    isNewRecord = isHighScore(score);
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = finalLevel ? finalLevel.name : 'Unknown';
    
    const scoreMessage = document.getElementById('scoreMessage');
    if (score < 200) {
        scoreMessage.textContent = "Keep practicing showing your love! 💕";
    } else if (score < 500) {
        scoreMessage.textContent = "Not bad! You're getting quite smitten! 😍";
    } else if (score < 800) {
        scoreMessage.textContent = "Wow! You're truly head over heels! 💖";
    } else {
        scoreMessage.textContent = "INCREDIBLE! You're real soulmates! 👑💕";
    }
    
    const newRecordSection = document.getElementById('newRecordSection');
    const gameOverButtons = document.getElementById('gameOverButtons');
    
    if (isNewRecord) {
        newRecordSection.style.display = 'block';
        gameOverButtons.style.display = 'none';
        
        setTimeout(() => {
            const input = document.getElementById('playerName');
            if (input) input.focus();
        }, 100);
    } else {
        newRecordSection.style.display = 'none';
        gameOverButtons.style.display = 'block';
    }
    
    gameOverModal.style.display = 'flex';
}

function submitHighScore() {
    const nameInput = document.getElementById('playerName');
    const playerName = nameInput ? nameInput.value.trim() : '';
    
    if (!playerName) {
        alert('Please enter your name first!');
        return;
    }

    const rank = addHighScore(playerName, score, currentLevel);
    updateTopThreeDisplay();
    
    gameOverModal.style.display = 'none';
    
    const congratsDiv = document.createElement('div');
    congratsDiv.classList.add('level-up-popup');
    congratsDiv.innerHTML = `
        🎉 Score Saved! 🎉<br>
        <div style="font-size: 18px; margin-top: 10px;">Congratulations ${playerName}!</div>
        <div style="font-size: 16px; margin-top: 5px;">You're ranked #${rank} 🏆</div>
    `;
    
    document.body.appendChild(congratsDiv);
    
    setTimeout(() => {
        congratsDiv.remove();
        startScreen.style.display = 'flex';
    }, 3000);
    
    playBonusSound();
    createConfettiExplosion();
}

function updateDisplay() {
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    currentLevelElement.textContent = currentLevel;
    updateLevelProgress();
}

function createFallingItem() {
    if (!gameActive || bonusActive || rainActive) return;

    const item = document.createElement('div');
    item.classList.add('falling-item');
    
    const itemType = Math.random();
    let emoji, points, sizeClass;
    
    if (itemType < 0.02) {
        // Rain trigger items (2% chance - reduced from 5%)
        emoji = rainTriggerItems[Math.floor(Math.random() * rainTriggerItems.length)];
        sizeClass = 'rain-trigger-item';
        points = 'rain';
    } else if (itemType < 0.05) {
        // Timer items (3% chance)
        emoji = timerItems[Math.floor(Math.random() * timerItems.length)];
        sizeClass = 'timer-item';
        points = 'time';
    } else if (itemType < 0.65) {
        // Hearts (60% chance)
        emoji = hearts[Math.floor(Math.random() * hearts.length)];
        const size = Math.random();
        if (size < 0.5) {
            sizeClass = 'heart-small';
            points = 5;
        } else if (size < 0.8) {
            sizeClass = 'heart-medium';
            points = 10;
        } else {
            sizeClass = 'heart-large';
            points = 20;
        }
    } else {
        // Kisses (35% chance)
        emoji = kisses[Math.floor(Math.random() * kisses.length)];
        const size = Math.random();
        if (size < 0.5) {
            sizeClass = 'kiss-small';
            points = 8;
        } else if (size < 0.8) {
            sizeClass = 'kiss-medium';
            points = 15;
        } else {
            sizeClass = 'kiss-large';
            points = 25;
        }
    }
    
    item.textContent = emoji;
    item.classList.add(sizeClass);
    item.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    
    const duration = window.innerWidth <= 768 ? 4 + Math.random() * 2 : 3 + Math.random() * 3;
    item.style.animationDuration = `${duration}s, 2s`;
    
    item.addEventListener('click', () => {
        if (!gameActive || bonusActive || rainActive) return;
        
        playClickSound();
        
        if (points === 'time') {
            addTime(5);
            showPointsPopup('+5s', item.offsetLeft, item.offsetTop);
        } else if (points === 'rain') {
            // Increase rain progress more significantly
            rainProgress += 3;
            if (rainProgress >= 8 && !rainReady) {
                rainReady = true;
                rainProgress = 8;
                showRainReadyPopup();
            }
            updateRainDisplay();
            updateScore(75);
            showPointsPopup('+75', item.offsetLeft, item.offsetTop);
        } else {
            // Regular items also add to bonus progress occasionally
            if (Math.random() < 0.15) { // 15% chance for bonus progress
                bonusProgress++;
                if (bonusProgress >= 15 && !bonusReady) {
                    bonusReady = true;
                    bonusProgress = 15;
                    showBonusReadyPopup();
                }
                updateBonusDisplay();
            }
            
            updateScore(points);
            showPointsPopup(points, item.offsetLeft, item.offsetTop);
        }
        
        item.remove();
        createCelebrationHearts(item.offsetLeft, item.offsetTop);
    });
    
    gameArea.appendChild(item);
    
    setTimeout(() => {
        if (item.parentNode) {
            item.remove();
        }
    }, duration * 1000);
}

function showPointsPopup(points, x, y) {
    const popup = document.createElement('div');
    popup.classList.add('points-popup');
    popup.textContent = typeof points === 'string' ? points : `+${points}`;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    const container = rainActive ? rainBonus : (bonusActive ? bonusGame : gameArea);
    container.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 1000);
}

function createCelebrationHearts(x, y) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = '✨';
            heart.style.position = 'absolute';
            heart.style.left = (x + Math.random() * 40 - 20) + 'px';
            heart.style.top = (y + Math.random() * 40 - 20) + 'px';
            heart.style.fontSize = '16px';
            heart.style.pointerEvents = 'none';
            heart.style.animation = 'pointsFloat 0.8s ease-out forwards';
            heart.style.zIndex = '999';
            
            const container = rainActive ? rainBonus : (bonusActive ? bonusGame : gameArea);
            container.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.remove();
                }
            }, 800);
        }, i * 100);
    }
}

function createBackgroundHeart() {
    const heart = document.createElement('div');
    heart.classList.add('bg-heart');
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (20 + Math.random() * 30) + 'px';
    heart.style.animationDelay = Math.random() * 2 + 's';
    
    floatingHeartsContainer.appendChild(heart);
    
    setTimeout(() => {
        if (heart.parentNode) {
            heart.remove();
        }
    }, 8000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadHighScores();
    updateTopThreeDisplay();
    
    document.getElementById('startBtn').addEventListener('click', startGame);
    soundToggle.addEventListener('click', toggleSound);
    document.getElementById('highScoresToggle').addEventListener('click', showHighScores);
    document.getElementById('viewHighScoresBtn').addEventListener('click', showHighScores);
    document.getElementById('viewHighScoresFromGameOver').addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        showHighScores();
    });
    document.getElementById('closeHighScores').addEventListener('click', hideHighScores);
    document.getElementById('clearScoresBtn').addEventListener('click', clearHighScores);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('submitScoreBtn').addEventListener('click', submitHighScore);
    
    document.getElementById('playerName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitHighScore();
        }
    });
    
    highScoresModal.addEventListener('click', (e) => {
        if (e.target === highScoresModal) {
            hideHighScores();
        }
    });
    
    document.addEventListener('click', () => {
        if (!audioContext) {
            initAudio();
        }
    }, { once: true });
});
    }, 3000);
    
    gameArea.addEventListener('click', triggerBonusGame, { once: true });
}

// Rain bonus functions
function triggerRainBonus() {
    if (rainActive || bonusActive) return;
    
    rainActive = true;
    rainReady = false;
    rainProgress = 0;
    rainTimeLeft = 15;
    rainScore = 0;
    
    updateRainDisplay();
    playRainSound();
    
    const warning = document.createElement('div');
    warning.classList.add('rain-warning');
    warning.innerHTML = '🌧️ LOVE RAIN STARTING! 🌧️<br>DOUBLE POINTS!';
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
        rainBonus.style.display = 'block';
        startRainItems();
    }, 2000);
}

function showRainReadyPopup() {
    playBonusSound();
    
    const popup = document.createElement('div');
    popup.classList.add('bonus-popup', 'rain-popup');
    popup.innerHTML = `
        🌧️ RAIN READY! 🌧️<br>
        <div style="font-size: 18px; margin-top: 10px;">Click anywhere to start Love Rain!</div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 3000);
    
    gameArea.addEventListener('click', triggerRainBonus, { once: true });
}

function startRainItems() {
    if (!rainActive) return;
    
    const rainSpeed = window.innerWidth <= 768 ? 500 : 350;
    const itemCount = window.innerWidth <= 768 ? 8 : 12;
    
    rainItemTimer = setInterval(() => {
        for (let i = 0; i < itemCount; i++) {
            setTimeout(() => createRainItem(), i * 80);
        }
    }, rainSpeed);
    
    rainTimer = setInterval(() => {
        rainTimeLeft--;
        rainTimerElement.textContent = rainTimeLeft;
        
        if (rainTimeLeft <= 0) {
            endRainBonus();
        }
    }, 1000);
}

function createRainItem() {
    if (!rainActive) return;

    const item = document.createElement('div');
    item.classList.add('falling-item');
    
    const itemType = Math.random();
    let emoji, points, sizeClass;
    
    if (itemType < 0.6) {
        emoji = hearts[Math.floor(Math.random() * hearts.length)];
        const size = Math.random();
        if (size < 0.3) {
            sizeClass = 'heart-small';
            points = 10;
        } else if (size < 0.7) {
            sizeClass = 'heart-medium';
            points = 20;
        } else {
            sizeClass = 'heart-large';
            points = 40;
        }
    } else if (itemType < 0.85) {
        emoji = kisses[Math.floor(Math.random() * kisses.length)];
        const size = Math.random();
        if (size < 0.3) {
            sizeClass = 'kiss-small';
            points = 16;
        } else if (size < 0.7) {
            sizeClass = 'kiss-medium';
            points = 30;
        } else {
            sizeClass = 'kiss-large';
            points = 50;
        }
    } else {
        if (Math.random() > 0.5) {
            emoji = timerItems[Math.floor(Math.random() * timerItems.length)];
            sizeClass = 'timer-item';
            points = 'time';
        } else {
            emoji = rainTriggerItems[Math.floor(Math.random() * rainTriggerItems.length)];
            sizeClass = 'rain-trigger-item';
            points = 100;
        }
    }
    
    item.textContent = emoji;
    item.classList.add(sizeClass);
    item.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    
    const duration = window.innerWidth <= 768 ? 2 + Math.random() * 1.5 : 1.2 + Math.random() * 1;
    item.style.animationDuration = `${duration}s, 1s`;
    
    item.addEventListener('click', () => {
        if (!rainActive) return;
        
        playClickSound();
        
        if (points === 'time') {
            addTime(3);
        } else {
            rainScore += points;
        }
        
        showPointsPopup(points === 'time' ? '+3s' : `+${points}`, item.offsetLeft, item.offsetTop);
        item.remove();
        
        createCelebrationHearts(item.offsetLeft, item.offsetTop);
    });
    
    rainBonus.appendChild(item);
    
    setTimeout(() => {
        if (item.parentNode) {
            item.remove();
        }
    }, duration * 1000);
}

function endRainBonus() {
    rainActive = false;
    clearInterval(rainTimer);
    clearInterval(rainItemTimer);
    
    score += rainScore;
    scoreElement.textContent = score;
    
    document.querySelectorAll('.falling-item').forEach(el => {
        if (el.parentNode === rainBonus) {
            el.remove();
        }
    });
    
    rainBonus.style.display = 'none';
    
    if (rainScore > 0) {
        playBonusSound();
        
        const popup = document.createElement('div');
        popup.classList.add('bonus-popup', 'rain-popup');
        popup.innerHTML = `
            🌧️ RAIN COMPLETE! 🌧️<br>
            <div style="font-size: 18px; margin-top: 10px;">+${rainScore} bonus points!</div>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 3000);
        
        createConfettiExplosion();
    }
    
    checkLevelUp();
    updateLevelProgress();
}

function checkLevelUp() {
    const nextLevel = loveLevels.find(level => level.level === currentLevel + 1);
    if (nextLevel && score >= nextLevel.pointsNeeded) {
        currentLevel++;
        currentLevelElement.textContent = currentLevel;
        loveLevelElement.textContent = nextLevel.name;
        
        addTime(10);
        playLevelUpSound();
        
        showLevelUpPopup(nextLevel.name);
        createConfettiExplosion();
        
        updateLevelProgress();
    }
}

function updateLevelProgress() {
    const currentLevelData = loveLevels.find(level => level.level === currentLevel);
    const nextLevelData = loveLevels.find(level => level.level === currentLevel + 1);
    
    if (currentLevelData && nextLevelData) {
        const currentLevelPoints = currentLevel === 1 ? 0 : currentLevelData.pointsNeeded;
        const pointsInLevel = score - currentLevelPoints;
        const pointsNeededForNext = nextLevelData.pointsNeeded - currentLevelPoints;
        const percentage = Math.min(100, (pointsInLevel / pointsNeededForNext) * 100);
        
        heartFillElement.style.width = percentage + '%';
        levelProgressElement.textContent = `${pointsInLevel}/${pointsNeededForNext}`;
    } else if (currentLevel >= loveLevels.length) {
        heartFillElement.style.width = '100%';
        levelProgressElement.textContent = 'MAX LEVEL!';
    }
}

function showLevelUpPopup(levelName) {
    const popup = document.createElement('div');
    popup.classList.add('level-up-popup');
    popup.innerHTML = `
        🎉 LEVEL UP! 🎉<br>
        <div style="font-size: 18px; margin-top: 10px;">${levelName}</div>
        <div style="font-size: 16px; margin-top: 5px; color: #4caf50;">+10 seconds bonus!</div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();// Game state variables
let score = 0;
let currentLevel = 1;
let timeLeft = 60;
let gameActive = false;
let bonusProgress = 0;
let bonusReady = false;
let rainProgress = 0;
let rainReady = false;
let gameTimer;
let itemSpawnTimer;
let backgroundTimer;

// Bonus game variables
let bonusActive = false;
let bonusTimeLeft = 15;
let bonusTimer;
let bubbleHearts = [];
let currentShooterHeart = '💕';
let bonusScore = 0;

// Rain bonus variables
let rainActive = false;
let rainTimeLeft = 15;
let rainTimer;
let rainItemTimer;
let rainScore = 0;

// High score variables - using session storage for shared scores
let highScores = [];
let isNewRecord = false;

// Sound variables
let soundEnabled = true;
let audioContext;

// DOM elements
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const currentLevelElement = document.getElementById('currentLevel');
const loveLevelElement = document.getElementById('loveLevel');
const heartFillElement = document.getElementById('heartFill');
const levelProgressElement = document.getElementById('levelProgress');
const bonusFillElement = document.getElementById('bonusFill');
const bonusProgressElement = document.getElementById('bonusProgress');
const bonusIndicatorElement = document.getElementById('bonusIndicator');
const rainFillElement = document.getElementById('rainFill');
const rainProgressElement = document.getElementById('rainProgress');
const rainIndicatorElement = document.getElementById('rainIndicator');
const gameArea = document.getElementById('gameArea');
const bonusGame = document.getElementById('bonusGame');
const rain// Game state variables
let score = 0;
let currentLevel = 1;
let timeLeft = 60;
let gameActive = false;
let gameTimer;
let itemSpawnTimer;
let backgroundTimer;

// Bonus game variables
let bonusActive = false;
let bonusTimeLeft = 15;
let bonusTimer;
let bubbleHearts = [];
let currentShooterHeart = '💕';
let bonusScore = 0;

// Rain bonus variables
let rainActive = false;
let rainTimeLeft = 15; // Increased for mobile
let rainTimer;
let rainItemTimer;
let rainScore = 0;

// High score variables
let highScores = [];
let isNewRecord = false;

// Sound variables
let soundEnabled = true;
let audioContext;

// DOM elements
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const currentLevelElement = document.getElementById('currentLevel');
const loveLevelElement = document.getElementById('loveLevel');
const heartFillElement = document.getElementById('heartFill');
const levelProgressElement = document.getElementById('levelProgress');
const gameArea = document.getElementById('gameArea');
const bonusGame = document.getElementById('bonusGame');
const rainBonus = document.getElementById('rainBonus');
const bonusTimerElement = document.getElementById('bonusTimer');
const rainTimerElement = document.getElementById('rainTimer');
const shooterElement = document.getElementById('shooter');
const floatingHeartsContainer = document.querySelector('.floating-hearts');
const confettiContainer = document.getElementById('confettiContainer');
const startScreen = document.getElementById('startScreen');
const soundToggle = document.getElementById('soundToggle');
const highScoresModal = document.getElementById('highScoresModal');
const highScoresList = document.getElementById('highScoresList');
const scoreStats = document.getElementById('scoreStats');
const gameOverModal = document.getElementById('gameOverModal');

// Game data
const hearts = ['💖', '💕', '💗', '💝', '💘', '💞'];
const kisses = ['💋', '😘', '😗', '💏'];
const bonusHeartColors = ['💖', '💕', '💗', '💝', '💘'];
const timerItems = ['⏰', '⏱️', '⌚'];
const rainTriggerItems = ['🎀', '💎', '🎁💜'];

const loveLevels = [
    { level: 1, name: "Beginnend", pointsNeeded: 100 },
    { level: 2, name: "Een beetje verliefd", pointsNeeded: 200 },
    { level: 3, name: "Verliefd", pointsNeeded: 350 },
    { level: 4, name: "Heel verliefd", pointsNeeded: 550 },
    { level: 5, name: "Stapelgek", pointsNeeded: 800 },
    { level: 6, name: "Onvoorwaardelijke liefde", pointsNeeded: 1100 },
    { level: 7, name: "Zielsmaatjes", pointsNeeded: 1500 },
    { level: 8, name: "Eeuwige liefde", pointsNeeded: 2000 },
    { level: 9, name: "Kosmische verbinding", pointsNeeded: 2600 },
    { level: 10, name: "Ultieme liefde", pointsNeeded: 3300 }
];

// Sound functions
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
        soundEnabled = false;
    }
}

function playSound(frequency, type = 'sine', duration = 0.2, volume = 0.1) {
    if (!soundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Sound play error:', e);
    }
}

function playClickSound() {
    playSound(800, 'sine', 0.15, 0.08);
}

function playBonusSound() {
    setTimeout(() => playSound(523, 'sine', 0.2, 0.1), 0);
    setTimeout(() => playSound(659, 'sine', 0.2, 0.1), 100);
    setTimeout(() => playSound(784, 'sine', 0.3, 0.1), 200);
}

function playLevelUpSound() {
    setTimeout(() => playSound(440, 'square', 0.15, 0.1), 0);
    setTimeout(() => playSound(554, 'square', 0.15, 0.1), 150);
    setTimeout(() => playSound(659, 'square', 0.15, 0.1), 300);
    setTimeout(() => playSound(880, 'square', 0.3, 0.1), 450);
}

function playRainSound() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            playSound(200 + Math.random() * 400, 'sawtooth', 0.1, 0.05);
        }, i * 50);
    }
}

function playTimeSound() {
    playSound(1000, 'triangle', 0.25, 0.08);
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled && !audioContext) {
        initAudio();
    }
}

// High score functions
function loadHighScores() {
    try {
        const saved = localStorage.getItem('loveGameHighScores');
        if (saved) {
            highScores = JSON.parse(saved);
        } else {
            // Default high scores
            highScores = [
                { name: "Genni", score: 300, level: 3, date: new Date().toLocaleDateString('nl-NL') },
                { name: "Su", score: 250, level: 2, date: new Date().toLocaleDateString('nl-NL') },
                { name: "Sumalee", score: 450, level: 4, date: new Date().toLocaleDateString('nl-NL') }
            ];
            saveHighScores();
        }
    } catch (e) {
        console.log('Could not load high scores:', e);
        highScores = [
            { name: "Genni", score: 300, level: 3, date: new Date().toLocaleDateString('nl-NL') },
            { name: "Su", score: 250, level: 2, date: new Date().toLocaleDateString('nl-NL') },
            { name: "Sumalee", score: 450, level: 4, date: new Date().toLocaleDateString('nl-NL') }
        ];
    }
}

function saveHighScores() {
    try {
        localStorage.setItem('loveGameHighScores', JSON.stringify(highScores));
    } catch (e) {
        console.log('Could not save high scores:', e);
    }
}

function addHighScore(name, score, level) {
    const finalLevel = loveLevels.find(l => l.level === level);
    const newScore = {
        name: name.trim() || 'Anonieme Liefdesridder',
        score: score,
        level: level,
        levelName: finalLevel ? finalLevel.name : 'Onbekend',
        date: new Date().toLocaleDateString('nl-NL')
    };

    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 10); // Keep only top 10
    
    saveHighScores();
    return highScores.findIndex(s => s === newScore) + 1; // Return rank
}

function isHighScore(score) {
    return highScores.length < 10 || score > highScores[highScores.length - 1].score;
}

function showHighScores() {
    highScoresModal.style.display = 'flex';
    updateHighScoresDisplay();
}

function hideHighScores() {
    highScoresModal.style.display = 'none';
}

function clearHighScores() {
    if (confirm('Weet je zeker dat je alle high scores wilt wissen? Dit kan niet ongedaan gemaakt worden!')) {
        highScores = [];
        saveHighScores();
        updateHighScoresDisplay();
        updateTopThreeDisplay();
    }
}

function updateHighScoresDisplay() {
    if (highScores.length === 0) {
        highScoresList.innerHTML = '<div class="no-scores">Nog geen scores! Speel het spel om de eerste te zijn! 💕</div>';
        scoreStats.innerHTML = '';
        return;
    }

    let html = '';
    highScores.forEach((score, index) => {
        const rank = index + 1;
        let rankClass = '';
        let badge = '';
        
        if (rank === 1) {
            rankClass = 'mvp';
            badge = '👑';
        } else if (rank <= 3) {
            rankClass = 'top3';
            badge = rank === 2 ? '🥈' : '🥉';
        } else if (rank <= 5) {
            badge = '⭐';
        } else {
            badge = '💕';
        }

        html += `
            <div class="score-entry ${rankClass}">
                <div class="rank ${rankClass}">#${rank}</div>
                <div class="player-name">${score.name}</div>
                <div class="player-score">${score.score}</div>
                <div class="badge">${badge}</div>
            </div>
        `;
    });

    highScoresList.innerHTML = html;

    // Update stats
    const totalGames = highScores.length;
    const averageScore = Math.round(highScores.reduce((sum, s) => sum + s.score, 0) / totalGames);
    const highestScore = highScores[0].score;
    
    scoreStats.innerHTML = `
        <strong>📊 Statistieken</strong><br>
        👑 MVP: ${highScores[0].name} (${highestScore} punten)<br>
        📈 Gemiddelde Score: ${averageScore}<br>
        🎮 Totaal Gespeeld: ${totalGames} games
    `;
}

function updateTopThreeDisplay() {
    const topThreeList = document.getElementById('topThreeList');
    if (!topThreeList) return;
    
    const topThree = highScores.slice(0, 3);
    
    if (topThree.length === 0) {
        topThreeList.innerHTML = '<div style="text-align: center; color: #999;">Nog geen scores!</div>';
        return;
    }
    
    let html = '';
    topThree.forEach((entry, index) => {
        const badge = index === 0 ? '👑' : index === 1 ? '🥈' : '🥉';
        const title = index === 0 ? 'MVP' : index === 1 ? '2e plaats' : '3e plaats';
        html += `<div>${badge} <strong>${entry.name}</strong>: ${entry.score} punten (${title})</div>`;
    });
    
    topThreeList.innerHTML = html;
}

// Game functions
function startGame() {
    if (!audioContext) {
        initAudio();
    }
    
    startScreen.style.display = 'none';
    gameActive = true;
    score = 0;
    currentLevel = 1;
    timeLeft = 60;
    isNewRecord = false;
    
    updateDisplay();
    
    playLevelUpSound();
    
    gameTimer = setInterval(() => {
        if (!bonusActive && !rainActive) {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                endGame();
            }
        }
    }, 1000);
    
    // Slower spawn rate for mobile
    const spawnRate = window.innerWidth <= 768 ? 900 : 700;
    itemSpawnTimer = setInterval(createFallingItem, spawnRate);
    backgroundTimer = setInterval(createBackgroundHeart, 2000);
    
    for (let i = 0; i < 5; i++) {
        setTimeout(createBackgroundHeart, i * 400);
    }
}

function endGame() {
    gameActive = false;
    bonusActive = false;
    rainActive = false;
    clearInterval(gameTimer);
    clearInterval(itemSpawnTimer);
    clearInterval(backgroundTimer);
    clearInterval(bonusTimer);
    clearInterval(rainTimer);
    clearInterval(rainItemTimer);
    
    document.querySelectorAll('.falling-item').forEach(item => item.remove());
    bonusGame.style.display = 'none';
    rainBonus.style.display = 'none';
    
    showGameOver();
}

function restartGame() {
    gameOverModal.style.display = 'none';
    highScoresModal.style.display = 'none';
    startScreen.style.display = 'flex';
}

function updateScore(points) {
    score += points;
    scoreElement.textContent = score;
    checkLevelUp();
    updateLevelProgress();
}

function addTime(seconds) {
    timeLeft += seconds;
    timerElement.textContent = timeLeft;
    showTimeBonus(seconds);
    playTimeSound();
}

function showTimeBonus(seconds) {
    const popup = document.createElement('div');
    popup.classList.add('time-bonus-popup');
    popup.textContent = `+${seconds}s`;
    popup.style.left = '50%';
    popup.style.top = '100px';
    popup.style.transform = 'translateX(-50%)';
    
    gameArea.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 1500);
}

function triggerRainBonus() {
    if (rainActive || bonusActive) return;
    
    rainActive = true;
    rainTimeLeft = 15; // Longer for mobile
    rainScore = 0;
    
    playRainSound();
    
    const warning = document.createElement('div');
    warning.classList.add('rain-warning');
    warning.innerHTML = '🌧️ REGEN VAN LIEFDE BEGINT! 🌧️<br>DUBBELE PUNTEN!';
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
        rainBonus.style.display = 'block';
        startRainItems();
    }, 2000);
}

function startRainItems() {
    if (!rainActive) return;
    
    // Slower rain for mobile
    const rainSpeed = window.innerWidth <= 768 ? 500 : 350;
    const itemCount = window.innerWidth <= 768 ? 8 : 12;
    
    rainItemTimer = setInterval(() => {
        for (let i = 0; i < itemCount; i++) {
            setTimeout(() => createRainItem(), i * 80);
        }
    }, rainSpeed);
    
    rainTimer = setInterval(() => {
        rainTimeLeft--;
        rainTimerElement.textContent = rainTimeLeft;
        
        if (rainTimeLeft <= 0) {
            endRainBonus();
        }
    }, 1000);
}

function createRainItem() {
    if (!rainActive) return;

    const item = document.createElement('div');
    item.classList.add('falling-item');
    
    const itemType = Math.random();
    let emoji, points, sizeClass;
    
    if (itemType < 0.6) {
        emoji = hearts[Math.floor(Math.random() * hearts.length)];
        const size = Math.random();
        if (size < 0.3) {
            sizeClass = 'heart-small';
            points = 10;
        } else if (size < 0.7) {
            sizeClass = 'heart-medium';
            points = 20;
        } else {
            sizeClass = 'heart-large';
            points = 40;
        }
    } else if (itemType < 0.85) {
        emoji = kisses[Math.floor(Math.random() * kisses.length)];
        const size = Math.random();
        if (size < 0.3) {
            sizeClass = 'kiss-small';
            points = 16;
        } else if (size < 0.7) {
            sizeClass = 'kiss-medium';
            points = 30;
        } else {
            sizeClass = 'kiss-large';
            points = 50;
        }
    } else {
        if (Math.random() > 0.5) {
            emoji = timerItems[Math.floor(Math.random() * timerItems.length)];
            sizeClass = 'timer-item';
            points = 'time';
        } else {
            emoji = rainTriggerItems[Math.floor(Math.random() * rainTriggerItems.length)];
            sizeClass = 'rain-trigger-item';
            points = 100;
        }
    }
    
    item.textContent = emoji;
    item.classList.add(sizeClass);
    item.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    
    // Slower falling for mobile
    const duration = window.innerWidth <= 768 ? 2 + Math.random() * 1.5 : 1.2 + Math.random() * 1;
    item.style.animationDuration = `${duration}s, 1s`;
    
    item.addEventListener('click', () => {
        if (!rainActive) return;
        
        playClickSound();
        
        if (points === 'time') {
            addTime(3);
        } else {
            rainScore += points;
        }
        
        showPointsPopup(points === 'time' ? '+3s' : `+${points}`, item.offsetLeft, item.offsetTop);
        item.remove();
        
        createCelebrationHearts(item.offsetLeft, item.offsetTop);
    });
    
    rainBonus.appendChild(item);
    
    setTimeout(() => {
        if (item.parentNode) {
            item.remove();
        }
    }, duration * 1000);
}

function endRainBonus() {
    rainActive = false;
    clearInterval(rainTimer);
    clearInterval(rainItemTimer);
    
    score += rainScore;
    scoreElement.textContent = score;
    
    document.querySelectorAll('.falling-item').forEach(el => {
        if (el.parentNode === rainBonus) {
            el.remove();
        }
    });
    
    rainBonus.style.display = 'none';
    
    if (rainScore > 0) {
        playBonusSound();
        
        const popup = document.createElement('div');
        popup.classList.add('bonus-popup', 'rain-popup');
        popup.innerHTML = `
            🌧️ REGEN VOLTOOID! 🌧️<br>
            <div style="font-size: 18px; margin-top: 10px;">+${rainScore} bonus punten!</div>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 3000);
        
        createConfettiExplosion();
    }
    
    checkLevelUp();
    updateLevelProgress();
}

function checkLevelUp() {
    const nextLevel = loveLevels.find(level => level.level === currentLevel + 1);
    if (nextLevel && score >= nextLevel.pointsNeeded) {
        currentLevel++;
        currentLevelElement.textContent = currentLevel;
        loveLevelElement.textContent = nextLevel.name;
        
        addTime(10);
        playLevelUpSound();
        
        showLevelUpPopup(nextLevel.name);
        createConfettiExplosion();
        
        updateLevelProgress();
    }
}

function updateLevelProgress() {
    const currentLevelData = loveLevels.find(level => level.level === currentLevel);
    const nextLevelData = loveLevels.find(level => level.level === currentLevel + 1);
    
    if (currentLevelData && nextLevelData) {
        const currentLevelPoints = currentLevel === 1 ? 0 : currentLevelData.pointsNeeded;
        const pointsInLevel = score - currentLevelPoints;
        const pointsNeededForNext = nextLevelData.pointsNeeded - currentLevelPoints;
        const percentage = Math.min(100, (pointsInLevel / pointsNeededForNext) * 100);
        
        heartFillElement.style.width = percentage + '%';
        levelProgressElement.textContent = `${pointsInLevel}/${pointsNeededForNext}`;
    } else if (currentLevel >= loveLevels.length) {
        heartFillElement.style.width = '100%';
        levelProgressElement.textContent = 'MAX LEVEL!';
    }
}

function showLevelUpPopup(levelName) {
    const popup = document.createElement('div');
    popup.classList.add('level-up-popup');
    popup.innerHTML = `
        🎉 LEVEL UP! 🎉<br>
        <div style="font-size: 18px; margin-top: 10px;">${levelName}</div>
        <div style="font-size: 16px; margin-top: 5px; color: #4caf50;">+10 seconden bonus!</div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 2000);
}

function createConfettiExplosion() {
    const colors = ['#ff6b9d', '#ffc3e0', '#ff9ff3', '#f368e0', '#ffeb3b', '#4caf50', '#2196f3'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            
            confettiContainer.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 20);
    }
}

function showGameOver() {
    const finalLevel = loveLevels.find(level => level.level === currentLevel);
    isNewRecord = isHighScore(score);
    
    // Update final score display
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = finalLevel ? finalLevel.name : 'Onbekend';
    
    // Update score message
    const scoreMessage = document.getElementById('scoreMessage');
    if (score < 200) {
        scoreMessage.textContent = "Nog even oefenen met liefde tonen! 💕";
    } else if (score < 500) {
        scoreMessage.textContent = "Niet slecht! Je bent al aardig verliefd! 😍";
    } else if (score < 800) {
        scoreMessage.textContent = "Wow! Je bent echt stapelgek op elkaar! 💖";
    } else {
        scoreMessage.textContent = "ONGELOOFLIJK! Jullie zijn echte zielsmaatjes! 👑💕";
    }
    
    // Show/hide appropriate sections
    const newRecordSection = document.getElementById('newRecordSection');
    const gameOverButtons = document.getElementById('gameOverButtons');
    
    if (isNewRecord) {
        newRecordSection.style.display = 'block';
        gameOverButtons.style.display = 'none';
        
        // Focus on input field
        setTimeout(() => {
            const input = document.getElementById('playerName');
            if (input) input.focus();
        }, 100);
    } else {
        newRecordSection.style.display = 'none';
        gameOverButtons.style.display = 'block';
    }
    
    gameOverModal.style.display = 'flex';
}

function submitHighScore() {
    const nameInput = document.getElementById('playerName');
    const playerName = nameInput ? nameInput.value.trim() : '';
    
    if (!playerName) {
        alert('Voer eerst je naam in!');
        return;
    }

    const rank = addHighScore(playerName, score, currentLevel);
    
    // Update displays
    updateTopThreeDisplay();
    
    // Hide game over modal and show success message
    gameOverModal.style.display = 'none';
    
    const congratsDiv = document.createElement('div');
    congratsDiv.classList.add('level-up-popup');
    congratsDiv.innerHTML = `
        🎉 Score Opgeslagen! 🎉<br>
        <div style="font-size: 18px; margin-top: 10px;">Gefeliciteerd ${playerName}!</div>
        <div style="font-size: 16px; margin-top: 5px;">Je staat op plaats #${rank} 🏆</div>
    `;
    
    document.body.appendChild(congratsDiv);
    
    setTimeout(() => {
        congratsDiv.remove();
        startScreen.style.display = 'flex';
    }, 3000);
    
    // Play success sound and confetti
    playBonusSound();
    createConfettiExplosion();
}

function updateDisplay() {
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    currentLevelElement.textContent = currentLevel;
    updateLevelProgress();
}

function createFallingItem() {
    if (!gameActive || bonusActive || rainActive) return;

    const item = document.createElement('div');
    item.classList.add('falling-item');
    
    const itemType = Math.random();
    let emoji, points, sizeClass;
    
    if (itemType < 0.05) {
        // Rain trigger items (5% chance)
        emoji = rainTriggerItems[Math.floor(Math.random() * rainTriggerItems.length)];
        sizeClass = 'rain-trigger-item';
        points = 'rain';
    } else if (itemType < 0.08) {
        // Timer items (3% chance)
        emoji = timerItems[Math.floor(Math.random() * timerItems.length)];
        sizeClass = 'timer-item';
        points = 'time';
    } else if (itemType < 0.65) {
        // Hearts (57% chance)
        emoji = hearts[Math.floor(Math.random() * hearts.length)];
        const size = Math.random();
        if (size < 0.5) {
            sizeClass = 'heart-small';
            points = 5;
        } else if (size < 0.8) {
            sizeClass = 'heart-medium';
            points = 10;
        } else {
            sizeClass = 'heart-large';
            points = 20;
        }
    } else {
        // Kisses (35% chance)
        emoji = kisses[Math.floor(Math.random() * kisses.length)];
        const size = Math.random();
        if (size < 0.5) {
            sizeClass = 'kiss-small';
            points = 8;
        } else if (size < 0.8) {
            sizeClass = 'kiss-medium';
            points = 15;
        } else {
            sizeClass = 'kiss-large';
            points = 25;
        }
    }
    
    item.textContent = emoji;
    item.classList.add(sizeClass);
    item.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    
    // Slower falling speed for mobile
    const duration = window.innerWidth <= 768 ? 4 + Math.random() * 2 : 3 + Math.random() * 3;
    item.style.animationDuration = `${duration}s, 2s`;
    
    item.addEventListener('click', () => {
        if (!gameActive || bonusActive || rainActive) return;
        
        playClickSound();
        
        if (points === 'time') {
            addTime(5);
            showPointsPopup('+5s', item.offsetLeft, item.offsetTop);
        } else if (points === 'rain') {
            triggerRainBonus();
            updateScore(75);
            showPointsPopup('+75', item.offsetLeft, item.offsetTop);
        } else {
            updateScore(points);
            showPointsPopup(points, item.offsetLeft, item.offsetTop);
        }
        
        item.remove();
        createCelebrationHearts(item.offsetLeft, item.offsetTop);
    });
    
    gameArea.appendChild(item);
    
    setTimeout(() => {
        if (item.parentNode) {
            item.remove();
        }
    }, duration * 1000);
}

function showPointsPopup(points, x, y) {
    const popup = document.createElement('div');
    popup.classList.add('points-popup');
    popup.textContent = typeof points === 'string' ? points : `+${points}`;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    const container = rainActive ? rainBonus : (bonusActive ? bonusGame : gameArea);
    container.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 1000);
}

function createCelebrationHearts(x, y) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = '✨';
            heart.style.position = 'absolute';
            heart.style.left = (x + Math.random() * 40 - 20) + 'px';
            heart.style.top = (y + Math.random() * 40 - 20) + 'px';
            heart.style.fontSize = '16px';
            heart.style.pointerEvents = 'none';
            heart.style.animation = 'pointsFloat 0.8s ease-out forwards';
            heart.style.zIndex = '999';
            
            const container = rainActive ? rainBonus : (bonusActive ? bonusGame : gameArea);
            container.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.remove();
                }
            }, 800);
        }, i * 100);
    }
}

function createBackgroundHeart() {
    const heart = document.createElement('div');
    heart.classList.add('bg-heart');
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (20 + Math.random() * 30) + 'px';
    heart.style.animationDelay = Math.random() * 2 + 's';
    
    floatingHeartsContainer.appendChild(heart);
    
    setTimeout(() => {
        if (heart.parentNode) {
            heart.remove();
        }
    }, 8000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load high scores and update display
    loadHighScores();
    updateTopThreeDisplay();
    
    // Start button
    document.getElementById('startBtn').addEventListener('click', startGame);
    
    // Sound toggle
    soundToggle.addEventListener('click', toggleSound);
    
    // High scores toggle
    document.getElementById('highScoresToggle').addEventListener('click', showHighScores);
    
    // View high scores from start screen
    document.getElementById('viewHighScoresBtn').addEventListener('click', showHighScores);
    
    // View high scores from game over
    document.getElementById('viewHighScoresFromGameOver').addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        showHighScores();
    });
    
    // Close high scores modal
    document.getElementById('closeHighScores').addEventListener('click', hideHighScores);
    
    // Clear scores button
    document.getElementById('clearScoresBtn').addEventListener('click', clearHighScores);
    
    // Restart button
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    // Submit score button
    document.getElementById('submitScoreBtn').addEventListener('click', submitHighScore);
    
    // Enter key to submit score
    document.getElementById('playerName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitHighScore();
        }
    });
    
    // Click outside modal to close
    highScoresModal.addEventListener('click', (e) => {
        if (e.target === highScoresModal) {
            hideHighScores();
        }
    });
    
    // Initialize audio context on first user interaction
    document.addEventListener('click', () => {
        if (!audioContext) {
            initAudio();
        }
    }, { once: true });
});
