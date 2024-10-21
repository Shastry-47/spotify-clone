class MusicPlayer {
    constructor() {
        this.currentSong = new Audio();
        this.songs = [];
        this.currFolder = '';
    }

    async getSongs(folder) {
        this.currFolder = folder;
        try {
            let response = await fetch(`https://shastry-47.github.io/spotify-clone/songs/songs.json`);
            let data = await response.json();
            
            if (!data[folder] || data[folder].length === 0) {
                console.error(`No songs found for folder: ${folder}`);
                return [];  
            }

            this.songs = data[folder].slice(1);
            this.renderSongList();

            return this.songs;
        } catch (error) {
            console.error('Error fetching songs:', error);
            return [];  
        }
    }

    renderSongList() {
        let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";  // Clear previous song list

        this.songs.forEach((song, index) => {
            let li = document.createElement('li');
            li.innerHTML = `<img class="invert" src="images/music.svg" alt=""> 
                            <div class="info"><div>${song.title}</div></div>    
                            <div class="playnow"><span>Play Now</span><img class="invert" src="images/play.svg" alt=""></div>`;
            li.addEventListener("click", () => this.playMusic(song.file));  // Play selected song
            songUL.appendChild(li);
        });
    }

    playMusic(track, pause = false) {
        console.log("Playing track:", track);
        this.currentSong.src = `https://shastry-47.github.io/spotify-clone/songs/${this.currFolder}/${track}`;
        console.log("Audio Source URL:", this.currentSong.src);

        if (!pause) {
            this.currentSong.play().catch(err => {
                console.error("Error playing audio:", err);
            });
            play.src = "images/pause.svg";
        }

        document.querySelector(".songInfo").innerHTML = decodeURI(track);
        document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
    }

    async displayAlbums() {
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
                await this.getSongs(item.currentTarget.dataset.folder);  // Load songs from clicked folder
            });
        });
    }

    async main() {
        await this.displayAlbums();
        await this.getSongs("ncs");
        this.playMusic(this.songs[0].file); // Play the first song
    }
}

// Instantiate and use the music player
const player = new MusicPlayer();
player.main();
