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
  currentTurn = 'ai'; // ←追加: ターン固定を修正
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