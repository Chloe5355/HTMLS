// ui.js
function updateScore(){
  const playerBox = document.getElementById('playerScoreBox');
  const aiBox = document.getElementById('aiScoreBox');

  document.getElementById('playerScore').textContent = pairsFound.player;
  document.getElementById('aiScore').textContent = pairsFound.ai;

  if(currentTurn==='player'){
    playerBox.classList.add('active');
    aiBox.classList.remove('active');
    board.forEach(card => {
      if(!card.classList.contains('matched')) card.classList.add('player-hover');
    });
  } else {
    aiBox.classList.add('active');
    playerBox.classList.remove('active');
    board.forEach(card => card.classList.remove('player-hover'));
  }
}

function showRules(){ document.getElementById('rulesModal').style.display='flex'; }
function closeRules(){ document.getElementById('rulesModal').style.display='none'; }