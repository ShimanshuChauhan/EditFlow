import express from 'express';

import folderRouter from './folderRoutes.js';
import videoRouter from './videoRoutes.js';
import { protect, restrictTo } from '../controllers/authController.js';
import { getAllProjects, createProject, getProject, updateProject, deleteProject, updatePermissions } from '../controllers/projectController.js';

const router = express.Router();

/* FIXME: Protect this route
  router.use(protect);
  router.use(restrictTo('admin'));
*/

router.use('/:projectId/folders', folderRouter);
router.use('/:projectId/videos', videoRouter);

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

router
  .route('/:projectId/permissions')
  .patch(restrictTo('owner'), updatePermissions);

export default router;