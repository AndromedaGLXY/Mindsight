
const colours = ['red','green','blue','yellow','orange','purple','pink','black','white','grey'];
let chosenColors = ['red','green'];
let leftColor = 'red', rightColor = 'green', currentColor = null;
let currentGame = {correct:0, wrong:0};
let history = [];

// DOM refs
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

function populateSetup(){
  color1.innerHTML=''; color2.innerHTML='';
  colours.forEach(c=>{ let o1=document.createElement('option'); o1.value=c; o1.textContent=c; color1.appendChild(o1);
                       let o2=document.createElement('option'); o2.value=c; o2.textContent=c; color2.appendChild(o2); });
  color1.value = chosenColors[0] || 'red'; color2.value = chosenColors[1] || 'green';
}

function showMenu(){ menu.style.display='flex'; setup.classList.add('hidden'); game.classList.add('hidden'); stats.classList.add('hidden'); }
function showSetup(){ menu.style.display='none'; setup.classList.remove('hidden'); game.classList.add('hidden'); stats.classList.add('hidden'); }
function showStats(){ menu.style.display='none'; setup.classList.add('hidden'); game.classList.add('hidden'); stats.classList.remove('hidden'); renderHistory(); }
function showGame(){ 
  if(!chosenColors || chosenColors.length!==2){ alert('Please set up two colours first'); return; }
  leftColor = chosenColors[0]; rightColor = chosenColors[1];
  leftLabel.textContent = leftColor.toUpperCase(); rightLabel.textContent = rightColor.toUpperCase();
  menu.style.display='none'; setup.classList.add('hidden'); stats.classList.add('hidden'); game.classList.remove('hidden');
  resetCurrentGame(); nextCard();
}

// setup confirm
document.getElementById('btnConfirm').addEventListener('click', ()=>{
  if(color1.value === color2.value){ alert('Choose two different colours'); return; }
  chosenColors = [color1.value, color2.value]; alert('Chosen: ' + chosenColors.join(' vs ')); showMenu();
});
document.getElementById('btnBackMenu1').addEventListener('click', showMenu);

// menu buttons
document.getElementById('btnPlay').addEventListener('click', ()=>{ showGame(); });
document.getElementById('btnSetup').addEventListener('click', ()=>{ populateSetup(); showSetup(); });
document.getElementById('btnStats').addEventListener('click', showStats);
document.getElementById('btnBackMenu2').addEventListener('click', showMenu);

// end/save game & clear history
document.getElementById('btnEndGame').addEventListener('click', ()=>{
  if(currentGame.correct + currentGame.wrong > 0){
    history.push({ correct: currentGame.correct, wrong: currentGame.wrong, left: leftColor, right: rightColor, time: new Date().toISOString() });
    saveHistory();
    alert('Game saved');
    resetCurrentGame();
  } else {
    alert('No plays this game to save.');
  }
});
document.getElementById('btnMenuFromGame').addEventListener('click', ()=>{ saveHistory(); showMenu(); });
document.getElementById('btnClearHistory').addEventListener('click', ()=>{ if(confirm('Clear history?')){ history = []; saveHistory(); renderHistory(); } });

// core game
function nextCard(){ currentColor = chosenColors[Math.floor(Math.random()*2)]; colorCard.style.backgroundColor = currentColor; colorCard.style.opacity = '1'; }
function updateLiveStats(){ liveCorrect.textContent = currentGame.correct; liveWrong.textContent = currentGame.wrong; }
function resetCurrentGame(){ currentGame = {correct:0, wrong:0}; updateLiveStats(); }
function saveHistory(){ localStorage.setItem('mindsight_history', JSON.stringify(history)); }
function loadHistory(){ const s = localStorage.getItem('mindsight_history'); if(s) history = JSON.parse(s); }
function renderHistory(){ historyList.innerHTML=''; if(history.length===0){ historyList.textContent='No saved games yet.'; return; } history.slice().reverse().forEach((h,i)=>{ const div = document.createElement('div'); div.className='history-item'; const idx = history.length - i; const t = new Date(h.time).toLocaleString(); div.textContent = `Game ${idx}: ${h.correct} correct / ${h.wrong} wrong — (${h.left} vs ${h.right}) — ${t}`; historyList.appendChild(div); }); }

// double-tap handling (pointer events preferred, fallback to touch/click)
// We'll use a short window to detect double taps.
let lastTap = 0;
let lastSide = null;
const DOUBLE_MS = 330;

function onSideTap(side){
  const now = Date.now();
  if(lastSide === side && (now - lastTap) < DOUBLE_MS){
    // double tap confirmed
    performChoice(side);
    lastTap = 0; lastSide = null;
  } else {
    lastTap = now; lastSide = side;
    flashSide(side);
  }
}

function performChoice(side){
  const chosen = (side === 'left') ? leftColor : rightColor;
  const correct = (chosen === currentColor);
  if(correct) currentGame.correct++; else currentGame.wrong++;
  updateLiveStats();
  try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(`${chosen}. ${correct ? 'Correct' : 'Wrong'}`)); } catch(e){}
  colorCard.style.opacity = '0.22';
  setTimeout(()=>{ nextCard(); colorCard.style.opacity = '1'; }, 650);
}

function flashSide(side){
  if(side === 'left'){ leftSide.classList.add('flash-left'); setTimeout(()=>leftSide.classList.remove('flash-left'), 220); }
  else { rightSide.classList.add('flash-right'); setTimeout(()=>rightSide.classList.remove('flash-right'), 220); }
}

// Use pointer events if supported (covers touch & mouse). Fallbacks: touchend + click.
if(window.PointerEvent){
  leftSide.addEventListener('pointerup', (e)=>{ e.preventDefault(); onSideTap('left'); });
  rightSide.addEventListener('pointerup', (e)=>{ e.preventDefault(); onSideTap('right'); });
} else {
  leftSide.addEventListener('touchend', (e)=>{ e.preventDefault(); onSideTap('left'); }, {passive:false});
  rightSide.addEventListener('touchend', (e)=>{ e.preventDefault(); onSideTap('right'); }, {passive:false});
  // click fallback for desktop
  leftSide.addEventListener('click', ()=> onSideTap('left'));
  rightSide.addEventListener('click', ()=> onSideTap('right'));
}

// keyboard accessibility: Enter on focused side triggers single tap (require double press to confirm)
leftSide.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') onSideTap('left'); });
rightSide.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') onSideTap('right'); });

// init
loadHistory(); renderHistory(); populateSetup(); showMenu();
