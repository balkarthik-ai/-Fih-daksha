const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const state = {
  score: 0,
  gameOver: false,
  message: 'Catch fish and reach 10 points!',
  hook: { x: canvas.width / 2, y: 120 },
  fish: [],
  spawnTimer: 0.7,
  lastTime: 0,
  keys: {},
};

const { clamp, getScoreDelta } = typeof window === 'undefined' ? require('./utils') : {
  clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
  getScoreDelta: (color) => {
    if (color === 'green') return 2;
    if (color === 'red') return -2;
    return 0;
  },
};

function resetGame() {
  state.score = 0;
  state.gameOver = false;
  state.message = 'Catch fish and reach 10 points!';
  state.hook = { x: canvas.width / 2, y: 120 };
  state.fish = [];
  state.spawnTimer = 0.7;
  scoreEl.textContent = '0';
}

function spawnFish() {
  const colors = ['green', 'yellow', 'red'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 20 + Math.random() * 26;
  const direction = Math.random() > 0.5 ? 1 : -1;
  const y = 160 + Math.random() * (canvas.height - 220);
  const speed = 90 + Math.random() * 45;

  state.fish.push({
    x: direction === 1 ? -60 : canvas.width + 60,
    y,
    size,
    color,
    direction,
    speed,
  });
}

function applyScore(color) {
  state.score += getScoreDelta(color);

  scoreEl.textContent = state.score;

  if (state.score >= 10) {
    state.gameOver = true;
    state.message = 'You won! Tap Play Again to continue.';
  } else if (state.score <= -10) {
    state.gameOver = true;
    state.message = 'You lost! Tap Play Again to try again.';
  }
}

function update(dt) {
  if (state.gameOver) {
    return;
  }

  const moveSpeed = 260 * dt;
  if (state.keys['ArrowUp']) state.hook.y -= moveSpeed;
  if (state.keys['ArrowDown']) state.hook.y += moveSpeed;
  if (state.keys['ArrowLeft']) state.hook.x -= moveSpeed;
  if (state.keys['ArrowRight']) state.hook.x += moveSpeed;

  state.hook.x = clamp(state.hook.x, 70, canvas.width - 70);
  state.hook.y = clamp(state.hook.y, 120, canvas.height - 60);

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnFish();
    state.spawnTimer = 0.95;
  }

  state.fish = state.fish.filter((fish) => {
    fish.x += fish.direction * fish.speed * dt * 1.5;

    const hookRadius = 16;
    const hit =
      Math.abs(fish.x - state.hook.x) < fish.size / 2 + hookRadius &&
      Math.abs(fish.y - state.hook.y) < fish.size / 2 + hookRadius;

    if (hit) {
      applyScore(fish.color);
      return false;
    }

    return fish.x > -80 && fish.x < canvas.width + 80;
  });
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#9be7ff');
  sky.addColorStop(0.6, '#37b7ff');
  sky.addColorStop(1, '#0f6fc2');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffd56a';
  ctx.beginPath();
  ctx.arc(140, 100, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 0; i < 7; i += 1) {
    const x = 80 + i * 120;
    const y = 150 + (i % 2) * 30;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#2ca9ff';
  ctx.fillRect(0, 160, canvas.width, canvas.height - 160);

  ctx.fillStyle = '#b5f5ff';
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.arc(80 + i * 100, 210 + (i % 3) * 22, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBoat() {
  ctx.save();
  ctx.translate(canvas.width / 2 - 90, 84);
  ctx.fillStyle = '#ff8c42';
  ctx.beginPath();
  ctx.roundRect(0, 0, 180, 70, 16);
  ctx.fill();

  ctx.fillStyle = '#ffbe6f';
  ctx.beginPath();
  ctx.roundRect(24, 12, 132, 34, 10);
  ctx.fill();

  ctx.fillStyle = '#7a4b1f';
  ctx.fillRect(72, 20, 20, 34);
  ctx.fillRect(110, 20, 20, 34);
  ctx.fillRect(148, 20, 14, 24);

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(148, 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHook() {
  ctx.strokeStyle = '#8d5a2b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 110);
  ctx.lineTo(state.hook.x, state.hook.y);
  ctx.stroke();

  ctx.fillStyle = '#4b2c1b';
  ctx.beginPath();
  ctx.arc(state.hook.x, state.hook.y, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d7b08c';
  ctx.beginPath();
  ctx.arc(state.hook.x, state.hook.y, 10, 0, Math.PI * 2);
  ctx.fill();
}

function drawFish(fish) {
  ctx.save();
  ctx.translate(fish.x, fish.y);
  if (fish.direction < 0) {
    ctx.scale(-1, 1);
  }

  const colors = {
    green: '#4fdc5f',
    yellow: '#ffd84d',
    red: '#ff5d5d',
  };

  ctx.fillStyle = colors[fish.color];
  ctx.beginPath();
  ctx.ellipse(0, 0, fish.size * 0.65, fish.size * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(fish.size * 0.08, -4, fish.size * 0.14, fish.size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2d2d2d';
  ctx.beginPath();
  ctx.arc(fish.size * 0.16, -4, fish.size * 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff3aa';
  ctx.beginPath();
  ctx.moveTo(-fish.size * 0.62, 0);
  ctx.lineTo(-fish.size * 0.9, -fish.size * 0.2);
  ctx.lineTo(-fish.size * 0.9, fish.size * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#4bbf5b';
  ctx.beginPath();
  ctx.moveTo(fish.size * 0.25, -fish.size * 0.1);
  ctx.quadraticCurveTo(fish.size * 0.7, -fish.size * 0.35, fish.size * 0.65, 0);
  ctx.quadraticCurveTo(fish.size * 0.7, fish.size * 0.35, fish.size * 0.25, fish.size * 0.1);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawMessage() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = '700 38px Trebuchet MS';
  ctx.textAlign = 'center';
  ctx.fillText(state.message, canvas.width / 2, canvas.height / 2 - 18);

  ctx.font = '600 18px Trebuchet MS';
  ctx.fillText('Use the arrow keys to fish and space to restart.', canvas.width / 2, canvas.height / 2 + 20);
}

function draw() {
  drawBackground();
  drawBoat();
  state.fish.forEach(drawFish);
  drawHook();

  ctx.font = '700 24px Trebuchet MS';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.fillText(`Score: ${state.score}`, 24, 40);

  if (state.gameOver) {
    drawMessage();
  }
}

function loop(timestamp) {
  const dt = Math.min(0.032, (timestamp - (state.lastTime || timestamp)) / 1000);
  state.lastTime = timestamp;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

const restartButton = document.getElementById('restartButton');
const controlButtons = document.querySelectorAll('[data-action]');

function setControlAction(action, pressed) {
  state.keys[action] = pressed;
}

controlButtons.forEach((button) => {
  const action = button.dataset.action;

  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    setControlAction(action, true);
    button.classList.add('active');
  });

  button.addEventListener('pointerup', () => {
    setControlAction(action, false);
    button.classList.remove('active');
  });

  button.addEventListener('pointerleave', () => {
    setControlAction(action, false);
    button.classList.remove('active');
  });
});

restartButton.addEventListener('click', resetGame);

const installButton = document.getElementById('installButton');
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.style.display = 'inline-flex';
});

installButton.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.style.display = 'none';
  if (choice.outcome === 'accepted') {
    console.log('App install accepted');
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(() => {
    // silently ignore registration issues
  });
}

window.addEventListener('keydown', (event) => {
  const key = event.key;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
    event.preventDefault();
  }

  if (key === ' ') {
    if (state.gameOver) {
      resetGame();
    }
    return;
  }

  state.keys[key] = true;
});

window.addEventListener('keyup', (event) => {
  state.keys[event.key] = false;
});

resetGame();
requestAnimationFrame(loop);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    clamp,
    getScoreDelta,
  };
}
