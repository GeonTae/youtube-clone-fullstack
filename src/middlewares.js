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
    return res.redirect("/login");
  }
};
//not allowing people who logged in access some specific pages
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};

import multer from "multer";
export const uploadFilesMiddleware = multer({
  dest: "uploads/",
});

export const uploadAvatarMiddleware = multer({
  dest: "uploads/avatars/",
  limits: { fileSize: 3000000 }, //3mb
});
export const uploadVideoMiddleware = multer({
  dest: "uploads/videos/",
  limits: { fileSize: 30000000 }, //30mb
});
