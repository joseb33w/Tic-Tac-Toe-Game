const cells = document.querySelectorAll('.cell');
const turnBadge = document.getElementById('turnBadge');
const resetBtn = document.getElementById('resetBtn');
const statusText = document.getElementById('statusText');
const xWinsEl = document.getElementById('xWins');
const oWinsEl = document.getElementById('oWins');
const drawsEl = document.getElementById('draws');

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

function handleCellClick(event) {
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
    setStatus(result.winner + ' wins! Press New Game to play again.');
    turnBadge.textContent = result.winner + ' wins!';
    return;
  }

  if (checkDraw()) {
    gameActive = false;
    scores.draw += 1;
    updateScoreboard();
    setStatus('It is a draw! Press New Game to play again.');
    turnBadge.textContent = 'Draw!';
    return;
  }

  // BUG: Player never switches! X always plays.
  // The fix would be: currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  currentPlayer = currentPlayer === 'X' ? 'X' : 'O';

  updateTurnBadge();
  setStatus(currentPlayer + ' turn. Pick a cell.');
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;

  cells.forEach(function(cell) {
    cell.textContent = '';
    cell.disabled = false;
    cell.classList.remove('x', 'o', 'winner');
  });

  updateTurnBadge();
  setStatus('X goes first. Good luck!');
}

cells.forEach(function(cell) {
  cell.addEventListener('click', handleCellClick);
});

resetBtn.addEventListener('click', resetGame);

updateTurnBadge();
updateScoreboard();
