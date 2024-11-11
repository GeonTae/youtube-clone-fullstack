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
});

userSchema.pre("save", async function () {
//   console.log("User password:", this.password);
  this.password = await bcrypt.hash(this.password, 5);
//   console.log("Hashed password:", this.password);
});

const User = mongoose.model("User", userSchema);
export default User;
