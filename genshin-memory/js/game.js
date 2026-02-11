let currentTurn = 'player';
let aiLevel = 'medium';
let board = [];
let selected = [];
let pairsFound = { player:0, ai:0 };
let aiMemory = {};
let gridSize = 8;
let winCount = 0;

// AI思考時間（ミリ秒）
const aiDelay = { easy: 1500, medium: 1000, hard: 700 };

// ---------------- GAME START ----------------
function startGame() {
  gridSize = parseInt(document.getElementById('boardSize').value);
  document.documentElement.style.setProperty('--grid-size', gridSize);

  document.getElementById('titleScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');

  aiLevel = document.getElementById('aiDifficulty').value;
  pairsFound = { player:0, ai:0 };
  aiMemory = {};
  currentTurn = 'player';

  initBoard();
  updateScore();
}

function stopGame() {
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('winScreen').classList.remove('active');
  document.getElementById('titleScreen').classList.add('active');
}

// ---------------- INIT BOARD ----------------
function initBoard(){
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  board = [];
  const totalCards = gridSize*gridSize;
  const icons = ['🗡️','🏹','📖','🌪','🔥','💧','❄','⚡','🪨','🌿'];
  let cardPairs = [];
  for(let i=0;i<totalCards/2;i++){
    let icon = icons[i % icons.length];
    cardPairs.push(icon, icon);
  }
  cardPairs.sort(()=>Math.random()-0.5);

  for(let i=0;i<totalCards;i++){
    let card = document.createElement('div');
    card.className='card';
    card.dataset.icon = cardPairs[i];
    card.textContent = ''; 
    card.onclick = ()=>playerTurn(card);
    board.push(card);
    boardEl.appendChild(card);
  }

  selected = [];
  updateScore();
  currentTurn = 'player';
}

// ---------------- PLAYER TURN ----------------
function playerTurn(card){
  if(currentTurn !== 'player') return;
  if(selected.includes(card) || card.classList.contains('matched')) return;

  card.textContent = card.dataset.icon;
  selected.push(card);
  rememberCard(card);

  if(selected.length === 2) {
    setTimeout(()=>checkMatch('player'), 1000);
  }
  updateScore();
}

// ---------------- AI TURN ----------------
function aiTurn(){
  if(currentTurn !== 'ai') return;
  let available = board.filter(c=>!c.classList.contains('matched') && !selected.includes(c));
  if(available.length<2) return;

  let [c1, c2] = pickSmartAICards(available);

  c1.textContent = c1.dataset.icon;
  c2.textContent = c2.dataset.icon;
  rememberCard(c1);
  rememberCard(c2);
  selected = [c1,c2];

  updateScore();
  setTimeout(()=>checkMatch('ai'), aiDelay[aiLevel]);
}

// ---------------- CHECK MATCH ----------------
function checkMatch(player){
  const [c1,c2] = selected;
  if(c1.dataset.icon === c2.dataset.icon){
    // ペア成功
    c1.classList.add('matched');
    c2.classList.add('matched');
    pairsFound[player]++;
    removeFromMemory(c1.dataset.icon,[c1,c2]);
    selected = [];
    updateScore();

    if(isGameOver()) {
      showWin();
    } else {
      // 揃った場合は同じターンで続ける
      if(player==='ai') setTimeout(aiTurn, aiDelay[aiLevel]);
    }

  } else {
    // 揃わなかった場合はターン交代
    setTimeout(()=>{
      c1.textContent='';
      c2.textContent='';
      selected = [];
      currentTurn = (player==='player') ? 'ai' : 'player';
      updateScore();
      if(currentTurn==='ai') setTimeout(aiTurn, aiDelay[aiLevel]);
    }, 1000);
  }
}

// ---------------- AI MEMORY ----------------
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

// ---------------- SMART AI CARD PICK ----------------
function pickSmartAICards(available){
  // 1. 覚えたカードで揃えられるペアをランダムに選ぶ
  let possiblePairs = [];
  for(let icon in aiMemory){
    let knownCards = aiMemory[icon].filter(c=>available.includes(c));
    if(knownCards.length>=2) possiblePairs.push([knownCards[0], knownCards[1]]);
  }
  if(possiblePairs.length>0){
    return possiblePairs[Math.floor(Math.random()*possiblePairs.length)];
  }

  // 2. 覚えたカード1枚＋ランダム
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

  // 3. 完全ランダム
  let idx1=Math.floor(Math.random()*available.length);
  let idx2=Math.floor(Math.random()*available.length);
  if(idx1===idx2) idx2=(idx2+1)%available.length;
  return [available[idx1], available[idx2]];
}

// ---------------- GAME OVER ----------------
function isGameOver(){
  return board.every(c=>c.classList.contains('matched'));
}

function showWin(){
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
}

function nextGame(){
  document.getElementById('winScreen').classList.remove('active');
  startGame();
}

// ---------------- RULES ----------------
function showRules(){ document.getElementById('rulesModal').style.display='flex'; }
function closeRules(){ document.getElementById('rulesModal').style.display='none'; }

// ---------------- SCORE UPDATE ----------------
function updateScore(){
  document.getElementById('currentTurn').textContent = (currentTurn==='player')?'あなた':'AI';
  document.getElementById('playerScore').textContent = pairsFound.player;
  document.getElementById('aiScore').textContent = pairsFound.ai;
}