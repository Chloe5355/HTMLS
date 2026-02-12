// player.js
function playerTurn(card){
  if(currentTurn !== 'player' || lockBoard) return;
  if(selected.includes(card) || card.classList.contains('matched')) return;

  card.textContent = card.dataset.icon;
  card.classList.add('flip');
  setTimeout(()=>card.classList.remove('flip'), 300);
  selected.push(card);
  rememberCard(card);

  if(selected.length === 2) {
    lockBoard = true;
    setTimeout(()=>{
      checkMatch('player');
      lockBoard = false;
    }, 1000);
  }

  updateScore();
}
