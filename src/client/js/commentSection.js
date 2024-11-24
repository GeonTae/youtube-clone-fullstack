const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
// const btn = form.querySelector("button");

const handleSubmit = async (event) => {
  event.preventDefault(); //stop refreshing page
  const textarea = form.querySelector("textarea");
  const text = textarea.value; //text from User
  const videoId = videoContainer.dataset.id; //which video comment
  //send it to backend
  if (text.trim() === "") {
    return;
  }
  await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", //to let express knows this is json type
    },
    body: JSON.stringify({ text }), //json string
  });
  textarea.value = "";
  window.location.reload();
}; //headers = information about request
// btn.addEventListener("click", handleSubmit);
if (form) {
  form.addEventListener("submit", handleSubmit);
} // in case logged out, form won't exist
