// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game states
const GAME_STATE = {
    IDLE: 0,
    RUNNING: 1,
    PAUSED: 2,
    GAME_OVER: 3
};

// Game objects
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 60,
    speed: 5,
    dx: 0,
    color: '#00ff00'
};

const game = {
    state: GAME_STATE.IDLE,
    score: 0,
    level: 1,
    lives: 3,
    maxLives: 3,
    gameSpeed: 3,
    enemySpawnRate: 0.02,
    coinSpawnRate: 0.01,
    frameCount: 0,
    isPaused: false
};

let enemies = [];
let coins = [];
let particles = [];

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') e.preventDefault();
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game functions
function startGame() {
    if (game.state === GAME_STATE.IDLE) {
        game.state = GAME_STATE.RUNNING;
        game.score = 0;
        game.level = 1;
        game.lives = game.maxLives;
        game.gameSpeed = 3;
        enemies = [];
        coins = [];
        particles = [];
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('gameStatus').textContent = 'Game Started!';
        document.getElementById('gameStatus').classList.remove('warning');
        
        updateUI();
        gameLoop();
    }
}

function togglePause() {
    if (game.state === GAME_STATE.RUNNING) {
        game.state = GAME_STATE.PAUSED;
        document.getElementById('pauseBtn').textContent = 'RESUME';
        document.getElementById('gameStatus').textContent = 'Game Paused';
        document.getElementById('gameStatus').classList.add('warning');
    } else if (game.state === GAME_STATE.PAUSED) {
        game.state = GAME_STATE.RUNNING;
        document.getElementById('pauseBtn').textContent = 'PAUSE';
        document.getElementById('gameStatus').textContent = 'Game Running';
        document.getElementById('gameStatus').classList.remove('warning');
        gameLoop();
    }
}

function resetGame() {
    game.state = GAME_STATE.IDLE;
    game.score = 0;
    game.level = 1;
    game.lives = game.maxLives;
    game.gameSpeed = 3;
    enemies = [];
    coins = [];
    particles = [];
    player.x = canvas.width / 2 - 20;
    player.dx = 0;
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = 'PAUSE';
    document.getElementById('gameStatus').textContent = 'Ready to play! Click START GAME';
    document.getElementById('gameStatus').classList.remove('warning');
    
    updateUI();
    draw();
}

function updateUI() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('level').textContent = game.level;
    document.getElementById('lives').textContent = game.lives;
}

function handleInput() {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.dx = -player.speed;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.dx = player.speed;
    } else {
        player.dx = 0;
    }
}

function updatePlayer() {
    player.x += player.dx;
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function spawnEnemy() {
    const width = 40;
    const height = 60;
    const x = Math.random() * (canvas.width - width);
    
    enemies.push({
        x: x,
        y: -height,
        width: width,
        height: height,
        speed: game.gameSpeed + Math.random() * 2,
        color: '#ff0000'
    });
}

function spawnCoin() {
    const size = 15;
    const x = Math.random() * (canvas.width - size);
    
    coins.push({
        x: x,
        y: -size,
        width: size,
        height: size,
        speed: game.gameSpeed * 0.8,
        color: '#ffff00'
    });
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        
        // Check collision with player
        if (checkCollision(player, enemies[i])) {
            game.lives--;
            createExplosion(enemies[i].x, enemies[i].y);
            enemies.splice(i, 1);
            
            if (game.lives <= 0) {
                endGame();
            }
        } else if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            game.score += 10;
        }
    }
}

function updateCoins() {
    for (let i = coins.length - 1; i >= 0; i--) {
        coins[i].y += coins[i].speed;
        
        // Check collision with player
        if (checkCollision(player, coins[i])) {
            game.score += 50;
            createParticles(coins[i].x, coins[i].y, coins[i].color);
            coins.splice(i, 1);
        } else if (coins[i].y > canvas.height) {
            coins.splice(i, 1);
        }
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 20,
            color: color
        });
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 15,
            color: '#ff6600'
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].life--;
        
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function endGame() {
    game.state = GAME_STATE.GAME_OVER;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = 'PAUSE';
    document.getElementById('gameStatus').textContent = `GAME OVER! Final Score: ${game.score}`;
    document.getElementById('gameStatus').classList.add('warning');
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road markings
    drawRoad();
    
    // Draw game objects
    drawPlayer();
    drawEnemies();
    drawCoins();
    drawParticles();
}

function drawRoad() {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 10]);
    
    for (let i = 0; i < canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i);
        ctx.lineTo(canvas.width / 2, i + 20);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
}

function drawPlayer() {
    // Draw car body
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw car windows
    ctx.fillStyle = '#00aa00';
    ctx.fillRect(player.x + 5, player.y + 10, 30, 15);
    ctx.fillRect(player.x + 5, player.y + 30, 30, 12);
    
    // Draw wheels
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 5, player.y + 5, 8, 12);
    ctx.fillRect(player.x + 27, player.y + 5, 8, 12);
    ctx.fillRect(player.x + 5, player.y + 43, 8, 12);
    ctx.fillRect(player.x + 27, player.y + 43, 8, 12);
}

function drawEnemies() {
    for (let enemy of enemies) {
        // Draw car body
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Draw car windows
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(enemy.x + 5, enemy.y + 10, 30, 15);
        ctx.fillRect(enemy.x + 5, enemy.y + 30, 30, 12);
        
        // Draw wheels
        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 8, 12);
        ctx.fillRect(enemy.x + 27, enemy.y + 5, 8, 12);
        ctx.fillRect(enemy.x + 5, enemy.y + 43, 8, 12);
        ctx.fillRect(enemy.x + 27, enemy.y + 43, 8, 12);
    }
}

function drawCoins() {
    for (let coin of coins) {
        ctx.fillStyle = coin.color;
        ctx.beginPath();
        ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw star inside coin
        ctx.fillStyle = '#ffcc00';
        drawStar(coin.x + coin.width / 2, coin.y + coin.height / 2, 5, 5, 2);
    }
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
        rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function drawParticles() {
    for (let particle of particles) {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 20;
        ctx.fillRect(particle.x, particle.y, 4, 4);
        ctx.globalAlpha = 1.0;
    }
}

function update() {
    handleInput();
    updatePlayer();
    updateEnemies();
    updateCoins();
    updateParticles();
    
    // Spawn enemies
    if (Math.random() < game.enemySpawnRate) {
        spawnEnemy();
    }
    
    // Spawn coins
    if (Math.random() < game.coinSpawnRate) {
        spawnCoin();
    }
    
    // Increase difficulty
    game.frameCount++;
    if (game.frameCount % 500 === 0) {
        game.level++;
        game.gameSpeed += 1;
        game.enemySpawnRate += 0.005;
        game.coinSpawnRate += 0.003;
    }
    
    updateUI();
}

function gameLoop() {
    if (game.state === GAME_STATE.RUNNING) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    } else if (game.state === GAME_STATE.PAUSED) {
        draw();
    }
}

// Initial setup
resetGame();