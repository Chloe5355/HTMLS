const SIZE=8;
let board,current,aiEnabled,ai,difficulty,gameOver=false;

const boardDiv=document.getElementById("board");
const statsDiv=document.getElementById("stats");
const scoreBoard=document.getElementById("scoreBoard");
const difficultySelect=document.getElementById("difficulty");
const statsMode=document.getElementById("statsMode");

document.getElementById("startBtn").onclick=startGame;
statsMode.addEventListener("change",loadStats);

/* ===================== */
function startGame(){
  aiEnabled=document.getElementById("aiToggle").checked;
  difficulty=difficultySelect.value;

  document.getElementById("titleScreen").style.display="none";
  document.getElementById("gameScreen").style.display="block";

  initBoard();

  const playerColor=Math.random()<0.5?"black":"white";
  ai=playerColor==="black"?"white":"black";
  current="black";
  gameOver=false;

  draw();
}

/* ===================== */
function goTitle(){
  document.getElementById("gameScreen").style.display="none";
  document.getElementById("titleScreen").style.display="block";
  loadStats();
}

/* ===================== */
function initBoard(){
  board=Array.from({length:SIZE},()=>Array(SIZE).fill(null));
  board[3][3]="white";
  board[3][4]="black";
  board[4][3]="black";
  board[4][4]="white";
}

/* ===================== */
function draw(){
  boardDiv.innerHTML="";
  for(let r=0;r<SIZE;r++){
    for(let c=0;c<SIZE;c++){
      const cell=document.createElement("div");
      cell.className="cell";

      if(!aiEnabled && canPlace(r,c,current) && !gameOver)
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

/* ===================== */
function handleClick(r,c){
  if(gameOver) return;
  if(!canPlace(r,c,current)) return;

  place(r,c,current);
  nextTurn();
}

/* ===================== */
function nextTurn(){
  current=current==="black"?"white":"black";

  if(!hasMove(current)){
    current=current==="black"?"white":"black";
    if(!hasMove(current)){ endGame(); return; }
  }

  draw();

  if(aiEnabled && current===ai){
    const delay = difficulty==="easy" ? 900 :
                  difficulty==="medium" ? 600 : 400;
    setTimeout(aiMove, delay);
  }
}

/* ===================== */
function place(r,c,color){
  board[r][c]=color;
  flip(r,c,color);
}

/* ===================== */
function canPlace(r,c,color){
  if(board[r][c]) return false;
  const enemy=color==="black"?"white":"black";
  const dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  return dirs.some(([dr,dc])=>{
    let nr=r+dr,nc=c+dc,found=false;
    while(inBoard(nr,nc)&&board[nr][nc]===enemy){
      found=true; nr+=dr; nc+=dc;
    }
    return found && inBoard(nr,nc)&&board[nr][nc]===color;
  });
}

/* ===================== */
function flip(r,c,color){
  const enemy=color==="black"?"white":"black";
  const dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  dirs.forEach(([dr,dc])=>{
    let nr=r+dr,nc=c+dc,cells=[];
    while(inBoard(nr,nc)&&board[nr][nc]===enemy){
      cells.push([nr,nc]);
      nr+=dr; nc+=dc;
    }
    if(inBoard(nr,nc)&&board[nr][nc]===color){
      cells.forEach(([rr,cc])=>{
        board[rr][cc]=color;

        const index=rr*SIZE+cc;
        const disk=boardDiv.children[index].firstChild;
        if(disk){
          disk.classList.add("flip");
          setTimeout(()=>disk.classList.remove("flip"),300);
        }
      });
    }
  });
}

/* ===================== */
function hasMove(color){
  return board.some((row,r)=>
    row.some((_,c)=>canPlace(r,c,color))
  );
}

function inBoard(r,c){
  return r>=0&&r<SIZE&&c>=0&&c<SIZE;
}

/* ===================== */
function updateScore(){
  let black=0,white=0;
  board.flat().forEach(v=>{
    if(v==="black") black++;
    if(v==="white") white++;
  });

  scoreBoard.textContent=
   `⚫ 黒:${black}　⚪ 白:${white}　｜　手番:${current==="black"?"黒":"白"}`;
}

/* ===================== */
function getValidMoves(player){
  const list=[];
  for(let r=0;r<SIZE;r++)
    for(let c=0;c<SIZE;c++)
      if(canPlace(r,c,player))
        list.push({r,c});
  return list;
}

function countFlips(r,c,color){
  let total=0;
  const enemy=color==="black"?"white":"black";
  const dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  dirs.forEach(([dr,dc])=>{
    let nr=r+dr,nc=c+dc,count=0;
    while(inBoard(nr,nc)&&board[nr][nc]===enemy){
      count++; nr+=dr; nc+=dc;
    }
    if(inBoard(nr,nc)&&board[nr][nc]===color) total+=count;
  });
  return total;
}

function randomMove(moves){ return moves[Math.floor(Math.random()*moves.length)]; }
function bestFlipMove(moves){
  let max=-1,best=moves[0];
  for(const m of moves){
    const count=countFlips(m.r,m.c,current);
    if(count>max){ max=count; best=m; }
  }
  return best;
}

/* ===================== */
function aiMove(){
  const moves=getValidMoves(current);
  if(!moves.length) return;

  let move;
  if(difficulty==="easy") move=randomMove(moves);
  else if(difficulty==="medium") move=bestFlipMove(moves);
  else move=bestFlipMove(moves); // 強はここでは簡略版（本格ミニマックスは別実装可）

  place(move.r,move.c,current);
  nextTurn();
}

/* ===================== */
function endGame(){
  gameOver=true;

  let black=0,white=0;
  board.flat().forEach(v=>{
    if(v==="black") black++;
    if(v==="white") white++;
  });

  let result="draw";
  if(black>white) result="black";
  if(white>black) result="white";

  saveResult(result);

  setTimeout(()=>showVictory(result,black,white),1000);
}

/* ===================== */
function showVictory(winner,black,white){
  document.body.classList.add("flash");
  setTimeout(()=>document.body.classList.remove("flash"),400);

  const overlay=document.createElement("div");
  overlay.id="victoryOverlay";

  let text="引き分け！";
  if(winner==="black") text="⚫ 黒の勝利！";
  if(winner==="white") text="⚪ 白の勝利！";

  overlay.innerHTML=`
    <div class="victoryText">${text}</div>
    <div style="margin-top:20px;font-size:20px;">
      黒:${black}　白:${white}
    </div>
    <button style="margin-top:30px;padding:10px 20px;font-size:18px;"
      onclick="closeVictory()">タイトルへ戻る</button>
  `;

  document.body.appendChild(overlay);
  launchConfetti(winner);
}

function launchConfetti(winner){
  const colors = winner==="black"? ["white","gold","silver"] : ["black","gold","silver"];
  let i=0;
  const interval=setInterval(()=>{
    for(let j=0;j<8;j++){
      const conf=document.createElement("div");
      conf.className="confetti";
      conf.style.left=Math.random()*100+"vw";
      conf.style.background=colors[Math.floor(Math.random()*colors.length)];
      conf.style.animationDuration=(Math.random()*2+2)+"s";
      document.body.appendChild(conf);
      setTimeout(()=>conf.remove(),4000);
    }
    i+=8;
    if(i>=120) clearInterval(interval);
  },120);
}

function closeVictory(){
  const overlay=document.getElementById("victoryOverlay");
  if(overlay) overlay.remove();
  goTitle();
}

/* ===================== */
function saveResult(result){
  let s=JSON.parse(localStorage.getItem("othelloStats")||"{}");

  if(!s.total){
    s={ total:0, pvp:{black:0,white:0,draw:0}, ai:{black:0,white:0,draw:0} };
  }

  s.total++;
  const mode=aiEnabled?"ai":"pvp";

  if(result==="black") s[mode].black++;
  else if(result==="white") s[mode].white++;
  else s[mode].draw++;

  localStorage.setItem("othelloStats",JSON.stringify(s));
}

/* ===================== */
function loadStats(){
  const s=JSON.parse(localStorage.getItem("othelloStats")||"{}");
  const mode=statsMode.value;
  if(!s[mode]) return;

  const wins=s[mode].black+s[mode].white;

  statsDiv.innerHTML=
    `<hr>
     <b>📜 実績</b><br>
     勝利回数: ${wins}`;
}

loadStats();