// src/app.js

const passport = require('passport');
const authenticate = require('./auth');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// author and version from our package.json file
const { createErrorResponse } = require('./response');

const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});

// Create an express app instance
const app = express();

// Middleware
app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());

// Passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Authenticate all routes under /v1
app.use('/v1', authenticate());

// Routes
app.use('/', require('./routes'));


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

// Global error handler
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, 'Error processing request');
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
  });
});

app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

module.exports = app;
