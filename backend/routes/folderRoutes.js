import express from 'express';

import { protect, restrictTo } from '../controllers/authController.js';
import { createFolder, getFolder, createSubFolder, deleteFolder, updateFolder } from '../controllers/folderController.js';
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .post(restrictTo('owner', 'editor'), createFolder);

router
  .route('/:folderId')
  .get(getFolder)
  .post(restrictTo('owner', 'editor'), createSubFolder)
  .patch(restrictTo('owner', 'editor'), updateFolder)
  .delete(restrictTo('owner'), deleteFolder)

export default router;