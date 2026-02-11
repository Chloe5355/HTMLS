let totalPairs, playerScore, aiScore, matchedPairs, flippedCards, cards, currentTurn;
let titles = ["初心者", "中級者", "上級者", "達人"];
let achievements = [];
let currentEquippedTitle = "なし";

playerScore = aiScore = matchedPairs = 0;
flippedCards = [];
cards = [];
currentTurn = 'player';

let cardEmojis = ['🗡️','🏹','📖','🌪','🔥','💧','❄','⚡','🪨','🌿'];

// 表示時間設定（ミリ秒）
const flipDelay = 600;   // 2枚めくった後の判定までの待機時間
const showDelay = 1200;  // カード表示時間（揃わなかった場合）
const aiDelay   = 1200;  // AIターン遅延

// --------------------------
// ゲーム開始
function startGame() {
  playerScore = 0;
  aiScore = 0;
  matchedPairs = 0;
  flippedCards = [];
  currentTurn = 'player';
  updateTurnDisplay();

  const size = parseInt(document.getElementById('boardSize').value);
  totalPairs = (size * size) / 2;
  document.documentElement.style.setProperty('--grid-size', size);

  let neededPairs = Math.ceil(totalPairs / cardEmojis.length);
  let temp = [];
  for (let i = 0; i < neededPairs; i++) temp.push(...cardEmojis);
  temp = temp.slice(0, totalPairs);

  cards = [];
  temp.forEach(e => { cards.push(e); cards.push(e); });
  shuffle(cards);

  renderBoard();
  updateScores();
  showScreen('gameScreen');
}

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  cards.forEach((v, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = v;
    card.dataset.index = i;
    card.textContent = '';  // ← まだ開いていないカードは空白
    card.onclick = () => playerFlip(card);
    board.appendChild(card);
  });
}

function updateTurnDisplay() {
  document.getElementById('currentTurnDisplay').textContent = currentTurn === 'player' ? 'あなた' : 'AI';
}

function playerFlip(card) {
  if (currentTurn !== 'player' || flippedCards.length >= 2 || card.classList.contains('matched')) return;

  card.textContent = card.dataset.value;
  flippedCards.push(card);

  if (flippedCards.length === 2) setTimeout(checkPair, flipDelay); // プレイヤー判定
}

function checkPair() {
  const [c1, c2] = flippedCards;
  if (!c1 || !c2) return;

  if (c1.dataset.value === c2.dataset.value) {
    c1.classList.add('matched');
    c2.classList.add('matched');

    if (currentTurn === 'player') playerScore++;
    else aiScore++;

    matchedPairs++;
    flippedCards = [];
    updateScores();

    if (matchedPairs >= totalPairs) return endGame();

    if (currentTurn === 'ai') setTimeout(aiTurn, aiDelay);
    return;
  }

  setTimeout(() => {
    c1.textContent = ''; // ← 閉じるときも空白に
    c2.textContent = '';
    flippedCards = [];
    switchTurn();
  }, showDelay);
}

function switchTurn() {
  currentTurn = currentTurn === 'player' ? 'ai' : 'player';
  updateTurnDisplay();
  if (currentTurn === 'ai') setTimeout(aiTurn, aiDelay);
}

// --------------------------
// AIターン
function aiTurn() {
  if (currentTurn !== 'ai') return;

  const available = Array.from(document.querySelectorAll('.card:not(.matched)'));
  if (available.length < 2) return endGame();

  let [c1, c2] = pickRandomPair(available);

  c1.textContent = c1.dataset.value;
  c2.textContent = c2.dataset.value;
  flippedCards = [c1, c2];

  setTimeout(() => {
    const matched = c1.dataset.value === c2.dataset.value;
    if (matched) {
      c1.classList.add('matched');
      c2.classList.add('matched');
      aiScore++;
      matchedPairs++;
      flippedCards = [];
      updateScores();

      if (matchedPairs >= totalPairs) return endGame();

      setTimeout(aiTurn, aiDelay); // 揃った場合も遅延して連続めくり
    } else {
      setTimeout(() => {
        c1.textContent = ''; // ← 閉じるときも空白
        c2.textContent = '';
        flippedCards = [];
        switchTurn();
      }, showDelay); // AIカード表示時間
    }
  }, showDelay);
}

function pickRandomPair(available) {
  let c1, c2;
  while (c1 === c2 || !c1 || !c2) {
    c1 = available[Math.floor(Math.random() * available.length)];
    c2 = available[Math.floor(Math.random() * available.length)];
  }
  return [c1, c2];
}

function updateScores() {
  document.getElementById('playerScore').textContent = playerScore;
  document.getElementById('aiScore').textContent = aiScore;
}

function endGame() {
  showScreen('winScreen');
  document.getElementById('finalPlayerScore').textContent = playerScore;
  document.getElementById('finalAIScore').textContent = aiScore;

  let result;
  if (playerScore > aiScore) {
    result = '🎉 あなたの勝ち！';
    currentEquippedTitle = titles[Math.floor(Math.random() * titles.length)];
  } else if (playerScore < aiScore) result = '💀 AIの勝ち…';
  else result = '🤝 引き分け';

  document.getElementById('winResult').textContent = result;
  document.getElementById('winTitle').textContent = currentEquippedTitle;
  achievements.push(result);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function stopGame() {
  renderTitles();
  renderAchievements();
  showScreen('titleScreen');
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function renderTitles() {
  const list = document.getElementById('titleList');
  list.innerHTML = '';
  titles.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    list.appendChild(li);
  });
}

function renderAchievements() {
  const list = document.getElementById('achievementList');
  list.innerHTML = '';
  achievements.forEach(a => {
    const li = document.createElement('li');
    li.textContent = a;
    list.appendChild(li);
  });
}

function equipCurrentTitle() {
  document.getElementById('equippedTitle').textContent = currentEquippedTitle;
}

// --------------------------
// ルールモーダル
function showRules() { document.getElementById('rulesModal').style.display = 'flex'; }
function closeRules() { document.getElementById('rulesModal').style.display = 'none'; }