const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const boardDiv = document.getElementById("board");
const turnLabel = document.getElementById("turnLabel");

const aiToggle = document.getElementById("aiToggle");
const aiLevel = document.getElementById("aiLevel");

let board, current, human, ai, aiEnabled;
let gameOver=false;

const SIZE=8;
const DIRS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

startBtn.onclick=()=>{
  titleScreen.classList.remove("active");
  gameScreen.classList.add("active");
  initGame();
};

backBtn.onclick=()=>{
  gameScreen.classList.remove("active");
  titleScreen.classList.add("active");
};

function initGame(){
  aiEnabled=aiToggle.value==="on";
  human=Math.random()<0.5?"black":"white";
  ai=human==="black"?"white":"black";
  current="black";
  gameOver=false;

  board=Array(SIZE).fill().map(()=>Array(SIZE).fill(null));
  board[3][3]="white";
  board[3][4]="black";
  board[4][3]="black";
  board[4][4]="white";

  draw();
  turnLabel.textContent="あなたは "+(human==="black"?"黒":"白")+" です";

  if(aiEnabled && current===ai)
    setTimeout(aiMove,500);
}

function draw(){
  boardDiv.innerHTML="";
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const cell=document.createElement("div");
      cell.className="cell";

      if(canPlace(r,c,current)&&!gameOver)
        cell.classList.add("valid");

      cell.onclick=()=>handleClick(r,c);

      if(board[r][c]){
        const disk=document.createElement("div");
        disk.className="disk "+board[r][c];
        cell.appendChild(disk);
      }

      boardDiv.appendChild(cell);
    }
  }
  updateScore();
}

function updateScore(){
  let black=0,white=0;
  board.flat().forEach(v=>{
    if(v==="black")black++;
    if(v==="white")white++;
  });

  document.getElementById("scoreBoard").textContent=
  "⚫黒:"+black+"　⚪白:"+white+
  "　｜　手番:"+(current==="black"?"黒":"白");
}

function handleClick(r,c){
  if(gameOver) return;
  if(aiEnabled && current!==human) return;
  if(placeDisk(r,c,current)) nextTurn();
}

function placeDisk(r,c,color){
  if(board[r][c]) return false;
  let flipped=false;

  for(const[dr,dc]of DIRS){
    let rr=r+dr,cc=c+dc;
    let temp=[];
    while(inBoard(rr,cc)&&board[rr][cc]&&board[rr][cc]!==color){
      temp.push([rr,cc]);
      rr+=dr;cc+=dc;
    }
    if(temp.length && inBoard(rr,cc)&&board[rr][cc]===color){
      temp.forEach(([fr,fc])=>board[fr][fc]=color);
      flipped=true;
    }
  }

  if(flipped){
    board[r][c]=color;
    draw();
    return true;
  }
  return false;
}

function inBoard(r,c){return r>=0&&r<SIZE&&c>=0&&c<SIZE;}

function nextTurn(){
  current=current==="black"?"white":"black";

  if(!hasValidMove(current)){
    current=current==="black"?"white":"black";
    if(!hasValidMove(current)){
      endGame();return;
    }
  }

  draw();

  if(aiEnabled && current===ai)
    setTimeout(aiMove,400);
}

function hasValidMove(color){
  for(let r=0;r<SIZE;r++)
    for(let c=0;c<SIZE;c++)
      if(canPlace(r,c,color)) return true;
  return false;
}

function canPlace(r,c,color){
  if(board[r][c]) return false;
  for(const[dr,dc]of DIRS){
    let rr=r+dr,cc=c+dc,found=false;
    while(inBoard(rr,cc)&&board[rr][cc]&&board[rr][cc]!==color){
      found=true;rr+=dr;cc+=dc;
    }
    if(found&&inBoard(rr,cc)&&board[rr][cc]===color) return true;
  }
  return false;
}

function aiMove(){
  let moves=[];
  for(let r=0;r<SIZE;r++)
    for(let c=0;c<SIZE;c++)
      if(canPlace(r,c,ai))
        moves.push({r,c,score:evaluateMove(r,c,ai)});

  if(!moves.length){nextTurn();return;}

  let choice;
  if(aiLevel.value==="easy")
    choice=moves[Math.floor(Math.random()*moves.length)];
  else{
    moves.sort((a,b)=>b.score-a.score);
    choice=moves[0];
  }

  placeDisk(choice.r,choice.c,ai);
  nextTurn();
}

function evaluateMove(r,c,color){
  let score=0;
  for(const[dr,dc]of DIRS){
    let rr=r+dr,cc=c+dc;
    while(inBoard(rr,cc)&&board[rr][cc]&&board[rr][cc]!==color){
      score++;rr+=dr;cc+=dc;
    }
  }
  if((r===0||r===7)&&(c===0||c===7)) score+=50;
  return score;
}

function endGame(){
  gameOver=true;
  let black=0,white=0;
  board.flat().forEach(v=>{
    if(v==="black")black++;
    if(v==="white")white++;
  });

  if(black>white) showWin("黒");
  else if(white>black) showWin("白");
  else showWin("引き分け");
}

function showWin(text){
  document.getElementById("winMessage").textContent=text+" 勝利！";
  document.getElementById("winOverlay").classList.add("show");
}

function closeWin(){
  document.getElementById("winOverlay").classList.remove("show");
}