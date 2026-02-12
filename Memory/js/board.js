// board.js
let board = [];
let selected = [];

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
    card.addEventListener('touchstart', (e)=>{e.preventDefault(); playerTurn(card);});
    board.push(card);
    boardEl.appendChild(card);
  }

  selected = [];
  updateScore();
  currentTurn = 'player';
  lockBoard = false;
}
