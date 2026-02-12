// ai.js
let aiMemory = {};
let aiThinkingInterval;

function startAIThinking() {
  const aiThinking = document.getElementById('aiThinking');
  let dots = '';
  clearInterval(aiThinkingInterval);
  aiThinkingInterval = setInterval(() => {
    dots += '•';
    if(dots.length > 3) dots = '';
    aiThinking.textContent = '思考中 ' + dots;
  }, 400);
}

function stopAIThinking() {
  clearInterval(aiThinkingInterval);
  document.getElementById('aiThinking').textContent = '';
}

function aiTurn(){
  if(currentTurn !== 'ai') return;
  lockBoard = true;
  startAIThinking(); 

  let available = board.filter(c=>!c.classList.contains('matched') && !selected.includes(c));
  if(available.length<2) return;

  let [c1, c2] = pickSmartAICards(available);

  const delay = (c1.dataset.icon === c2.dataset.icon) ? aiExtraDelay.success : aiExtraDelay.fail;

  setTimeout(() => {
    [c1,c2].forEach(c=>{
      c.textContent = c.dataset.icon;
      c.classList.add('flip');
      setTimeout(()=>c.classList.remove('flip'), 300);
      rememberCard(c);
    });

    selected = [c1,c2];
    updateScore();
    stopAIThinking();

    setTimeout(()=>{
      checkMatch('ai');
      lockBoard = false;
    }, delay);

  }, aiDelay[aiLevel]);
}

function pickSmartAICards(available){
  let possiblePairs = [];
  for(let icon in aiMemory){
    let knownCards = aiMemory[icon].filter(c=>available.includes(c));
    if(knownCards.length>=2) possiblePairs.push([knownCards[0], knownCards[1]]);
  }
  if(possiblePairs.length>0){
    return possiblePairs[Math.floor(Math.random()*possiblePairs.length)];
  }

  let singleOptions = [];
  for(let icon in aiMemory){
    let knownCards = aiMemory[icon].filter(c=>available.includes(c));
    if(knownCards.length===1) singleOptions.push(knownCards[0]);
  }
  if(singleOptions.length>0){
    let known = singleOptions[Math.floor(Math.random()*singleOptions.length)];
    let randomCandidates = available.filter(c=>c!==known);
    let randomCard = randomCandidates[Math.floor(Math.random()*randomCandidates.length)];
    return [known, randomCard];
  }

  let idx1=Math.floor(Math.random()*available.length);
  let idx2=Math.floor(Math.random()*available.length);
  if(idx1===idx2) idx2=(idx2+1)%available.length;
  return [available[idx1], available[idx2]];
}