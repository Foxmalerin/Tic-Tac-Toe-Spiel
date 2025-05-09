alert("Willkommen zu meinem Tic Tac Toe spiel.");
alert("X fängt an.");

const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('game-board');
const newGameButton = document.getElementById('new-game');
const resetButton = document.getElementById('reset');
const aiToggle = document.getElementById('ai-toggle');

const xWinsElement = document.getElementById('x-wins');
const oWinsElement = document.getElementById('o-wins');

let oTurn;
let oscore = 0, xscore = 0; drawScore = 0;
let playAgainstAI = false;
startGame();

newGameButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
aiToggle.addEventListener('change', (e) => {
  playAgainstAI = e.target.checked;
  startGame();
});

function startGame() {
  oTurn = false;
  cellElements.forEach(cell => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(O_CLASS);
    cell.classList.remove('winning');
    cell.removeEventListener('click', handleClick);
    cell.addEventListener('click', handleClick, { once: true });
  });
  if (oTurn && playAgainstAI) {
    aiMove(); // KI macht den ersten Zug, wenn O beginnt
  }
}

function resetGame() {
  xscore = 0;
  oscore = 0;
  drawScore = 0;
  updateScore();
  startGame();
}

function handleClick(e) {
  console.log("handleClick called");
  const cell = e.target;
  const currentClass = oTurn ? O_CLASS : X_CLASS;
  placeMark(cell, currentClass);
  if (checkWin(currentClass)) {
    console.log("checkWin passed for", currentClass);
    highlightWinningCombination(currentClass);
    if (currentClass === X_CLASS) {
      console.log("X wins");
      xscore += 1;
      const xWinSound = document.getElementById('x-win-sound');
      if (xWinSound) {
        xWinSound.play().catch(error => console.error("Error playing x-win-sound:", error)); // Gewinner-Sound für X
        startConfetti(); // Starte Konfetti, wenn gegen die KI gespielt wird und X gewinnt
      } else {
        console.error("x-win-sound element not found");
      }
    } else {
      console.log("O wins");
      oscore += 1;
      const oWinSound = document.getElementById('x-win-sound');
      if (oWinSound) {
        oWinSound.play().catch(error => console.error("Error playing o-win-sound:", error)); // Gewinner-Sound für O
        startConfetti(); // Starte Konfetti, wenn gegen die KI gespielt wird und X gewinnt
      } else {
        console.error("o-win-sound element not found");
      }
    }
    updateScore();
  } else if (isDraw()) {
    console.log("It's a draw");
    drawScore += 1; // Erhöhe die Anzahl der Unentschieden
    updateScore();  // Aktualisiere die Siegesliste
  } else {
    swapTurns();
    if (oTurn && playAgainstAI) {
      aiMove();
    }
  }
}

function startConfetti() {
  const count = 200,
    defaults = {
      origin: { y: 0.7 },
    };

  function fire(particleRatio, opts) {
    confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
    }));
  }
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {spread: 60,});
  fire(0.35, {spread: 100, decay: 0.91, scalar: 0.8,});
  fire(0.1, {spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2,});
  fire(0.1, {spread: 120, startVelocity: 45,});
}
function placeMark(cell, currentClass) {
  cell.classList.add(currentClass);
}

function swapTurns() {
  oTurn = !oTurn;
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some(combination => {
    return combination.every(index => {
      return cellElements[index].classList.contains(currentClass);
    });
  });
}

function highlightWinningCombination(currentClass) {
  WINNING_COMBINATIONS.forEach(combination => {
    if (combination.every(index => cellElements[index].classList.contains(currentClass))) {
      combination.forEach(index => {
        cellElements[index].classList.add('winning');
      });
    }
  });
}

function isDraw() {
  return [...cellElements].every(cell => {
    return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
  });
}

function updateScore() {
  xWinsElement.textContent = xscore;
  oWinsElement.textContent = oscore;
  document.getElementById('draws').textContent = drawScore;
}

function aiMove() {
  const makeRandomMove = Math.random() < 0.6; // 60% Wahrscheinlichkeit, einen zufälligen Zug zu machen
  let move;
  if (makeRandomMove) {
    const emptyCells = Array.from(cellElements).filter(cell => !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS));
    move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  } else {
    move = getBestMove();
  }
  const cell = move;
  placeMark(cell, O_CLASS);
  if (checkWin(O_CLASS)) {
    highlightWinningCombination(O_CLASS);
    oscore += 1;
    const oWinSound = document.getElementById('o-win-sound');
    if (oWinSound) {
      oWinSound.play().catch(error => console.error("Error playing o-win-sound:", error)); // Verlierer-Sound für O
    } else {
      console.error("o-win-sound element not found");
    }
    updateScore();
  } else if (isDraw()) {
    drawScore += 1; // Erhöhe die Anzahl der Unentschieden
    updateScore();  // Aktualisiere die Siegesliste
  } else {
    swapTurns();
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;
  cellElements.forEach((cell, index) => {
    if (cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)) {
      return;
    }
    cell.classList.add(O_CLASS);
    const score = minimax(0, false);
    cell.classList.remove(O_CLASS);
    if (score > bestScore) {
      bestScore = score;
      move = cell;
    }
  });
  return move;
}

function minimax(depth, isMaximizing) {
  if (checkWin(O_CLASS)) {
    return 1;
  }
  if (checkWin(X_CLASS)) {
    return -1;
  }
  if (isDraw()) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    cellElements.forEach(cell => {
      if (cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)) {
        return;
      }
      cell.classList.add(O_CLASS);
      const score = minimax(depth + 1, false);
      cell.classList.remove(O_CLASS);
      bestScore = Math.max(score, bestScore);
    });
    return bestScore;
  } else {
    let bestScore = Infinity;
    cellElements.forEach(cell => {
      if (cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)) {
        return;
      }
      cell.classList.add(X_CLASS);
      const score = minimax(depth + 1, true);
      cell.classList.remove(X_CLASS);
      bestScore = Math.min(score, bestScore);
    });
    return bestScore;
  }
}
function toggleAI() {
  var checkBox = document.getElementById("ai-toggle");
  var label = document.getElementById("toggle-label");

  if (checkBox.checked) {
    label.innerHTML = "KI AN"; // Text ändern, wenn die Checkbox aktiviert ist
    label.style.backgroundColor = "green"; // Hintergrundfarbe ändern
    alert("Du fängst an.")
  } else {
    label.innerHTML = "KI AUS"; // Text ändern, wenn die Checkbox deaktiviert ist
    label.style.backgroundColor = "red"; // Hintergrundfarbe ändern
    alert("X fängt an.")
  }
}
// ist ein teil damit es keine internet verbindung braucht
const CACHE_NAME = 'tic-tac-toe-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/images/background.jpg',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
      }
      return fetch(event.request);
      })
  );
});

