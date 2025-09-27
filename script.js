let chosenColors = ["red", "green"];
let leftColor = "red";
let rightColor = "green";
let currentColor = null;

function showGame() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("setup").style.display = "none";
  document.getElementById("stats").style.display = "none";
  document.getElementById("game").style.display = "flex";
  document.getElementById("leftLabel").textContent = leftColor.toUpperCase();
  document.getElementById("rightLabel").textContent = rightColor.toUpperCase();
  nextCard();
}

function nextCard() {
  currentColor = chosenColors[Math.floor(Math.random() * chosenColors.length)];
  const card = document.getElementById("colorCard");
  card.style.backgroundColor = currentColor;
  card.style.transform = "translateX(0px)";
}

function handleSwipe(direction) {
  let correct = false;
  if (direction === "left" && currentColor === leftColor) correct = true;
  if (direction === "right" && currentColor === rightColor) correct = true;

  // Speak the result
  let msg = new SpeechSynthesisUtterance(
    `${currentColor}. ${correct ? "Correct" : "Wrong"}`
  );
  speechSynthesis.speak(msg);

  // Load the next card
  setTimeout(nextCard, 800);
}

// Swipe handling
let startX = 0;
const card = document.getElementById("colorCard");

card.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

card.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  if (endX < startX - 50) {
    handleSwipe("left");
  } else if (endX > startX + 50) {
    handleSwipe("right");
  }
});

// For desktop testing with mouse
card.addEventListener("mousedown", e => {
  startX = e.clientX;
});
card.addEventListener("mouseup", e => {
  const endX = e.clientX;
  if (endX < startX - 50) {
    handleSwipe("left");
  } else if (endX > startX + 50) {
    handleSwipe("right");
  }
});
