// fragments/src/app.js
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('./logger');
const auth = require('./auth');
const pino = require('pino-http')({ logger });

const app = express();

// Behind ALB: respect X-Forwarded-* so req.protocol is correct
app.set('trust proxy', true);

// Logging + security
app.use(pino);
app.use(helmet());
app.use(compression());

// CORS: expose Location so frontend can read it
app.use(cors({
  origin: '*', // or 'http://localhost:8081' if you want to lock it down
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Authorization','Content-Type'],
  exposedHeaders: ['Location'],
  maxAge: 86400,
}));

// NOTE: do NOT mount rawBody() globally; it’s applied only to POST/PUT in the API router
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth
passport.use(auth.strategy());
app.use(passport.initialize());

// Public routes
app.use('/', require('./routes'));

// Protected API routes (the API router mounts rawBody() where needed)
app.use('/v1', auth.authenticate(), require('./routes/api'));

// 404
app.use((req, res) => {
  res.status(404).json({ status: 'error', error: { message: 'not found', code: 404 } });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  if (status >= 500) logger.error({ err }, 'Error processing request');
  res.status(status).json({ status: 'error', error: { message, code: status } });
});

module.exports = app;
