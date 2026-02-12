// gameOver.js
function isGameOver(){
  return board.every(c=>c.classList.contains('matched'));
}

function showWin(){
  board.forEach(card => {
    if(!card.classList.contains('matched')) return;
    const x = (Math.random()-0.5) * 200 + 'px';
    const y = (Math.random()-0.5) * 200 + 'px';
    card.style.setProperty('--x', x);
    card.style.setProperty('--y', y);
    card.classList.add('fly');
  });

  setTimeout(()=>{
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('winScreen').classList.add('active');
    document.getElementById('playerPairs').textContent = pairsFound.player;
    document.getElementById('aiPairs').textContent = pairsFound.ai;

    if(pairsFound.player > pairsFound.ai){
      document.getElementById('winner').textContent = 'あなた';
      winCount++;
      document.getElementById('winCount').textContent = winCount;
    } else if(pairsFound.player < pairsFound.ai){
      document.getElementById('winner').textContent = 'AI';
    } else {
      document.getElementById('winner').textContent = '引き分け';
    }

    board.forEach(c => c.classList.remove('fly', 'matched'));
  }, 1000);
}

function nextGame(){
  document.getElementById('winScreen').classList.remove('active');
  startGame();
}