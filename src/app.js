const express = require('express');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('./logger');
const auth = require('./auth');

const pino = require('pino-http')({ logger });
const app = express();

// Middleware
app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());

// Passport setup
passport.use(auth.strategy());
app.use(passport.initialize());

// ✅ Authenticate ALL routes under /v1 consistently:
app.use('/v1', auth.authenticate());

// Routes
app.use('/', require('./routes'));

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: { message: 'not found', code: 404 }
  });
});

// Global error handler
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) logger.error({ err }, 'Error processing request');

  res.status(status).json({
    status: 'error',
    error: { message, code: status }
  });
});

module.exports = app;
