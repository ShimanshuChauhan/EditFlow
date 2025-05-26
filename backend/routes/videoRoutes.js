import express from "express";

import { protect, restrictTo } from "../controllers/authController.js";
import { getVideo, uploadVideo, uploadVideoInFolder } from "../controllers/videoController.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/:folderId')
  .post(restrictTo("owner", "editor"), uploadVideoInFolder);

router
  .route("/")
  .post(restrictTo("owner", "editor"), uploadVideo);

router
  .route('/:videoId')
  .get(getVideo)

export default router;