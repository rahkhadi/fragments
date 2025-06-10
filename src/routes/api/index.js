// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const router = express.Router();

const rawBody = require('../../middleware/rawBody');
const post = require('./post');
const get = require('./get');

// Define routes
router.get('/fragments', get);
router.post('/fragments', rawBody(), post);

// TODO: Add more routes like /fragments/:id, etc.
const getById = require('./get-id');
router.get('/fragments/:id', getById);

module.exports = router;
