
const colours = ["red","green","blue","yellow","orange","purple","pink","black","white","grey"];
let chosenColors = ["red","green"];
let leftColor = "red";
let rightColor = "green";
let currentColor = null;
let currentGame = { correct: 0, wrong: 0 };
let history = [];

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

function populateSetup() {
  color1.innerHTML = ''; color2.innerHTML='';
  colours.forEach(c=>{
    let o1=document.createElement('option');o1.value=c;o1.textContent=c;color1.appendChild(o1);
    let o2=document.createElement('option');o2.value=c;o2.textContent=c;color2.appendChild(o2);
  });
  color1.value=chosenColors[0]; color2.value=chosenColors[1];
}

function showMenu(){ menu.style.display='flex'; setup.classList.add('hidden'); game.classList.add('hidden'); stats.classList.add('hidden'); }
function showSetup(){ menu.style.display='none'; setup.classList.remove('hidden'); game.classList.add('hidden'); stats.classList.add('hidden'); }
function showStats(){ menu.style.display='none'; setup.classList.add('hidden'); game.classList.add('hidden'); stats.classList.remove('hidden'); renderHistory(); }
function showGame(){ leftColor=chosenColors[0]; rightColor=chosenColors[1]; leftLabel.textContent=leftColor.toUpperCase(); rightLabel.textContent=rightColor.toUpperCase(); menu.style.display='none'; setup.classList.add('hidden'); stats.classList.add('hidden'); game.classList.remove('hidden'); resetCurrentGame(); nextCard(); }

document.getElementById('btnConfirm').addEventListener('click', ()=>{ if(color1.value===color2.value){alert('Please choose different colours');return;} chosenColors=[color1.value,color2.value]; alert('Chosen: '+chosenColors.join(' vs ')); showMenu(); });
document.getElementById('btnBackMenu1').addEventListener('click', showMenu);
document.getElementById('btnPlay').addEventListener('click', showGame);
document.getElementById('btnSetup').addEventListener('click', ()=>{populateSetup();showSetup();});
document.getElementById('btnStats').addEventListener('click', showStats);
document.getElementById('btnBackMenu2').addEventListener('click', showMenu);

document.getElementById('btnEndGame').addEventListener('click', ()=>{ if(currentGame.correct+currentGame.wrong>0){ history.push({correct:currentGame.correct,wrong:currentGame.wrong,left:leftColor,right:rightColor,time:new Date().toISOString()}); saveHistory(); alert('Game saved'); resetCurrentGame(); } });
document.getElementById('btnMenuFromGame').addEventListener('click', ()=>{ saveHistory(); showMenu(); });
document.getElementById('btnClearHistory').addEventListener('click', ()=>{ if(confirm('Clear all history?')){ history=[]; saveHistory(); renderHistory(); } });

function nextCard(){ currentColor=chosenColors[Math.floor(Math.random()*2)]; colorCard.style.backgroundColor=currentColor; colorCard.style.opacity='1'; }
function updateLiveStats(){ liveCorrect.textContent=currentGame.correct; liveWrong.textContent=currentGame.wrong; }
function resetCurrentGame(){ currentGame={correct:0,wrong:0}; updateLiveStats(); }
function saveHistory(){ localStorage.setItem('mindsight_history', JSON.stringify(history)); }
function loadHistory(){ let s=localStorage.getItem('mindsight_history'); if(s) history=JSON.parse(s); }
function renderHistory(){ historyList.innerHTML=''; if(history.length===0){ historyList.textContent='No saved games yet.'; return;} history.slice().reverse().forEach((h,i)=>{let div=document.createElement('div');div.className='history-item';div.textContent=`Game ${history.length-i}: ${h.correct} correct / ${h.wrong} wrong (${h.left} vs ${h.right})`; historyList.appendChild(div);}); }

let lastTap=0,lastSide=null; const DOUBLE_MS=350;
function handleTap(side){ const now=Date.now(); if(lastSide===side && (now-lastTap)<DOUBLE_MS){ performChoice(side); lastTap=0; lastSide=null; } else { lastTap=now; lastSide=side; flashSide(side); } }
function performChoice(side){ let chosen=(side==='left')?leftColor:rightColor; let correct=(chosen===currentColor); if(correct)currentGame.correct++; else currentGame.wrong++; updateLiveStats(); try{ speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(`${chosen}. ${correct?'Correct':'Wrong'}`)); }catch(e){} colorCard.style.opacity='0.2'; setTimeout(()=>{nextCard(); colorCard.style.opacity='1';},600); }
function flashSide(side){ if(side==='left'){leftSide.classList.add('flash-left'); setTimeout(()=>leftSide.classList.remove('flash-left'),200);} else {rightSide.classList.add('flash-right'); setTimeout(()=>rightSide.classList.remove('flash-right'),200);} }

leftSide.addEventListener('touchend', (e)=>{e.preventDefault();handleTap('left');},{passive:false});
rightSide.addEventListener('touchend', (e)=>{e.preventDefault();handleTap('right');},{passive:false});
leftSide.addEventListener('dblclick', ()=>handleTap('left'));
rightSide.addEventListener('dblclick', ()=>handleTap('right'));

loadHistory(); renderHistory(); populateSetup(); showMenu();
