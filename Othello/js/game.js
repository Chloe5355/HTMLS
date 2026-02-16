const boardEl=document.getElementById("board");
const info=document.getElementById("info");
const logEl=document.getElementById("log");
const aiToggle=document.getElementById("aiToggle");
const colorSelect=document.getElementById("colorSelect");
const aiSelect=document.getElementById("aiLevel");

let board=[],current="black",human="black",ai="white";
let gameOver=false,aiEnabled=true;

function init(){
  aiEnabled = aiToggle.value==="on";
  human = colorSelect.value;
  ai = human==="black"?"white":"black";
  current="black";

  board=Array(8).fill().map(()=>Array(8).fill(null));
  board[3][3]="white"; board[3][4]="black";
  board[4][3]="black"; board[4][4]="white";

  gameOver=false;
  draw();

  if(aiEnabled && current===ai)
    setTimeout(aiMove,500);
}

function draw(){
  boardEl.innerHTML="";
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const cell=document.createElement("div");
      cell.className="cell";
      cell.onclick=()=>humanMove(r,c);

      if(board[r][c]){
        const disc=document.createElement("div");
        disc.className="disc "+board[r][c];
        cell.appendChild(disc);
      }

      boardEl.appendChild(cell);
    }
  }
}

function humanMove(r,c){
  if(gameOver) return;

  if(aiEnabled){
    if(current!==human) return;
    if(move(r,c)) setTimeout(aiMove,300);
  }else{
    move(r,c);
  }
}

function aiMove(){
  if(!aiEnabled || current!==ai || gameOver) return;

  const moves=getMoves(ai);
  if(!moves.length){passTurn();return;}

  let choice;
  const level=aiSelect.value;

  if(level==="easy")
    choice=moves[Math.floor(Math.random()*moves.length)];
  else
    choice=moves.sort((a,b)=>b.flips-a.flips)[0];

  move(choice.r,choice.c);
}

function move(r,c){
  const flips=getFlips(r,c,current);
  if(!flips.length) return false;

  board[r][c]=current;
  flips.forEach(f=>board[f[0]][f[1]]=current);

  current=current==="black"?"white":"black";

  if(!getMoves(current).length){
    current=current==="black"?"white":"black";
    if(!getMoves(current).length){
      endGame();
      return true;
    }
  }

  draw();
  return true;
}

function getFlips(r,c,player){
  if(board[r][c]) return [];
  const opp=player==="black"?"white":"black";
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let flips=[];
  for(const[dR,dC] of dirs){
    let temp=[],nr=r+dR,nc=c+dC;
    while(nr>=0&&nr<8&&nc>=0&&nc<8&&board[nr][nc]===opp){
      temp.push([nr,nc]);
      nr+=dR; nc+=dC;
    }
    if(nr>=0&&nr<8&&nc>=0&&nc<8&&board[nr][nc]===player)
      flips=flips.concat(temp);
  }
  return flips;
}

function getMoves(player){
  let moves=[];
  for(let r=0;r<8;r++)
    for(let c=0;c<8;c++){
      const f=getFlips(r,c,player);
      if(f.length) moves.push({r,c,flips:f.length});
    }
  return moves;
}

function endGame(){
  gameOver=true;

  let black=0,white=0;
  board.flat().forEach(c=>{
    if(c==="black")black++;
    if(c==="white")white++;
  });

  let resultText,statResult;

  if(aiEnabled){
    if((human==="black"&&black>white)||(human==="white"&&white>black)){
      resultText="あなたの勝ち"; statResult="win";
    }else if(black===white){
      resultText="引き分け"; statResult="draw";
    }else{
      resultText="あなたの負け"; statResult="lose";
    }
  }else{
    if(black>white){resultText="黒の勝ち"; statResult="black";}
    else if(white>black){resultText="白の勝ち"; statResult="white";}
    else{resultText="引き分け"; statResult="draw";}
  }

  info.innerText=`${resultText} (${black}-${white})`;

  saveStats(statResult);
  saveLog(resultText,black,white);
  updateStats();
  loadLogs();
}

function saveStats(result){
  const stats=JSON.parse(localStorage.getItem("othelloStats"))||{
    cpu:{win:0,lose:0,draw:0},
    pvp:{black:0,white:0,draw:0}
  };

  if(aiEnabled) stats.cpu[result]++;
  else{
    if(result==="black") stats.pvp.black++;
    else if(result==="white") stats.pvp.white++;
    else stats.pvp.draw++;
  }

  localStorage.setItem("othelloStats",JSON.stringify(stats));
}

function updateStats(){
  const stats=JSON.parse(localStorage.getItem("othelloStats"))||{
    cpu:{win:0,lose:0,draw:0},
    pvp:{black:0,white:0,draw:0}
  };

  const cpuTotal=stats.cpu.win+stats.cpu.lose+stats.cpu.draw;
  const cpuRate=cpuTotal?((stats.cpu.win/cpuTotal)*100).toFixed(1):0;

  document.getElementById("stats").innerHTML=
  `🤖 CPU 勝:${stats.cpu.win} 負:${stats.cpu.lose} 引:${stats.cpu.draw} 勝率:${cpuRate}%<br>
   👥 人間 黒:${stats.pvp.black} 白:${stats.pvp.white} 引:${stats.pvp.draw}`;
}

function saveLog(result,b,w){
  const logs=JSON.parse(localStorage.getItem("othelloLogs"))||[];

  logs.unshift({
    date:new Date().toLocaleString(),
    mode:aiEnabled?"VS CPU":"人間対戦",
    level:aiEnabled?aiSelect.value:"-",
    result,black:b,white:w
  });

  localStorage.setItem("othelloLogs",JSON.stringify(logs));
}

function loadLogs(){
  const logs=JSON.parse(localStorage.getItem("othelloLogs"))||[];
  logEl.innerHTML=logs.map(l=>
    `${l.date} | ${l.mode}${l.mode==="VS CPU"?"("+l.level+")":""} | ${l.result} (${l.black}-${l.white})`
  ).join("<br>");
}

function clearLogs(){
  localStorage.removeItem("othelloLogs");
  loadLogs();
}

function passTurn(){
  current=current==="black"?"white":"black";
}

function resetGame(){
  init();
}

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("service-worker.js");
}

init();
updateStats();
loadLogs();
