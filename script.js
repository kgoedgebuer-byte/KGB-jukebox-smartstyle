const fileInput = document.getElementById("fileInput");
const playlist = document.getElementById("playlist");
const player = document.getElementById("player");
const spotifyBtn = document.getElementById("spotifyBtn");

let tracks = JSON.parse(localStorage.getItem("jukeboxTracks")) || [];

function renderPlaylist() {
    playlist.innerHTML = "";
    tracks.forEach((file, index) => {
        const li = document.createElement("li");
        li.textContent = file.name;
        li.onclick = () => playTrack(index);
        playlist.appendChild(li);
    });
}

function playTrack(index) {
    const file = tracks[index];
    const url = URL.createObjectURL(file);
    player.src = url;
    player.play();
}

fileInput.onchange = () => {
    const newFiles = Array.from(fileInput.files);
    tracks = [...tracks, ...newFiles];
    localStorage.setItem("jukeboxTracks", JSON.stringify(tracks));
    renderPlaylist();
};

spotifyBtn.onclick = () => {
    window.location.href = "spotify://";
};

renderPlaylist();
