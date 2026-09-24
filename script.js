// State variables
let currentDepth = 100;
let currentTime = "2025-01-01";
let isPlaying = false;
let animationTimer = null;

const DEPTHS = [0, 100, 500, 1000];
const TIMES = ["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-04", "2025-01-05"];

// Depth Slider Event
document.getElementById("depthSlider").addEventListener("input", (e) => {
  const index = Number(e.target.value);
  currentDepth = DEPTHS[index];
  document.getElementById("depthValue").textContent = currentDepth + " m";
  document.getElementById("status").textContent = "Depth: " + currentDepth + " m";
});

// Time Slider Event
document.getElementById("timeSlider").addEventListener("input", (e) => {
  const index = Number(e.target.value);
  currentTime = TIMES[index];
  document.getElementById("timeValue").textContent = currentTime;
  document.getElementById("status").textContent = "Time: " + currentTime;
});

// Variable Selector Change
document.getElementById("variableSelector").addEventListener("change", (e) => {
  const selected = e.target.value;
  if (selected !== "temperature") {
    alert("Notice: Only Temperature dataset is active in the current MVP.");
    e.target.value = "temperature";
  }
});

// Play / Pause Animation
document.getElementById("playButton").addEventListener("click", () => {
  const button = document.getElementById("playButton");

  if (isPlaying) {
    clearInterval(animationTimer);
    isPlaying = false;
    button.textContent = "▶ Play";
    document.getElementById("status").textContent = "Paused";
  } else {
    isPlaying = true;
    button.textContent = "❚❚ Pause";
    document.getElementById("status").textContent = "Playing...";

    animationTimer = setInterval(() => {
      const slider = document.getElementById("timeSlider");
      let currentIndex = Number(slider.value);
      currentIndex = (currentIndex + 1) % TIMES.length;
      slider.value = currentIndex;
      slider.dispatchEvent(new Event("input"));
    }, 1000);
  }
});

// Reset Button
document.getElementById("resetButton").addEventListener("click", () => {
  document.getElementById("depthSlider").value = 1;
  document.getElementById("timeSlider").value = 0;
  currentDepth = 100;
  currentTime = "2025-01-01";
  document.getElementById("depthValue").textContent = "100 m";
  document.getElementById("timeValue").textContent = "2025-01-01";
  document.getElementById("status").textContent = "Reset to default";
});

// Keyboard Shortcuts (Spacebar & Arrow keys)
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

  if (e.code === "Space") {
    e.preventDefault();
    document.getElementById("playButton").click();
  }
  if (e.code === "ArrowUp") {
    const slider = document.getElementById("depthSlider");
    slider.value = Math.min(Number(slider.value) + 1, 3);
    slider.dispatchEvent(new Event("input"));
  }
  if (e.code === "ArrowDown") {
    const slider = document.getElementById("depthSlider");
    slider.value = Math.max(Number(slider.value) - 1, 0);
    slider.dispatchEvent(new Event("input"));
  }
});