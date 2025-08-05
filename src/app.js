const express = require('express');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('./logger');
const auth = require('./auth');
const pino = require('pino-http')({ logger });
const rawBody = require('./middleware/rawBody');

const app = express();

// Logging and security middlewares
app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());

// Use rawBody before body parsers
app.use(rawBody());

// Standard parsers after rawBody
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: ['text/plain', 'text/markdown', 'application/json'] }));

// Auth setup
passport.use(auth.strategy());
app.use(passport.initialize());

// Public routes (e.g., health)
app.use('/', require('./routes'));

// Protected routes
app.use('/v1', auth.authenticate(), require('./routes/api'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: { message: 'not found', code: 404 },
  });
});

// Error handler
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
