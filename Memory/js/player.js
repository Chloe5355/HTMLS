function playerTurn(card){
  if(currentTurn!=='player' || lockBoard) return;

  if(selected.includes(card) || card.classList.contains('matched')) return;

  card.textContent = card.dataset.icon;
  selected.push(card);
  rememberCard(card);

  if(selected.length===2){
    lockBoard = true;
    setTimeout(()=>{
      checkMatch('player');
      lockBoard = false;
    },1000);
  }
}