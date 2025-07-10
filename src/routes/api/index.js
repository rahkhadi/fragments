const express = require('express');
const router = express.Router();

const rawBody = require('../../middleware/rawBody');
const post = require('./post');
const get = require('./get');
const getById = require('./get-id');
const getExtension = require('./get-extension');

// Define routes (important: order matters!)
router.get('/fragments', get);
router.post('/fragments', rawBody(), post);
router.get('/fragments/:id', getById);
router.get('/fragments/:id.:ext', getExtension); 

module.exports = router;
