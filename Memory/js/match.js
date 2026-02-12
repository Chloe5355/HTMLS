// match.js
function rememberCard(card){
  if(!aiMemory[card.dataset.icon]) aiMemory[card.dataset.icon]=[];
  if(!aiMemory[card.dataset.icon].includes(card)) aiMemory[card.dataset.icon].push(card);
}

function removeFromMemory(icon, cards){
  if(aiMemory[icon]){
    aiMemory[icon] = aiMemory[icon].filter(c=>!cards.includes(c));
    if(aiMemory[icon].length===0) delete aiMemory[icon];
  }
}

function checkMatch(player){
  const [c1,c2] = selected;
  if(c1.dataset.icon === c2.dataset.icon){
    [c1, c2].forEach(c=>{
      c.classList.add('matched','animate');
      setTimeout(()=>c.classList.remove('animate'),500);
    });

    pairsFound[player]++;
    removeFromMemory(c1.dataset.icon,[c1,c2]);
    selected = [];
    updateScore();

    const scoreSpan = (player==='player') ? document.getElementById('playerScore') : document.getElementById('aiScore');
    scoreSpan.classList.add('score-pop');
    setTimeout(()=>scoreSpan.classList.remove('score-pop'), 500);

    if(isGameOver()) showWin();
    else if(player==='ai') setTimeout(aiTurn, aiDelay[aiLevel]);

  } else {
    setTimeout(()=>{
      c1.textContent=''; c2.textContent='';
      selected = [];
      currentTurn = (player==='player') ? 'ai' : 'player';
      updateScore();
      if(currentTurn==='ai') setTimeout(aiTurn, aiDelay[aiLevel]);
    }, 1000);
  }
}