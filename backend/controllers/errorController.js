import AppError from '../utils/appError.js';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const handleOAuthError = (err) => {
  const message = 'Access denied. Please try again.';
  return new AppError(message, 403);
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
    console.log(err.name);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.message === 'access_denied') {
      error = handleOAuthError(error);
    }

    sendErrorProd(error, res);
  }
};