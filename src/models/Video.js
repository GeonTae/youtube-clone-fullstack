import mongoose from "mongoose";

// export const formatHashtags = (hashtags) =>
//   hashtags
//     .split(",")
//     .map((word) =>
//       word.startsWith("#") ? `#${word.replace(/#/g, "")}` : `#${word}`
//     );

//define a shape of the data
const videoSchema = new mongoose.Schema({
  //   title: String, description: String, createdAt: Date,
  title: { type: String, required: true, trim: true, maxLength: 80 },
  videoUrl: { type: String, required: true },
  thumbUrl: { type: String, required: true },
  description: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 140,
  },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  //have to let mongoose know that the id is from what model is => so ref: "User"
});

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) =>
      word.startsWith("#") ? `#${word.replace(/#/g, "")}` : `#${word}`
    );
});

// videoSchema.pre("save", async function () {
//   console.log(this);
//   this.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) =>
//       word.startsWith("#") ? `#${word.replace(/#/g, "")}` : `#${word}`
//     );
// });

//creating a model
const Video = mongoose.model("Video", videoSchema); //"Video" is for reference to the database
export default Video;
