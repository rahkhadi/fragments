// fragments/src/routes/api/index.js
const express = require('express');
const router = express.Router();

const rawBody = require('../../middleware/rawBody');
const authenticate = require('../../auth/auth-middleware');

const postRoute = require('./post');
const get = require('./get');
const getById = require('./get-id');
const getInfo = require('./get-info');
const getExtension = require('./get-extension');
const del = require('./delete');

// All fragment routes require authentication
router.use('/fragments', authenticate('http'));

// Apply rawBody to POST only
router.use('/fragments', rawBody(), postRoute);

// Other routes
router.get('/fragments', get);
router.get('/fragments/:id', getById);
router.get('/fragments/:id/info', getInfo);
router.get('/fragments/:id.:ext', getExtension);
router.delete('/fragments/:id', del);

module.exports = router;
