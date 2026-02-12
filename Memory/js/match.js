function checkMatch(player){
  const [c1,c2] = selected;

  if(c1.dataset.icon===c2.dataset.icon){
    c1.classList.add('matched');
    c2.classList.add('matched');
    pairsFound[player]++;
    removeFromMemory(c1.dataset.icon,[c1,c2]);
    selected=[];
    updateScore();

    if(isGameOver()) showWin();
    else if(player==='ai') setTimeout(aiTurn, aiDelay[aiLevel]);

  } else {
    setTimeout(()=>{
      c1.textContent='';
      c2.textContent='';
      selected=[];
      currentTurn = (player==='player')?'ai':'player';
      updateScore();
      if(currentTurn==='ai') setTimeout(aiTurn, aiDelay[aiLevel]);
    },1000);
  }
}