import express from 'express';
import morgan from 'morgan';

import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/projects', projectRouter);

app.get('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;