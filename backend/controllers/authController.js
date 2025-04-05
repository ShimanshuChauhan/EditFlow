import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';

import User from '../models/userModel.js';
import Project from '../models/projectModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const { decode, verify } = jwt;
dotenv.config({ path: './config.env' });

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
  if (req.query.error) {
    return next(new AppError(req.query.error, 400));
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
  const { sub: googleId, email, name, picture } = decode(id_token);
  const user = await User.findOne({ googleId });
  // console.log(id_token);
  if (user) {
    // console.log(access_token);
    user.oauthTokens.set('access_token', access_token);
    user.oauthTokens.set('refresh_token', refresh_token);
    await user.save();
    createSendToken(user, 200, res);
  }
  else {
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
  }
});

export const protect = catchAsync(async (req, res, next) => {

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // console.log(token);
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = await verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    const userId = req.user._id.toString();
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }
    const projectOwnerId = project.ownerId.toString();

    let isAuthorized = false;

    for (let role of roles) {
      // console.log(role);
      if (role === 'owner' && projectOwnerId === userId) {
        // console.log("owner id matched");
        isAuthorized = true;
        break;
      }
      if (role === 'editor' && project.permissions.some((permission) => permission.userId.toString() === userId && permission.role === 'editor')) {
        // console.log("editor matched");
        isAuthorized = true;
        break;
      }
      if (role === 'viewer' && project.permissions.some((permission) => permission.userId.toString() === userId && permission.role === 'viewer')) {
        // console.log("viewer matched");
        isAuthorized = true;
        break;
      }
    }
    if (!isAuthorized) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  });
};