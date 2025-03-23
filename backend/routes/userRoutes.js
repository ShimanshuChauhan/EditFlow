import express from 'express';
import dotenv from 'dotenv';
import { createUser, signUp } from '../controllers/authController.js';

dotenv.config({ path: './config.env' });

const router = express.Router();

router.get('/signup', signUp);

router.get('/google/callback', createUser);

export default router;