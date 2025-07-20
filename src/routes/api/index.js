// fragments/src/routes/api/index.js
const express = require('express');
const router = express.Router();

const rawBody = require('../../middleware/rawBody');
const post = require('./post');
const get = require('./get');
const getById = require('./get-id');
const getInfo = require('./get-info');
const getExtension = require('./get-extension');
const authenticate = require('../../auth/auth-middleware');

// Ensure auth middleware is applied on all secured routes
router.get('/fragments', authenticate('http'), get);
router.post('/fragments', authenticate('http'), rawBody(), post);
router.get('/fragments/:id', authenticate('http'), getById);
router.get('/fragments/:id/info', authenticate('http'), getInfo);
router.get('/fragments/:id.:ext', authenticate('http'), getExtension);

module.exports = router;




