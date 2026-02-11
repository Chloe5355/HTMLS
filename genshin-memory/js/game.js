const ELEMENTS = [
  { id:'wind', icon:'🌪', color:'#3ee6c4', name:'風' },
  { id:'fire', icon:'🔥', color:'#ff4b4b', name:'炎' },
  { id:'water', icon:'💧', color:'#3b82f6', name:'水' },
  { id:'ice', icon:'❄', color:'#7dd3fc', name:'氷' },
  { id:'thunder', icon:'⚡', color:'#a855f7', name:'雷' },
  { id:'rock', icon:'🪨', color:'#facc15', name:'岩' },
  { id:'grass', icon:'🌿', color:'#22c55e', name:'草' }
];

let board=document.getElementById('board');
let opened=[], gameRunning=false, aiTurn=false;
let aiDifficulty='medium', aiMemory={};
let streak=0, maxStreak=0;
let ownedTitles={}, equippedTitle='';
let developerMode=false;

const ACHIEVEMENTS = [
  { name:'10連勝', condition:10, type:'win', title:'大共鳴者', special:false },
  { name:'全勝', condition:100, type:'win', title:'開発者称号', special:true }
];

function changeElement(){
  if(gameRunning) return;
  const elId=document.getElementById('element').value;
  const element=ELEMENTS.find(e=>e.id===elId);
  if(element) document.documentElement.style.setProperty('--main', element.color);
}

function startGame(){
  document.getElementById('titleScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');
  gameRunning=true; aiTurn=false; streak=0; maxStreak=0;
  aiDifficulty=document.getElementById('aiDifficulty').value;
  changeElement(); shuffleCards(); renderStatus();
  document.getElementById('element').disabled=true;
}

function stopGame(){
  document.getElementById('titleScreen').classList.add('active');
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('winScreen').classList.remove('active');
  document.getElementById('winScreen').style.zIndex=0;
  gameRunning=false; aiTurn=false; board.innerHTML='';
  document.getElementById('element').disabled=false;
}

function shuffleCards(){
  board.innerHTML=''; opened=[]; aiMemory={};
  let cards=[...ELEMENTS,...ELEMENTS].sort(()=>Math.random()-0.5);
  cards.forEach((el,i)=>{
    const div=document.createElement('div');
    div.className='card';
    div.dataset.element=el.id;
    div.dataset.icon=el.icon;
    div.dataset.index=i;
    div.innerHTML=`<div class="card-inner"><div class="card-front"></div><div class="card-back">${el.icon}</div></div>`;
    div.onclick=()=>playerMove(div);
    board.appendChild(div);
  });
}

function playerMove(card){
  if(!gameRunning || aiTurn || card.classList.contains('open')) return;
  openCard(card);
  if(opened.length===2){ aiTurn=true; setTimeout(checkMatch,800); }
}

function openCard(card){ card.classList.add('open'); opened.push(card); if(aiDifficulty!=='easy') aiMemory[card.dataset.index]=card.dataset.element; }
function closeCard(card){ card.classList.remove('open'); opened=opened.filter(c=>c!==card); }

function checkMatch(){
  const [a,b]=opened;
  if(a.dataset.element!==b.dataset.element){
    setTimeout(()=>{ closeCard(a); closeCard(b); setTimeout(aiMove,500); },500);
  } else {
    streak++; maxStreak=Math.max(streak,maxStreak); opened=[];
    checkAchievements();
    const allOpen = Array.from(document.querySelectorAll('.card')).every(c=>c.classList.contains('open'));
    if(allOpen) showWinScreen(); else setTimeout(aiMove,500);
  }
  renderStatus();
}

function aiMove(){
  if(!gameRunning){ aiTurn=false; return; }
  let cards=Array.from(document.querySelectorAll('.card')).filter(c=>!c.classList.contains('open'));
  if(cards.length<2){ aiTurn=false; return; }

  let pick1,pick2;
  if(aiDifficulty==='easy'){
    pick1=cards[Math.floor(Math.random()*cards.length)];
    pick2=cards[Math.floor(Math.random()*cards.length)];
  } else {
    let found=false;
    for(let i in aiMemory){ for(let j in aiMemory){
      if(i!==j && aiMemory[i]===aiMemory[j]){
        pick1=document.querySelector(`.card[data-index='${i}']`);
        pick2=document.querySelector(`.card[data-index='${j}']`);
        if(pick1 && pick2){ found=true; break; }
      }
    } if(found) break; }
    if(!found){ pick1=cards[Math.floor(Math.random()*cards.length)]; pick2=cards[Math.floor(Math.random()*cards.length)]; }
  }
  openCard(pick1);
  setTimeout(()=>{ openCard(pick2); setTimeout(()=>{ checkMatch(); aiTurn=false; },800); },500);
}

function renderStatus(){
  document.getElementById('streak').textContent=streak;
  let winRate=maxStreak?Math.round(streak/maxStreak*100):0;
  document.getElementById('winRate').textContent=winRate+'%';
}

function checkAchievements(){
  ACHIEVEMENTS.forEach(a=>{
    if(!ownedTitles[a.title] && streak>=a.condition){
      ownedTitles[a.title]=true;
      const li=document.createElement('li');
      li.textContent=a.title + (a.special?' 🔥':'');
      if(a.special) li.style.color='gold';
      document.getElementById('titleList').appendChild(li);
      if(a.title==='開発者称号'){ equipTitle('開発者称号'); developerMode=true; document.getElementById('devPanel').style.display='block'; }
    }
  });
}

function equipCurrentTitle(){ const titles=Object.keys(ownedTitles); if(titles.length>0) equipTitle(titles[titles.length-1]); }
function equipTitle(title){ equippedTitle=title; const frame=document.getElementById('titleFrame'); const span=document.getElementById('equippedTitle'); span.textContent=title; frame.className=''; if(title==='開発者称号') frame.classList.add('developer'); else if(title.includes('大共鳴者')) frame.classList.add('gold'); }

function showWinScreen(){
  gameRunning=false; aiTurn=false;
  document.getElementById('gameScreen').classList.remove('active');
  const winScreen=document.getElementById('winScreen');
  winScreen.classList.add('active'); winScreen.style.zIndex=100;
  document.getElementById('winStreak').textContent=streak;
  const titles=Object.keys(ownedTitles);
  document.getElementById('winTitle').textContent = titles.length>0 ? titles[titles.length-1] : 'なし';
  const elId=document.getElementById('element').value;
  const element=ELEMENTS.find(e=>e.id===elId);
  if(element) winScreen.style.background = `radial-gradient(circle, ${element.color} 0%, transparent 70%)`;
}

function nextGame(){
  const winScreen=document.getElementById('winScreen');
  winScreen.classList.remove('active'); winScreen.style.zIndex=0;
  document.getElementById('gameScreen').classList.add('active');
  gameRunning=true; aiTurn=false; shuffleCards(); renderStatus();
}

function applyUIColor(){
  if(!developerMode) return;
  const color=document.getElementById('uiColor').value;
  document.documentElement.style.setProperty('--main', color);
}