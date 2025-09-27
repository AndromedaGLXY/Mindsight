// ===== Variables =====
let chosenColors = ["red","green"];
let leftColor = "red";
let rightColor = "green";
let currentColor = null;
let score = { correct:0, wrong:0, games:0 };

// ===== Show/Hide screens =====
function showMenu() {
  document.getElementById("menu").style.display="block";
  document.getElementById("setup").style.display="none";
  document.getElementById("game").style.display="none";
  document.getElementById("stats").style.display="none";
}
function showSetup() {
  document.getElementById("menu").style.display="none";
  document.getElementById("setup").style.display="block";
}
function showStats() {
  loadStats();
  const total = score.correct+score.wrong;
  const accuracy = total>0 ? ((score.correct/total)*100).toFixed(1) : 0;
  document.getElementById("statsContent").textContent=
    `Games: ${score.games}\nCorrect: ${score.correct}\nWrong: ${score.wrong}\nAccuracy: ${accuracy}%`;
  document.getElementById("menu").style.display="none";
  document.getElementById("stats").style.display="block";
}
function showGame() {
  if(chosenColors.length!==2){
    alert("Please set up two colours first!");
    return;
  }
  leftColor = chosenColors[0];
  rightColor = chosenColors[1];
  document.getElementById("leftLabel").textContent=leftColor.toUpperCase();
  document.getElementById("rightLabel").textContent=rightColor.toUpperCase();
  document.getElementById("menu").style.display="none";
  document.getElementById("setup").style.display="none";
  document.getElementById("stats").style.display="none";
  document.getElementById("game").style.display="flex";
  nextCard();
}

// ===== Setup confirmation =====
document.getElementById("btnConfirm").onclick = ()=>{
  const c1 = document.getElementById("color1").value;
  const c2 = document.getElementById("color2").value;
  if(c1===c2){ alert("Choose two different colours!"); return; }
  chosenColors=[c1,c2];
  alert(`Chosen colours: ${c1} & ${c2}`);
  showMenu();
};
document.getElementById("btnBackMenu1").onclick=showMenu;
document.getElementById("btnBackMenu2").onclick=showMenu;

// ===== Buttons =====
document.getElementById("btnPlay").onclick = showGame;
document.getElementById("btnSetup").onclick = showSetup;
document.getElementById("btnStats").onclick = showStats;
document.getElementById("btnEndGame").onclick = showMenu;

// ===== Game logic =====
const card = document.getElementById("colorCard");
let startX=0;

function nextCard(){
  currentColor = chosenColors[Math.floor(Math.random()*2)];
  card.style.backgroundColor = currentColor;
  card.style.transform="translateX(0px)";
}

// Swipe detection
card.addEventListener("touchstart", e=>{ startX=e.touches[0].clientX; });
card.addEventListener("touchend", e=>{
  const endX = e.changedTouches[0].clientX;
  if(endX < startX-50) handleSwipe("left");
  else if(endX > startX+50) handleSwipe("right");
});
card.addEventListener("mousedown", e=>{ startX=e.clientX; });
card.addEventListener("mouseup", e=>{
  const endX=e.clientX;
  if(endX<startX-50) handleSwipe("left");
  else if(endX>startX+50) handleSwipe("right");
});

function handleSwipe(direction){
  let correct=false;
  if(direction==="left" && currentColor===leftColor) correct=true;
  if(direction==="right" && currentColor===rightColor) correct=true;

  // Speech
  const msg = new SpeechSynthesisUtterance(`${currentColor}. ${correct ? "Correct" : "Wrong"}`);
  speechSynthesis.speak(msg);

  if(correct) score.correct++; else score.wrong++;
  setTimeout(nextCard,700);
}

// ===== Stats storage =====
function saveStats(){ localStorage.setItem("mindSightStats", JSON.stringify(score)); }
function loadStats(){
  const s=localStorage.getItem("mindSightStats");
  if(s) score=JSON.parse(s);
}
window.addEventListener("beforeunload", saveStats);

// ===== Initialize =====
loadStats();
showMenu();
