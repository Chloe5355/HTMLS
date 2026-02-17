const SIZE=8;
let board,current,aiEnabled,ai,difficulty,gameOver=false;

const boardDiv=document.getElementById("board");
const statsDiv=document.getElementById("stats");
const scoreBoard=document.getElementById("scoreBoard");

document.getElementById("startBtn").onclick=startGame;

/* ===================== */
function startGame(){
  aiEnabled=document.getElementById("aiToggle").checked;
  difficulty=document.getElementById("difficulty").value;

  document.getElementById("titleScreen").style.display="none";
  document.getElementById("gameScreen").style.display="block";

  initBoard();

  const playerColor=Math.random()<0.5?"black":"white";
  ai=playerColor==="black"?"white":"black";
  current="black";
  gameOver=false;

  draw();
}

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

      // 置けるマスを光らせる
      if(!gameOver && canPlace(r,c,current)){
        cell.classList.add("valid");
      }

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
    // AI動作を遅延
    setTimeout(aiMove, 800);
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
          // フリップアニメのテンポを0.5秒に
          setTimeout(()=>disk.classList.remove("flip"), 500);
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
function aiMove(){
  const moves=[];
  board.forEach((row,r)=>{
    row.forEach((_,c)=>{
      if(canPlace(r,c,ai)) moves.push([r,c]);
    });
  });
  if(moves.length===0) return;
  const [r,c]=moves[Math.floor(Math.random()*moves.length)];
  place(r,c,ai);
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
  checkAchievements(result,black,white);

  showVictory(result,black,white);
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
  const colors = winner==="black"
    ? ["white","gold","silver"]
    : ["black","gold","silver"];

  for(let i=0;i<120;i++){
    const conf=document.createElement("div");
    conf.className="confetti";
    conf.style.left=Math.random()*100+"vw";
    conf.style.background=colors[Math.floor(Math.random()*colors.length)];
    conf.style.animationDuration=(Math.random()*2+2)+"s";
    document.body.appendChild(conf);

    setTimeout(()=>conf.remove(),4000);
  }
}

function closeVictory(){
  const overlay=document.getElementById("victoryOverlay");
  if(overlay) overlay.remove();
  goTitle();
}

/* ===================== */
function saveResult(winner){
  const stats=JSON.parse(localStorage.getItem("othelloStats")||"{}");
  stats.total=(stats.total||0)+1;
  stats[winner]=(stats[winner]||0)+1;
  localStorage.setItem("othelloStats",JSON.stringify(stats));
}

/* ===================== */
function checkAchievements(winner,black,white){
  const ach=JSON.parse(localStorage.getItem("achievements")||"{}");
  const stats=JSON.parse(localStorage.getItem("othelloStats")||"{}");

  if(stats.total>=1) ach.first=true;
  if((stats.black||0)+(stats.white||0)>=5) ach.fiveWins=true;
  if(aiEnabled && winner!==ai && winner!=="draw") ach.cpuWin=true;
  if(stats.total>=10) ach.tenGames=true;
  if(black===64||white===64) ach.perfect=true;

  localStorage.setItem("achievements",JSON.stringify(ach));
}

/* ===================== */
function loadStats(){
  const s=JSON.parse(localStorage.getItem("othelloStats")||"{}");
  const ach=JSON.parse(localStorage.getItem("achievements")||"{}");

  statsDiv.innerHTML=
   `総対戦:${s.total||0}<br>
    黒勝:${s.black||0}<br>
    白勝:${s.white||0}<br>
    引分:${s.draw||0}
    <div id="achievements">
    <hr>
    <b>🏆 実績</b><br>
    <div class="achievement ${ach.first?'unlocked':''}">🎮 初プレイ</div>
    <div class="achievement ${ach.fiveWins?'unlocked':''}">🏅 5勝達成</div>
    <div class="achievement ${ach.cpuWin?'unlocked':''}">🤖 CPU撃破</div>
    <div class="achievement ${ach.tenGames?'unlocked':''}">👑 10連戦</div>
    <div class="achievement ${ach.perfect?'unlocked':''}">💯 完封勝利</div>
    </div>`;
}

loadStats();