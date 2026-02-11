// ----------------------------
// 初期設定
// ----------------------------
const totalPairs = 8; 
let playerScore = 0;
let aiScore = 0;
let matchedPairs = 0;
let flippedCards = [];
let cards = [];
let aiMemory = {}; // AIが覚えているカード

// カード絵文字（武器・元素・キャラクターイメージ）
const cardEmojis = ['🗡️','🏹','📖','🌪','🔥','💧','❄','⚡'];

// ----------------------------
// ゲーム開始
// ----------------------------
function startGame() {
  playerScore = 0;
  aiScore = 0;
  matchedPairs = 0;
  flippedCards = [];
  aiMemory = {};

  cards = [];
  cardEmojis.forEach(emoji => {
    cards.push(emoji);
    cards.push(emoji);
  });
  shuffle(cards);

  renderBoard();

  document.getElementById('playerScore').textContent = 0;
  document.getElementById('aiScore').textContent = 0;

  showScreen('gameScreen');
}

// ----------------------------
// ボード描画
// ----------------------------
function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  cards.forEach((value, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = value;
    card.dataset.index = index;
    card.textContent = '?';
    card.onclick = () => playerFlip(card);
    board.appendChild(card);
  });
}

// ----------------------------
// プレイヤー操作
// ----------------------------
function playerFlip(card) {
  if (flippedCards.length >= 2 || card.classList.contains('matched')) return;

  card.textContent = card.dataset.value;
  flippedCards.push(card);

  if (flippedCards.length === 2) setTimeout(checkPair, 500);
}

function checkPair() {
  const [c1, c2] = flippedCards;

  if (c1.dataset.value === c2.dataset.value) {
    c1.classList.add('matched');
    c2.classList.add('matched');
    playerScore++;
    matchedPairs++;
    document.getElementById('playerScore').textContent = playerScore;
  } else {
    c1.textContent = '?';
    c2.textContent = '?';
  }

  flippedCards = [];

  if (matchedPairs < totalPairs) setTimeout(aiTurn, 500);
  else endGame();
}

// ----------------------------
// AIターン（難易度別）
// ----------------------------
function aiTurn() {
  const difficulty = document.getElementById('aiDifficulty').value;
  const available = Array.from(document.querySelectorAll('.card:not(.matched)'));
  if (available.length < 2) return;

  let [c1, c2] = null;

  if (difficulty === 'easy') [c1, c2] = pickRandomPair(available);
  else if (difficulty === 'medium') [c1, c2] = mediumAI(available);
  else [c1, c2] = hardAI(available);

  flipAICards(c1, c2);
}

function flipAICards(c1, c2) {
  if (!c1 || !c2) return;

  c1.textContent = c1.dataset.value;
  c2.textContent = c2.dataset.value;

  // AI記憶に追加
  aiMemory[c1.dataset.value] = aiMemory[c1.dataset.value] || [];
  if (!aiMemory[c1.dataset.value].includes(c1.dataset.index)) aiMemory[c1.dataset.value].push(c1.dataset.index);

  aiMemory[c2.dataset.value] = aiMemory[c2.dataset.value] || [];
  if (!aiMemory[c2.dataset.value].includes(c2.dataset.index)) aiMemory[c2.dataset.value].push(c2.dataset.index);

  if (c1.dataset.value === c2.dataset.value) {
    c1.classList.add('matched');
    c2.classList.add('matched');
    aiScore++;
    matchedPairs++;
    document.getElementById('aiScore').textContent = aiScore;
  }

  setTimeout(() => {
    if (!c1.classList.contains('matched')) c1.textContent = '?';
    if (!c2.classList.contains('matched')) c2.textContent = '?';
    if (matchedPairs >= totalPairs) endGame();
  }, 500);
}

// ----------------------------
// AIロジック
// ----------------------------
function pickRandomPair(available) {
  let c1, c2;
  while (c1 === c2 || !c1 || !c2) {
    c1 = available[Math.floor(Math.random() * available.length)];
    c2 = available[Math.floor(Math.random() * available.length)];
  }
  return [c1, c2];
}

function mediumAI(available) {
  for (let val in aiMemory) {
    const indices = aiMemory[val].filter(i => available.find(c => c.dataset.index == i));
    if (indices.length >= 2) return [available.find(c => c.dataset.index == indices[0]), available.find(c => c.dataset.index == indices[1])];
  }
  return pickRandomPair(available);
}

function hardAI(available) {
  return mediumAI(available); // mediumより記憶を完全活用するように拡張可能
}

// ----------------------------
// 勝敗判定
// ----------------------------
function endGame() {
  showScreen('winScreen');

  document.getElementById('finalPlayerScore').textContent = playerScore;
  document.getElementById('finalAIScore').textContent = aiScore;

  let result;
  if (playerScore > aiScore) result = '🎉 あなたの勝ち！';
  else if (playerScore < aiScore) result = '💀 AIの勝ち…';
  else result = '🤝 引き分け';
  document.getElementById('winResult').textContent = result;
}

// ----------------------------
// 画面切り替え
// ----------------------------
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function stopGame() {
  showScreen('titleScreen');
}

// ----------------------------
// ヘルパー
// ----------------------------
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}