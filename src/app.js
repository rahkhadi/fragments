// fragments/src/app.js
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('./logger');
const auth = require('./auth');
const rawBody = require('./middleware/rawBody');
const pino = require('pino-http')({ logger });

const app = express();

// Middleware setup
app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rawBody());
app.use(express.text({ type: ['text/plain', 'text/markdown', 'application/json'] }));

// Passport authentication strategy
passport.use(auth.strategy());
app.use(passport.initialize());

// Mount public root routes (e.g., /health)
app.use('/', require('./routes'));

// Mount /v1 routes with authentication
app.use('/v1', auth.authenticate(), require('./routes/api'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: { message: 'not found', code: 404 },
  });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  if (status >= 500) logger.error({ err }, 'Error processing request');
  res.status(status).json({
    status: 'error',
    error: { message, code: status },
  });
});

module.exports = app;
