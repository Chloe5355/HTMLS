// ログ関数（スマホ用）
function log(msg){
    console.log(msg);
    const logEl = document.getElementById('log');
    if(logEl) logEl.innerHTML += msg + '<br>';
}

// ゲーム開始関数
function startGame(){
    log('startGame が呼ばれました');
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

// 他の関数も同様に log() を必要に応じて入れられます

// ---------------------------------------------------
// DOM読み込み後に関数を window に公開
document.addEventListener('DOMContentLoaded', ()=>{
    window.startGame = startGame;
    window.stopGame = stopGame;
    window.nextGame = nextGame;
    window.showRules = showRules;
    window.closeRules = closeRules;
    window.playerTurn = playerTurn;
    window.aiTurn = aiTurn;

    log('window に関数を公開しました');
});