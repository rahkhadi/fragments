// src/routes/index.js

const express = require('express');

// version and author from package.json
const { version, author } = require('../../package.json');
const { createSuccessResponse } = require('../response');

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
const { authenticate } = require('../auth');
router.use('/v1', authenticate(), require('./api'));

/**
 * Define a simple root route for system metadata.
 */
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/rahkhadi/fragments',
      version,
    })
  );
});

/**
 * Define a health check route.
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
