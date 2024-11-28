import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a"); //creating a link
  a.href = fileUrl;
  a.download = fileName; //telling the browser not to go to the URL, then download the url
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  video.loop = false;
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = new FFmpeg({
    // corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/ffmpeg-core.js",
  });

  ffmpeg.on("log", ({ message }) => {
    console.log(message);
  });

  // const baseURL = "http://localhost:4000/ffmpeg/core/dist/umd";
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  await ffmpeg.writeFile(files.input, await fetchFile(videoFile));
  await ffmpeg.exec(["-i", files.input, "-r", "60", files.output]); //encode 60FPS
  await ffmpeg.exec([
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb,
  ]);

  const mp4File = await ffmpeg.readFile(files.output);
  const thumbFile = await ffmpeg.readFile(files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  await ffmpeg.deleteFile(files.input);
  await ffmpeg.deleteFile(files.output);
  await ffmpeg.deleteFile(files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  // Stop all tracks of the stream to turn off the web camera
  const tracks = stream.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
  stream = null;
  //   video.remove();

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", preview);
};

// const handleStop = () => {
//   actionBtn.innerText = "Download Recording";
//   actionBtn.removeEventListener("click", handleStop);
//   actionBtn.addEventListener("click", handleDownload);
//   recorder.stop();
// };

const handleStart = () => {
  //   actionBtn.innerText = "Stop Recording";
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);
  //   actionBtn.addEventListener("click", handleStop);

  //   recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

const preview = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 1024, height: 576 },
  });
  video.srcObject = stream;
  video.play();

  actionBtn.innerText = "Start Recording";
  actionBtn.removeEventListener("click", preview);
  actionBtn.addEventListener("click", handleStart);
};

// preview();

actionBtn.addEventListener("click", preview);
