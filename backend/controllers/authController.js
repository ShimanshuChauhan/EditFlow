import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';

import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

dotenv.config({ path: './config.env' });
const { decode } = jwt;

const GOOGLE_AUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOption.secure = true;
  }

  res.cookie('jwt', token, cookieOption);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

export const signUp = catchAsync(async (req, res) => {
  const scopes = GOOGLE_AUTH_SCOPES.join(' ');
  const authUrl = `${process.env.GOOGLE_OAUTH_URL}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&scope=${scopes}&prompt=consent`;
  res.redirect(authUrl);
});

export const createUser = catchAsync(async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    return next(new AppError('No code received', 400));
  }

  const tokenResponse = await axios.post(process.env.GOOGLE_ACCESS_TOKEN_URL, {
    code: code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    grant_type: 'authorization_code'
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const { access_token, refresh_token, id_token } = tokenResponse.data;
  console.log('Tokens: ', { access_token, refresh_token, id_token });
  const { sub: googleId, email, name, picture } = decode(id_token);
  const newUser = await User.create({
    name: name,
    email: email,
    profilePic: picture,
    googleId: googleId,
    oauthTokens: new Map([
      ['access_token', access_token],
      ['refresh_token', refresh_token]
    ])
  });

  createSendToken(newUser, 201, res);
});