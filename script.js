/* ---- BASIS AUDIO + PLAYLIST SYSTEM ---- */
let audio = new Audio();
let ctx = new (window.AudioContext || window.webkitAudioContext)();
let src = ctx.createMediaElementSource(audio);
let analyser = ctx.createAnalyser();
let gain = ctx.createGain();

src.connect(gain);
gain.connect(analyser);
analyser.connect(ctx.destination);
analyser.fftSize = 128;

let playlist = [];
let currentIndex = 0;
let shuffle = false;
let loopSong = false;

/* DOM refs */
const playlistEl = document.getElementById("playlist");
const fileInput = document.getElementById("fileInput");
const freeBtn = document.getElementById("freeMusicBtn");
const nowTitle = document.getElementById("nowTitle");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const progressFill = document.getElementById("progressFill");
const volumeSlider = document.getElementById("volumeSlider");
const sleepBtn = document.getElementById("sleepBtn");
const eqBtn = document.getElementById("eqBtn");

/* ---- KLEUR THEMA ---- */
document.querySelectorAll(".color-btn").forEach(btn=>{
  btn.onclick = ()=>{
    document.body.className = `theme-${btn.dataset.color}`;
    localStorage.setItem("theme", btn.dataset.color);
  };
});
let savedTheme = localStorage.getItem("theme");
if(savedTheme) document.body.className = `theme-${savedTheme}`;

/* ---- EIGEN MUZIEK ---- */
fileInput.onchange = e=>{
  [...e.target.files].forEach(f=>{
    playlist.push({ name:f.name, url:URL.createObjectURL(f) });
  });
  render();
};

/* ---- GRATIS MUZIEK (WERKT 100%) ---- */
freeBtn.onclick = ()=>{
  let freeTracks = [
    "https://filesamples.com/samples/audio/mp3/sample1.mp3",
    "https://filesamples.com/samples/audio/mp3/sample3.mp3",
    "https://filesamples.com/samples/audio/mp3/sample5.mp3",
    "https://filesamples.com/samples/audio/mp3/sample4.mp3",
    "https://filesamples.com/samples/audio/mp3/sample2.mp3"
  ];
  freeTracks.forEach((url,i)=>{
    playlist.push({ name:"Gratis Track "+(i+1), url:url });
  });
  render();
};

/* ---- LADEN VAN TRACK ---- */
function load(i){
  audio.src = playlist[i].url;
  nowTitle.textContent = playlist[i].name;
}

/* ---- PLAYBACK ---- */
function play(){ audio.play(); playPauseBtn.textContent="⏸"; }
function pause(){ audio.pause(); playPauseBtn.textContent="▶"; }

playPauseBtn.onclick = ()=> audio.paused ? play() : pause();

prevBtn.onclick = ()=>{
  currentIndex = (currentIndex-1+playlist.length)%playlist.length;
  load(currentIndex); play(); render();
};

nextBtn.onclick = ()=>{
  currentIndex = shuffle
    ? Math.floor(Math.random()*playlist.length)
    : (currentIndex+1)%playlist.length;
  load(currentIndex); play(); render();
};

audio.onended = ()=> loopSong ? play() : nextBtn.onclick();

/* ---- PROGRESS ---- */
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

/* ---- VOLUME ---- */
volumeSlider.oninput = ()=> gain.gain.value = volumeSlider.value;

/* ---- SLEEP TIMER ---- */
sleepBtn.onclick = ()=>{
  let min = prompt("Slaap na hoeveel minuten? (bv. 20)");
  if(!min) return;
  setTimeout(()=> audio.pause(), min*60000);
};

/* ---- EQ PRESETS ---- */
eqBtn.onclick = ()=>{
  let preset = prompt("EQ: bass / pop / soft / rock ?");
  if(!preset) return;

  switch(preset){
    case "bass": gain.gain.value=1.4; break;
    case "pop": gain.gain.value=1.1; break;
    case "soft": gain.gain.value=0.8; break;
    case "rock": gain.gain.value=1.3; break;
  }
};

/* ---- VISUALIZER ---- */
let canvas = document.getElementById("visualizer");
let cCtx = canvas.getContext("2d");

function draw(){
  requestAnimationFrame(draw);
  let buffer = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(buffer);

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  let barWidth = canvas.width / buffer.length;

  for(let i=0;i<buffer.length;i++){
    let h = buffer[i];
    cCtx.fillStyle = "white";
    cCtx.fillRect(i*barWidth, canvas.height-h, barWidth-1, h);
  }
}
draw();

/* ---- PLAYLIST ---- */
function render(){
  playlistEl.innerHTML="";
  playlist.forEach((t,i)=>{
    let li = document.createElement("li");
    li.className="playlist-item"+(i===currentIndex?" active":"");
    li.textContent=t.name;
    li.onclick=()=>{ currentIndex=i; load(i); play(); render(); };
    playlistEl.appendChild(li);
  });
}
