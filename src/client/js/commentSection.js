const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
// const btn = form.querySelector("button");

const handleDelete = async (event) => {
  const comment = event.target.parentElement; // The <li> element
  const commentId = comment.dataset.id; // Get comment ID

  const response = await fetch(`/api/comments/${commentId}/delete`, {
    method: "DELETE",
  }); // send it to backend

  if (response.status === 200) {
    comment.remove(); // Remove comment from screen
  } else if (response.status === 403) {
    alert("You are not authorized to delete this comment.");
  } else {
    alert("Failed to delete comment.");
  }
};

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id; // to allow deleting comment
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fa-solid fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const deleteIcon = document.createElement("span");
  deleteIcon.innerText = " ❌";
  deleteIcon.className = "comment_delete"; // Add class for delete
  deleteIcon.addEventListener("click", handleDelete); // delete

  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(deleteIcon);
  videoComments.prepend(newComment);
}; // for fake comment before reloading\

const handleSubmit = async (event) => {
  event.preventDefault(); //stop refreshing page
  const textarea = form.querySelector("textarea");
  const text = textarea.value; //text from User
  const videoId = videoContainer.dataset.id; //which video comment
  //send it to backend
  if (text.trim() === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", //to let express knows this is json type
    },
    body: JSON.stringify({ text }), //json string, sending it to body
  });
  textarea.value = "";
  if (response.status === 201) {
    const { newCommentId } = await response.json(); // extract json from backend response (videoController.js)
    addComment(text, newCommentId); //for fake comment
  }
  //   window.location.reload();
}; //headers = information about request
// btn.addEventListener("click", handleSubmit);
if (form) {
  form.addEventListener("submit", handleSubmit);
} // in case logged out, form won't exist

// Attach event listeners for existing comments
const deleteIcons = document.querySelectorAll(".comment_delete");
deleteIcons.forEach((icon) => {
  icon.addEventListener("click", handleDelete);
});
