function aiTurn(){
  if(currentTurn!=='ai' || lockBoard) return;
  lockBoard = true;
  startAIThinking();

  let available = board.filter(c => !c.classList.contains('matched') && !selected.includes(c));
  if(available.length < 2) return;

  let [c1,c2] = pickSmartAICards(available);
  c1.textContent=c1.dataset.icon;
  c2.textContent=c2.dataset.icon;
  rememberCard(c1);
  rememberCard(c2);
  selected = [c1,c2];
  updateScore();

  stopAIThinking();

  let delay = (c1.dataset.icon===c2.dataset.icon) ? aiExtraDelay.success : aiExtraDelay.fail;

  setTimeout(()=>{
    checkMatch('ai');
    lockBoard = false;
  }, delay);
}
window.aiTurn = aiTurn;