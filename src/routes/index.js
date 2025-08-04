// src/routes/index.js

const express = require('express');
const { version, author } = require('../../package.json');
const { createSuccessResponse } = require('../response');

const router = express.Router();

/**
 * Public health check route (unauthenticated)
 */
router.get('/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({ status: 'ok' });
});

/**
 * Root route metadata
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

module.exports = router;
