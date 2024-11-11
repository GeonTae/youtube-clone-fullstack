import bcrypt from "bcrypt";
import mongoose, { Model } from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  githubLoginOnly: { type: Boolean, default: false },
  avatarUrl: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  location: String,
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }], // bring all video ids from the video model
});

userSchema.pre("save", async function () {
  //   console.log("User password:", this.password);
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
  //   console.log("Hashed password:", this.password);
});

const User = mongoose.model("User", userSchema);
export default User;
