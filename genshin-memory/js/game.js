let totalPairs;
let playerScore = 0;
let aiScore = 0;
let matchedPairs = 0;
let flippedCards = [];
let cards = [];
let aiMemory = {};
let currentTurn = 'player';
let cardEmojis = ['🗡️','🏹','📖','🌪','🔥','💧','❄','⚡'];
let currentElement = 'wind';

// ----------------------------
// テーマ変更
function changeElement() {
  const sel = document.getElementById('element');
  currentElement = sel.value;

  const elementEmojiMap = {
    wind: '🌪', fire: '🔥', water: '💧', ice: '❄',
    thunder: '⚡', rock: '🪨', grass: '🌿'
  };

  cardEmojis = ['🗡️','🏹','📖'].map(e => e + elementEmojiMap[currentElement])
               .concat(['🗡️','🏹','📖','🌪','🔥','💧','❄','⚡'].slice(3));
}

// ----------------------------
// UIカラー変更
function applyUIColor() {
  const bg = document.getElementById('bgColor').value;
  const card = document.getElementById('cardColor').value;
  const border = document.getElementById('cardBorderColor').value;

  document.documentElement.style.setProperty('--bg-color', bg);
  document.documentElement.style.setProperty('--card-bg-color', card);
  document.documentElement.style.setProperty('--card-border-color', border);
}

// ----------------------------
// ゲーム開始
function startGame() {
  changeElement();
  playerScore = 0;
  aiScore = 0;
  matchedPairs = 0;
  flippedCards = [];
  aiMemory = {};
  currentTurn = 'player';
  updateTurnDisplay();

  const size = parseInt(document.getElementById('boardSize').value);
  totalPairs = (size * size) / 2;
  document.documentElement.style.setProperty('--grid-size', size);

  // カード生成
  cards = [];
  let neededPairs = Math.ceil(totalPairs / cardEmojis.length);
  let tempEmojis = [];
  for (let i = 0; i < neededPairs; i++) tempEmojis.push(...cardEmojis);
  tempEmojis = tempEmojis.slice(0, totalPairs);

  tempEmojis.forEach(e => { cards.push(e); cards.push(e); });
  shuffle(cards);

  renderBoard();

  document.getElementById('playerScore').textContent = 0;
  document.getElementById('aiScore').textContent = 0;

  showScreen('gameScreen');
}

// ----------------------------
// ボード描画
function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  cards.forEach((value,index)=>{
    const card = document.createElement('div');
    card.className='card';
    card.dataset.value=value;
    card.dataset.index=index;
    card.textContent='?';
    card.onclick=()=>playerFlip(card);
    board.appendChild(card);
  });
}

// ----------------------------
// ターン表示
function updateTurnDisplay() {
  document.getElementById('currentTurnDisplay').textContent = currentTurn==='player'?'あなた':'AI';
}

// ----------------------------
// プレイヤー操作
function playerFlip(card){
  if(currentTurn!=='player') return;
  if(flippedCards.length>=2 || card.classList.contains('matched')) return;

  card.textContent=card.dataset.value;
  flippedCards.push(card);
  if(flippedCards.length===2) setTimeout(checkPair,500);
}

// ----------------------------
// ペア判定
function checkPair(){
  const [c1,c2]=flippedCards;
  if(!c1 || !c2) return;

  if(c1.dataset.value===c2.dataset.value){
    c1.classList.add('matched'); c2.classList.add('matched');
    if(currentTurn==='player') playerScore++; else aiScore++;
    document.getElementById('playerScore').textContent=playerScore;
    document.getElementById('aiScore').textContent=aiScore;

    matchedPairs++;
    flippedCards=[];

    if(matchedPairs>=totalPairs) return endGame();
    if(currentTurn==='ai') setTimeout(aiTurn,500);
    return;
  }

  setTimeout(()=>{
    c1.textContent='?';
    c2.textContent='?';
    flippedCards=[];
    switchTurn();
  },500);
}

// ----------------------------
// ターン切替
function switchTurn(){
  currentTurn = currentTurn==='player'?'ai':'player';
  updateTurnDisplay();
  if(currentTurn==='ai') setTimeout(aiTurn,500);
}

// ----------------------------
// AIターン
function aiTurn(){
  if(currentTurn!=='ai') return;
  const difficulty = document.getElementById('aiDifficulty').value;
  const available = Array.from(document.querySelectorAll('.card:not(.matched)'));
  if(available.length<2) return;

  let [c1,c2] = pickRandomPair(available);
  c1.textContent=c1.dataset.value;
  c2.textContent=c2.dataset.value;

  flippedCards=[c1,c2];
  setTimeout(checkPair,500);
}

// ----------------------------
// AIランダム選択
function pickRandomPair(available){
  let c1,c2;
  while(c1===c2 || !c1 || !c2){
    c1=available[Math.floor(Math.random()*available.length)];
    c2=available[Math.floor(Math.random()*available.length)];
  }
  return [c1,c2];
}

// ----------------------------
// 勝敗
function endGame(){
  showScreen('winScreen');
  document.getElementById('finalPlayerScore').textContent=playerScore;
  document.getElementById('finalAIScore').textContent=aiScore;

  let result;
  if(playerScore>aiScore) result='🎉 あなたの勝ち！';
  else if(playerScore<aiScore) result='💀 AIの勝ち…';
  else result='🤝 引き分け';
  document.getElementById('winResult').textContent=result;
}

// ----------------------------
// 画面切替
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function stopGame(){ showScreen('titleScreen'); }

// ----------------------------
// ヘルパー
function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
}