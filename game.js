// Game variables
let canvas, ctx;
let ball, paddle;
let bricks = [];
let score = 0;
let highScore = 10000; // Default high score
let lives = 3;
let level = 1;
let gameState = 'start'; // start, ready, playing, paused, levelComplete, gameOver
let powerUps = [];
let lastTime = 0;
let speedFactor = 1.0; // Normal speed (adjustable)
let ballOnPaddle = true; // Ball starts on the paddle
let spacePressed = false;

// Current time and user information
const CURRENT_TIMESTAMP = "2025-04-03 17:08:13";
const CURRENT_USER = "Ricky-bruh";

// Easter egg variables
let konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;
let secretClicks = 0;
let easterEggsFound = [];
let specialEffectTimer = 0;
let catchEnabled = false;

// Notification system
let notificationTimer = null;
let notificationDuration = 3000; // 3 seconds

// Sound effects
let sounds = {};

// Constants
const BALL_RADIUS = 8;
const PADDLE_HEIGHT = 15;
const PADDLE_WIDTH = 80;
const BRICK_ROWS = 8;
const BRICK_COLS = 11;
const BRICK_WIDTH = 40;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 2;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 30;
const BASE_BALL_SPEED = 2.5; // Slower speed as requested
const BASE_PADDLE_SPEED = 5; // Slower paddle speed

// Power-up types and their colors/letters
const POWER_UP_TYPES = [
    { type: 'expand', letter: 'E', color: '#ff0000' }, // Red
    { type: 'catch', letter: 'C', color: '#0000ff' },  // Blue
    { type: 'disruption', letter: 'D', color: '#ffff00' }, // Yellow
    { type: 'laser', letter: 'L', color: '#00ff00' },  // Green
    { type: 'player', letter: 'P', color: '#ff00ff' }, // Magenta
    { type: 'slow', letter: 'S', color: '#00ffff' },   // Cyan
    { type: 'break', letter: 'B', color: '#ff8800' }   // Orange
];

// Classic Arkanoid level designs
const ARKANOID_LEVELS = [
    // Level 1 - Classic Arkanoid first level layout
    {
        name: "ROUND 1",
        borderColor: "#3355ff", // Blue border
        rows: 8,
        cols: 11,
        brickTypes: [
            { row: 0, hitPoints: 1, color: '#ff0000' }, // Red
            { row: 1, hitPoints: 1, color: '#ff0000' },
            { row: 2, hitPoints: 1, color: '#ff8800' }, // Orange
            { row: 3, hitPoints: 1, color: '#ff8800' },
            { row: 4, hitPoints: 1, color: '#ffff00' }, // Yellow
            { row: 5, hitPoints: 1, color: '#ffff00' },
            { row: 6, hitPoints: 1, color: '#00ff00' }, // Green
            { row: 7, hitPoints: 1, color: '#00ff00' }
        ],
        ballSpeed: 1.0,
        specialBricks: [],
        emptySpaces: [],
        silverBricks: [] // Silver bricks are indestructible
    },
    // Level 2 - Pattern with gaps and silver bricks
    {
        name: "ROUND 2",
        borderColor: "#ff5533", // Red-orange border
        rows: 8,
        cols: 11,
        brickTypes: [
            { row: 0, hitPoints: 1, color: '#8800ff' }, // Purple
            { row: 1, hitPoints: 1, color: '#8800ff' },
            { row: 2, hitPoints: 1, color: '#0088ff' }, // Light blue
            { row: 3, hitPoints: 1, color: '#0088ff' },
            { row: 4, hitPoints: 1, color: '#00ffff' }, // Cyan
            { row: 5, hitPoints: 1, color: '#00ffff' },
            { row: 6, hitPoints: 1, color: '#ff00ff' }, // Magenta
            { row: 7, hitPoints: 1, color: '#ff00ff' }
        ],
        ballSpeed: 1.1,
        specialBricks: [
            { row: 3, col: 5, type: 'easterEgg', hitPoints: 1, color: '#ffffff' }
        ],
        emptySpaces: [
            { row: 2, col: 5 },
            { row: 4, col: 5 },
            { row: 6, col: 5 }
        ],
        silverBricks: [
            { row: 2, col: 4 }, { row: 2, col: 6 },
            { row: 4, col: 4 }, { row: 4, col: 6 },
            { row: 6, col: 4 }, { row: 6, col: 6 }
        ]
    },
    // Level 3 - Classic "Space Invader" pattern
    {
        name: "ROUND 3",
        borderColor: "#33ff55", // Green border
        rows: 8,
        cols: 11,
        brickTypes: [
            { row: 0, hitPoints: 1, color: '#ff0000' },
            { row: 1, hitPoints: 1, color: '#ff8800' },
            { row: 2, hitPoints: 1, color: '#ffff00' },
            { row: 3, hitPoints: 1, color: '#00ff00' },
            { row: 4, hitPoints: 1, color: '#00ffff' },
            { row: 5, hitPoints: 1, color: '#0088ff' },
            { row: 6, hitPoints: 1, color: '#8800ff' },
            { row: 7, hitPoints: 1, color: '#ff00ff' }
        ],
        ballSpeed: 1.2,
        specialBricks: [],
        emptySpaces: [
            // Space invader shape
            { row: 1, col: 0 }, { row: 1, col: 10 },
            { row: 3, col: 0 }, { row: 3, col: 10 },
            { row: 4, col: 1 }, { row: 4, col: 9 },
            { row: 5, col: 1 }, { row: 5, col: 9 },
            { row: 7, col: 1 }, { row: 7, col: 9 },
            { row: 7, col: 2 }, { row: 7, col: 8 }
        ],
        silverBricks: [
            { row: 0, col: 5 }, // Top antenna
            { row: 7, col: 4 }, { row: 7, col: 6 } // Bottom corners
        ]
    },
    // Level 4 - "Fortress" pattern with more silver bricks
    {
        name: "ROUND 4",
        borderColor: "#ff33ff", // Pink border
        rows: 8,
        cols: 11,
        brickTypes: [
            { row: 0, hitPoints: 1, color: '#ffff00' },
            { row: 1, hitPoints: 1, color: '#ffff00' },
            { row: 2, hitPoints: 1, color: '#00ff00' },
            { row: 3, hitPoints: 1, color: '#00ff00' },
            { row: 4, hitPoints: 1, color: '#00ffff' },
            { row: 5, hitPoints: 1, color: '#00ffff' },
            { row: 6, hitPoints: 1, color: '#ff00ff' },
            { row: 7, hitPoints: 1, color: '#ff00ff' }
        ],
        ballSpeed: 1.3,
        specialBricks: [
            { row: 4, col: 5, type: 'secret', hitPoints: 1, color: '#ffffff' }
        ],
        emptySpaces: [
            // Fortress pattern
            { row: 1, col: 1 }, { row: 1, col: 9 },
            { row: 2, col: 2 }, { row: 2, col: 8 },
            { row: 3, col: 3 }, { row: 3, col: 7 },
            { row: 4, col: 4 }, { row: 4, col: 6 },
            { row: 5, col: 4 }, { row: 5, col: 6 },
            { row: 6, col: 3 }, { row: 6, col: 7 },
            { row: 7, col: 2 }, { row: 7, col: 8 }
        ],
        silverBricks: [
            // Fortress wall
            { row: 0, col: 0 }, { row: 0, col: 10 },
            { row: 1, col: 0 }, { row: 1, col: 10 },
            { row: 2, col: 0 }, { row: 2, col: 10 },
            { row: 3, col: 0 }, { row: 3, col: 10 },
            { row: 4, col: 0 }, { row: 4, col: 10 },
            { row: 5, col: 0 }, { row: 5, col: 10 },
            { row: 6, col: 0 }, { row: 6, col: 10 },
            { row: 7, col: 0 }, { row: 7, col: 10 }
        ]
    },
    // Level 5 - Final level with DOH boss
    {
        name: "FINAL ROUND",
        borderColor: "#ffff33", // Yellow border
        rows: 8,
        cols: 11,
        brickTypes: [
            { row: 0, hitPoints: 2, color: '#ff0000' },
            { row: 1, hitPoints: 2, color: '#ff8800' },
            { row: 2, hitPoints: 2, color: '#ffff00' },
            { row: 3, hitPoints: 2, color: '#00ff00' },
            { row: 4, hitPoints: 2, color: '#00ffff' },
            { row: 5, hitPoints: 1, color: '#0088ff' },
            { row: 6, hitPoints: 1, color: '#8800ff' },
            { row: 7, hitPoints: 1, color: '#ff00ff' }
        ],
        ballSpeed: 1.5,
        specialBricks: [
            { row: 4, col: 5, type: 'final', hitPoints: 3, color: '#ffffff' }
        ],
        emptySpaces: [],
        silverBricks: [
            // Top row is all silver
            { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, 
            { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 },
            { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 },
            { row: 0, col: 9 }, { row: 0, col: 10 }
        ]
    }
];

// Enhanced particle effects system for brick destruction
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createBrickExplosion(x, y, color) {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            
            this.particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                color: color,
                life: 30 + Math.random() * 20
            });
        }
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Move particle
            particle.x += particle.dx;
            particle.y += particle.dy;
            
            // Decrease life
            particle.life--;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        for (const particle of this.particles) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            
            // Fade out as life decreases
            const opacity = particle.life / 50;
            ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${opacity})`;
            
            ctx.fill();
            ctx.closePath();
        }
    }
}

// Helper to convert hex to rgb for particle opacity
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Convert to rgb
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
}

// Add laser projectiles feature
class LaserSystem {
    constructor() {
        this.lasers = [];
    }
    
    fireLaser(paddle) {
        // Create two lasers, one from each cannon
        this.lasers.push({
            x: paddle.x + 5,
            y: paddle.y - 8,
            width: 2,
            height: 10,
            speed: 8
        });
        
        this.lasers.push({
            x: paddle.x + paddle.width - 7,
            y: paddle.y - 8,
            width: 2,
            height: 10,
            speed: 8
        });
        
        showNotification("Lasers fired!");
    }
    
    update() {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            
            // Move laser upward
            laser.y -= laser.speed;
            
            // Remove if off screen
            if (laser.y + laser.height < 0) {
                this.lasers.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ff0000';
        for (const laser of this.lasers) {
            ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
        }
    }
    
    checkBrickCollisions(bricks) {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            
            for (let j = 0; j < bricks.length; j++) {
                const brick = bricks[j];
                
                if (brick.visible && 
                    laser.x > brick.x && 
                    laser.x < brick.x + brick.width && 
                    laser.y < brick.y + brick.height && 
                    laser.y > brick.y) {
                    
                    // Don't destroy silver bricks with lasers
                    if (!brick.isSilver) {
                        // Reduce brick hit points
                        brick.hitPoints--;
                        
                        if (brick.hitPoints <= 0) {
                            destroyBrick(brick, j);
                        } else {
                            // Update brick appearance if not destroyed
                            updateBrickAppearance(brick);
                        }
                    } else {
                        // Just flash the silver brick
                        animateSilverBrickHit(brick);
                    }
                    
                    // Remove the laser
                    this.lasers.splice(i, 1);
                    break;
                }
            }
        }
    }
}

// Add multiball implementation
class Multiball {
    constructor() {
        this.balls = [];
        this.active = false;
    }
    
    activate() {
        if (this.active) return;
        
        this.active = true;
        
        // Create two additional balls with slightly different directions
        for (let i = 0; i < 2; i++) {
            const angle = (Math.random() * 120 - 60) * Math.PI / 180;
            
            this.balls.push({
                x: ball.x,
                y: ball.y,
                dx: ball.speed * Math.sin(angle),
                dy: -ball.speed * Math.cos(angle),
                radius: ball.radius,
                speed: ball.speed,
                color: '#ffffff',
                breaking: ball.breaking
            });
        }
        
        showNotification("MULTIBALL ACTIVATED!");
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const extraBall = this.balls[i];
            
            // Move the ball
            const speedMultiplier = deltaTime / 16.67;
            extraBall.x += extraBall.dx * speedMultiplier;
            extraBall.y += extraBall.dy * speedMultiplier;
            
            // Wall collision detection
            if (extraBall.x + extraBall.radius > canvas.width || extraBall.x - extraBall.radius < 0) {
                extraBall.dx = -extraBall.dx;
            }
            
            if (extraBall.y - extraBall.radius < 0) {
                extraBall.dy = -extraBall.dy;
            }
            
            // Paddle collision
            if (
                extraBall.y + extraBall.radius > paddle.y &&
                extraBall.y - extraBall.radius < paddle.y + paddle.height &&
                extraBall.x + extraBall.radius > paddle.x &&
                extraBall.x - extraBall.radius < paddle.x + paddle.width
            ) {
                // Calculate bounce angle
                const hitPos = (extraBall.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
                const angle = hitPos * Math.PI/3; // Max angle: 60 degrees
                
                extraBall.dx = extraBall.speed * Math.sin(angle);
                extraBall.dy = -extraBall.speed * Math.cos(angle);
                
                // Make sure ball always goes up
                if (extraBall.dy > 0) {
                    extraBall.dy = -extraBall.dy;
                }
            }
            
            // Brick collisions
            for (let j = 0; j < bricks.length; j++) {
                const brick = bricks[j];
                
                if (brick.visible) {
                    if (
                        extraBall.x + extraBall.radius > brick.x &&
                        extraBall.x - extraBall.radius < brick.x + brick.width &&
                        extraBall.y + extraBall.radius > brick.y &&
                        extraBall.y - extraBall.radius < brick.y + brick.height
                    ) {
                        // If break mode is on and it's not a silver brick, destroy without bouncing
                        if (extraBall.breaking && !brick.isSilver) {
                            destroyBrick(brick, j);
                            continue; // Skip bouncing logic
                        }
                        
                        // Can't destroy silver bricks unless using break power-up
                        if (brick.isSilver && !extraBall.breaking) {
                            // Determine bounce direction
                            const overlapLeft = extraBall.x + extraBall.radius - brick.x;
                            const overlapRight = brick.x + brick.width - (extraBall.x - extraBall.radius);
                            const overlapTop = extraBall.y + extraBall.radius - brick.y;
                            const overlapBottom = brick.y + brick.height - (extraBall.y - extraBall.radius);
                            
                            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                            
                            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                                extraBall.dx = -extraBall.dx;
                            } else {
                                extraBall.dy = -extraBall.dy;
                            }
                            continue;
                        }
                        
                        // Determine bounce direction and reduce brick hit points
                        const overlapLeft = extraBall.x + extraBall.radius - brick.x;
                        const overlapRight = brick.x + brick.width - (extraBall.x - extraBall.radius);
                        const overlapTop = extraBall.y + extraBall.radius - brick.y;
                        const overlapBottom = brick.y + brick.height - (extraBall.y - extraBall.radius);
                        
                        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                        
                        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                            extraBall.dx = -extraBall.dx;
                        } else {
                            extraBall.dy = -extraBall.dy;
                        }
                        
                        // Reduce brick hit points
                        brick.hitPoints--;
                        
                        if (brick.hitPoints <= 0) {
                            destroyBrick(brick, j);
                        } else {
                            updateBrickAppearance(brick);
                        }
                    }
                }
            }
            
            // Remove ball if it goes off screen at the bottom
            if (extraBall.y + extraBall.radius > canvas.height) {
                this.balls.splice(i, 1);
                
                // If all extra balls are gone, deactivate multiball
                if (this.balls.length === 0) {
                    this.active = false;
                    showNotification("Extra balls lost!");
                }
            }
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        for (const extraBall of this.balls) {
            ctx.beginPath();
            ctx.arc(extraBall.x, extraBall.y, extraBall.radius, 0, Math.PI * 2);
            
            if (extraBall.breaking) {
                // Break mode - flashing effect
                const time = Date.now() * 0.01;
                const flash = Math.floor(time) % 2 === 0;
                ctx.fillStyle = flash ? '#ffff00' : '#ff8800';
            } else {
                ctx.fillStyle = extraBall.color;
            }
            
            ctx.fill();
            ctx.closePath();
        }
    }
}

// Create instances of our systems
const particles = new ParticleSystem();
const laserSystem = new LaserSystem();
const multiball = new Multiball();

// Enhanced screen shake effect
let screenShakeAmount = 0;

function applyScreenShake() {
    if (screenShakeAmount > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeAmount;
        const shakeY = (Math.random() - 0.5) * screenShakeAmount;
        
        ctx.save();
        ctx.translate(shakeX, shakeY);
        
        screenShakeAmount -= 0.3;
        if (screenShakeAmount < 0) screenShakeAmount = 0;
    }
}

function resetScreenShake() {
    if (screenShakeAmount > 0) {
        ctx.restore();
    }
}

// Initialize the game
window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = 480;
    canvas.height = 600;
    ctx = canvas.getContext('2d');
    
    // Update the current date and time display
    const currentTimeEl = document.querySelector('.last-update');
    if (currentTimeEl) {
        currentTimeEl.textContent = CURRENT_TIMESTAMP;
    }
    
    // Update player name
    const playerNameElements = document.querySelectorAll('.player-name, .player-welcome');
    playerNameElements.forEach(el => {
        el.textContent = el.textContent.includes('PLAYER:') ? 
            "PLAYER: " + CURRENT_USER : "Welcome, " + CURRENT_USER + "!";
    });
    
    // Initialize game objects
    initGame();
    
    // Event listeners for game controls
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', restartGame);
    document.getElementById('nextLevelButton').addEventListener('click', nextLevel);
    document.getElementById('pauseButton').addEventListener('click', togglePause);
    document.getElementById('resumeButton').addEventListener('click', resumeGame);
    document.getElementById('speedButton').addEventListener('click', cycleSpeed);
    
    // Paddle controls
    document.addEventListener('mousemove', movePaddleWithMouse);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Easter egg listeners
    document.addEventListener('keydown', checkKonamiCode);
    canvas.addEventListener('click', checkSecretClick);

    // Apply the border color for the current level
    updateBorderColor();
    
    // Auto-pause when window loses focus
    window.addEventListener('blur', function() {
        if (gameState === 'playing') {
            togglePause();
            showNotification("Game auto-paused: Window lost focus");
        }
    });
    
    // Start the animation loop with timestamp for smooth animation
    requestAnimationFrame(gameLoop);
    
    // Show welcome notification
    setTimeout(() => {
        showNotification(`Welcome back, ${CURRENT_USER}! Last game played: ${CURRENT_TIMESTAMP}`);
    }, 1000);
};

function initGame() {
    // Create the paddle (Vaus)
    paddle = {
        x: canvas.width / 2 - PADDLE_WIDTH / 2,
        y: canvas.height - PADDLE_HEIGHT - 30,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        dx: BASE_PADDLE_SPEED,
        color: '#3355ff',  // Blue color of the original Vaus
        hasCatch: false,
        hasLaser: false
    };
    
    // Create the ball
    resetBall();
    
    // Reset state for a new game
    ballOnPaddle = true;
    spacePressed = false;
    powerUps = [];
    catchEnabled = false;
    
    // Create bricks for the current level
    createBricks();
    
    // Update UI
    updateScore();
    updateLives();
    updateLevel();
    updateEasterEggCount();
}

function resetBall() {
    // Calculate ball speed based on level and speed factor
    const levelData = ARKANOID_LEVELS[Math.min(level - 1, ARKANOID_LEVELS.length - 1)];
    const adjustedSpeed = BASE_BALL_SPEED * levelData.ballSpeed * speedFactor;
    
    ball = {
        x: paddle.x + paddle.width / 2,
        y: paddle.y - BALL_RADIUS,
        dx: 0, // Will be set when launched
        dy: 0, // Will be set when launched
        radius: BALL_RADIUS,
        speed: adjustedSpeed,
        color: '#ffffff',  // White ball
        breaking: false,  // For break power-up
        isStuck: false    // For catch power-up
    };
    
    ballOnPaddle = true;
}

function launchBall() {
    if (ballOnPaddle) {
        // Set initial speed and direction
        const levelData = ARKANOID_LEVELS[Math.min(level - 1, ARKANOID_LEVELS.length - 1)];
        const adjustedSpeed = BASE_BALL_SPEED * levelData.ballSpeed * speedFactor;
        
        // Launch at an angle, slightly random but mainly upward
        const angle = (Math.random() * 60 - 30) * Math.PI / 180; // -30 to +30 degrees
        ball.dx = adjustedSpeed * Math.sin(angle);
        ball.dy = -adjustedSpeed * Math.cos(angle);
        
        ballOnPaddle = false;
        showNotification("Ball launched!");
    }
}

function createBricks() {
    bricks = [];
    
    // Get level data (or use the last level if beyond defined levels)
    const levelIndex = Math.min(level - 1, ARKANOID_LEVELS.length - 1);
    const levelData = ARKANOID_LEVELS[levelIndex];
    
    const rows = levelData.rows;
    const cols = levelData.cols;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // Skip if this position is in the emptySpaces array
            if (levelData.emptySpaces && levelData.emptySpaces.some(space => space.row === r && space.col === c)) {
                continue;
            }
            
            // Check if this is a silver brick (indestructible)
            const isSilverBrick = levelData.silverBricks && 
                                 levelData.silverBricks.some(brick => brick.row === r && brick.col === c);
            
            // Get brick type based on row
            const brickType = levelData.brickTypes.find(type => type.row === r) || levelData.brickTypes[0];
            
            // Check if this is a special brick
            const specialBrick = levelData.specialBricks && 
                                 levelData.specialBricks.find(brick => brick.row === r && brick.col === c);
            
            // Calculate position
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            
            // Create the brick with appropriate properties
            bricks.push({
                x: brickX,
                y: brickY,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                hitPoints: isSilverBrick ? Infinity : (specialBrick ? specialBrick.hitPoints : brickType.hitPoints),
                color: isSilverBrick ? '#aaaaaa' : (specialBrick ? specialBrick.color : brickType.color),
                visible: true,
                isSilver: isSilverBrick,
                isEasterEgg: specialBrick ? specialBrick.type === 'easterEgg' : false,
                isSecretBrick: specialBrick ? specialBrick.type === 'secret' : false,
                isFinalBrick: specialBrick ? specialBrick.type === 'final' : false,
                powerUpChance: specialBrick ? 0.8 : 0.15 // Higher chance on special bricks
            });
        }
    }
}

function startGame() {
    gameState = 'ready'; // Ready state, waiting for ball launch
    document.getElementById('startScreen').classList.add('hidden');
    showNotification("Press SPACE to launch the ball!");
}

function restartGame() {
    score = 0;
    lives = 3;
    level = 1;
    powerUps = [];
    easterEggsFound = [];
    initGame();
    gameState = 'ready';
    document.getElementById('gameOverScreen').classList.add('hidden');
    updateBorderColor();
    showNotification("Game restarted - Get ready!");
}

function nextLevel() {
    level++;
    document.getElementById('nextLevelNum').textContent = level + 1;
    powerUps = [];
    initGame();
    gameState = 'ready'; // Ready state, waiting for ball launch
    document.getElementById('levelCompleteScreen').classList.add('hidden');
    updateBorderColor();
    
    // Get level data
    const levelIndex = Math.min(level - 1, ARKANOID_LEVELS.length - 1);
    const levelData = ARKANOID_LEVELS[levelIndex];
    
    showNotification(`${levelData.name} - Get ready! Press SPACE to launch.`);
}

function updateBorderColor() {
    // Change border color based on level
    const levelIndex = Math.min(level - 1, ARKANOID_LEVELS.length - 1);
    const borderColor = ARKANOID_LEVELS[levelIndex].borderColor;
    
    // Update canvas border
    canvas.style.borderColor = borderColor;
    
    // If you want to update side panel border too:
    document.querySelector('.side-panel').style.borderColor = borderColor;
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        document.getElementById('pauseScreen').classList.remove('hidden');
        showNotification("Game paused");
    } else if (gameState === 'paused') {
        resumeGame();
    }
}

function resumeGame() {
    if (gameState === 'paused') {
        gameState = 'playing';
        document.getElementById('pauseScreen').classList.add('hidden');
        showNotification("Game resumed");
    }
}

function cycleSpeed() {
    // Cycle through speed settings: Normal -> Slow -> Very Slow -> Normal
    if (speedFactor === 1.0) {
        speedFactor = 0.7; // Slow
        document.getElementById('speedButton').textContent = "SPEED: SLOW";
    } else if (speedFactor === 0.7) {
        speedFactor = 0.4; // Very Slow
        document.getElementById('speedButton').textContent = "SPEED: VERY SLOW";
    } else {
        speedFactor = 1.0; // Normal
        document.getElementById('speedButton').textContent = "SPEED: NORMAL";
    }
    
    // Update ball speed if the ball is moving
    if (!ballOnPaddle) {
        const levelData = ARKANOID_LEVELS[Math.min(level - 1, ARKANOID_LEVELS.length - 1)];
        const adjustedSpeed = BASE_BALL_SPEED * levelData.ballSpeed * speedFactor;
        
        // Keep the ball direction but update its speed
        const magnitude = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (magnitude > 0) {
            ball.dx = (ball.dx / magnitude) * adjustedSpeed;
            ball.dy = (ball.dy / magnitude) * adjustedSpeed;
        }
        ball.speed = adjustedSpeed;
    }
    
    showNotification(`Game speed set to: ${document.getElementById('speedButton').textContent.split(': ')[1]}`);
}

function updateScore() {
    document.getElementById('score').textContent = score.toString().padStart(6, '0');
    document.getElementById('finalScore').textContent = score.toString().padStart(6, '0');
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore.toString().padStart(6, '0');
        showNotification("NEW HIGH SCORE!");
    }
}

function updateLives() {
    // Update the life icons
    for (let i = 1; i <= 3; i++) {
        const lifeElement = document.getElementById(`life${i}`);
        if (i <= lives) {
            lifeElement.style.visibility = 'visible';
        } else {
            lifeElement.style.visibility = 'hidden';
        }
    }
}

function updateLevel() {
    document.getElementById('level').textContent = level;
}

function updateEasterEggCount() {
    document.getElementById('easterEggsCount').textContent = easterEggsFound.length;
}

function movePaddleWithMouse(e) {
    if (gameState !== 'playing' && gameState !== 'ready') return;
    
    const relativeX = e.clientX - canvas.offsetLeft;
    const newPaddleX = relativeX - paddle.width / 2;
    
    // Ensure paddle stays within canvas bounds
    if (newPaddleX > 0 && newPaddleX + paddle.width < canvas.width) {
        paddle.x = newPaddleX;
        
        // Move ball with paddle if it's stuck on the paddle
        if (ballOnPaddle || ball.isStuck) {
            ball.x = paddle.x + paddle.width / 2;
        }
    }
}

function handleKeyDown(e) {
    // Paddle movement
    if (gameState === 'playing' || gameState === 'ready') {
        if (e.key === 'ArrowRight' && paddle.x + paddle.width < canvas.width) {
            paddle.x += paddle.dx;
            
            // Move ball with paddle if it's stuck on the paddle
            if (ballOnPaddle || ball.isStuck) {
                ball.x = paddle.x + paddle.width / 2;
            }
        } else if (e.key === 'ArrowLeft' && paddle.x > 0) {
            paddle.x -= paddle.dx;
            
            // Move ball with paddle if it's stuck on the paddle
            if (ballOnPaddle || ball.isStuck) {
                ball.x = paddle.x + paddle.width / 2;
            }
        }
        
        // Launch ball with space
        if (e.key === ' ' || e.key === 'Space') {
            spacePressed = true;
            
            if (gameState === 'ready') {
                gameState = 'playing';
            }
            
            if (ballOnPaddle) {
                launchBall();
            } else if (ball.isStuck) {
                // Release stuck ball
                ball.isStuck = false;
                // Re-launch at an angle
                const angle = (Math.random() * 60 - 30) * Math.PI / 180;
                ball.dx = ball.speed * Math.sin(angle);
                ball.dy = -ball.speed * Math.cos(angle);
                showNotification("Ball released!");
            }
        }
        
        // Fire lasers with X key
        if ((e.key === 'x' || e.key === 'X') && paddle.hasLaser) {
            fireLaser();
        }
    }
    
    // Pause game with 'p' key
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
    
    // Secret keys
    if (e.key === 'r' && e.ctrlKey && easterEggsFound.includes('konami')) {
        // Secret rainbow mode toggle when Konami code is active
        if (!easterEggsFound.includes('rainbowToggle')) {
            activateEasterEgg('rainbowToggle');
        }
    }
    
    // Track for secret patterns
    trackSecretPattern(e.key.toLowerCase());
}

function handleKeyUp(e) {
    if (e.key === ' ' || e.key === 'Space') {
        spacePressed = false;
    }
}

function gameLoop(timestamp) {
    // Calculate time delta for smooth animation
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply screen shake
    applyScreenShake();
    
    // Draw game elements
    drawBall();
    drawPaddle();
    drawBricks();
    drawPowerUps(deltaTime);
    
    // Update and draw particles
    particles.update();
    particles.draw(ctx);
    
    // Update and draw lasers
    if (paddle.hasLaser) {
        laserSystem.update();
        laserSystem.draw(ctx);
        laserSystem.checkBrickCollisions(bricks);
    }
    
    // Update and draw multiball
    if (multiball.active) {
        multiball.update(deltaTime);
        multiball.draw(ctx);
    }
    
    // Update game state if playing
    if (gameState === 'playing') {
        if (!ballOnPaddle) {
            moveBall(deltaTime);
        }
        checkCollisions();
        updatePowerUps(deltaTime);
        
        // Update special effect timers
        if (specialEffectTimer > 0) {
            specialEffectTimer -= deltaTime;
            if (specialEffectTimer <= 0) {
                removeSpecialEffects();
            }
        }
        
        // Check if level is complete
        if (isLevelComplete()) {
            if (level >= ARKANOID_LEVELS.length) {
                // Game complete!
                showNotification("🎉 CONGRATULATIONS! YOU'VE COMPLETED THE GAME!", 5000);
                gameState = 'gameOver';
                document.getElementById('gameOverScreen').classList.remove('hidden');
                document.getElementById('gameOverScreen').querySelector('h1').textContent = "YOU WIN!";
            } else {
                gameState = 'levelComplete';
                document.getElementById('levelCompleteScreen').classList.remove('hidden');
            }
        }
    }
    
    // Reset screen shake
    resetScreenShake();
    
    requestAnimationFrame(gameLoop);
}

function drawBall() {
    // If ball is on paddle, position it correctly
    if (ballOnPaddle) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
    }
    
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    
    // Special effects for the ball
    if (ball.breaking) {
        // Break mode - flashing effect
        const time = Date.now() * 0.01;
        const flash = Math.floor(time) % 2 === 0;
        ctx.fillStyle = flash ? '#ffff00' : '#ff8800';
    } else if (easterEggsFound.includes('konami')) {
        // Rainbow ball if konami code is active
        const time = Date.now() * 0.001;
        const r = Math.sin(time * 3.0) * 127 + 128;
        const g = Math.sin(time * 3.0 + 2) * 127 + 128;
        const b = Math.sin(time * 3.0 + 4) * 127 + 128;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    } else {
        ctx.fillStyle = ball.color;
    }
    
    ctx.fill();
    ctx.closePath();
    
    // Draw energy field around breaking ball
    if (ball.breaking) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffff00';
        ctx.stroke();
        ctx.closePath();
    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Create metallic gradient for the paddle (Vaus)
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    
    if (easterEggsFound.includes('secretClick')) {
        // Gold Vaus for secret click easter egg
        gradient.addColorStop(0, '#ffff99');
        gradient.addColorStop(0.5, '#ffcc00');
        gradient.addColorStop(1, '#cc9900');
    } else {
        // Standard blue Vaus
        gradient.addColorStop(0, '#99aaff');
        gradient.addColorStop(0.5, '#3355ff');
        gradient.addColorStop(1, '#0022cc');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw paddle border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw the catch zone if active
    if (paddle.hasCatch) {
        ctx.beginPath();
        ctx.rect(paddle.x + paddle.width * 0.4, paddle.y - 2, paddle.width * 0.2, 2);
        ctx.fillStyle = '#ffff00';
        ctx.fill();
        ctx.closePath();
    }
    
    // Draw laser cannons if active
    if (paddle.hasLaser) {
        // Left cannon
        ctx.beginPath();
        ctx.rect(paddle.x + 5, paddle.y - 8, 5, 8);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.closePath();
        
        // Right cannon
        ctx.beginPath();
        ctx.rect(paddle.x + paddle.width - 10, paddle.y - 8, 5, 8);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.closePath();
    }
    
    ctx.closePath();
}

function drawBricks() {
    for (const brick of bricks) {
        if (brick.visible) {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.width, brick.height);
            
            if (brick.isSilver) {
                // Silver brick with metallic effect
                const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.5, '#aaaaaa');
                gradient.addColorStop(1, '#888888');
                ctx.fillStyle = gradient;
            } else if (brick.isEasterEgg || brick.isSecretBrick || brick.isFinalBrick) {
                // Special effects for easter egg bricks
                const time = Date.now() * 0.002;
                const pulse = Math.sin(time) * 0.2 + 0.8;
                
                // Create a pulsing gradient
                const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
                gradient.addColorStop(0, brick.color);
                gradient.addColorStop(0.5, '#ffffff');
                gradient.addColorStop(1, brick.color);
                
                ctx.fillStyle = gradient;
            } else {
                // Regular brick with slight gradient
                const colorValue = brick.color;
                const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
                gradient.addColorStop(0, lightenColor(colorValue, 30));
                gradient.addColorStop(1, darkenColor(colorValue, 20));
                ctx.fillStyle = gradient;
            }
            
            ctx.fill();
            
            // Draw brick border
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.closePath();
        }
    }
}

// Helper functions to lighten/darken colors
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const r = Math.min(255, (num >> 16) + amt);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const b = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const r = Math.max(0, (num >> 16) - amt);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const b = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

function drawPowerUps(deltaTime) {
    for (const powerUp of powerUps) {
        ctx.beginPath();
        
        // Draw power-up capsule (rectangular with rounded ends)
        ctx.roundRect(powerUp.x, powerUp.y, 30, 15, 7);
        ctx.fillStyle = powerUp.color;
        ctx.fill();
        
        // Draw the letter
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerUp.letter, powerUp.x + 15, powerUp.y + 8);
        
        ctx.closePath();
    }
}

function moveBall(deltaTime) {
    // If ball is stuck to paddle, don't move it independently
    if (ball.isStuck) return;
    
    // Apply screen shake
    applyScreenShake();
    
    // Move ball based on its speed and delta time
    const speedMultiplier = deltaTime / 16.67; // 60 FPS = 16.67ms per frame
    
    ball.x += ball.dx * speedMultiplier;
    ball.y += ball.dy * speedMultiplier;
    
    // Wall collision detection
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        
        // Add screen shake for wall hits if breaking mode is on
        if (ball.breaking) {
            screenShakeAmount = 5;
        }
        
        // Easter egg: If you hit the side walls in a specific pattern
        if (++secretClicks === 7 && !easterEggsFound.includes('sideWalls')) {
            activateEasterEgg('sideWalls');
        }
    }
    
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        
        // Add screen shake for ceiling hits if breaking mode is on
        if (ball.breaking) {
            screenShakeAmount = 5;
        }
    }
    
    // If ball hits the bottom, lose a life
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        updateLives();
        
        // Strong screen shake for lost ball
        screenShakeAmount = 10;
        
        if (lives <= 0) {
            gameState = 'gameOver';
            document.getElementById('gameOverScreen').classList.remove('hidden');
            showNotification("GAME OVER!", 5000);
        } else {
            resetBall();
            gameState = 'ready';
            showNotification(`Ball lost! ${lives} lives remaining. Press SPACE to continue.`);
        }
    }
    
    // Reset screen shake
    resetScreenShake();
}

function checkCollisions() {
    // Paddle collision
    if (
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x + ball.radius > paddle.x &&
        ball.x - ball.radius < paddle.x + paddle.width
    ) {
        // Check if catch power-up is active and ball is moving downward
        if (paddle.hasCatch && ball.dy > 0 && !ball.isStuck) {
            // Stick the ball to the paddle
            ball.isStuck = true;
            ball.y = paddle.y - ball.radius;
            showNotification("Ball caught! Press SPACE to release.");
            return;
        }
        
        // Calculate bounce angle based on where ball hits the paddle
        const hitPos = (ball.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
        const angle = hitPos * Math.PI/3; // Max angle: 60 degrees
        
        // Apply the current ball speed to the new direction
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
        
        // Make sure ball always goes up
        if (ball.dy > 0) {
            ball.dy = -ball.dy;
        }
    }
    
    // Brick collision
    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        
        if (brick.visible) {
            // Check for collision
            if (
                ball.x + ball.radius > brick.x &&
                ball.x - ball.radius < brick.x + brick.width &&
                ball.y + ball.radius > brick.y &&
                ball.y - ball.radius < brick.y + brick.height
            ) {
                // If break mode is on and it's not a silver brick, destroy without bouncing
                if (ball.breaking && !brick.isSilver) {
                    destroyBrick(brick, i);
                    continue; // Skip bouncing logic, keep moving
                }
                
                // Can't destroy silver bricks unless using break power-up
                if (brick.isSilver && !ball.breaking) {
                    // Just bounce, don't damage
                    determineBounceDirection(ball, brick);
                    continue;
                }
                
                // Determine which side of the brick was hit for realistic bouncing
                determineBounceDirection(ball, brick);
                
                // Reduce brick hit points
                brick.hitPoints--;
                
                // If brick is destroyed
                if (brick.hitPoints <= 0) {
                    destroyBrick(brick, i);
                } else {
                    // Update brick color based on remaining hit points
                    updateBrickAppearance(brick);
                }
            }
        }
    }
    
    // Power-up collision
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        
        if (
            powerUp.x < paddle.x + paddle.width &&
            powerUp.x + 30 > paddle.x &&
            powerUp.y < paddle.y + paddle.height &&
            powerUp.y + 15 > paddle.y
        ) {
            // Apply power-up effect
            applyPowerUp(powerUp.type);
            
            // Remove the power-up
            powerUps.splice(i, 1);
        }
    }
}

function determineBounceDirection(ball, brick) {
    // Calculate overlap on each side
    const overlapLeft = ball.x + ball.radius - brick.x;
    const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
    const overlapTop = ball.y + ball.radius - brick.y;
    const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);
    
    // Find the smallest overlap to determine bounce direction
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
    
    if (minOverlap === overlapLeft || minOverlap === overlapRight) {
        // Hit from the sides
        ball.dx = -ball.dx;
    } else {
        // Hit from top or bottom
        ball.dy = -ball.dy;
    }
}

function destroyBrick(brick, index) {
    brick.visible = false;
    
    // Create particle explosion at brick position
    particles.createBrickExplosion(
        brick.x + brick.width / 2, 
        brick.y + brick.height / 2,
        brick.color
    );
    
    // Scoring based on brick type
    if (brick.isSilver) {
        score += 50; // Silver bricks worth more
    } else {
        score += 10;
    }
    updateScore();
    
    // Easter egg brick activated
    if (brick.isEasterEgg) {
        activateEasterEgg('specialBrick');
    }
    
    // Secret brick activated
    if (brick.isSecretBrick) {
        activateEasterEgg('secretBrick');
    }
    
    // Final brick activated
    if (brick.isFinalBrick) {
        activateEasterEgg('finalBrick');
    }
    
    // Chance to spawn power-up
    if (Math.random() < brick.powerUpChance) {
        spawnPowerUp(brick.x + brick.width/2 - 15, brick.y);
    }
}

function updateBrickAppearance(brick) {
    // Make brick flash when hit
    const originalColor = brick.color;
    brick.color = '#ffffff';
    
    setTimeout(() => {
        brick.color = originalColor;
    }, 50);
}

// Silver brick hit animation effect
function animateSilverBrickHit(brick) {
    // Create a temporary flash effect
    const originalColor = brick.color;
    const flashColors = ['#ffffff', '#dddddd', '#bbbbbb', '#aaaaaa'];
    
    let flashIndex = 0;
    const flashInterval = setInterval(() => {
        brick.color = flashColors[flashIndex % flashColors.length];
        flashIndex++;
        
        if (flashIndex >= flashColors.length) {
            clearInterval(flashInterval);
            brick.color = originalColor;
        }
    }, 50);
}

function spawnPowerUp(x, y) {
    // Select a random power-up type
    const powerUpIndex = Math.floor(Math.random() * POWER_UP_TYPES.length);
    const powerUpData = POWER_UP_TYPES[powerUpIndex];
    
    powerUps.push({
        x: x,
        y: y,
        type: powerUpData.type,
        letter: powerUpData.letter,
        color: powerUpData.color,
        speed: 1.0 * speedFactor  // Falling speed
    });
}

function updatePowerUps(deltaTime) {
    const speedMultiplier = deltaTime / 16.67;
    
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        
        // Move the power-up down
        powerUp.y += powerUp.speed * speedMultiplier;
        
        // Remove if it goes offscreen
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
}

function applyPowerUp(type) {
    // Restore original paddle properties
    const originalWidth = PADDLE_WIDTH;
    
    switch(type) {
        case 'expand':
            // Expand the paddle
            paddle.width = originalWidth * 1.5;
            showNotification("Paddle expanded!");
            
            // Set timeout to revert
            setTimeout(() => {
                paddle.width = originalWidth;
                showNotification("Paddle size normal again");
            }, 15000);
            break;
            
        case 'catch':
            // Enable catch ability
            paddle.hasCatch = true;
            showNotification("Catch ability activated! Ball will stick to paddle.");
            
            // Set timeout to revert
            setTimeout(() => {
                paddle.hasCatch = false;
                showNotification("Catch ability expired");
            }, 20000);
            break;
            
        case 'disruption':
            // Activate multiball
            multiball.activate();
            break;
            
        case 'laser':
            // Add lasers to the paddle
            paddle.hasLaser = true;
            showNotification("Laser power activated! Press X to fire.");
            
            // Set timeout to revert
            setTimeout(() => {
                paddle.hasLaser = false;
                showNotification("Laser power expired");
            }, 15000);
            break;
            
        case 'player':
            // Extra life
            lives++;
            updateLives();
            showNotification("Extra life gained!");
            break;
            
        case 'slow':
            // Slow down the ball
            const originalSpeed = ball.speed;
            ball.speed = ball.speed * 0.6;
            
            // Update direction vectors to maintain direction but reduce speed
            if (ball.dx !== 0 || ball.dy !== 0) {
                const magnitude = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                ball.dx = (ball.dx / magnitude) * ball.speed;
                ball.dy = (ball.dy / magnitude) * ball.speed;
            }
            
            showNotification("Ball slowed down!");
            
            // Set timeout to revert
            setTimeout(() => {
                ball.speed = originalSpeed;
                
                // Update direction vectors to maintain direction but restore speed
                if (ball.dx !== 0 || ball.dy !== 0) {
                    const magnitude = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                    ball.dx = (ball.dx / magnitude) * originalSpeed;
                    ball.dy = (ball.dy / magnitude) * originalSpeed;
                }
                
                showNotification("Ball speed back to normal");
            }, 10000);
            break;
            
        case 'break':
            // Break-through mode
            ball.breaking = true;
            ball.color = '#ffff00'; // Yellow glow
            showNotification("Break-through mode! Ball smashes through bricks!");
            
                        // Also apply to multiball if active
                        if (multiball.active) {
                            multiball.balls.forEach(extraBall => {
                                extraBall.breaking = true;
                                extraBall.color = '#ffff00';
                            });
                        }
                        
                        // Set timeout to revert
                        setTimeout(() => {
                            ball.breaking = false;
                            ball.color = '#ffffff';
                            
                            // Also revert for multiball if active
                            if (multiball.active) {
                                multiball.balls.forEach(extraBall => {
                                    extraBall.breaking = false;
                                    extraBall.color = '#ffffff';
                                });
                            }
                            
                            showNotification("Break-through mode expired");
                        }, 10000);
                        break;
                }
            }
            
            function isLevelComplete() {
                // Level is complete when all non-silver bricks are destroyed
                return bricks.every(brick => !brick.visible || brick.isSilver);
            }
            
            // Fire laser function
            function fireLaser() {
                if (paddle.hasLaser) {
                    laserSystem.fireLaser(paddle);
                }
            }
            
            // Easter egg functions
            function checkKonamiCode(e) {
                // Check if the key matches the next key in the sequence
                if (e.key === konamiSequence[konamiIndex]) {
                    konamiIndex++;
                    
                    // If the entire sequence is complete
                    if (konamiIndex === konamiSequence.length) {
                        activateEasterEgg('konami');
                        konamiIndex = 0;
                    }
                } else {
                    konamiIndex = 0;
                }
            }
            
            function checkSecretClick(e) {
                // Secret click in the top left corner
                if (e.offsetX < 50 && e.offsetY < 50) {
                    activateEasterEgg('secretClick');
                }
            }
            
            function activateEasterEgg(type) {
                if (easterEggsFound.includes(type)) return;
                
                easterEggsFound.push(type);
                updateEasterEggCount();
                
                switch(type) {
                    case 'konami':
                        // Konami code easter egg - rainbow effects and bonus
                        ball.color = '#ff00ff';
                        
                        showNotification("KONAMI CODE ACTIVATED! Rainbow ball mode engaged!");
                        score += 1000;
                        updateScore();
                        break;
                        
                    case 'secretClick':
                        // Secret click easter egg - gold paddle & extra lives
                        lives++;
                        updateLives();
                        
                        // Gold paddle effect permanently
                        showNotification("SECRET FOUND! +1 life and gold paddle unlocked!");
                        break;
                        
                    case 'sideWalls':
                        // Side wall pattern easter egg
                        secretClicks = 0;
                        const originalRadius = ball.radius;
                        ball.radius *= 2; // Bigger ball
                        
                        showNotification("BIG BALL MODE ACTIVATED!");
                        
                        // Set timer to revert the effect
                        specialEffectTimer = 15000; // 15 seconds
                        
                        setTimeout(() => {
                            ball.radius = originalRadius;
                            showNotification("Ball size back to normal");
                        }, 15000);
                        break;
                        
                    case 'specialBrick':
                        // Special brick easter egg
                        showNotification("SPECIAL BRICK BROKEN! All bricks are now one hit!");
                        
                        bricks.forEach(brick => {
                            if (!brick.isSilver) {
                                brick.hitPoints = 1;
                            }
                        });
                        break;
                        
                    case 'secretBrick':
                        // Secret brick easter egg - double points temporarily
                        showNotification("SECRET BRICK BROKEN! Double points activated!");
                        
                        score += 200; // Bonus points
                        updateScore();
                        
                        // Apply double score effect
                        const originalScorePerBrick = 10;
                        const doubleScoreInterval = setInterval(() => {
                            // Check if game is still active
                            if (gameState === 'playing' || gameState === 'ready') {
                                score += 1; // Small passive score increase
                                updateScore();
                            } else {
                                clearInterval(doubleScoreInterval);
                            }
                        }, 1000);
                        
                        // Clear the interval after 30 seconds
                        setTimeout(() => {
                            clearInterval(doubleScoreInterval);
                            showNotification("Double points effect has ended");
                        }, 30000);
                        break;
                        
                    case 'finalBrick':
                        // Final level special brick
                        showNotification("FINAL BRICK DISCOVERED! Boss mode coming soon!");
                        
                        // Mega bonus points
                        score += 5000;
                        updateScore();
                        break;
                        
                    case 'rainbowToggle':
                        showNotification("SECRET RAINBOW MODE TOGGLED!");
                        
                        // This is just a placeholder for future visual effects
                        const currentColor = ball.color;
                        ball.color = currentColor === '#ff00ff' ? '#ffffff' : '#ff00ff';
                        break;
                        
                    case 'dohSecret':
                        // DOH secret found
                        showNotification("DOH SECRET FOUND! Boss battle unlocked in future update!");
                        score += 3000;
                        updateScore();
                        break;
                        
                    case 'taitoSecret':
                        // TAITO secret found
                        showNotification("TAITO EASTER EGG FOUND! ALL POWER-UPS UNLOCKED!");
                        
                        // Spawn all power-ups in a row at the top
                        POWER_UP_TYPES.forEach((powerUp, index) => {
                            const x = (index + 1) * (canvas.width / (POWER_UP_TYPES.length + 1)) - 15;
                            spawnPowerUp(x, 10);
                        });
                        break;
                        
                    case 'ultimate':
                        showNotification("🌟 ULTIMATE POWER UNLOCKED! 🌟", 5000);
                        
                        // Apply all power-ups at once
                        paddle.width = PADDLE_WIDTH * 1.5;
                        paddle.hasCatch = true;
                        paddle.hasLaser = true;
                        ball.breaking = true;
                        ball.color = '#ffff00';
                        lives++; // Extra life
                        updateLives();
                        
                        // Activate multiball
                        multiball.activate();
                        
                        // Add screen shake for dramatic effect
                        screenShakeAmount = 15;
                        
                        // Create particles for visual flair
                        for (let i = 0; i < 50; i++) {
                            particles.createBrickExplosion(
                                Math.random() * canvas.width,
                                Math.random() * canvas.height,
                                '#ffffff'
                            );
                        }
                        
                        // Add massive score bonus
                        score += 10000;
                        updateScore();
                        break;
                }
            }
            
            function removeSpecialEffects() {
                // Reset any special effects that are active
                specialEffectTimer = 0;
                
                // Reset ball size if it was changed
                ball.radius = BALL_RADIUS;
                
                // Reset ball color
                ball.color = '#ffffff';
                
                // Reset ball breaking status
                ball.breaking = false;
            }
            
            // Notification system
            function showNotification(message, duration = notificationDuration) {
                const notification = document.getElementById('notification');
                notification.textContent = message;
                notification.classList.remove('hidden', 'fade-out');
                
                // Clear any existing timeout
                if (notificationTimer) {
                    clearTimeout(notificationTimer);
                }
                
                // Set timeout to fade out and hide
                notificationTimer = setTimeout(() => {
                    notification.classList.add('fade-out');
                    
                    setTimeout(() => {
                        notification.classList.add('hidden');
                    }, 500); // Match the CSS transition time
                }, duration);
            }
            
            // Secret combinations tracker (for advanced easter eggs)
            let secretPattern = [];
            
            function trackSecretPattern(key) {
                secretPattern.push(key);
                
                // Keep only the last 10 entries
                if (secretPattern.length > 10) {
                    secretPattern.shift();
                }
                
                // Check for "DOH" pattern: D, O, H keys
                if (secretPattern.join('').includes('doh')) {
                    if (!easterEggsFound.includes('dohSecret')) {
                        activateEasterEgg('dohSecret');
                        secretPattern = []; // Reset after finding
                    }
                }
                
                // Check for "TAITO" pattern
                if (secretPattern.join('').toUpperCase().includes('TAITO')) {
                    if (!easterEggsFound.includes('taitoSecret')) {
                        activateEasterEgg('taitoSecret');
                        secretPattern = []; // Reset after finding
                    }
                }
                
                // Check for ULT pattern for the ultimate easter egg
                const lastThree = secretPattern.slice(-3).join('').toUpperCase();
                if (lastThree === 'ULT') {
                    if (!easterEggsFound.includes('ultimate')) {
                        activateEasterEgg('ultimate');
                        secretPattern = []; // Reset after finding
                    }
                }
            }
            
            // Update window.onload to use the new current date and user
            window.onload = function() {
                // Update the constants with new values
                const CURRENT_TIMESTAMP = "2025-04-03 17:12:28";
                const CURRENT_USER = "Ricky-bruh";
                
                canvas = document.getElementById('gameCanvas');
                canvas.width = 480;
                canvas.height = 600;
                ctx = canvas.getContext('2d');
                
                // Update the current date and time display
                const currentTimeEl = document.querySelector('.last-update');
                if (currentTimeEl) {
                    currentTimeEl.textContent = CURRENT_TIMESTAMP;
                }
                
                // Update player name
                const playerNameElements = document.querySelectorAll('.player-name, .player-welcome');
                playerNameElements.forEach(el => {
                    el.textContent = el.textContent.includes('PLAYER:') ? 
                        "PLAYER: " + CURRENT_USER : "Welcome, " + CURRENT_USER + "!";
                });
                
                // Update date in start screen
                const dateInfoEl = document.querySelector('.date-info');
                if (dateInfoEl) {
                    dateInfoEl.textContent = CURRENT_TIMESTAMP;
                }
                
                // Initialize game objects
                initGame();
                
                // Event listeners for game controls
                document.getElementById('startButton').addEventListener('click', startGame);
                document.getElementById('restartButton').addEventListener('click', restartGame);
                document.getElementById('nextLevelButton').addEventListener('click', nextLevel);
                document.getElementById('pauseButton').addEventListener('click', togglePause);
                document.getElementById('resumeButton').addEventListener('click', resumeGame);
                document.getElementById('speedButton').addEventListener('click', cycleSpeed);
                
                // Paddle controls
                document.addEventListener('mousemove', movePaddleWithMouse);
                document.addEventListener('keydown', handleKeyDown);
                document.addEventListener('keyup', handleKeyUp);
                
                // Easter egg listeners
                document.addEventListener('keydown', checkKonamiCode);
                canvas.addEventListener('click', checkSecretClick);
            
                // Apply the border color for the current level
                updateBorderColor();
                
                // Auto-pause when window loses focus
                window.addEventListener('blur', function() {
                    if (gameState === 'playing') {
                        togglePause();
                        showNotification("Game auto-paused: Window lost focus");
                    }
                });
                
                // Start the animation loop with timestamp for smooth animation
                requestAnimationFrame(gameLoop);
                
                // Show welcome notification
                setTimeout(() => {
                    showNotification(`Welcome back, ${CURRENT_USER}! Last game played: ${CURRENT_TIMESTAMP}`);
                }, 1000);
                
                // Create blinking effect for "GAME START" button
                const startButton = document.getElementById('startButton');
                setInterval(() => {
                    startButton.classList.toggle('blinking');
                }, 700);
                
                // Set high score display
                document.getElementById('highScore').textContent = highScore.toString().padStart(6, '0');
            };
            
            // Add fullscreen toggle shortcut (F key)
            document.addEventListener('keydown', function(e) {
                if (e.key === 'f' || e.key === 'F') {
                    toggleFullscreen();
                }
            });
            
            // Fullscreen toggle function
            function toggleFullscreen() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        showNotification("Fullscreen error: " + err.message);
                    });
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                }
            }
            
            // Helper function for welcome message based on time of day
            function getWelcomeMessage() {
                const hour = new Date().getHours();
                
                if (hour < 12) {
                    return "Good morning, " + CURRENT_USER + "!";
                } else if (hour < 18) {
                    return "Good afternoon, " + CURRENT_USER + "!";
                } else {
                    return "Good evening, " + CURRENT_USER + "!";
                }
            }
            
            // Final easter egg - typing ULT keys
            document.addEventListener('keydown', function(e) {
                if (e.key.toLowerCase() === 'u') {
                    setTimeout(() => {
                        const keyListener = function(e2) {
                            if (e2.key.toLowerCase() === 'l') {
                                setTimeout(() => {
                                    const finalKeyListener = function(e3) {
                                        if (e3.key.toLowerCase() === 't') {
                                            // Found the ultimate secret!
                                            if (!easterEggsFound.includes('ultimate')) {
                                                activateEasterEgg('ultimate');
                                            }
                                            document.removeEventListener('keydown', finalKeyListener);
                                        }
                                    };
                                    document.addEventListener('keydown', finalKeyListener, { once: true });
                                }, 500);
                                document.removeEventListener('keydown', keyListener);
                            }
                        };
                        document.addEventListener('keydown', keyListener, { once: true });
                    }, 500);
                }
            });