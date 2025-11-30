document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const character = document.getElementById('character');
    const gameContainer = document.getElementById('game-container');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');
    const road = document.getElementById('road');
    
    // Game state
    let isJumping = false;
    let isGameOver = false;
    let score = 0;
    let highScore = localStorage.getItem('malwareSurferHighScore') || 0;
    let speed = 8;
    let gameSpeed = 2000;
    let lanes = [150, 350, 550];
    let characterPosition = 1; // Middle lane
    
    // Set high score display
    highScoreElement.textContent = `High Score: ${highScore}`;
    
    // Character options
    const characters = [
        '👨‍💻', // Hacker
        '👩‍💻', // Female hacker
        '🦹', // Super villain
        '🧙', // Wizard
    ];
    character.textContent = characters[0];
    
    // Obstacle types with better graphics
    const obstacleTypes = [
        { class: 'virus', icon: '🦠', color: '#ff5555' },
        { class: 'worm', icon: '🐛', color: '#55ff55' },
        { class: 'trojan', icon: '👾', color: '#ffff55' },
        { class: 'ransomware', icon: '💿', color: '#aa55ff' },
        { class: 'spyware', icon: '📀', color: '#ff55ff' }
    ];
    
    // Create background "code rain" effect
    function createCodeRain() {
        const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ$%&/()=?";
        const element = document.createElement('div');
        element.className = 'background-code';
        
        // Generate random code lines
        let code = '';
        for (let i = 0; i < 50; i++) {
            let line = '';
            for (let j = 0; j < 80; j++) {
                line += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            code += line + '\n';
        }
        
        element.textContent = code;
        element.style.left = `${Math.random() * 100}%`;
        element.style.top = `${Math.random() * 100}%`;
        gameContainer.appendChild(element);
        
        // Animate the code
        let position = -100;
        const fallSpeed = 1 + Math.random() * 3;
        
        function animate() {
            position += fallSpeed;
            element.style.transform = `translateY(${position}px)`;
            
            if (position < window.innerHeight) {
                requestAnimationFrame(animate);
            } else {
                element.remove();
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Start code rain effect
    setInterval(createCodeRain, 500);
    
    // Character movement
    function moveCharacter(direction) {
        if (isJumping || isGameOver) return;
        
        if (direction === 'left' && characterPosition > 0) {
            characterPosition--;
        } else if (direction === 'right' && characterPosition < lanes.length - 1) {
            characterPosition++;
        }
        
        character.style.left = `${lanes[characterPosition]}px`;
    }
    
    // Jump function
    function jump() {
        if (isJumping || isGameOver) return;
        
        isJumping = true;
        character.classList.remove('running');
        character.classList.add('jumping');
        
        setTimeout(() => {
            character.classList.remove('jumping');
            character.classList.add('running');
            isJumping = false;
        }, 1000);
    }
    
    // Create obstacles
    function createObstacle() {
        if (isGameOver) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        // Random obstacle type
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        obstacle.classList.add(type.class);
        obstacle.textContent = type.icon;
        obstacle.style.color = type.color;
        
        // Random lane
        const lane = Math.floor(Math.random() * lanes.length);
        obstacle.style.left = `${lanes[lane]}px`;
        
        gameContainer.appendChild(obstacle);
        
        // Animate obstacle
        let position = window.innerWidth;
        obstacle.style.left = `${position}px`;
        
        const obstacleInterval = setInterval(() => {
            if (position < -100) {
                // Obstacle passed
                clearInterval(obstacleInterval);
                obstacle.remove();
                score++;
                scoreElement.textContent = `Score: ${score}`;
                
                // Increase difficulty
                if (score % 5 === 0) {
                    speed += 0.5;
                    gameSpeed = Math.max(800, gameSpeed - 100);
                }
            } else if (
                position > lanes[characterPosition] - 60 && 
                position < lanes[characterPosition] + 60 && 
                isJumping === false
            ) {
                // Collision detected
                clearInterval(obstacleInterval);
                gameOver();
            } else {
                // Move obstacle
                position -= speed;
                obstacle.style.left = `${position}px`;
            }
        }, 16);
        
        // Schedule next obstacle
        if (!isGameOver) {
            setTimeout(createObstacle, gameSpeed);
        }
    }
    
    // Game over function
    function gameOver() {
        isGameOver = true;
        character.textContent = '💥';
        character.classList.remove('running', 'jumping');
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('malwareSurferHighScore', highScore);
            highScoreElement.textContent = `High Score: ${highScore}`;
        }
        
        // Show game over screen
        finalScoreElement.textContent = score;
        gameOverElement.style.display = 'block';
    }
    
    // Start game
    function startGame() {
        // Reset game state
        isGameOver = false;
        score = 0;
        speed = 8;
        gameSpeed = 2000;
        characterPosition = 1;
        
        // Reset displays
        scoreElement.textContent = `Score: ${score}`;
        gameOverElement.style.display = 'none';
        character.textContent = characters[0];
        character.className = 'running';
        character.style.left = `${lanes[characterPosition]}px`;
        
        // Clear existing obstacles
        document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
        
        // Start obstacle generation
        createObstacle();
    }
    
    // Event listeners
    document.addEventListener('keydown', (e) => {
        if (isGameOver) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                moveCharacter('left');
                break;
            case 'ArrowRight':
                moveCharacter('right');
                break;
            case 'ArrowUp':
            case ' ':
                jump();
                break;
        }
    });
    
    // Touch controls for mobile
    let touchStartX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchend', (e) => {
        if (isGameOver) {
            startGame();
            return;
        }
        
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                moveCharacter('left');
            } else {
                moveCharacter('right');
            }
        } else {
            jump();
        }
    });
    
    restartBtn.addEventListener('click', startGame);
    
    // Initialize game
    startGame();
});