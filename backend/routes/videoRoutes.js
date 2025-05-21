import express from "express";

import { protect, restrictTo } from "../controllers/authController.js";
import { getVideo, uploadVideo } from "../controllers/videoController.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route("/")
  .post(restrictTo("owner", "editor"), uploadVideo);

router
  .route('/:videoId')
  .get(getVideo);


export default router;