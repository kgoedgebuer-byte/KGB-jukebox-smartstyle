let audio = new Audio();
let playlist = [];
let currentIndex = -1;
let playing = false;

const fileInput = document.getElementById("fileInput");
const playlistEl = document.getElementById("playlist");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const nowTitle = document.getElementById("nowTitle");

fileInput.addEventListener("change", e => {
  playlist = [...e.target.files].map(f => ({
    name: f.name.replace(/\.[^/.]+$/, ""),
    url: URL.createObjectURL(f)
  }));
  currentIndex = 0;
  load(currentIndex);
  render();
});

function load(i) {
  audio.src = playlist[i].url;
  nowTitle.textContent = playlist[i].name;
}

function render() {
  playlistEl.innerHTML = "";
  playlist.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "playlist-item" + (i === currentIndex ? " active" : "");
    li.textContent = t.name;
    li.onclick = () => { currentIndex = i; load(i); play(); };
    playlistEl.appendChild(li);
  });
}

function play() {
  audio.play();
  playing = true;
  playPauseBtn.textContent = "⏸";
}

function pause() {
  audio.pause();
  playing = false;
  playPauseBtn.textContent = "▶";
}

playPauseBtn.onclick = () => playing ? pause() : play();
prevBtn.onclick = () => { currentIndex = (currentIndex-1+playlist.length)%playlist.length; load(currentIndex); play(); render(); };
nextBtn.onclick = () => { currentIndex = (currentIndex+1)%playlist.length; load(currentIndex); play(); render(); };
audio.onended = () => nextBtn.onclick();
