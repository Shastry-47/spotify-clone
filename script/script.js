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
    let response = await fetch(`https://shastry-47.github.io/spotify-clone/songs/songs.json`);
    let data = await response.json();
    console.log(data);
    songs = data[folder];

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="images/music.svg" alt=""> 
                                <div class="info">
                                    <div> ${song.title}</div>
                                </div>    
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="images/play.svg" alt="">
                                </div> 
                            </li>`;
    }
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index].file);  // Ensure songs[index].file is correct
        });
    });

}

const playMusic = (track, pause = false) => {
    currentSong.src = `https://shastry-47.github.io/spotify-clone/songs/${currFolder}/${track}`;  // Use currFolder dynamically
    console.log("Audio Source URL:", currentSong.src);  // Log the audio source

    if (!pause) {
        currentSong.play().catch(err => {
            console.error("Error playing audio:", err);
        });
        play.src = "images/pause.svg";
    }
    
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}




async function displayAlbums() {
    let response = await fetch(`https://shastry-47.github.io/spotify-clone/songs/songs.json`);
    let data = await response.json();
    let cardContainer = document.querySelector(".cardContainer");

    cardContainer.innerHTML = "";  // Clear previous entries
    for (const folder in data) {
        let album = data[folder][0];  // Assuming the first song in each folder contains album info
        cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="37" height="49" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="black" stroke-width="1.5" fill="green" />
                    <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="black" />
                </svg>                     
            </div>
            <img src="songs/${folder}/${album.cover}" alt="">
            <h4>${album.title}</h4>
            <p>${album.description}</p>
        </div>`;
    }

    // Add click event to each album card to load songs
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(item.currentTarget.dataset.folder);  // Load songs from clicked folder
            playMusic(songs[0].file);  // Play the first song in the folder
        });
    });
}


async function main() {
    await displayAlbums();
    
    await getSongs("ncs");
    playMusic(songs[0], true);


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
        if (!isNaN(currentSong.duration)) {  // Ensure duration is valid
            document.querySelector(".songTime").innerHTML = `${secondsToMinutes(currentSong.currentTime)}/${secondsToMinutes(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });


       document.querySelector(".seekbar").addEventListener("click", e => {
        if (!isNaN(currentSong.duration)) {  // Ensure the duration is valid
            let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        }
    });


    document.querySelector(".hamburgerContainer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    prev.addEventListener("click", () => {
    let currentFile = currentSong.src.split("/").pop();  // Get the current file name
    let idx = songs.findIndex(song => song.file === currentFile);  // Find the index of the current song
    if (idx > 0) {
        playMusic(songs[idx - 1].file);  // Play the previous song
    }
});

next.addEventListener("click", () => {
    let currentFile = currentSong.src.split("/").pop();  // Get the current file name
    let idx = songs.findIndex(song => song.file === currentFile);  // Find the index of the current song
    if (idx < songs.length - 1) {
        playMusic(songs[idx + 1].file);  // Play the next song
    }
});
    
    let lastVolume = currentSong.volume;  // Track the last set volume (initially the default volume)

document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("images/volume.svg")) {
        e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg");
        lastVolume = currentSong.volume;  // Save the current volume before muting
        currentSong.volume = 0;  // Mute the audio
        document.querySelector(".range input").value = 0;  // Update the slider
    } else {
        e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg");
        currentSong.volume = lastVolume;  // Restore the previous volume
        document.querySelector(".range input").value = lastVolume * 100;  // Update the slider
    }
});

// Sync the volume slider with the volume
document.querySelector(".range input").addEventListener("input", e => {
    let volume = e.target.value / 100;  // Convert the slider value (0-100) to volume (0-1)
    currentSong.volume = volume;  // Set the current volume
    lastVolume = volume;  // Keep track of the last volume (in case of mute/unmute)
    
    // Update the volume icon based on whether the volume is muted or not
    if (volume === 0) {
        document.querySelector(".volume>img").src = "images/mute.svg";
    } else {
        document.querySelector(".volume>img").src = "images/volume.svg";
    }
});


        async function playNextSong() {
        let currentFile = currentSong.src.split("/").pop();  // Get the current file name
        let idx = songs.findIndex(song => song.file === currentFile);  // Find the index of the current song
        if ((idx + 1) < songs.length) {
            playMusic(songs[idx + 1].file);  // Play the next song
        } else {
            currentSong.pause();  // Pause when the playlist is over
        }
    }
    currentSong.addEventListener("ended", playNextSong);
}

main();
