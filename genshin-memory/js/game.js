let currentTurn = 'player';
let aiLevel = 'medium';
let board = [];
let selected = [];
let pairsFound = { player: 0, ai: 0 };
let aiMemory = {}; // icon: [card1, card2,...]

function startGame() {
  document.getElementById('titleScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');
  aiLevel = document.getElementById('aiDifficulty').value;
  initBoard();
}

function stopGame() {
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('winScreen').classList.remove('active');
  document.getElementById('titleScreen').classList.add('active');
  pairsFound = {player:0, ai:0};
  aiMemory = {};
}

function initBoard(){
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  board = [];
  const totalCards = 8*8;
  const icons = ['🗡️','🏹','📖','🌪','🔥','💧','❄','⚡','🪨','🌿'];
  let cardPairs = [];
  for(let i=0;i<totalCards/2;i++){
    let icon = icons[i % icons.length];
    cardPairs.push(icon, icon);
  }
  cardPairs.sort(()=>Math.random()-0.5);
  
  for(let i=0;i<totalCards;i++){
    let card = document.createElement('div');
    card.className = 'card';
    card.dataset.icon = cardPairs[i];
    card.textContent = '?';
    card.onclick = ()=>playerTurn(card);
    board.push(card);
    boardEl.appendChild(card);
  }
  currentTurn = 'player';
}

function playerTurn(card){
  if(currentTurn!=='player') return;
  if(selected.includes(card)||card.classList.contains('matched')) return;
  card.textContent = card.dataset.icon;
  selected.push(card);
  rememberCard(card);
  if(selected.length===2){
    checkMatch('player');
  }
}

function rememberCard(card){
  if(!aiMemory[card.dataset.icon]) aiMemory[card.dataset.icon]=[];
  if(!aiMemory[card.dataset.icon].includes(card)) aiMemory[card.dataset.icon].push(card);
}

function checkMatch(player){
  const [c1,c2] = selected;
  if(c1.dataset.icon===c2.dataset.icon){
    c1.classList.add('matched');
    c2.classList.add('matched');
    pairsFound[player]++;
    removeFromMemory(c1.dataset.icon, [c1,c2]);
    selected = [];
    if(isGameOver()) showWin();
    else if(player==='ai') setTimeout(aiTurn,1000);
  } else {
    setTimeout(()=>{
      c1.textContent = '?';
      c2.textContent = '?';
      selected=[];
      currentTurn = (player==='player')?'ai':'player';
      if(currentTurn==='ai') setTimeout(aiTurn,1000);
    },1000);
  }
}

function removeFromMemory(icon, cards){
  if(aiMemory[icon]){
    aiMemory[icon] = aiMemory[icon].filter(c => !cards.includes(c));
    if(aiMemory[icon].length===0) delete aiMemory[icon];
  }
}

function aiTurn(){
  let available = board.filter(c=>!c.classList.contains('matched'));
  if(available.length<2) return;
  
  let [c1,c2] = pickAICards(available);
  
  c1.textContent = c1.dataset.icon;
  c2.textContent = c2.dataset.icon;
  rememberCard(c1);
  rememberCard(c2);
  
  selected = [c1,c2];
  setTimeout(()=>checkMatch('ai'),1000);
}

function pickAICards(available){
  if(aiLevel==='easy'){
    let idx1=Math.floor(Math.random()*available.length);
    let idx2=Math.floor(Math.random()*available.length);
    if(idx1===idx2) idx2=(idx2+1)%available.length;
    return [available[idx1], available[idx2]];
  } else if(aiLevel==='medium'){
    for(let icon in aiMemory){
      if(aiMemory[icon].length>=1){
        let knownCard = aiMemory[icon][0];
        let random = available.find(c=>c!==knownCard) || available[0];
        return [knownCard, random];
      }
    }
    return pickAICards(available); // fallback random
  } else if(aiLevel==='hard'){
    // 完全に既知カードがあれば揃える
    for(let icon in aiMemory){
      if(aiMemory[icon].length>=2){
        return [aiMemory[icon][0], aiMemory[icon][1]];
      }
    }
    return pickAICards(available); // random fallback
  }
}

function isGameOver(){
  return board.every(c=>c.classList.contains('matched'));
}

function showWin(){
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('winScreen').classList.add('active');
  document.getElementById('winStreak').textContent = pairsFound.player;
}

function nextGame(){
  stopGame();
  startGame();
}

/* ルールモーダル */
function showRules(){ document.getElementById('rulesModal').style.display='flex'; }
function closeRules(){ document.getElementById('rulesModal').style.display='none'; }

function changeElement(){ /* 元素テーマ変更処理 */ }