const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const textarea = document.getElementById("textarea");
//icon
const playBtnIcon = playBtn.querySelector("i");
const muteBtnIcon = muteBtn.querySelector("i");
const fullScreenIcon = fullScreenBtn.querySelector("i");

//global
let controlsTimeout = null; //for timeout bar disappear delay
let controlsMovementTimeout = null;
let volumeHistory = 0.5; //this is for, when unmute, going back to the previous volume value
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
  playBtnIcon.classList = video.paused
    ? "fa-solid fa-play"
    : "fa-solid fa-pause";
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
  muteBtnIcon.classList = video.muted
    ? "fa-solid fa-volume-xmark"
    : "fa-solid fa-volume-high";
  volumeRange.value = video.muted ? 0 : volumeHistory;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = "fa-solid fa-volume-high";
  }
  volumeHistory = value;
  video.volume = value; //actual video

  //when volume bar is 0 ==> change the muteBtn txt to "Unmute"
  if (Number(value) === 0) {
    muteBtnIcon.classList = "fa-solid fa-volume-xmark";
    video.muted = true;
  }
  //when volume bar is 0 and btn is already "Unmute" and click btn ==> value 0.5
  if (Number(value) === 0 && video.muted) {
    volumeHistory = 0.5;
    video.volume = 0.5;
  }
};

const formatTime = (seconds) => {
  if (seconds >= 3600) {
    return new Date(seconds * 1000).toISOString().substring(11, 19);
  } else {
    return new Date(seconds * 1000).toISOString().substring(14, 19);
  }
};

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = video.duration;
};
const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime); // connecting time and bar
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullScreenCheck = document.fullscreenElement; //element or null
  if (fullScreenCheck) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fa-solid fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fa-solid fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  } // this is for when I re-enter mouse in the video, then we re-start hideCountTime
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  } // this is for when I keep moving the mouse in the video, then we re-start hideCountTime
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000); //3000ms => 3s
};

const changeVideoTime = (seconds) => {
  video.currentTime += seconds;
};

queueMicrotask;
const handlePressKey = (event) => {
  const fullScreenCheck = document.fullscreenElement;
  if (event.target !== textarea) {
    if (event.key === "m") {
      handleMuteClick();
    }
    if (!fullScreenCheck && event.key === "f") {
      handleFullScreen();
    }
    if (event.code === "Space") {
      handlePlayClick();
    }
    if (event.code === "ArrowRight") {
      changeVideoTime(5);
    }
    if (event.code === "ArrowLeft") {
      changeVideoTime(-5);
    }
  }
  if (fullScreenCheck && event.code === "Esc") {
    handleFullScreen();
  }
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, { method: "POST" });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
// video.addEventListener("pause", handlePause);
// video.addEventListener("pause", handlePlay);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click", handlePlayClick); // play & pause when clicking video too
video.addEventListener("ended", handleEnded); //for updating views count
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
document.addEventListener("keydown", handlePressKey);
