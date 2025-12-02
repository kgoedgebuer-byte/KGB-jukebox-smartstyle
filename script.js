const fileInput = document.getElementById("fileInput");
const playlistEl = document.getElementById("playlist");
const player = document.getElementById("player");
const currentTitleEl = document.getElementById("currentTitle");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const volumeSlider = document.getElementById("volume");

const urlInput = document.getElementById("urlInput");
const addUrlBtn = document.getElementById("addUrlBtn");
const loadFreeBtn = document.getElementById("loadFreeBtn");
const clearBtn = document.getElementById("clearBtn");
const spotifyBtn = document.getElementById("spotifyBtn");

const themePicker = document.getElementById("themePicker");

let tracks = [];
let currentIndex = -1;

// ---------- THEMA'S ----------
const THEMES = [
  { bg: "#e3f2ff", accent: "#3c7dff" },
  { bg: "#ffe3f4", accent: "#ff4fa3" },
  { bg: "#f3e3ff", accent: "#a34dff" },
  { bg: "#ffe9d9", accent: "#ff7a3c" },
  { bg: "#f0ffd9", accent: "#8bbd24" },
  { bg: "#d9fff2", accent: "#00c39a" },
  { bg: "#d9f5ff", accent: "#0092ff" },
  { bg: "#ffd9d9", accent: "#ff3c3c" },
  { bg: "#e2d9ff", accent: "#5b5bff" },
  { bg: "#d9fffb", accent: "#00b9b0" },
  { bg: "#fffbd9", accent: "#ffb400" },
  { bg: "#ffd9f0", accent: "#ff5bb8" },
  { bg: "#d9e6ff", accent: "#3c6dff" },
  { bg: "#d9fff0", accent: "#00b86b" },
  { bg: "#ffe1d9", accent: "#ff6a4d" },
  { bg: "#f2d9ff", accent: "#b44dff" },
  { bg: "#d9f0ff", accent: "#2b9cff" },
  { bg: "#e7ffd9", accent: "#6abf00" },
  { bg: "#ffd9e7", accent: "#ff4d7a" },
  { bg: "#d9fff9", accent: "#00a89c" }
];

function applyTheme(theme) {
  document.documentElement.style.setProperty("--bg-color", theme.bg);
  document.documentElement.style.setProperty("--accent-color", theme.accent);
  document.documentElement.style.setProperty(
    "--accent-soft",
    hexToSoft(theme.accent)
  );
  localStorage.setItem("kgb_theme", JSON.stringify(theme));
}

function hexToSoft(hex) {
  try {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const mix = (c) => Math.round((c + 255 * 2) / 3);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  } catch {
    return "#dde5ff";
  }
}

function initThemes() {
  themePicker.innerHTML = "";
  const saved = localStorage.getItem("kgb_theme");
  let current = THEMES[0];
  if (saved) {
    try {
      current = JSON.parse(saved);
    } catch {}
  }
  THEMES.forEach((theme) => {
    const dot = document.createElement("div");
    dot.className = "theme-dot";
    dot.style.background = theme.accent;
    dot.onclick = () => {
      applyTheme(theme);
      updateThemeSelection(theme);
    };
    themePicker.appendChild(dot);
  });
  applyTheme(current);
  updateThemeSelection(current);
}

function updateThemeSelection(theme) {
  const dots = themePicker.querySelectorAll(".theme-dot");
  dots.forEach((dot) => dot.classList.remove("selected"));
  const idx = THEMES.findIndex(
    (t) => t.bg === theme.bg && t.accent === theme.accent
  );
  if (idx >= 0 && dots[idx]) dots[idx].classList.add("selected");
}

// ---------- TRACKS & PLAYLIST ----------

// Alleen online/free tracks worden opgeslagen (geen lokale bestanden)
const STORAGE_KEY = "kgb_jukebox_tracks";

function loadStoredTracks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const stored = JSON.parse(raw);
    tracks = stored;
  } catch {
    tracks = [];
  }
}

function saveStoredTracks() {
  const onlineOnly = tracks.filter((t) => t.type !== "local");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(onlineOnly));
}

function renderPlaylist() {
  playlistEl.innerHTML = "";
  tracks.forEach((t, i) => {
    const li = document.createElement("li");
    li.dataset.index = i;
    li.className = i === currentIndex ? "active" : "";
    li.innerHTML = `
      <span>${t.name}</span>
      <span class="badge">${
        t.type === "local" ? "lok" : t.type === "free" ? "free" : "url"
      }</span>
    `;
    li.onclick = () => playTrack(i);
    playlistEl.appendChild(li);
  });
}

// type: "local" | "url" | "free"
function playTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  currentIndex = index;
  const track = tracks[index];
  let src = track.url;
  if (track.type === "local" && track.file) {
    src = URL.createObjectURL(track.file);
  }
  player.src = src;
  player.play().catch(() => {});
  currentTitleEl.textContent = track.name;
  renderPlaylist();
}

// ---------- EVENTS ----------

fileInput.onchange = () => {
  const files = Array.from(fileInput.files);
  if (!files.length) return;
  files.forEach((f) => {
    tracks.push({
      type: "local",
      name: f.name,
      url: "",
      file: f
    });
  });
  renderPlaylist();
  // niet opslaan -> veiligheid
};

addUrlBtn.onclick = () => {
  const url = urlInput.value.trim();
  if (!url) return;
  const name = url.split("/").slice(-1)[0] || "Online nummer";
  tracks.push({ type: "url", name, url });
  urlInput.value = "";
  saveStoredTracks();
  renderPlaylist();
};

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addUrlBtn.onclick();
});

// Gratis muziek van publieke test-mp3’s
const FREE_TRACKS = [
  {
    name: "Free Sample 1 (3s)",
    url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3"
  },
  {
    name: "Free Sample 2 (12s)",
    url: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3"
  },
  {
    name: "Free Sample 3 (30s)",
    url: "https://samplelib.com/lib/preview/mp3/sample-30s.mp3"
  }
];

loadFreeBtn.onclick = () => {
  FREE_TRACKS.forEach((ft) => {
    if (!tracks.some((t) => t.url === ft.url)) {
      tracks.push({ type: "free", name: ft.name, url: ft.url });
    }
  });
  saveStoredTracks();
  renderPlaylist();
};

clearBtn.onclick = () => {
  tracks = tracks.filter((t) => t.type === "local");
  saveStoredTracks();
  renderPlaylist();
};

prevBtn.onclick = () => {
  if (!tracks.length) return;
  currentIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
  playTrack(currentIndex);
};

nextBtn.onclick = () => {
  if (!tracks.length) return;
  currentIndex = (currentIndex + 1) % tracks.length;
  playTrack(currentIndex);
};

shuffleBtn.onclick = () => {
  if (!tracks.length) return;
  currentIndex = Math.floor(Math.random() * tracks.length);
  playTrack(currentIndex);
};

playPauseBtn.onclick = () => {
  if (player.paused) player.play();
  else player.pause();
};

volumeSlider.oninput = (e) => {
  player.volume = parseFloat(e.target.value);
};

player.addEventListener("ended", () => {
  if (!tracks.length) return;
  currentIndex = (currentIndex + 1) % tracks.length;
  playTrack(currentIndex);
});

// Spotify opent app, met fallback naar web
spotifyBtn.onclick = () => {
  const spotifyUrl = "spotify://";
  const webUrl = "https://open.spotify.com";
  let opened = false;

  try {
    window.location.href = spotifyUrl;
    opened = true;
  } catch {
    opened = false;
  }

  setTimeout(() => {
    if (!opened) {
      window.location.href = webUrl;
    }
  }, 1200);
};

// ---------- INIT ----------
initThemes();
loadStoredTracks();
renderPlaylist();
player.volume = 0.8;
