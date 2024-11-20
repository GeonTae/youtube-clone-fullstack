const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
  const a = document.createElement("a"); //creating a link
  a.href = videoFile;
  a.download = "MyRecording.mp4"; //telling the browser not to go to the URL, then download the url
  document.body.appendChild(a);
  a.click();

  // Stop all tracks of the stream to turn off the web camera
  const tracks = stream.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
  stream = null;
  video.remove();
};

const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);

  recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const preview = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 800, height: 400 },
  });
  video.srcObject = stream;
  video.play();

  startBtn.innerText = "Start Recording";
  startBtn.removeEventListener("click", preview);
  startBtn.addEventListener("click", handleStart);
};

// preview();

startBtn.addEventListener("click", preview);
