const audio = document.getElementById("audio");
const playlistDiv = document.getElementById("playlist");

let playlist = JSON.parse(localStorage.getItem("kgb_playlist")) || [];
let currentIndex = 0;

function renderPlaylist() {
    playlistDiv.innerHTML = "";
    playlist.forEach((src, idx) => {
        const row = document.createElement("div");
        row.innerText = src;
        row.onclick = () => playTrack(idx);
        playlistDiv.appendChild(row);
    });
}
renderPlaylist();

document.getElementById("playPauseBtn").onclick = () => {
    if (audio.paused) audio.play();
    else audio.pause();
};

document.getElementById("addSongBtn").onclick = async () => {
    let url = prompt("Geef mp3 URL:");
    if (!url) return;

    playlist.push(url);
    localStorage.setItem("kgb_playlist", JSON.stringify(playlist));
    renderPlaylist();
};

function playTrack(i) {
    currentIndex = i;
    audio.src = playlist[i];
    audio.play();
}

document.getElementById("nextBtn").onclick = () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    playTrack(currentIndex);
};

document.getElementById("prevBtn").onclick = () => {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(currentIndex);
};

document.getElementById("volume").oninput = e => {
    audio.volume = e.target.value;
};

const themes = [
    "#d9f7ff", "#ffe3f4", "#f3d9ff", "#ffe9d9", "#f7ffd9",
    "#d9ffe8", "#d9f0ff", "#ffd9d9", "#e2d9ff", "#d9fff7",
    "#fffbd9", "#ffd9f0", "#d9ddff", "#c3fff6", "#ffd3c3",
    "#ffe1c3", "#f0ffd3", "#d3e8ff", "#e3d3ff", "#d3fff0"
];

const picker = document.getElementById("themePicker");
themes.forEach(c => {
    const dot = document.createElement("div");
    dot.style.background = c;
    dot.onclick = () => {
        document.body.style.setProperty("--theme", c);
        localStorage.setItem("kgb_theme", c);
    };
    picker.appendChild(dot);
});

let savedTheme = localStorage.getItem("kgb_theme");
if (savedTheme) document.body.style.setProperty("--theme", savedTheme);
