// fragments/src/routes/api/index.js
const express = require('express');
const router = express.Router();

const rawBody = require('../../middleware/rawBody');
const authenticate = require('../../auth/auth-middleware');

const post = require('./post');
const get = require('./get');
const getById = require('./get-id');
const getInfo = require('./get-info');
const getExtension = require('./get-extension');
const del = require('./delete');

// Protected fragment API endpoints
router.get('/fragments', authenticate('http'), get);
router.post('/fragments', authenticate('http'), rawBody(), post);
router.get('/fragments/:id', authenticate('http'), getById);
router.get('/fragments/:id/info', authenticate('http'), getInfo);
router.get('/fragments/:id.:ext', authenticate('http'), getExtension);
router.delete('/fragments/:id', authenticate('http'), del);

module.exports = router;
