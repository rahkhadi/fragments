// fragments/src/routes/api/index.js
const express = require('express');
const passport = require('passport');

const rawBody = require('../../middleware/rawBody');
const auth = require('../../auth');                    // exposes .strategy()
const authMiddleware = require('../../auth/auth-middleware');

const postRoute  = require('./post');
const putRoute   = require('./put');
const get        = require('./get');
const getById    = require('./get-id');
const getInfo    = require('./get-info');
const getExt     = require('./get-extension');
const del        = require('./delete');

const router = express.Router();

// Register whichever strategy auth/index.js chose
passport.use(auth.strategy());

// Pick the passport strategy name for our hashing middleware
const strategyName =
  (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) ? 'bearer' : 'http';

// ✅ Authenticate + set req.user to the HASHED email
router.use('/fragments', authMiddleware(strategyName));

// Body reader must come after auth for POST/PUT
router.use('/fragments', rawBody(), postRoute);
router.use('/fragments', rawBody(), putRoute);

// Other routes (order matters)
router.get('/fragments', get);
router.get('/fragments/:id.:ext', getExt);
router.get('/fragments/:id/info', getInfo);
router.get('/fragments/:id', getById);
router.delete('/fragments/:id', del);

module.exports = router;

