console.log("Video player");

const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");

let volumeHistory = 0.5; //global - this is for, when unmute, going back to the previous volume value
video.volume = volumeHistory;

const handlePlayClick = (event) => {
  //if the video is playing, pause it
  if (video.paused) {
    //play
    // playBtn.innerText = "Pause";
    video.play();
  } else {
    //pause
    // playBtn.innerText = "Play";
    video.pause();
  }
  playBtn.innerText = video.paused ? "Play" : "Pause";
};

// const handlePause = () => (playBtn.innerText = "Play");
// const handlePlay = () => (playBtn.innerText = "Pause");

const handleMuteClick = (event) => {
  if (video.muted) {
    video.muted = false;
    // muteBtn.innerText = "Mute";
  } else {
    video.muted = true;
    // muteBtn.innerText = "Unmute";
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
  volumeRange.value = video.muted ? 0 : volumeHistory;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeHistory = value;
  video.volume = value; //actual video

  //when volume bar is 0 ==> change the muteBtn txt to "Unmute"
  if (Number(value) === 0) {
    muteBtn.innerText = "Unmute";
    video.muted = true;
  }
  //when volume bar is 0 and btn is already "Unmute" and click btn ==> value 0.5
  if (Number(value) === 0 && video.muted) {
    volumeHistory = 0.5;
    video.volume = 0.5;
  }
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
// video.addEventListener("pause", handlePause);
// video.addEventListener("pause", handlePlay);
volumeRange.addEventListener("input", handleVolumeChange);
