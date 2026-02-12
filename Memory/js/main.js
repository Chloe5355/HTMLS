let currentTurn = 'player';
let aiLevel = 'medium';
let board = [];
let selected = [];
let pairsFound = { player:0, ai:0 };
let aiMemory = {};
let gridSize = 8;
let winCount = 0;
let lockBoard = false;

const aiDelay = { easy: 1500, medium: 1000, hard: 700 };
const aiExtraDelay = { success: 600, fail: 1200 };

function startGame() {
    gridSize = parseInt(document.getElementById('boardSize').value);
    document.documentElement.style.setProperty('--grid-size', gridSize);

    document.getElementById('titleScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');

    aiLevel = document.getElementById('aiDifficulty').value;
    pairsFound = { player:0, ai:0 };
    aiMemory = {};
    currentTurn = 'player';
    lockBoard = false;

    initBoard();
    updateScore();

    if(currentTurn==='ai') setTimeout(aiTurn, aiDelay[aiLevel]);
}

function stopGame() {
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('winScreen').classList.remove('active');
    document.getElementById('titleScreen').classList.add('active');
}

function nextGame() {
    document.getElementById('winScreen').classList.remove('active');
    startGame();
}

function showRules() { document.getElementById('rulesModal').style.display='flex'; }
function closeRules() { document.getElementById('rulesModal').style.display='none'; }

function updateScore() {
    document.getElementById('currentTurn').textContent = (currentTurn==='player')?'あなた':'AI';
    document.getElementById('playerScore').textContent = pairsFound.player;
    document.getElementById('aiScore').textContent = pairsFound.ai;
}

// ---------------------------------------------------
// window で公開（HTMLのボタンやカードから呼び出せる）
document.addEventListener('DOMContentLoaded', () => {
    window.startGame = startGame;
    window.stopGame = stopGame;
    window.nextGame = nextGame;
    window.showRules = showRules;
    window.closeRules = closeRules;
    window.playerTurn = playerTurn;
    window.aiTurn = aiTurn;
});