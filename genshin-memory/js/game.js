let cards=[],flipped=[],lock=false;
let turn="player";
let score={player:0,ai:0};
let gridSize=8;
let aiLevel="normal";
let aiMemory={};
let wins=0,total=0;

window.onload=()=>{
  wins=parseInt(localStorage.getItem("wins"))||0;
  total=parseInt(localStorage.getItem("total"))||0;
};

function startGame(){
  gridSize=parseInt(boardSize.value);
  aiLevel=aiLevelSelect.value;
  document.documentElement.style.setProperty("--grid-size",gridSize);
  board.style.gridTemplateColumns=`repeat(${gridSize},1fr)`;

  showScreen("gameScreen");
  init();
}

function init(){
  board.innerHTML="";
  cards=[];flipped=[];lock=false;
  score={player:0,ai:0};
  turn="player";
  aiMemory={};

  let totalCards=gridSize*gridSize;
  let arr=[];
  for(let i=0;i<totalCards/2;i++){arr.push(i,i);}
  arr.sort(()=>Math.random()-0.5);

  arr.forEach((v,i)=>{
    let c=document.createElement("div");
    c.className="card";
    c.dataset.value=v;
    c.onclick=()=>playerFlip(c);
    board.appendChild(c);
    cards.push(c);
  });

  updateUI();
}

function playerFlip(card){
  if(lock||turn!=="player")return;
  if(flipped.length===2||card.classList.contains("matched"))return;
  reveal(card);
  if(flipped.length===2)check();
}

function reveal(card){
  card.textContent=card.dataset.value;
  flipped.push(card);

  if(!aiMemory[card.dataset.value])
    aiMemory[card.dataset.value]=[];
  if(!aiMemory[card.dataset.value].includes(card))
    aiMemory[card.dataset.value].push(card);
}

function check(){
  lock=true;
  let [a,b]=flipped;

  if(a.dataset.value===b.dataset.value){
    a.classList.add("matched");
    b.classList.add("matched");
    score[turn]++;
    delete aiMemory[a.dataset.value];
    flipped=[];
    lock=false;
    updateUI();
    if(isEnd())finish();
  }else{
    setTimeout(()=>{
      a.textContent="";
      b.textContent="";
      flipped=[];
      turn=turn==="player"?"ai":"player";
      updateUI();
      lock=false;
      if(turn==="ai")aiTurn();
    },1000);
  }
}

function aiTurn(){
  setTimeout(()=>{
    let pair=findPair();
    let first,second;

    if(aiLevel==="easy"||!pair){
      [first,second]=randomPick();
    }else{
      [first,second]=pair;
    }

    reveal(first);
    setTimeout(()=>{
      reveal(second);
      check();
    },800);
  },1000);
}

function randomPick(){
  let avail=cards.filter(c=>!c.classList.contains("matched"));
  let a=avail[Math.floor(Math.random()*avail.length)];
  let b;
  do{b=avail[Math.floor(Math.random()*avail.length)];}
  while(a===b);
  return[a,b];
}

function findPair(){
  if(aiLevel==="easy")return null;
  for(let k in aiMemory){
    let v=aiMemory[k].filter(c=>!c.classList.contains("matched"));
    if(v.length>=2)return[v[0],v[1]];
  }
  return null;
}

function updateUI(){
  turnDisplay.textContent=
    turn==="player"?"あなたのターン":"AIのターン";
  playerScore.textContent=score.player;
  aiScore.textContent=score.ai;
}

function isEnd(){
  return score.player+score.ai===(gridSize*gridSize)/2;
}

function finish(){
  total++;
  if(score.player>score.ai){
    wins++;
    winnerText.textContent="あなたの勝ち！";
  }else if(score.player<score.ai){
    winnerText.textContent="AIの勝ち！";
  }else{
    winnerText.textContent="引き分け";
  }

  localStorage.setItem("wins",wins);
  localStorage.setItem("total",total);

  finalPlayer.textContent=score.player;
  finalAI.textContent=score.ai;
  winCount.textContent=wins;
  totalGames.textContent=total;
  winRate.textContent=Math.round((wins/total)*100)||0;

  showScreen("resultScreen");
}

function restart(){showScreen("gameScreen");init();}
function goTitle(){showScreen("titleScreen");}
function resetData(){
  localStorage.clear();
  wins=0;total=0;
  alert("データリセット完了");
}

function showScreen(id){
  document.querySelectorAll(".screen")
    .forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}