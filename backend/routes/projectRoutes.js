import express from 'express';

import { protect, restrictTo } from '../controllers/authController.js';
import { getAllProjects, createProject, getProject, updateProject, deleteProject } from '../controllers/projectController.js';

const router = express.Router();

/* FIXME: Protect this route
  router.use(protect);
  router.use(restrictTo('admin'));
*/

router
  .route('/')
  .get(getAllProjects)
  .post(
    protect,
    createProject
  );

router.use(protect);

router
  .route('/:projectId')
  .get(restrictTo('owner', 'editor', 'viewer'), getProject)
  .patch(restrictTo('owner', 'editor'), updateProject)
  .delete(restrictTo('owner'), deleteProject);

export default router;