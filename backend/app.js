import express from 'express';
import morgan from 'morgan';
import AppError from './utils/appError.js';

const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

export default app;
