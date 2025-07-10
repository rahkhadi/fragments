/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const router = express.Router();

const rawBody = require('../../middleware/rawBody');
const post = require('./post');
const get = require('./get');
const getById = require('./get-id');
const getExtension = require('./get-extension');

// Define routes
router.get('/fragments', get);
router.post('/fragments', rawBody(), post);
router.get('/fragments/:id', getById);
router.use(getExtension);

module.exports = router;
