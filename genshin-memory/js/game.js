let cards = [];
let flipped = [];
let lockBoard = false;
let currentTurn = "player";
let pairsFound = { player: 0, ai: 0 };
let winCount = 0;
let totalGames = 0;
let gridSize = 8;

window.onload = function(){
  winCount = parseInt(localStorage.getItem("winCount")) || 0;
  totalGames = parseInt(localStorage.getItem("totalGames")) || 0;
};

function startGame(){
  gridSize = parseInt(document.getElementById("boardSize").value);
  document.documentElement.style.setProperty("--grid-size", gridSize);

  document.getElementById("titleScreen").classList.remove("active");
  document.getElementById("gameScreen").classList.add("active");

  initBoard();
}

function initBoard(){
  const board = document.getElementById("board");
  board.innerHTML = "";
  cards = [];
  flipped = [];
  pairsFound = { player:0, ai:0 };
  currentTurn = "player";

  let total = gridSize * gridSize;
  let symbols = [];
  for(let i=0;i<total/2;i++){
    symbols.push(i);
    symbols.push(i);
  }
  symbols.sort(()=>Math.random()-0.5);

  symbols.forEach((symbol,index)=>{
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.symbol = symbol;
    card.textContent = "？";
    card.onclick = ()=>flipCard(card);
    board.appendChild(card);
    cards.push(card);
  });

  updateScore();
}

function flipCard(card){
  if(lockBoard || currentTurn!=="player") return;
  if(flipped.length===2) return;
  if(card.classList.contains("matched")) return;
  if(flipped.includes(card)) return;

  card.textContent = card.dataset.symbol;
  flipped.push(card);

  if(flipped.length===2){
    checkMatch();
  }
}

function checkMatch(){
  lockBoard = true;

  if(flipped[0].dataset.symbol === flipped[1].dataset.symbol){
    flipped.forEach(c=>c.classList.add("matched"));
    pairsFound[currentTurn]++;
    flipped = [];
    lockBoard = false;
    updateScore();
    checkGameEnd();
  } else {
    setTimeout(()=>{
      flipped.forEach(c=>c.textContent="？");
      flipped = [];
      currentTurn = currentTurn==="player"?"ai":"player";
      updateScore();
      lockBoard = false;
      if(currentTurn==="ai") aiTurn();
    },800);
  }
}

function aiTurn(){
  setTimeout(()=>{
    let available = cards.filter(c=>!c.classList.contains("matched"));
    let first = available[Math.floor(Math.random()*available.length)];
    flipAI(first);
    setTimeout(()=>{
      available = cards.filter(c=>!c.classList.contains("matched") && c!==first);
      let second = available[Math.floor(Math.random()*available.length)];
      flipAI(second);
      checkMatch();
    },600);
  },800);
}

function flipAI(card){
  card.textContent = card.dataset.symbol;
  flipped.push(card);
}

function updateScore(){
  document.getElementById("currentTurn").textContent =
    currentTurn==="player"?"あなた":"AI";

  document.getElementById("playerScore").textContent = pairsFound.player;
  document.getElementById("aiScore").textContent = pairsFound.ai;
}

function checkGameEnd(){
  if(pairsFound.player + pairsFound.ai === (gridSize*gridSize)/2){
    showWin();
  }
}

function showWin(){
  document.getElementById("gameScreen").classList.remove("active");
  document.getElementById("winScreen").classList.add("active");

  document.getElementById("playerPairs").textContent = pairsFound.player;
  document.getElementById("aiPairs").textContent = pairsFound.ai;

  totalGames++;

  if(pairsFound.player > pairsFound.ai){
    document.getElementById("winner").textContent="あなた";
    winCount++;
  } else if(pairsFound.player < pairsFound.ai){
    document.getElementById("winner").textContent="AI";
  } else {
    document.getElementById("winner").textContent="引き分け";
  }

  localStorage.setItem("winCount", winCount);
  localStorage.setItem("totalGames", totalGames);

  document.getElementById("winCount").textContent = winCount;
  document.getElementById("totalGames").textContent = totalGames;

  let rate = totalGames===0?0:
    Math.round((winCount/totalGames)*100);

  document.getElementById("winRate").textContent = rate;
}

function nextGame(){
  document.getElementById("winScreen").classList.remove("active");
  document.getElementById("gameScreen").classList.add("active");
  initBoard();
}

function stopGame(){
  document.getElementById("winScreen").classList.remove("active");
  document.getElementById("titleScreen").classList.add("active");
}

function resetData(){
  if(!confirm("本当にデータをリセットしますか？")) return;

  localStorage.removeItem("winCount");
  localStorage.removeItem("totalGames");

  winCount=0;
  totalGames=0;

  document.getElementById("winCount").textContent=0;
  document.getElementById("totalGames").textContent=0;
  document.getElementById("winRate").textContent=0;

  alert("データをリセットしました");
}