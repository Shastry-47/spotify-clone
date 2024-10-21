let currentSong = new Audio();
let songs = [];
let currFolder = "";
let lastVolume = 1; // Default volume level
const play = document.getElementById("play");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`https://shastry-47.github.io/spotify-clone/songs/songs.json`);
        let data = await response.json();

        if (!data[folder] || data[folder].length === 0) {
            console.error(`No songs found for folder: ${folder}`);
            return []; // Return an empty array if no songs are found
        }

        songs = data[folder].slice(1); // Exclude the first element for songs
        console.log(songs);

        let songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = ""; // Clear the previous song list

        songs.forEach((song, index) => {
            songUL.innerHTML += `<li><img class="invert" src="images/music.svg" alt="">
                                   <div class="info">
                                       <div>${song.title}</div>
                                   </div>    
                                   <div class="playnow" data-index="${index}">
                                       <span>Play Now</span>
                                       <img class="invert" src="images/play.svg" alt="">
                                   </div> 
                               </li>`;
        });

        // Event listener for song selection
        Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
            e.querySelector('.playnow').addEventListener("click", () => {
                playMusic(songs[index].file);
            });
        });

        return songs; // Return the songs array
    } catch (error) {
        console.error('Error fetching songs:', error);
        return []; // Return an empty array in case of error
    }
}

const playMusic = (track) => {
    currentSong.src = `https://shastry-47.github.io/spotify-clone/songs/${currFolder}/${track}`;
    console.log("Playing track:", track);
    
    currentSong.play().catch(err => {
        console.error("Error playing audio:", err);
    });

    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";

    // Update button icon
    play.src = "images/pause.svg"; 
}

async function displayAlbums() {
    try {
        let response = await fetch(`https://shastry-47.github.io/spotify-clone/songs/songs.json`);
        let data = await response.json();
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = ""; // Clear previous entries

        for (const folder in data) {
            let album = data[folder][0]; // Assuming the first song in each folder contains album info
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <img src="songs/${folder}/${album.cover}" alt="">
                <h4>${album.title}</h4>
                <p>${album.description}</p>
            </div>`;
        }

        // Load songs from clicked album
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(item.currentTarget.dataset.folder);
                if (songs.length > 0) {
                    currentSong.src = `https://shastry-47.github.io/spotify-clone/songs/${item.currentTarget.dataset.folder}/${songs[0].file}`;
                    document.querySelector(".songInfo").innerHTML = decodeURI(songs[0].file);
                    play.src = "images/pause.svg"; // Set play button to indicate paused state
                } else {
                    console.error("No songs available to play from this album.");
                }
            });
        });
    } catch (error) {
        console.error('Error displaying albums:', error);
    }
}

async function main() {
    await displayAlbums();
    
    songs = await getSongs("ncs"); // Load songs from the "ncs" folder
    if (songs.length > 0) {
        currentSong.src = `https://shastry-47.github.io/spotify-clone/songs/ncs/${songs[0].file}`; // Load first song
        document.querySelector(".songInfo").innerHTML = decodeURI(songs[0].file); // Display song info
    }

    // Play/Pause button functionality
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play().catch(err => console.error("Error playing audio:", err));
            play.src = "images/pause.svg"; // Change icon to pause
        } else {
            currentSong.pause();
            play.src = "images/play.svg"; // Change icon to play
        }
    });

    // Update time display
    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songTime").innerHTML = `${secondsToMinutes(currentSong.currentTime)}/${secondsToMinutes(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    // Seek bar functionality
    document.querySelector(".seekbar").addEventListener("click", e => {
        if (!isNaN(currentSong.duration)) {
            let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        }
    });

    // Previous song functionality
    prev.addEventListener("click", () => {
        let currentFile = currentSong.src.split("/").pop(); // Get the current file name
        let idx = songs.findIndex(song => song.file === currentFile); // Find the index of the current song
        if (idx > 0) {
            playMusic(songs[idx - 1].file); // Play the previous song
        }
    });

    // Next song functionality
    next.addEventListener("click", () => {
        let currentFile = currentSong.src.split("/").pop(); // Get the current file name
        let idx = songs.findIndex(song => song.file === currentFile); // Find the index of the current song
        if (idx < songs.length - 1) {
            playMusic(songs[idx + 1].file); // Play the next song
        }
    });

    // Automatically play the next song when the current one ends
    currentSong.addEventListener("ended", () => {
        let currentFile = currentSong.src.split("/").pop(); // Get the current file name
        let idx = songs.findIndex(song => song.file === currentFile); // Find the index of the current song
        if (idx < songs.length - 1) {
            playMusic(songs[idx + 1].file); // Automatically play the next song when the current ends
        } else {
            currentSong.pause(); // Pause when the playlist is over
            play.src = "images/play.svg"; // Change icon to play
        }
    });

    // Volume control
    const volumeControl = document.querySelector(".range input");
    volumeControl.value = lastVolume * 100; // Set initial volume slider value
    volumeControl.addEventListener("input", e => {
        let volume = e.target.value / 100; // Convert to volume (0-1)
        currentSong.volume = volume; // Set the current volume
        lastVolume = volume; // Track the last volume
        document.querySelector(".volume>img").src = volume === 0 ? "images/mute.svg" : "images/volume.svg"; // Update icon
    });
}

main();
