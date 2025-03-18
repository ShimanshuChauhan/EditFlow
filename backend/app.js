import express from 'express';

import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

const app = express();
app.use(express.json());

app.get('/home', (req, res) => {
  res.send('Hello World');
});

app.get('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;