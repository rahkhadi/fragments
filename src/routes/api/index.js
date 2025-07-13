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

router.get('/fragments', get);
router.post('/fragments', rawBody(), post);
router.get('/fragments/:id', getById);
router.get('/fragments/:id/info', getInfo);
router.get('/fragments/:id.:ext', authenticate('http'), getExtension);

module.exports = router;





