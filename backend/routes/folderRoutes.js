import express from 'express';

import { protect, restrictTo } from '../controllers/authController.js';
import { createFolder } from '../controllers/folderController.js';
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(protect, createFolder)

export default router;