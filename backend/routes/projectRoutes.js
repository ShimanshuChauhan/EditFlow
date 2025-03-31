import express from 'express';

import { protect, restrictTo } from '../controllers/authController.js';
import { getAllProjects, createProject, getProject, updateProject, deleteProject } from '../controllers/projectController.js';

const router = express.Router();

router
  .route('/')
  .get(getAllProjects)
  .post(
    protect,
    createProject
  );

router
  .route('/:id')
  .get(getProject)
  .patch(updateProject)
  .delete(deleteProject);

export default router;