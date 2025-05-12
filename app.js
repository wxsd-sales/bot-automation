import express from 'express';
import logger from 'morgan';
import cors from 'cors';

import serverRouter from './routes/server.js';

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', serverRouter);

// module.exports = app;
export default app;
