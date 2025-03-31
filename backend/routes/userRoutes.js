import express from 'express';
import dotenv from 'dotenv';

import { getAllUsers, deteleMe, getUser } from '../controllers/userController.js';
import { createUser, signUp, protect } from '../controllers/authController.js';

dotenv.config({ path: './config.env' });

const router = express.Router();

router.get('/signup', signUp);
router.get('/google/callback', createUser);

router.use(protect);

router
  .route('/')
  .get(getAllUsers)
  .delete(deteleMe);

router
  .route('/:id')
  .get(getUser);

export default router;