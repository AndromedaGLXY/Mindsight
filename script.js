const colours = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "black", "white", "grey"];
let chosen = [];
let score = { correct: 0, wrong: 0, games: 0 };

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function populateColors() {
  const list = document.getElementById("color-list");
  list.innerHTML = "";
  colours.forEach(col => {
    const btn = document.createElement("button");
    btn.textContent = col;
    btn.style.background = col;
    btn.style.color = col === "black" ? "white" : "black";
    btn.onclick = () => toggleColor(col, btn);
    list.appendChild(btn);
  });
}

function toggleColor(col, btn) {
  if (chosen.includes(col)) {
    chosen = chosen.filter(c => c !== col);
    btn.style.border = "none";
  } else if (chosen.length < 2) {
    chosen.push(col);
    btn.style.border = "3px solid black";
  }
}

function confirmSetup() {
  if (chosen.length === 2) {
    alert("Colours chosen: " + chosen.join(" & "));
    showScreen('menu');
  } else {
    alert("Please pick 2 colours.");
  }
}

function startGame() {
  if (chosen.length !== 2) {
    alert("Set up the game first!");
    return;
  }
  showScreen("game");
  document.getElementById("left-label").textContent = chosen[0];
  document.getElementById("right-label").textContent = chosen[1];
  nextCard();
}

function nextCard() {
  const card = document.getElementById("card");
  const colour = chosen[Math.floor(Math.random() * 2)];
  card.dataset.colour = colour;
  card.style.background = colour;
  card.textContent = "";
  document.getElementById("feedback").textContent = "Swipe left or right!";
}

function handleSwipe(direction) {
  const card = document.getElementById("card");
  const actual = card.dataset.colour;
  let correct = false;
  if (direction === "left" && actual === chosen[0]) correct = true;
  if (direction === "right" && actual === chosen[1]) correct = true;

  if (correct) {
    score.correct++;
    feedback("Correct: " + actual);
  } else {
    score.wrong++;
    feedback("Wrong: " + actual);
  }

  // Speak result
  const msg = new SpeechSynthesisUtterance(actual + (correct ? " correct" : " wrong"));
  speechSynthesis.speak(msg);

  setTimeout(nextCard, 1000);
}

function feedback(text) {
  document.getElementById("feedback").textContent = text;
}

function endGame() {
  score.games++;
  saveStats();
  showStats();
  showScreen("stats");
}

function showStats() {
  const total = score.correct + score.wrong;
  const accuracy = total > 0 ? ((score.correct / total) * 100).toFixed(1) : 0;
  document.getElementById("stats-content").textContent =
    `Games: ${score.games}\nCorrect: ${score.correct}\nWrong: ${score.wrong}\nAccuracy: ${accuracy}%`;
}

function saveStats() {
  localStorage.setItem("mindSightStats", JSON.stringify(score));
}

function loadStats() {
  const saved = localStorage.getItem("mindSightStats");
  if (saved) score = JSON.parse(saved);
}

function addSwipe() {
  let startX = 0;
  document.addEventListener("touchstart", e => startX = e.changedTouches[0].screenX);
  document.addEventListener("touchend", e => {
    let endX = e.changedTouches[0].screenX;
    if (endX < startX - 50) handleSwipe("left");
    if (endX > startX + 50) handleSwipe("right");
  });
}

// Init
loadStats();
populateColors();
addSwipe();
showScreen("menu");
