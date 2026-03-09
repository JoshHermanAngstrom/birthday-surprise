// ===== STAGE MANAGEMENT =====
function showStage(stageId) {
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    document.getElementById(stageId).classList.add('active');
}

// ===== FART SOUND GENERATOR (Web Audio API) =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playFart() {
    if (!audioCtx) audioCtx = new AudioCtx();

    const duration = 0.25 + Math.random() * 0.25;
    const now = audioCtx.currentTime;

    // Main oscillator — low rumble
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80 + Math.random() * 40, now);
    osc.frequency.linearRampToValueAtTime(50 + Math.random() * 30, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300 + Math.random() * 200, now);
    filter.frequency.linearRampToValueAtTime(100, now + duration);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);

    // Noise burst for texture
    const bufferSize = audioCtx.sampleRate * duration;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = audioCtx.createBufferSource();
    const noiseGain = audioCtx.createGain();
    const noiseFilter = audioCtx.createBiquadFilter();

    noise.buffer = noiseBuffer;
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 150 + Math.random() * 100;
    noiseFilter.Q.value = 1;

    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + duration);
}

// ===== STAGE 1: LOGIN =====
const loginForm = document.getElementById('login-form');
const loginCard = document.querySelector('.login-card');
const loginBtn = loginForm.querySelector('.login-btn');
const loginStage = document.getElementById('login-stage');

let dodgeCount = 0;
const MAX_DODGES = 5;
let isDodging = false;

const dodgeMessages = [
    "Haha, nope!",
    "Too slow!",
    "Almost!",
    "Try again...",
    "Okay okay, one more...",
];

const btnOriginalHTML = loginBtn.innerHTML;

function getRandomPosition() {
    const margin = 50;

    // Use clientWidth/Height for the actual visible viewport (excludes scrollbars)
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    // Measure the button's current rendered size
    const rect = loginBtn.getBoundingClientRect();
    const btnW = rect.width;
    const btnH = rect.height;

    const minX = margin;
    const minY = margin;
    const maxX = vw - btnW - margin;
    const maxY = vh - btnH - margin;

    // Current position
    const curX = parseFloat(loginBtn.style.left) || vw / 2;
    const curY = parseFloat(loginBtn.style.top) || vh / 2;

    let x, y, attempts = 0;
    do {
        x = minX + Math.random() * Math.max(0, maxX - minX);
        y = minY + Math.random() * Math.max(0, maxY - minY);
        attempts++;
    } while (attempts < 30 && Math.hypot(x - curX, y - curY) < 150);

    // Hard clamp
    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    return { x, y };
}

// Intercept clicks on the button
loginBtn.addEventListener('click', (e) => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        loginCard.classList.add('shake');
        setTimeout(() => loginCard.classList.remove('shake'), 500);
        return;
    }

    // Still dodging?
    if (dodgeCount < MAX_DODGES) {
        e.preventDefault();
        e.stopPropagation();

        // Prevent rapid clicks during animation
        if (isDodging) return;
        isDodging = true;

        playFart();

        // Update button text
        loginBtn.innerHTML = '<span>' + dodgeMessages[dodgeCount] + '</span>';
        dodgeCount++;

        // First dodge: move button to body so no parent can clip it
        if (!loginBtn.classList.contains('runaway')) {
            const rect = loginBtn.getBoundingClientRect();
            // Move to overlay to escape all overflow contexts
            document.getElementById('btn-overlay').appendChild(loginBtn);
            loginBtn.classList.add('runaway');
            // Start from current visual position so first move is smooth
            loginBtn.style.left = rect.left + 'px';
            loginBtn.style.top = rect.top + 'px';

            // Let the browser settle, then animate to new spot
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const pos = getRandomPosition();
                    loginBtn.style.left = pos.x + 'px';
                    loginBtn.style.top = pos.y + 'px';
                    setTimeout(() => { isDodging = false; }, 850);
                });
            });
        } else {
            const pos = getRandomPosition();
            loginBtn.style.left = pos.x + 'px';
            loginBtn.style.top = pos.y + 'px';
            setTimeout(() => { isDodging = false; }, 850);
        }

        return;
    }

    // Final click — put button back in the form and log in
    loginBtn.classList.remove('runaway');
    loginBtn.style.left = '';
    loginBtn.style.top = '';
    loginForm.appendChild(loginBtn);
    loginBtn.innerHTML = '<span>Signing in...</span>';
    loginBtn.style.pointerEvents = 'none';

    setTimeout(() => {
        showStage('maze-stage');
        initMaze();
    }, 1200);
});

// Prevent the form's native submit from firing while dodging
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
});

// ===== STAGE 2: MAZE =====
const mazeCanvas = document.getElementById('mazeCanvas');
const mCtx = mazeCanvas.getContext('2d');

const maze = [
    [1,0,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,0,1],
];

const mazeCols = 12;
const mazeRows = 12;
const exitMX = 10;
const exitMY = 11;

let mPlayerX = 1;
let mPlayerY = 0;
let mMoves = 0;
let mStartTime = null;
let mTimerInterval = null;
let mCompleted = false;
let mazeInitialized = false;
let cellSize = 30;

function initMaze() {
    if (mazeInitialized) return;
    mazeInitialized = true;

    // Size the canvas to fit the card nicely
    const wrap = document.querySelector('.maze-canvas-wrap');
    const maxW = wrap.clientWidth - 10;
    cellSize = Math.floor(Math.min(maxW / mazeCols, 32));
    mazeCanvas.width = mazeCols * cellSize;
    mazeCanvas.height = mazeRows * cellSize;

    mPlayerX = 1;
    mPlayerY = 0;
    mMoves = 0;
    mCompleted = false;
    document.getElementById('maze-moves').textContent = '0';
    document.getElementById('maze-timer').textContent = '00:00';

    drawMaze();
    startMazeTimer();
}

function drawMaze() {
    const cs = cellSize;
    mCtx.fillStyle = '#ffffff';
    mCtx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);

    for (let y = 0; y < mazeRows; y++) {
        for (let x = 0; x < mazeCols; x++) {
            if (maze[y][x] === 1) {
                mCtx.fillStyle = '#f9a8d4'; // pink walls
                mCtx.fillRect(x * cs, y * cs, cs, cs);
                // Slight inner shadow
                mCtx.fillStyle = '#f472b6';
                mCtx.fillRect(x * cs + 1, y * cs + 1, cs - 2, cs - 2);
            } else {
                mCtx.fillStyle = '#ffffff';
                mCtx.fillRect(x * cs, y * cs, cs, cs);
                mCtx.strokeStyle = '#fdf2f8';
                mCtx.strokeRect(x * cs, y * cs, cs, cs);
            }
        }
    }

    // Start label
    mCtx.fillStyle = '#be185d';
    mCtx.font = 'bold ' + Math.max(8, cs * 0.3) + 'px Inter';
    mCtx.textAlign = 'center';
    mCtx.textBaseline = 'middle';
    mCtx.fillText('GO', 1 * cs + cs / 2, 0 * cs + cs / 2);

    // Exit
    mCtx.fillStyle = '#ec4899';
    mCtx.fillRect(exitMX * cs + 2, exitMY * cs + 2, cs - 4, cs - 4);
    mCtx.fillStyle = '#fff';
    mCtx.font = 'bold ' + Math.max(7, cs * 0.28) + 'px Inter';
    mCtx.fillText('EXIT', exitMX * cs + cs / 2, exitMY * cs + cs / 2);

    // Player
    mCtx.fillStyle = '#db2777';
    mCtx.beginPath();
    mCtx.arc(mPlayerX * cs + cs / 2, mPlayerY * cs + cs / 2, cs / 3, 0, Math.PI * 2);
    mCtx.fill();
    // Pulse ring
    mCtx.strokeStyle = '#ec4899';
    mCtx.lineWidth = 2;
    mCtx.beginPath();
    mCtx.arc(mPlayerX * cs + cs / 2, mPlayerY * cs + cs / 2, cs / 2.5, 0, Math.PI * 2);
    mCtx.stroke();
}

function mazeCanMove(x, y) {
    if (x < 0 || x >= mazeCols || y < 0 || y >= mazeRows) return false;
    return maze[y][x] === 0;
}

function moveMazePlayer(dx, dy) {
    if (mCompleted) return;
    const nx = mPlayerX + dx;
    const ny = mPlayerY + dy;
    if (mazeCanMove(nx, ny)) {
        mPlayerX = nx;
        mPlayerY = ny;
        mMoves++;
        document.getElementById('maze-moves').textContent = mMoves;
        if (mPlayerX === exitMX && mPlayerY === exitMY) {
            mazeComplete();
        }
        drawMaze();
    }
}

function mazeComplete() {
    mCompleted = true;
    clearInterval(mTimerInterval);
    setTimeout(() => {
        showStage('kiss-stage');
    }, 800);
}

function startMazeTimer() {
    mStartTime = Date.now();
    mTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - mStartTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        document.getElementById('maze-timer').textContent = mins + ':' + secs;
    }, 1000);
}

// Keyboard controls for maze
document.addEventListener('keydown', (e) => {
    if (!mazeInitialized || mCompleted) return;
    // Only respond when maze stage is active
    if (!document.getElementById('maze-stage').classList.contains('active')) return;
    switch (e.key) {
        case 'ArrowUp': e.preventDefault(); moveMazePlayer(0, -1); break;
        case 'ArrowDown': e.preventDefault(); moveMazePlayer(0, 1); break;
        case 'ArrowLeft': e.preventDefault(); moveMazePlayer(-1, 0); break;
        case 'ArrowRight': e.preventDefault(); moveMazePlayer(1, 0); break;
    }
});

// Touch button controls for mobile
document.querySelectorAll('.maze-dir-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const dir = btn.dataset.dir;
        switch (dir) {
            case 'up': moveMazePlayer(0, -1); break;
            case 'down': moveMazePlayer(0, 1); break;
            case 'left': moveMazePlayer(-1, 0); break;
            case 'right': moveMazePlayer(1, 0); break;
        }
    });
});

// Swipe support for maze
(function() {
    let touchStartX = 0, touchStartY = 0;
    const mazeStage = document.getElementById('maze-stage');
    mazeStage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });
    mazeStage.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // too small
        if (Math.abs(dx) > Math.abs(dy)) {
            moveMazePlayer(dx > 0 ? 1 : -1, 0);
        } else {
            moveMazePlayer(0, dy > 0 ? 1 : -1);
        }
    }, { passive: true });
})();

// ===== STAGE 3: KISS GATE =====
const kissBtn = document.getElementById('kiss-btn');
const kissResponse = document.getElementById('kiss-response');
let kissCount = 0;

kissBtn.addEventListener('click', () => {
    kissCount++;
    if (kissCount === 1) {
        kissResponse.textContent = "Come on... you call that a kiss? Try again!";
        kissBtn.textContent = "Okay I really kissed him this time";
    } else {
        kissResponse.textContent = "";
        kissBtn.textContent = "Unlocking...";
        kissBtn.style.pointerEvents = 'none';
        setTimeout(() => {
            showStage('gift-stage');
        }, 1000);
    }
});

// ===== STAGE 4: GIFT BOX =====
const giftBox = document.getElementById('gift-box');
let giftOpened = false;

giftBox.addEventListener('click', () => {
    if (giftOpened) return;
    giftOpened = true;

    // Hide prompt text
    document.querySelector('.gift-prompt').style.animation = 'none';
    document.querySelector('.gift-prompt').style.opacity = '0';
    document.querySelector('.gift-prompt').style.transition = 'opacity 0.3s';

    // Open the lid
    giftBox.classList.add('opened');

    // Launch confetti briefly
    setTimeout(() => {
        launchConfetti();
    }, 400);

    // Rickroll time!
    setTimeout(() => {
        showStage('rickroll-stage');
        startRickroll();
    }, 1500);
});

// ===== CONFETTI =====
function launchConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#ec4899', '#f472b6', '#fbcfe8', '#f5c842', '#7c3aed', '#60a5fa', '#f9a8d4', '#fde68a'];
    const shapes = ['square', 'circle'];

    for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = 2 + Math.random() * 2;
        const size = 6 + Math.random() * 10;

        piece.style.left = left + '%';
        piece.style.width = size + 'px';
        piece.style.height = shape === 'circle' ? size + 'px' : size * 0.6 + 'px';
        piece.style.background = color;
        piece.style.borderRadius = shape === 'circle' ? '50%' : '2px';
        piece.style.animationDelay = delay + 's';
        piece.style.animationDuration = duration + 's';

        container.appendChild(piece);

        // Trigger animation
        requestAnimationFrame(() => {
            piece.classList.add('animate');
        });

        // Clean up
        setTimeout(() => {
            piece.remove();
        }, (delay + duration) * 1000 + 500);
    }
}

// ===== STAGE 5: RICKROLL =====
const rickVideo = document.getElementById('rickroll-video');

function playVideoWithSound(video) {
    video.muted = false;
    const p = video.play();
    if (p) {
        p.catch(() => {
            // Mobile blocked unmuted autoplay — start muted then unmute
            video.muted = true;
            video.play().then(() => {
                video.muted = false;
            }).catch(() => {});
        });
    }
}

function startRickroll() {
    rickVideo.currentTime = 0;
    playVideoWithSound(rickVideo);

    // After 10 seconds, stop and go to countdown
    setTimeout(() => {
        rickVideo.pause();
        showStage('countdown-stage');
        startCountdown();
    }, 10000);
}

// ===== STAGE 6: COUNTDOWN =====
function startCountdown() {
    const numberEl = document.getElementById('countdown-number');
    const barEl = document.getElementById('countdown-bar');
    let count = 5;

    // Kick off the bar fill
    requestAnimationFrame(() => {
        barEl.style.width = '20%';
    });

    const interval = setInterval(() => {
        count--;
        if (count <= 0) {
            clearInterval(interval);
            numberEl.textContent = '0';
            barEl.style.width = '100%';
            // Swap countdown number for the continue button
            setTimeout(() => {
                numberEl.style.display = 'none';
                barEl.parentElement.style.display = 'none';
                document.querySelector('.countdown-subtitle').textContent = 'Your gift is ready!';
                document.getElementById('countdown-continue').classList.add('visible');
            }, 500);
            return;
        }

        numberEl.textContent = count;
        numberEl.classList.add('tick');
        setTimeout(() => numberEl.classList.remove('tick'), 200);
        barEl.style.width = ((5 - count) / 5 * 100) + '%';
    }, 1000);
}

// ===== STAGE 7: DISNEY THEME VIDEO =====
const disneyVideo = document.getElementById('disney-video');

document.getElementById('countdown-continue').addEventListener('click', () => {
    // This runs inside a direct user tap — iOS allows video.play() here
    showStage('disney-video-stage');
    disneyVideo.currentTime = 0;
    disneyVideo.muted = false;
    disneyVideo.play();

    disneyVideo.addEventListener('ended', () => {
        showStage('reveal-stage');
        createSparkles();
    }, { once: true });
});

// ===== SPARKLES (Reveal stage) =====
function createSparkles() {
    const field = document.getElementById('sparkle-field');

    for (let i = 0; i < 50; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 3 + 's';
        sparkle.style.animationDuration = 2 + Math.random() * 3 + 's';

        const size = 1 + Math.random() * 3;
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';

        field.appendChild(sparkle);
    }
}
