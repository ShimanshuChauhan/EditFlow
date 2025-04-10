import express from 'express';

import { protect, restrictTo } from '../controllers/authController.js';
import { createFolder, getFolder } from '../controllers/folderController.js';
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .post(restrictTo('owner', 'editor'), createFolder);

router
  .route('/:folderId')
  .get(getFolder)

export default router;