import express from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const router = express.Router();

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_ACCESS_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
const GOOGLE_CALLBACK_URL = 'http://localhost:3000/api/v1/users/google/callback';

const GOOGLE_AUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

router.get('/signup', (req, res) => {
  const scopes = GOOGLE_AUTH_SCOPES.join(' ');
  const authUrl = `${GOOGLE_OAUTH_URL}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&scope=${scopes}`;
  res.redirect(authUrl);
});

router.get('/google/callback', (req, res) => {
  console.log(req.query);
  res.send('Google callback URL');
  // res.redirect('/home');
});

export default router;