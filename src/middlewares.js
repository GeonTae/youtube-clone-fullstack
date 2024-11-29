import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const s3AvatarStorage = multerS3({
  s3: s3Client,
  bucket: "youtube-clone-2024-fly",
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, `avatars/${req.session.user._id}/${Date.now().toString()}`);
  }, // to choose where to save and name
});

const s3VideoStorage = multerS3({
  s3: s3Client,
  bucket: "youtube-clone-2024-fly",
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, `videos/${req.session.user._id}/${Date.now().toString()}`);
  }, // to choose where to save and name
});

// export const removeFile = async (url) =>
// await s3.send(
// new DeleteObjectCommand({
// Bucket: "Bucket-name",
// Key: decodeURIComponent(url.split(".amazonaws.com/").pop()!.toString()),
// })
// );

export const localsMiddleware = (req, res, next) => {
  //   console.log(req.session);
  //   if (req.session.loggedIn) {
  //     res.locals.loggedIn = true;
  //   }
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Youtube-clone";
  res.locals.loggedInUser = req.session.user || {};
  console.log(req.session.user);
  //   console.log(res.locals);
  // this way, you can share the session info with pug template. pug can acess the local
  //res.local can send info to pug
  next();
};

//not allowing people who didnot logged in access some specific pages
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Log in first."); //creating, not showing
    return res.redirect("/login");
  }
};
//not allowing people who logged in access some specific pages
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

export const uploadFilesMiddleware = multer({
  dest: "uploads/",
});

export const uploadAvatarMiddleware = multer({
  // dest: "uploads/avatars/",
  limits: { fileSize: 3000000 }, //3mb
  storage: s3AvatarStorage,
});
export const uploadVideoMiddleware = multer({
  // dest: "uploads/videos/",
  limits: { fileSize: 100000000 }, //100mb
  storage: s3VideoStorage,
});
