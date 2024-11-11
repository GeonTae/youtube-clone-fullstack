import express from "express";
import {
  getEditProfile,
  postEditProfile,
  see,
  logout,
  userHome,
  startGithubLogin,
  finishGithubLogin,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  uploadAvatarMiddleware,
} from "../middlewares";

const userRouter = express.Router();

// userRouter.get("/", userHome);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEditProfile)
  .post(uploadAvatarMiddleware.single("avatar"), postEditProfile);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
// userRouter.get("/remove", remove);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/:id", see); //:potato -> variable

export default userRouter;
