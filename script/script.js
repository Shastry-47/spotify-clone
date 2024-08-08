let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`https://shastry-47.github.io/spotify-clone/${folder}`);
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}`)[1]);
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="music.svg" alt=""> 
                                <div class="info">
                                    <div> ${song.replaceAll("%20", " ")}</div>
                                </div>    
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="images/play.svg" alt="">
                                </div> 
                            </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}` + decodeURI(track);
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`https://shastry-47.github.io/spotify-clone/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`https://shastry-47.github.io/spotify-clone/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML += `<div data-folder="${folder}/" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="37" height="49" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="black" stroke-width="1.5" fill="green" />
                        <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="black" />
                    </svg>                     
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h4>${response.title}</h4>
                <p>${response.description}</p>
            </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/ncs/");
    playMusic(songs[0], true);

    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutes(currentSong.currentTime)}/${secondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburgerContainer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    prev.addEventListener("click", () => {
        let idx = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((idx - 1) >= 0) {
            playMusic(songs[idx - 1]);
        }
    });

    next.addEventListener("click", () => {
        let idx = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((idx + 1) < songs.length) {
            playMusic(songs[idx + 1]);
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("images/volume.svg")) {
            e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

    async function playNextSong() {
        let idx = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((idx + 1) < songs.length) {
            playMusic(songs[idx + 1]);
        } else {
            currentSong.pause();
        }
    }
    currentSong.addEventListener("ended", playNextSong);
}

main();
