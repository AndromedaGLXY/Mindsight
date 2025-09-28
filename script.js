
/* MindSight: double-tap left/right, live stats, historical list */

const colours = ["red","green","blue","yellow","orange","purple","pink","black","white","grey"];
let chosenColors = ["red","green"];
let leftColor = "red";
let rightColor = "green";
let currentColor = null;

// current game stats
let currentGame = { correct: 0, wrong: 0 };

// history array of past games
let history = [];

// DOM references
const menu = document.getElementById('menu');
const setup = document.getElementById('setup');
const game = document.getElementById('game');
const stats = document.getElementById('stats');
const color1 = document.getElementById('color1');
const color2 = document.getElementById('color2');
const leftLabel = document.getElementById('leftLabel');
const rightLabel = document.getElementById('rightLabel');
const colorCard = document.getElementById('colorCard');
const liveCorrect = document.getElementById('liveCorrect');
const liveWrong = document.getElementById('liveWrong');
const historyList = document.getElementById('historyList');
const leftSide = document.getElementById('leftSide');
const rightSide = document.getElementById('rightSide');

// populate setup selects
function populateSetup() {
  color1.innerHTML = '';
  color2.innerHTML = '';
  colours.forEach(c=>{
    const o1 = document.createElement('option'); o1.value=c; o1.textContent=c; color1.appendChild(o1);
    const o2 = document.createElement('option'); o2.value=c; o2.textContent=c; color2.appendChild(o2);
  });
  color1.value = chosenColors[0] || 'red';
  color2.value = chosenColors[1] || 'green';
}

// screen helpers
function showMenu(){ menu.style.display='flex'; setup.classList.add('hidden'); game.classList.add('hidden'); stats.classList.add('hidden'); }
function showSetup(){ menu.style.display='none'; setup.classList.remove('hidden'); game.classList.add('hidden'); stats.classList.add('hidden'); }
function showStats(){ menu.style.display='none'; setup.classList.add('hidden'); game.classList.add('hidden'); stats.classList.remove('hidden'); renderHistory(); }
function showGame(){ 
  if(chosenColors.length !== 2){ alert('Choose two colours first'); return; }
  leftColor = chosenColors[0]; rightColor = chosenColors[1];
  leftLabel.textContent = leftColor.toUpperCase();
  rightLabel.textContent = rightColor.toUpperCase();
  menu.style.display='none'; setup.classList.add('hidden'); stats.classList.add('hidden'); game.classList.remove('hidden');
  resetCurrentGame();
  nextCard();
}

// setup confirm
document.getElementById('btnConfirm').addEventListener('click', ()=>{
  const c1 = color1.value, c2 = color2.value;
  if(c1===c2){ alert('Please select two different colours'); return; }
  chosenColors = [c1,c2];
  alert('Chosen: ' + c1 + ' (left) and ' + c2 + ' (right)');
  showMenu();
});
document.getElementById('btnBackMenu1').addEventListener('click', showMenu);

// menu buttons
document.getElementById('btnPlay').addEventListener('click', showGame);
document.getElementById('btnSetup').addEventListener('click', ()=>{ populateSetup(); showSetup(); });
document.getElementById('btnStats').addEventListener('click', showStats);
document.getElementById('btnBackMenu2').addEventListener('click', showMenu);

// end game save
document.getElementById('btnEndGame').addEventListener('click', ()=>{
  // save only if there were plays
  if(currentGame.correct + currentGame.wrong > 0) {
    const entry = { correct: currentGame.correct, wrong: currentGame.wrong, left: leftColor, right: rightColor, time: new Date().toISOString() };
    history.push(entry);
    saveHistory();
    alert('Game saved to history: ' + entry.correct + ' correct / ' + entry.wrong + ' wrong');
    resetCurrentGame();
  } else {
    alert('No plays this game to save.');
  }
});

document.getElementById('btnMenuFromGame').addEventListener('click', ()=>{ saveHistory(); showMenu(); });

// clear history
document.getElementById('btnClearHistory').addEventListener('click', ()=>{
  if(confirm('Clear all saved games?')){ history = []; saveHistory(); renderHistory(); alert('History cleared'); }
});

// next card
function nextCard(){
  currentColor = chosenColors[Math.floor(Math.random()*2)];
  colorCard.style.backgroundColor = currentColor;
  colorCard.style.opacity = '1';
}

// live stats update
function updateLiveStats(){
  liveCorrect.textContent = currentGame.correct;
  liveWrong.textContent = currentGame.wrong;
}

// reset current game
function resetCurrentGame(){
  currentGame.correct = 0; currentGame.wrong = 0;
  updateLiveStats();
}

// history persistence
function saveHistory(){ localStorage.setItem('mindsight_history', JSON.stringify(history)); }
function loadHistory(){ const s = localStorage.getItem('mindsight_history'); if(s) history = JSON.parse(s); }
function renderHistory(){
  historyList.innerHTML = '';
  if(history.length===0){ historyList.textContent = 'No saved games yet.'; return; }
  history.slice().reverse().forEach((h,i)=>{
    const div = document.createElement('div'); div.className='history-item';
    const idx = history.length - i;
    const t = new Date(h.time).toLocaleString();
    div.textContent = `Game ${idx}: ${h.correct} correct / ${h.wrong} wrong — (${h.left} vs ${h.right}) — ${t}`;
    historyList.appendChild(div);
  });
}

// double-tap detection
let lastTap = 0;
let lastSide = null; // 'left' or 'right'
const DOUBLE_TAP_MS = 350;

function handleTap(side){
  const now = Date.now();
  if(lastSide === side && (now - lastTap) < DOUBLE_TAP_MS){
    // double tap confirmed
    performChoice(side);
    lastTap = 0; lastSide = null;
  } else {
    lastTap = now;
    lastSide = side;
    // provide subtle visual feedback: briefly flash the side
    flashSide(side);
  }
}

function performChoice(side){
  // determine if correct
  const chosen = (side === 'left') ? leftColor : rightColor;
  const correct = (chosen === currentColor);
  if(correct) currentGame.correct++; else currentGame.wrong++;
  updateLiveStats();
  // speak result
  try {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(`${chosen}. ${correct ? 'Correct' : 'Wrong'}`);
    speechSynthesis.speak(utter);
  } catch(e){ console.log('Speech error', e); }
  // briefly fade card then next
  colorCard.style.opacity = '0.2';
  setTimeout(()=>{ nextCard(); colorCard.style.opacity='1'; }, 700);
}

function flashSide(side){
  const el = (side==='left') ? leftSide : rightSide;
  el.style.opacity = '0.6';
  setTimeout(()=> el.style.opacity = '1', 180);
}

// add event listeners to sides for touch and mouse
leftSide.addEventListener('touchend', (e)=>{ e.preventDefault(); handleTap('left'); }, {passive:false});
rightSide.addEventListener('touchend', (e)=>{ e.preventDefault(); handleTap('right'); }, {passive:false});

// desktop double click support
leftSide.addEventListener('dblclick', ()=> handleTap('left'));
rightSide.addEventListener('dblclick', ()=> handleTap('right'));

// load history and initialize
loadHistory();
renderHistory();
populateSetup();
showMenu();
