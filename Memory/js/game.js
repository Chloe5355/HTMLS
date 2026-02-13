/* ---------------- GAME LOGIC ---------------- */
let currentTurn='player',
    aiLevel='medium',
    board=[],
    selected=[],
    pairsFound={player:0,ai:0},
    aiMemory={},
    gridSize=8,
    winCount=0,
    lockBoard=false;

const aiDelay={easy:1500,medium:1000,hard:700},
      aiExtraDelay={success:600,fail:1200};

const icons=['🗡️','🏹','📖','🌪','🔥','💧','❄','⚡','🪨','🌿'];

/* ---------------- INIT BOARD ---------------- */
function initBoard(){
  const boardEl=document.getElementById('board');
  boardEl.innerHTML='';
  board=[];

  const totalCards=gridSize*gridSize;
  let cardPairs=[];

  for(let i=0;i<totalCards/2;i++){
    let icon=icons[i%icons.length];
    cardPairs.push(icon,icon);
  }

  cardPairs.sort(()=>Math.random()-0.5);

  for(let i=0;i<totalCards;i++){
    let card=document.createElement('div');
    card.className='card';
    card.dataset.icon=cardPairs[i];

    // 3D構造
    card.innerHTML=`
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${cardPairs[i]}</div>
      </div>
    `;

    card.onclick=()=>playerTurn(card);

    board.push(card);
    boardEl.appendChild(card);
  }

  selected=[];
  currentTurn='player';
  lockBoard=false;
  updateScore();
}

/* ---------------- PLAYER ---------------- */
function playerTurn(card){
  if(currentTurn!=='player'||lockBoard||selected.includes(card)||card.classList.contains('matched')) return;

  card.classList.add("flipped");
  selected.push(card);
  rememberCard(card);

  if(selected.length===2){
    lockBoard=true;
    setTimeout(()=>{ checkMatch('player'); lockBoard=false; },1000);
  }

  updateScore();
}

/* ---------------- AI ---------------- */
function aiTurn(){
  if(currentTurn!=='ai') return;
  lockBoard=true;

  let available=board.filter(c=>!c.classList.contains('matched')&&!selected.includes(c));
  if(available.length<2) return;

  let [c1,c2]=pickSmartAICards(available);

  c1.classList.add("flipped");
  c2.classList.add("flipped");

  rememberCard(c1);
  rememberCard(c2);

  selected=[c1,c2];
  updateScore();

  let delay=(c1.dataset.icon===c2.dataset.icon)? aiExtraDelay.success:aiExtraDelay.fail;
  setTimeout(()=>{ checkMatch('ai'); lockBoard=false; }, delay);
}

/* ---------------- CHECK MATCH ---------------- */
function checkMatch(player){
  const [c1,c2]=selected;

  if(c1.dataset.icon===c2.dataset.icon){
    c1.classList.add('matched');
    c2.classList.add('matched');

    pairsFound[player]++;
    removeFromMemory(c1.dataset.icon,[c1,c2]);

    selected=[];
    updateScore();

    if(isGameOver()){
      showWin();
    }else if(player==='ai'){
      setTimeout(aiTurn, aiDelay[aiLevel]);
    }
  } else {
    setTimeout(()=>{
      c1.classList.remove("flipped");
      c2.classList.remove("flipped");

      selected=[];
      currentTurn=(player==='player')?'ai':'player';

      updateScore();

      if(currentTurn==='ai')
        setTimeout(aiTurn, aiDelay[aiLevel]);

    },1000);
  }
}

/* ---------------- AI MEMORY ---------------- */
function rememberCard(card){
  if(!aiMemory[card.dataset.icon])
    aiMemory[card.dataset.icon]=[];

  if(!aiMemory[card.dataset.icon].includes(card))
    aiMemory[card.dataset.icon].push(card);
}

function removeFromMemory(icon,cards){
  if(aiMemory[icon]){
    aiMemory[icon]=aiMemory[icon].filter(c=>!cards.includes(c));
    if(aiMemory[icon].length===0)
      delete aiMemory[icon];
  }
}

/* ---------------- SMART PICK ---------------- */
function pickSmartAICards(available){
  let possiblePairs=[];

  for(let icon in aiMemory){
    let known=aiMemory[icon].filter(c=>available.includes(c));
    if(known.length>=2)
      possiblePairs.push([known[0],known[1]]);
  }

  if(possiblePairs.length>0)
    return possiblePairs[Math.floor(Math.random()*possiblePairs.length)];

  let singleOptions=[];
  for(let icon in aiMemory){
    let known=aiMemory[icon].filter(c=>available.includes(c));
    if(known.length===1)
      singleOptions.push(known[0]);
  }

  if(singleOptions.length>0){
    let known=singleOptions[Math.floor(Math.random()*singleOptions.length)];
    let randomCandidates=available.filter(c=>c!==known);
    return [known,randomCandidates[Math.floor(Math.random()*randomCandidates.length)]];
  }

  let idx1=Math.floor(Math.random()*available.length);
  let idx2=Math.floor(Math.random()*available.length);
  if(idx1===idx2) idx2=(idx2+1)%available.length;

  return [available[idx1],available[idx2]];
}

/* ---------------- GAME OVER ---------------- */
function isGameOver(){
  return board.every(c=>c.classList.contains('matched'));
}

function showWin(){
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('winScreen').classList.add('active');

  document.getElementById('playerPairs').textContent=pairsFound.player;
  document.getElementById('aiPairs').textContent=pairsFound.ai;

  if(pairsFound.player>pairsFound.ai){
    document.getElementById('winner').textContent='あなた';
    winCount++;
    document.getElementById('winCount').textContent=winCount;
  }
  else if(pairsFound.player<pairsFound.ai){
    document.getElementById('winner').textContent='AI';
  }
  else{
    document.getElementById('winner').textContent='引き分け';
  }
}

/* ---------------- START/STOP ---------------- */
function startGame(){
  gridSize=parseInt(document.getElementById('boardSize').value);
  document.documentElement.style.setProperty('--grid-size',gridSize);

  document.getElementById('titleScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');

  aiLevel=document.getElementById('aiDifficulty').value;

  pairsFound={player:0,ai:0};
  aiMemory={};
  currentTurn='player';
  lockBoard=false;

  initBoard();

  // AI ターンなら自動で実行
  if(currentTurn==='ai')
    setTimeout(aiTurn, aiDelay[aiLevel]);

  updateScore();
}

function stopGame(){
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('winScreen').classList.remove('active');
  document.getElementById('titleScreen').classList.add('active');
}

function nextGame(){
  document.getElementById('winScreen').classList.remove('active');
  startGame();
}

/* ---------------- RULES ---------------- */
function showRules(){
  document.getElementById('rulesModal').style.display='flex';
}

function closeRules(){
  document.getElementById('rulesModal').style.display='none';
}

/* ---------------- SCORE ---------------- */
function updateScore(){
  // 現在のターン（黒枠）
  const turnBox = document.getElementById('currentTurnBox');
  const turnName = (currentTurn==='player') ? 'あなた' : 'AI';
  turnBox.textContent = `現在のターン : ${turnName}`;
  turnBox.style.border = '2px solid #000';
  turnBox.style.padding = '6px 12px';
  turnBox.style.borderRadius = '6px';
  turnBox.style.display = 'inline-block';
  turnBox.style.backgroundColor = '#fff';
  turnBox.style.marginBottom = '8px';

  // 枚数表示（横並び）
  const playerBox = document.getElementById('playerScoreBox');
  const aiBox = document.getElementById('aiScoreBox');

  playerBox.textContent = `あなた : ${pairsFound.player}枚`;
  aiBox.textContent = `AI : ${pairsFound.ai}枚`;

  [playerBox, aiBox].forEach(box=>{
    box.style.border = '2px solid #000';
    box.style.padding = '6px 12px';
    box.style.borderRadius = '6px';
    box.style.display = 'inline-block';
    box.style.backgroundColor = '#fff';
    box.style.margin = '0 6px';
  });
}