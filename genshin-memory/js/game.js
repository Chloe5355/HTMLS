// ====== 状態管理 ======
let cards = [];
let flipped = [];
let lockBoard = false;
let currentTurn = "player";
let score = { player: 0, ai: 0 };
let gridSize = 8;
let aiLevel = "normal";
let aiMemory = {};

let winCount = 0;
let totalGames = 0;

// ====== 初期ロード ======
window.onload = () => {
  winCount = parseInt(localStorage.getItem("wins")) || 0;
  totalGames = parseInt(localStorage.getItem("games")) || 0;
};

// ====== ゲーム開始 ======
function startGame() {
  gridSize = parseInt(document.getElementById("boardSize").value);
  aiLevel = document.getElementById("aiLevel").value;

  document.getElementById("board").style.gridTemplateColumns =
    `repeat(${gridSize}, 1fr)`;

  showScreen("gameScreen");
  initBoard();
}

// ====== 盤面生成 ======
function initBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  cards = [];
  flipped = [];
  lockBoard = false;
  currentTurn = "player";
  score = { player: 0, ai: 0 };
  aiMemory = {};

  const total = gridSize * gridSize;
  let values = [];

  for (let i = 0; i < total / 2; i++) {
    values.push(i, i);
  }

  values.sort(() => Math.random() - 0.5);

  values.forEach((val, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = val;
    card.dataset.index = index;
    card.textContent = ""; // 「？」なし

    card.onclick = () => playerFlip(card);

    board.appendChild(card);
    cards.push(card);
  });

  updateUI();
}

// ====== プレイヤー処理 ======
function playerFlip(card) {
  if (lockBoard) return;
  if (currentTurn !== "player") return;
  if (flipped.length >= 2) return;
  if (card.classList.contains("matched")) return;
  if (flipped.includes(card)) return;

  reveal(card);

  if (flipped.length === 2) {
    checkMatch();
  }
}

// ====== 共通：カード表示 ======
function reveal(card) {
  card.textContent = card.dataset.value;
  flipped.push(card);

  // AI記憶（レベルnormal以上）
  if (aiLevel !== "easy") {
    if (!aiMemory[card.dataset.value]) {
      aiMemory[card.dataset.value] = [];
    }
    if (!aiMemory[card.dataset.value].includes(card)) {
      aiMemory[card.dataset.value].push(card);
    }
  }
}

// ====== 判定処理 ======
function checkMatch() {
  lockBoard = true;

  const [a, b] = flipped;

  if (a.dataset.value === b.dataset.value) {
    // 揃った
    a.classList.add("matched");
    b.classList.add("matched");

    score[currentTurn]++;

    delete aiMemory[a.dataset.value];

    flipped = [];
    lockBoard = false;

    updateUI();

    if (isGameEnd()) finishGame();
    else if (currentTurn === "ai") {
      // AIは揃ったら続行
      setTimeout(aiTurn, 1000);
    }

  } else {
    // 外れ
    setTimeout(() => {
      a.textContent = "";
      b.textContent = "";

      flipped = [];
      currentTurn = currentTurn === "player" ? "ai" : "player";
      updateUI();

      lockBoard = false;

      if (currentTurn === "ai") {
        setTimeout(aiTurn, 1000);
      }
    }, 1000); // 表示1秒
  }
}

// ====== AI処理 ======
function aiTurn() {
  if (lockBoard) return;

  let first, second;

  // HARD / NORMAL は既知ペア優先
  if (aiLevel !== "easy") {
    const known = findKnownPair();
    if (known) {
      [first, second] = known;
    }
  }

  // 見つからなければランダム
  if (!first) {
    [first, second] = randomPick();
  }

  reveal(first);

  setTimeout(() => {
    reveal(second);
    checkMatch();
  }, 800);
}

// ====== ランダム選択 ======
function randomPick() {
  const available = cards.filter(c =>
    !c.classList.contains("matched") &&
    !flipped.includes(c)
  );

  const a = available[Math.floor(Math.random() * available.length)];
  let b;

  do {
    b = available[Math.floor(Math.random() * available.length)];
  } while (a === b);

  return [a, b];
}

// ====== 記憶ペア探索 ======
function findKnownPair() {
  for (let key in aiMemory) {
    const valid = aiMemory[key].filter(c =>
      !c.classList.contains("matched")
    );
    if (valid.length >= 2) {
      return [valid[0], valid[1]];
    }
  }
  return null;
}

// ====== UI更新 ======
function updateUI() {
  document.getElementById("turnText").textContent =
    currentTurn === "player" ? "あなたのターン" : "AIのターン";

  document.getElementById("pScore").textContent = score.player;
  document.getElementById("aScore").textContent = score.ai;
}

// ====== 終了判定 ======
function isGameEnd() {
  return score.player + score.ai === (gridSize * gridSize) / 2;
}

// ====== 結果処理 ======
function finishGame() {
  totalGames++;

  let winnerText = "引き分け";

  if (score.player > score.ai) {
    winnerText = "あなたの勝ち！";
    winCount++;
  } else if (score.player < score.ai) {
    winnerText = "AIの勝ち！";
  }

  localStorage.setItem("wins", winCount);
  localStorage.setItem("games", totalGames);

  document.getElementById("winner").textContent = winnerText;
  document.getElementById("finalP").textContent = score.player;
  document.getElementById("finalA").textContent = score.ai;
  document.getElementById("wins").textContent = winCount;
  document.getElementById("games").textContent = totalGames;

  const rate = totalGames === 0
    ? 0
    : Math.round((winCount / totalGames) * 100);

  document.getElementById("rate").textContent = rate;

  showScreen("resultScreen");
}

// ====== 画面制御 ======
function restart() {
  showScreen("gameScreen");
  initBoard();
}

function toTitle() {
  showScreen("titleScreen");
}

function resetData() {
  if (!confirm("データをリセットしますか？")) return;

  localStorage.removeItem("wins");
  localStorage.removeItem("games");

  winCount = 0;
  totalGames = 0;

  alert("リセットしました");
}

// ====== 画面切替 ======
function showScreen(id) {
  document.querySelectorAll(".screen")
    .forEach(s => s.classList.remove("active"));

  document.getElementById(id).classList.add("active");
}