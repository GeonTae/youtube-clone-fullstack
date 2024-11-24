import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

//home router
//=======================================================
export const home = async (req, res) => {
  // console.log("start")
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner"); // await makes wait until getting database
  // console.log(videos);
  // console.log("finished")
  return res.render("home", { pageTitle: "Home", videos: videos });
};
// start -> videos -> finished

//=======================================================
//video router
//=======================================================
// export const see = (req, res) => res.send("See");
export const watch = async (req, res) => {
  // const id =req.params.id;
  const { id } = req.params; //from url id
  // console.log("show video:", id);
  const video = await Video.findById(id).populate("owner").populate("comments");
  // this populate segment the User info into the Video info, not just as User id
  // const owner = await User.findById(video.owner);
  console.log(video);
  if (!video) {
    //video === null
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("videos/watch", { pageTitle: video.title, video });
};

//=======================================================
// getEdit: painting the form. postEdit: saving the changes
//=======================================================
export const getEditVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    //video === null
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  // console.log(typeof video.owner, typeof _id); // object , string
  //to allow accessing only for the video owner
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video");
    return res.status(403).redirect("/");
  }
  return res.render("videos/edit-video", {
    pageTitle: `Edit ${video.title}`,
    video,
  });
};
// ----------------------------------------------------------
export const postEditVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  // const video = await Video.findById(id);  // get whole video info
  const video = await Video.exists({ _id: id }); //return boolean
  // const video = await Video.findById(id);
  // _id = db has this name. id is the id we requested
  if (!video) {
    //video === null
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video");
    return res.status(403).redirect("/");
  }
  // video.title = title;
  // video.description = description;
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  // await video.save();
  req.flash("success", "Changed saved.");
  return res.redirect(`/videos/${id}`); //goto the website again
};

//=======================================================
//upload
//=======================================================

export const getUpload = (req, res) => {
  return res.render("videos/upload", { pageTitle: "Upload Video" });
};
// ----------------------------------------------------------
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  // const { path: videoUrl } = req.file; //bring path from req.file and name as videoUrl
  const { video, thumb } = req.files;
  // console.log(video[0]);
  // console.log(video[0].path);
  // console.log(thumb[0].path);
  const { title, description, hashtags } = req.body;
  // const video = new Video({
  // });
  // await video.save();
  try {
    const newVideo = await Video.create({
      title,
      description,
      videoUrl: video[0].path,
      thumbUrl: thumb[0].path,
      // thumbUrl: thumb[0].path.replace(/[\\]/g, "/"), // in window os
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
      meta: {
        views: 0,
        rating: 0,
      },
    });
    //save new posted video info into the owner User db
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();

    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("videos/upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
//`new` just creates an instance of a class.
// `create` will actually put the data on the DB.

//=======================================================
//=======================================================

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  const user = await User.findById(_id); //from db
  if (!video) {
    //video === null
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  // Video.findOneAndDelete({_id: id});
  user.videos.splice(user.videos.indexOf(id), 1);
  // await User.findByIdAndUpdate(_id, { $pull: { videos: id } });
  user.save();
  return res.redirect("/");
};

//=======================================================
//=======================================================

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
        //mongoDB Operator
        //i is for containing both lower, upper cases
        // for contain-start: `^${keword}`
        // for contain-end: `${keyword}$'
      },
    }).populate("owner");
  }
  return res.render("videos/search", { pageTitle: "Search", videos });
};

// 라우터로 지정한 :id -> req.params
// pug파일에서 input으로 받은 내용 -> req.body(form이 POST일 때)
// pug파일에서 input으로 받은 url내용 -> req.query (form이 GET일 때)

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user }, //user info
    body: { text }, //comment
    params: { id }, //video id
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.sendStatus(201);
};

//home router
//callback way example
// export const home = (req, res) => {
//   console.log("start")
//   Video.find({})
//     .then((videos) => {
//       console.log("videos:", videos);
//       return res.render("home", { pageTitle: "Home", videos: videos });
//     })
//     .catch((error) => {
//       console.log("errors", error);
//     });
//   console.log("finished")
// };

// start -> finished -> video
//callback doesn't wait
