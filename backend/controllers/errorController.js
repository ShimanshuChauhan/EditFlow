import AppError from '../utils/appError.js';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const handleOAuthError = (err) => {
  // console.log(err);
  const message = 'Access denied by the user, try again to continue!';
  return new AppError(message, 403);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.log('Error 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

export default function (err, req, res, next) {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };

    console.log(error);
    if (error.message === 'access_denied') {
      error = handleOAuthError(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    sendErrorProd(error, res);
  }
};