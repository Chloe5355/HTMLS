// main.js
let currentTurn = 'player';
let aiLevel = 'medium';
let gridSize = 8;
let lockBoard = false;
let pairsFound = { player:0, ai:0 };
let aiDelay = { easy: 1500, medium: 1000, hard: 700 };
let aiExtraDelay = { success: 600, fail: 1200 };
let winCount = 0;

function startGame() {
  gridSize = parseInt(document.getElementById('boardSize').value);
  document.documentElement.style.setProperty('--grid-size', gridSize);

  document.getElementById('titleScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');

  aiLevel = document.getElementById('aiDifficulty').value;
  pairsFound = { player:0, ai:0 };
  currentTurn = 'player';
  lockBoard = false;

  initBoard();
  updateScore();
}

function stopGame() {
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('winScreen').classList.remove('active');
  document.getElementById('titleScreen').classList.add('active');
}