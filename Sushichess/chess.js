const boardSize = 8;

let video = document.getElementById("video");
let canvas = document.getElementById("overlay");
let ctx = canvas.getContext("2d", { willReadFrequently: true });

let currentPlayer = 'white';
let whiteTime = 300;
let blackTime = 300;
let whiteInterval, blackInterval;

import { getBoardDiff } from './model.js';

let prevBoardState = null;

// Simulated piece memory — use piece strings like "WR1" = White Rook 1
let boardMemory = {
  a1: "WR1", b1: "WN1", c1: "WB1", d1: "WQ",  e1: "WK",  f1: "WB2", g1: "WN2", h1: "WR2",
  a2: "WP1", b2: "WP2", c2: "WP3", d2: "WP4", e2: "WP5", f2: "WP6", g2: "WP7", h2: "WP8",
  a3: null, b3: null, c3: null, d3: null, e3: null, f3: null, g3: null, h3: null,
  a4: null, b4: null, c4: null, d4: null, e4: null, f4: null, g4: null, h4: null,
  a5: null, b5: null, c5: null, d5: null, e5: null, f5: null, g5: null, h5: null,
  a6: null, b6: null, c6: null, d6: null, e6: null, f6: null, g6: null, h6: null,
  a7: "BP1", b7: "BP2", c7: "BP3", d7: "BP4", e7: "BP5", f7: "BP6", g7: "BP7", h7: "BP8",
  a8: "BR1", b8: "BN1", c8: "BB1", d8: "BQ",  e8: "BK",  f8: "BB2", g8: "BN2", h8: "BR2"
};

// === Webcam Functions ===
function stopWebcam() {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

export async function startWebcam(videoId = "video") {
  const videoElement = document.getElementById(videoId);

  if (!videoElement) {
    console.error("🎥 Video element not found:", videoId);
    return;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasVideo = devices.some(device => device.kind === 'videoinput');
    if (!hasVideo) {
      alert("❌ No video input devices found. Connect a webcam.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    videoElement.onloadedmetadata = () => {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      drawOverlayGrid();
    };

    await videoElement.play();
    console.log("✅ Webcam started");

  } catch (err) {
    console.error("❌ Error accessing webcam:", err.name, err.message);
    alert("⚠️ Webcam access failed: " + err.name + " - " + err.message);
  }
}
// === Grid Drawing ===
function drawOverlayGrid() {
  const squareSize = Math.min(canvas.width, canvas.height) / boardSize;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "red";
  ctx.lineWidth = 1.2;
  ctx.font = `${Math.floor(squareSize / 4)}px Arial`;
  ctx.fillStyle = "white";

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const x = j * squareSize;
      const y = i * squareSize;
      ctx.strokeRect(x, y, squareSize, squareSize);

      const file = String.fromCharCode(97 + j); // a-h
      const rank = 8 - i; // 8-1
      const notation = `${file}${rank}`;
      const piece = boardMemory[notation] || "";
      ctx.fillText(`${piece}`, x + 4, y + 20);
    }
  }

  ctx.restore();
}

// === Clock Functions ===
function updateClocks() {
  document.getElementById("whiteTime").textContent =
    `White Time: ${Math.floor(whiteTime / 60)}:${(whiteTime % 60).toString().padStart(2, '0')}`;

  document.getElementById("blackTime").textContent =
    `Black Time: ${Math.floor(blackTime / 60)}:${(blackTime % 60).toString().padStart(2, '0')}`;
}

function startClock() {
  clearInterval(whiteInterval);
  clearInterval(blackInterval);

  if (currentPlayer === 'white') {
    whiteInterval = setInterval(() => {
      whiteTime--;
      updateClocks();
    }, 1000);
  } else {
    blackInterval = setInterval(() => {
      blackTime--;
      updateClocks();
    }, 1000);
  }
}

// === Move Detection Logic ===
function getChangedSquares(before, after) {
  return Object.keys({ ...before, ...after }).filter(
    key => before[key] !== after[key]
  );
}

function determineFromTo(changed, before, after) {
  const from = changed.find(k => before[k] && !after[k]);
  const to = changed.find(k => !before[k] && after[k]);
  return [from, to];
}

function simulateBoardUpdate(newBoard) {
  const oldBoard = { ...boardMemory }; // previous state
  const changed = getChangedSquares(oldBoard, newBoard);

  if (changed.length === 2) {
    const [from, to] = determineFromTo(changed, oldBoard, newBoard);
    const movedPiece = oldBoard[from];

    if (movedPiece) {
      // Transfer the piece identity to new square
      boardMemory[to] = movedPiece;
      boardMemory[from] = null;

      console.log(`♟️ Move: ${movedPiece} from ${from} to ${to}`);
      document.getElementById("moveLog").textContent += `\n${movedPiece} ${from} → ${to}`;

      currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
      startClock();
      drawOverlayGrid();
    } else {
      console.warn("⚠️ Could not find moved piece in memory.");
    }

  } else {
    console.warn("⚠️ Move detection unclear:", changed);
  }
}


// === MAIN ===
document.addEventListener("DOMContentLoaded", () => {
  startWebcam();
  updateClocks();
  startClock();

  setInterval(drawOverlayGrid, 500);

  document.getElementById("moveBtn").addEventListener("click", () => {
    // Dummy update — replace with AI-detected board state later
    simulateBoardUpdate({
   
    });
  });
});

