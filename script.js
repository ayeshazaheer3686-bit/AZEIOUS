const songs = [
  {title:"Kontraa",artist:"Adeson",category:"Pop",src:"music/kontraa-water-afro-pop-music-445661.mp3"},
  {title:"Wonders of the Earth",artist:"Daniel Stone",category:"Electronic",src:"music/grand_project-wonders-of-the-earth-550792.mp3"},
  {title:"A Very Happy Christmas",artist:"Luna Ray",category:"Pop",src:"music/mixkit-a-very-happy-christmas-897.mp3"},
  {title:"Forest Treasure",artist:"The Echoes",category:"Rock",src:"music/mixkit-forest-treasure-138.mp3"},
  {title:"Fright Night",artist:"Jay Carter",category:"Hip Hop",src:"music/mixkit-fright-night-871.mp3"},
  {title:"Romantic",artist:"Mia Rose",category:"Chill",src:"music/mixkit-romantic-01-752.mp3"}
];

const audio=document.getElementById("audioPlayer"), playBtn=document.getElementById("playBtn"), prevBtn=document.getElementById("prevBtn"), nextBtn=document.getElementById("nextBtn"), progressBar=document.getElementById("progressBar"), volumeBar=document.getElementById("volumeBar"), volumeIcon=document.getElementById("volumeIcon"), currentTitle=document.getElementById("currentTitle"), currentArtist=document.getElementById("currentArtist"), currentTime=document.getElementById("currentTime"), duration=document.getElementById("duration"), songList=document.getElementById("songList"), songCount=document.getElementById("songCount"), queueInfo=document.getElementById("queueInfo"), searchInput=document.getElementById("searchInput"), favoriteBtn=document.getElementById("favoriteBtn"), shuffleBtn=document.getElementById("shuffleBtn"), repeatBtn=document.getElementById("repeatBtn"), emptyState=document.getElementById("emptyState"), toast=document.getElementById("toast");

let currentIndex=0,isPlaying=false,isShuffle=false,isRepeat=false,currentCategory="All",libraryView="All Songs";
let favorites=JSON.parse(localStorage.getItem("azeiousFavorites")||"[]");
let playlists=JSON.parse(localStorage.getItem("azeiousPlaylists")||"{}");
let recent=JSON.parse(localStorage.getItem("azeiousRecent")||"[]");
let muted=false;
audio.volume=.8;

function save(){localStorage.setItem("azeiousFavorites",JSON.stringify(favorites));localStorage.setItem("azeiousPlaylists",JSON.stringify(playlists));localStorage.setItem("azeiousRecent",JSON.stringify(recent));}
function toastMsg(message){toast.textContent=message;toast.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.remove("show"),1800)}
function formatTime(seconds){if(!Number.isFinite(seconds))return "0:00";return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,"0")}`}
function filteredSongs(){const term=searchInput.value.trim().toLowerCase();return songs.map((s,i)=>({...s,index:i})).filter(s=>{const text=`${s.title} ${s.artist} ${s.category}`.toLowerCase();const searchOk=text.includes(term);const catOk=currentCategory==="All"||s.category===currentCategory;let viewOk=true;if(libraryView==="Favorites")viewOk=favorites.includes(s.index);if(libraryView==="Recently Played")viewOk=recent.includes(s.index);if(playlists[libraryView])viewOk=playlists[libraryView].includes(s.index);return searchOk&&catOk&&viewOk})}

function displaySongs(){const list=filteredSongs();songList.innerHTML="";list.forEach((song,pos)=>{const el=document.createElement("div");el.className="song";el.style.animationDelay=`${Math.min(pos,12)*35}ms`;if(song.index===currentIndex)el.classList.add("playing");const playing=song.index===currentIndex&&isPlaying;el.innerHTML=`<div class="song-number">${playing?'<span class="playing-bars"><i></i><i></i><i></i></span>':song.index+1}</div><div class="song-info"><div class="song-cover"><i class="fa-solid ${playing?'fa-volume-high':'fa-music'}"></i></div><div><h4>${song.title}</h4><p>${song.artist}</p></div></div><div class="song-category">${song.category}</div><div class="song-duration">${song.duration||"--:--"}</div><button class="song-more" title="Add to playlist"><i class="fa-solid fa-ellipsis"></i></button>`;el.addEventListener("click",e=>{if(e.target.closest(".song-more")){openPlaylistMenu(song.index);return}loadSong(song.index,true)});songList.appendChild(el)});songCount.textContent=`${list.length} song${list.length!==1?'s':''}`;queueInfo.textContent=`${list.length} track${list.length!==1?'s':''}`;emptyState.classList.toggle("hidden",list.length!==0);document.getElementById("allCount").textContent=songs.length;document.getElementById("sideFavCount").textContent=favorites.length;document.getElementById("favoriteCount").textContent=favorites.length;renderSidePlaylists()}

function renderSidePlaylists(){const box=document.getElementById("playlistNames");box.querySelectorAll(".custom-playlist").forEach(x=>x.remove());Object.keys(playlists).forEach(name=>{const b=document.createElement("button");b.className=`side-playlist custom-playlist ${libraryView===name?'active':''}`;b.dataset.playlist=name;b.innerHTML=`<i class="fa-solid fa-list"></i><span>${name}</span><b>${playlists[name].length}</b>`;b.addEventListener("click",()=>setView(name));box.appendChild(b)})}
function setView(view){libraryView=view;currentCategory="All";document.querySelectorAll(".category").forEach(b=>b.classList.toggle("active",b.dataset.category==="All"));document.querySelectorAll(".side-playlist").forEach(b=>b.classList.toggle("active",b.dataset.playlist===view));document.getElementById("listTitle").textContent=view==="All Songs"?"Popular Songs":view;displaySongs()}
function openPlaylistMenu(index){const names=Object.keys(playlists);if(!names.length){toastMsg("Create a playlist first with +");return}const choice=prompt(`Add “${songs[index].title}” to which playlist?\n\n${names.map((n,i)=>`${i+1}. ${n}`).join("\n")}`);if(choice===null)return;const num=Number(choice);const name=names[num-1]||names.find(n=>n.toLowerCase()===choice.trim().toLowerCase());if(!name){toastMsg("Playlist not found");return}if(!playlists[name].includes(index)){playlists[name].push(index);save();toastMsg(`Added to ${name}`)}else toastMsg("Song is already in that playlist");displaySongs()}

function loadSong(index,autoPlay=false){currentIndex=Math.max(0,Math.min(index,songs.length-1));const song=songs[currentIndex];audio.pause();audio.src=song.src;audio.load();currentTitle.textContent=song.title;currentArtist.textContent=song.artist;currentTime.textContent="0:00";progressBar.value=0;duration.textContent="0:00";favoriteBtn.innerHTML=favorites.includes(currentIndex)?'<i class="fa-solid fa-heart"></i>':'<i class="fa-regular fa-heart"></i>';if(!recent.includes(currentIndex))recent.unshift(currentIndex);recent=recent.slice(0,12);save();displaySongs();if(autoPlay)playSong()}
function playSong(){if(!audio.src)loadSong(currentIndex);audio.play().then(()=>{isPlaying=true;playBtn.innerHTML='<i class="fa-solid fa-pause"></i>';playBtn.title="Pause";displaySongs()}).catch(()=>{isPlaying=false;toastMsg("Could not play this audio file")})}
function pauseSong(){audio.pause();isPlaying=false;playBtn.innerHTML='<i class="fa-solid fa-play"></i>';playBtn.title="Play";displaySongs()}
function nextSong(){if(isShuffle){let n;do n=Math.floor(Math.random()*songs.length);while(n===currentIndex&&songs.length>1);currentIndex=n}else currentIndex=(currentIndex+1)%songs.length;loadSong(currentIndex,true)}
function prevSong(){if(audio.currentTime>4){audio.currentTime=0;return}currentIndex=(currentIndex-1+songs.length)%songs.length;loadSong(currentIndex,true)}

playBtn.addEventListener("click",()=>isPlaying?pauseSong():playSong());nextBtn.addEventListener("click",nextSong);prevBtn.addEventListener("click",prevSong);
progressBar.addEventListener("input",()=>{if(audio.duration)audio.currentTime=(progressBar.value/100)*audio.duration});
audio.addEventListener("timeupdate",()=>{if(audio.duration){progressBar.value=(audio.currentTime/audio.duration)*100;currentTime.textContent=formatTime(audio.currentTime)}});
audio.addEventListener("loadedmetadata",()=>duration.textContent=formatTime(audio.duration));
audio.addEventListener("ended",()=>isRepeat?playSong():nextSong());
audio.addEventListener("error",()=>{isPlaying=false;playBtn.innerHTML='<i class="fa-solid fa-play"></i>';toastMsg(`Audio could not be loaded: ${songs[currentIndex].title}`);displaySongs()});

volumeBar.addEventListener("input",()=>{audio.volume=Number(volumeBar.value);muted=audio.volume===0;volumeIcon.className=audio.volume===0?"fa-solid fa-volume-xmark":audio.volume<.5?"fa-solid fa-volume-low":"fa-solid fa-volume-high"});volumeIcon.addEventListener("click",()=>{if(muted){audio.volume=.8;volumeBar.value=.8;muted=false}else{audio.volume=0;volumeBar.value=0;muted=true}volumeIcon.className=muted?"fa-solid fa-volume-xmark":"fa-solid fa-volume-high"});
searchInput.addEventListener("input",displaySongs);
document.querySelectorAll(".category").forEach(btn=>btn.addEventListener("click",()=>{currentCategory=btn.dataset.category;document.querySelectorAll(".category").forEach(b=>b.classList.toggle("active",b===btn));displaySongs()}));
shuffleBtn.addEventListener("click",()=>{isShuffle=!isShuffle;shuffleBtn.classList.toggle("active",isShuffle);toastMsg(isShuffle?"Shuffle enabled":"Shuffle disabled")});repeatBtn.addEventListener("click",()=>{isRepeat=!isRepeat;repeatBtn.classList.toggle("active",isRepeat);toastMsg(isRepeat?"Repeat enabled":"Repeat disabled")});
favoriteBtn.addEventListener("click",()=>{if(favorites.includes(currentIndex))favorites=favorites.filter(i=>i!==currentIndex);else favorites.push(currentIndex);save();favoriteBtn.innerHTML=favorites.includes(currentIndex)?'<i class="fa-solid fa-heart"></i>':'<i class="fa-regular fa-heart"></i>';toastMsg(favorites.includes(currentIndex)?"Added to Favorites":"Removed from Favorites");displaySongs()});

document.getElementById("startListening").addEventListener("click",()=>{loadSong(currentIndex,true)});
document.getElementById("favoritesNav").addEventListener("click",e=>{e.preventDefault();setView("Favorites")});document.getElementById("recentNav").addEventListener("click",e=>{e.preventDefault();setView("Recently Played")});document.querySelectorAll(".side-playlist").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.playlist)));
document.querySelectorAll(".sidebar nav a[data-view]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();setView("All Songs")}));
document.getElementById("addPlaylist").addEventListener("click",()=>{const name=prompt("Enter a playlist name:");if(!name||!name.trim())return;const clean=name.trim();if(playlists[clean]){toastMsg("That playlist already exists");return}playlists[clean]=[];save();setView(clean);toastMsg(`Playlist “${clean}” created`)});

document.addEventListener("keydown",e=>{if(e.target.matches("input"))return;if(e.code==="Space"){e.preventDefault();isPlaying?pauseSong():playSong()}if(e.code==="ArrowRight")nextSong();if(e.code==="ArrowLeft")prevSong()});

displaySongs();loadSong(0,false);
