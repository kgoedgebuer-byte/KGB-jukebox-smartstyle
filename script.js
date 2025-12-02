const audio = new Audio();
let playlist = []; // {name, url, kind:'remote'|'local'}
let currentIndex = -1;
let shuffleOn = false;
let loopOn = false;
let sleepTimeout = null;

// DOM
const fileInput = document.getElementById("fileInput");
const freeBtn = document.getElementById("freeMusicBtn");
const playlistEl = document.getElementById("playlist");
const nowTitleEl = document.getElementById("nowTitle");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const progressFillEl = document.getElementById("progressFill");
const volumeSlider = document.getElementById("volumeSlider");
const shuffleBtn = document.getElementById("shuffleBtn");
const loopBtn = document.getElementById("loopBtn");
const sleepBtn = document.getElementById("sleepBtn");
const spotifyBtn = document.getElementById("spotifyBtn");

// THEMA
document.querySelectorAll(".color-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const theme = btn.dataset.theme;
    document.body.className = `theme-${theme}`;
    localStorage.setItem("kgbJukeboxTheme", theme);
  });
});
const savedTheme = localStorage.getItem("kgbJukeboxTheme");
if (savedTheme) {
  document.body.className = `theme-${savedTheme}`;
} else {
  document.body.className = "theme-pink";
}

// GRATIS MUZIEK (uit eigen repo-map free-music/)
const FREE_TRACKS = [
  { name: "Free Track 1", url: "free-music/track1.mp3" },
  { name: "Free Track 2", url: "free-music/track2.mp3" },
  { name: "Free Track 3", url: "free-music/track3.mp3" },
  { name: "Free Track 4", url: "free-music/track4.mp3" },
  { name: "Free Track 5", url: "free-music/track5.mp3" }
];

function loadSavedRemote() {
  const saved = localStorage.getItem("kgbJukeboxRemote");
  if (!saved) return;
  try {
    const arr = JSON.parse(saved);
    arr.forEach(t => playlist.push(t));
    if (playlist.length > 0 && currentIndex === -1) {
      currentIndex = 0;
      loadTrack(currentIndex);
    }
  } catch (e) {
    console.warn("Kon playlist niet lezen:", e);
  }
}

function saveRemote() {
  const remote = playlist.filter(t => t.kind === "remote");
  localStorage.setItem("kgbJukeboxRemote", JSON.stringify(remote));
}

loadSavedRemote();
renderPlaylist();
updatePlayState();

// FILES VAN TOESTEL
fileInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  files.forEach((file) => {
    playlist.push({
      name: file.name,
      url: URL.createObjectURL(file),
      kind: "local"
    });
  });
  if (currentIndex === -1 && playlist.length > 0) {
    currentIndex = 0;
    loadTrack(currentIndex);
  }
  renderPlaylist();
});

// GRATIS MUZIEK KNOP
freeBtn.addEventListener("click", () => {
  FREE_TRACKS.forEach((t) => {
    if (!playlist.some((p) => p.url === t.url)) {
      playlist.push({ ...t, kind: "remote" });
    }
  });
  if (currentIndex === -1 && playlist.length > 0) {
    currentIndex = 0;
    loadTrack(currentIndex);
  }
  saveRemote();
  renderPlaylist();
});

// CORE PLAYER
function loadTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  currentIndex = index;
  const track = playlist[index];
  audio.src = track.url;
  nowTitleEl.textContent = track.name;
}

function playCurrent() {
  if (playlist.length === 0) return;
  if (currentIndex < 0) currentIndex = 0;
  loadTrack(currentIndex);
  audio
    .play()
    .then(() => {
      updatePlayState(true);
    })
    .catch((err) => {
      console.warn("Kan niet afspelen:", err);
    });
}

function pauseCurrent() {
  audio.pause();
  updatePlayState(false);
}

function updatePlayState(forcePlaying) {
  const playing = forcePlaying !== undefined ? forcePlaying : !audio.paused;
  playPauseBtn.textContent = playing ? "⏸" : "▶";
  renderPlaylist();
}

playPauseBtn.addEventListener("click", () => {
  if (audio.paused) {
    playCurrent();
  } else {
    pauseCurrent();
  }
});

prevBtn.addEventListener("click", () => {
  if (playlist.length === 0) return;
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  playCurrent();
});

nextBtn.addEventListener("click", () => {
  if (playlist.length === 0) return;
  if (shuffleOn) {
    currentIndex = Math.floor(Math.random() * playlist.length);
  } else {
    currentIndex = (currentIndex + 1) % playlist.length;
  }
  playCurrent();
});

audio.addEventListener("ended", () => {
  if (loopOn) {
    playCurrent();
  } else {
    nextBtn.click();
  }
});

// PROGRESS
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFillEl.style.width = `${pct}%`;
});

function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// VOLUME
volumeSlider.addEventListener("input", () => {
  audio.volume = parseFloat(volumeSlider.value);
});

// SHUFFLE & LOOP
shuffleBtn.addEventListener("click", () => {
  shuffleOn = !shuffleOn;
  shuffleBtn.classList.toggle("active", shuffleOn);
});

loopBtn.addEventListener("click", () => {
  loopOn = !loopOn;
  loopBtn.classList.toggle("active", loopOn);
});

// SLEEP TIMER
sleepBtn.addEventListener("click", () => {
  const minutes = prompt("Slaap-timer (minuten, bv. 20):");
  if (!minutes) return;
  const ms = parseInt(minutes, 10) * 60000;
  if (sleepTimeout) clearTimeout(sleepTimeout);
  sleepTimeout = setTimeout(() => {
    pauseCurrent();
  }, ms);
  alert(`Muziek stopt over ${minutes} min.`);
});

// SPOTIFY
spotifyBtn.addEventListener("click", () => {
  if (currentIndex < 0 || currentIndex >= playlist.length) return;
  const name = playlist[currentIndex].name;
  const url = "https://open.spotify.com/search/" + encodeURIComponent(name);
  window.open(url, "_blank");
});

// PLAYLIST RENDER
function renderPlaylist() {
  playlistEl.innerHTML = "";
  if (playlist.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nog geen nummers geladen.";
    li.className = "playlist-item";
    playlistEl.appendChild(li);
    return;
  }
  playlist.forEach((track, index) => {
    const li = document.createElement("li");
    li.className = "playlist-item";
    if (index === currentIndex && !audio.paused) {
      li.classList.add("active");
    }
    li.textContent = track.name;
    li.addEventListener("click", () => {
      currentIndex = index;
      playCurrent();
    });
    playlistEl.appendChild(li);
  });
}
