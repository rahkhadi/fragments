// fragments/src/routes/api/index.js
const express = require('express');
const router = express.Router();

const rawBody = require('../../middleware/rawBody');
const auth = require('../../auth');

const postRoute = require('./post');
const putRoute  = require('./put');
const get = require('./get');
const getById = require('./get-id');
const getInfo = require('./get-info');
const getExtension = require('./get-extension');
const del = require('./delete');

router.use('/fragments', auth.authenticate());
router.use('/fragments', rawBody(), postRoute);
router.use('/fragments', rawBody(), putRoute);   // put.js path should be: router.put('/:id', ...)

// Other routes (order matters!)
router.get('/fragments', get);
router.get('/fragments/:id.:ext', getExtension);  
router.get('/fragments/:id/info', getInfo);
router.get('/fragments/:id', getById);            
router.delete('/fragments/:id', del);

module.exports = router;

