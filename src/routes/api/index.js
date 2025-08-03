// fragments-lab9/src/routes/api/index.js

const express = require('express');
const router = express.Router(); // ✅ Declare router BEFORE using it

const rawBody = require('../../middleware/rawBody');
const authenticate = require('../../auth/auth-middleware');

const post = require('./post');
const get = require('./get');
const getById = require('./get-id');
const getInfo = require('./get-info');
const getExtension = require('./get-extension');
const del = require('./delete'); // ✅ Import your DELETE handler

// Ensure auth middleware is applied on all secured routes
router.get('/fragments', authenticate('http'), get);
router.post('/fragments', authenticate('http'), rawBody(), post);
router.get('/fragments/:id', authenticate('http'), getById);
router.get('/fragments/:id/info', authenticate('http'), getInfo);
router.get('/fragments/:id.:ext', authenticate('http'), getExtension);
router.delete('/fragments/:id', authenticate('http'), del); // ✅ DELETE route in correct place

module.exports = router;
