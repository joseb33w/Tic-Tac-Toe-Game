const cells = document.querySelectorAll('.cell');
const turnBadge = document.getElementById('turnBadge');
const resetBtn = document.getElementById('resetBtn');
const statusText = document.getElementById('statusText');
const xWinsEl = document.getElementById('xWins');
const oWinsEl = document.getElementById('oWins');
const drawsEl = document.getElementById('draws');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');

const WIN_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let aiMode = false;
let aiThinking = false;
let scores = { X: 0, O: 0, draw: 0 };

function updateTurnBadge() {
  turnBadge.textContent = 'Turn: ' + currentPlayer;
}

function setStatus(message) {
  statusText.textContent = message;
}

function updateScoreboard() {
  xWinsEl.textContent = scores.X;
  oWinsEl.textContent = scores.O;
  drawsEl.textContent = scores.draw;
}

function checkWinner() {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return { winner: board[a], combo: combo };
    }
  }
  return null;
}

function checkDraw() {
  return board.every(function(cell) { return cell !== ''; });
}

function highlightWinningCells(combo) {
  combo.forEach(function(index) {
    cells[index].classList.add('winner');
  });
}

function disableAllCells() {
  cells.forEach(function(cell) {
    cell.disabled = true;
  });
}

/* ---- AI Logic (Minimax) ---- */

function getEmptyCells(b) {
  const empty = [];
  for (let i = 0; i < b.length; i++) {
    if (b[i] === '') empty.push(i);
  }
  return empty;
}

function checkWinnerBoard(b) {
  for (const combo of WIN_COMBOS) {
    const [a, c1, c2] = combo;
    if (b[a] && b[a] === b[c1] && b[c1] === b[c2]) {
      return b[a];
    }
  }
  return null;
}

function minimax(b, depth, isMaximizing) {
  const winner = checkWinnerBoard(b);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (getEmptyCells(b).length === 0) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const i of getEmptyCells(b)) {
      b[i] = 'O';
      best = Math.max(best, minimax(b, depth + 1, false));
      b[i] = '';
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of getEmptyCells(b)) {
      b[i] = 'X';
      best = Math.min(best, minimax(b, depth + 1, true));
      b[i] = '';
    }
    return best;
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let bestMove = -1;
  const empty = getEmptyCells(board);

  // Add a touch of randomness on the first AI move for variety
  if (empty.length >= 8) {
    const corners = [0, 2, 6, 8].filter(i => board[i] === '');
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
  }

  for (const i of empty) {
    board[i] = 'O';
    const score = minimax(board, 0, false);
    board[i] = '';
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

function makeAiMove() {
  if (!gameActive || currentPlayer !== 'O' || !aiMode) return;

  aiThinking = true;
  setStatus('AI is thinking...');
  turnBadge.textContent = 'AI thinking...';

  setTimeout(function() {
    if (!gameActive) { aiThinking = false; return; }

    const move = getBestMove();
    if (move === -1) { aiThinking = false; return; }

    board[move] = 'O';
    cells[move].textContent = 'O';
    cells[move].classList.add('o');
    cells[move].disabled = true;

    var result = checkWinner();

    if (result) {
      gameActive = false;
      scores[result.winner] += 1;
      updateScoreboard();
      highlightWinningCells(result.combo);
      disableAllCells();
      setStatus('AI wins! Press New Game to try again.');
      turnBadge.textContent = 'AI wins!';
      aiThinking = false;
      return;
    }

    if (checkDraw()) {
      gameActive = false;
      scores.draw += 1;
      updateScoreboard();
      setStatus('It\'s a draw! Press New Game to play again.');
      turnBadge.textContent = 'Draw!';
      aiThinking = false;
      return;
    }

    currentPlayer = 'X';
    updateTurnBadge();
    setStatus('Your turn! Pick a cell.');
    aiThinking = false;
  }, 450);
}

/* ---- Core Game ---- */

function handleCellClick(event) {
  if (aiThinking) return;

  var cell = event.target;
  var index = parseInt(cell.dataset.index);

  if (board[index] !== '' || !gameActive) return;

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.disabled = true;

  var result = checkWinner();

  if (result) {
    gameActive = false;
    scores[result.winner] += 1;
    updateScoreboard();
    highlightWinningCells(result.combo);
    disableAllCells();
    const winMsg = aiMode && result.winner === 'X' ? 'You win!' : result.winner + ' wins!';
    setStatus(winMsg + ' Press New Game to play again.');
    turnBadge.textContent = winMsg;
    return;
  }

  if (checkDraw()) {
    gameActive = false;
    scores.draw += 1;
    updateScoreboard();
    setStatus('It\'s a draw! Press New Game to play again.');
    turnBadge.textContent = 'Draw!';
    return;
  }

  // BUG FIX: Now correctly switches between X and O
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

  updateTurnBadge();

  if (aiMode && currentPlayer === 'O') {
    makeAiMove();
  } else {
    setStatus(currentPlayer + '\'s turn. Pick a cell.');
  }
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;
  aiThinking = false;

  cells.forEach(function(cell) {
    cell.textContent = '';
    cell.disabled = false;
    cell.classList.remove('x', 'o', 'winner');
  });

  updateTurnBadge();
  setStatus(aiMode ? 'Your turn! You are X.' : 'X goes first. Good luck!');
}

function toggleMode() {
  aiMode = modeToggle.checked;
  modeLabel.textContent = aiMode ? 'vs AI' : 'vs Friend';
  resetGame();
}

cells.forEach(function(cell) {
  cell.addEventListener('click', handleCellClick);
});

resetBtn.addEventListener('click', resetGame);
modeToggle.addEventListener('change', toggleMode);

updateTurnBadge();
updateScoreboard();
