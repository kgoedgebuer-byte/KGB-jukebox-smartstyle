let audio = new Audio();
let playlist = JSON.parse(localStorage.getItem("playlist")||"[]");
let currentIndex = 0;
let shuffle = false;
let loop = false;

/* DOM refs */
const playlistEl = document.getElementById("playlist");
const fileInput = document.getElementById("fileInput");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const nowTitle = document.getElementById("nowTitle");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const progressFill = document.getElementById("progressFill");

document.querySelectorAll(".color-btn").forEach(btn=>{
  btn.onclick = () => {
    let theme = btn.dataset.color;
    document.body.className = `theme-${theme}`;
    localStorage.setItem("theme",theme);
  };
});
let saved = localStorage.getItem("theme");
if(saved) document.body.className = `theme-${saved}`;

function savePlaylist(){
  localStorage.setItem("playlist",JSON.stringify(playlist));
}

fileInput.onchange = e => {
  [...e.target.files].forEach(f=>{
    playlist.push({
      name:f.name.replace(/\.[^/.]+$/,""),
      url:URL.createObjectURL(f)
    });
  });
  savePlaylist();
  render();
};

document.getElementById("freeMusicBtn").onclick = async () => {
  let r = await fetch("https://pixabay.com/api/?key=40596540-6e4d5ea33a7e2b30f1f8e79c0&q=chill&per_page=10");
  let d = await r.json();
  d.hits.forEach(t=>{
    playlist.push({ name:t.tags, url:t.audio });
  });
  savePlaylist();
  render();
};

function load(i){
  audio.src = playlist[i].url;
  nowTitle.textContent = playlist[i].name;
}

function play(){
  audio.play();
  playPauseBtn.textContent="⏸";
}

function pause(){
  audio.pause();
  playPauseBtn.textContent="▶";
}

playPauseBtn.onclick = ()=> audio.paused ? play() : pause();

prevBtn.onclick = ()=>{
  currentIndex = (currentIndex-1+playlist.length)%playlist.length;
  load(currentIndex); play(); render();
};

nextBtn.onclick = ()=>{
  if(shuffle){
    currentIndex = Math.floor(Math.random()*playlist.length);
  } else {
    currentIndex = (currentIndex+1)%playlist.length;
  }
  load(currentIndex); play(); render();
};

audio.onended = ()=>{
  if(loop) { play(); return; }
  nextBtn.onclick();
};

audio.ontimeupdate = ()=>{
  currentTimeEl.textContent = format(audio.currentTime);
  durationEl.textContent = format(audio.duration);
  progressFill.style.width = ((audio.currentTime/audio.duration)*100)+"%";
};

function format(sec){
  if(!sec) return "0:00";
  let m = Math.floor(sec/60);
  let s = Math.floor(sec%60);
  return `${m}:${s<10?"0":""}${s}`;
}

document.getElementById("shuffleBtn").onclick = ()=>{
  shuffle = !shuffle;
  alert("Shuffle: "+(shuffle?"ON":"OFF"));
};

document.getElementById("loopBtn").onclick = ()=>{
  loop = !loop;
  alert("Loop: "+(loop?"ON":"OFF"));
};

document.getElementById("bassBtn").onclick = ()=>{
  audio.preservesPitch = false;
  audio.playbackRate = 0.92;
  alert("Bass+ actief");
};

function render(){
  playlistEl.innerHTML="";
  playlist.forEach((t,i)=>{
    let li = document.createElement("li");
    li.className = "playlist-item"+(i===currentIndex?" active":"");
    li.textContent=t.name;
    li.onclick=()=>{ currentIndex=i; load(i); play(); render(); };
    playlistEl.appendChild(li);
  });
}

render();
