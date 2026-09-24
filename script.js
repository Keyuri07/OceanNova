// Simple variables
let currentDepth = 100;
let currentTime = "2025-01-01";
let isPlaying = false;
let animationTimer = null;

const DEPTHS = [0, 100, 500, 1000];
const TIMES = ["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-04", "2025-01-05"];

// Show/hide loading
function showLoading() {
  document.getElementById("loading").style.display = "block";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

// Show error
function showError(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 5000);
}

// Depth slider
document.getElementById("depthSlider").addEventListener("input", (e) => {
  const index = Number(e.target.value);
  currentDepth = DEPTHS[index];
  document.getElementById("depthValue").textContent = currentDepth + " m";
  document.getElementById("status").textContent = "Depth: " + currentDepth + " m";
});

// Time slider
document.getElementById("timeSlider").addEventListener("input", (e) => {
  const index = Number(e.target.value);
  currentTime = TIMES[index];
  document.getElementById("timeValue").textContent = currentTime;
  document.getElementById("status").textContent = "Time: " + currentTime;
});

// Play/Pause button
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

// Reset button
document.getElementById("resetButton").addEventListener("click", () => {
  document.getElementById("depthSlider").value = 1;
  document.getElementById("timeSlider").value = 0;
  currentDepth = 100;
  currentTime = "2025-01-01";
  document.getElementById("depthValue").textContent = "100 m";
  document.getElementById("timeValue").textContent = "2025-01-01";
  document.getElementById("status").textContent = "Reset to default";
});

// Test: Update colorbar (fake data for now)
document.getElementById("minValue").textContent = "18.5 °C";
document.getElementById("maxValue").textContent = "27.3 °C";