import express from "express";
import {
  watch,
  getEditVideo,
  postEditVideo,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  uploadVideoMiddleware,
} from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch); //:potato // (\\d+) is only for accepting number
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEditVideo)
  .post(postEditVideo);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(
    uploadVideoMiddleware.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );
// .post(uploadVideoMiddleware.single("video"), postUpload);

// videoRouter.get("/:id(\\d+)/edit", getEdit);
// videoRouter.post("/:id(\\d+)/edit", postEdit);

// videoRouter.get("/:id(\\d+)/delete", deleteVideo);
// videoRouter.get("/upload", upload); // has to locate at the top so that express doesn't take this as :id

export default videoRouter;
