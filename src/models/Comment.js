import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, maxLength: 300 },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  createdAt: { type: Date, required: true, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema); //in DB

export default Comment;