// fragments/src/routes/api/post.js
const express = require('express');
const router = express.Router();
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

// Strip any "; charset=..." etc.
const normalizeType = (h = '') => String(h).split(';')[0].trim().toLowerCase();

router.post('/', async (req, res) => {
  const ownerId = req.user;                   // set by auth middleware
  const rawType = req.headers['content-type'];
  const type = normalizeType(rawType);

  logger.debug(
    { ownerId, contentType: rawType, normalizedType: type, bodyIsBuffer: Buffer.isBuffer(req.body) },
    'Incoming POST /v1/fragments'
  );

  if (!ownerId || !Buffer.isBuffer(req.body)) {
    return res.status(415).json({ status: 'error', message: 'Invalid request body' });
  }
  if (!Fragment.isSupportedType(type)) {
    return res.status(415).json({ status: 'error', message: `Unsupported Content-Type: ${rawType}` });
  }

  try {
    const fragment = new Fragment({ ownerId, type, size: req.body.length });
    await fragment.save();
    await fragment.setData(req.body); // setData() also updates/saves meta

    // Prefer API_URL on ECS; else use forwarded proto/host
    const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host  = req.get('host');
    const base  = process.env.API_URL || `${proto}://${host}`;
    const location = `${base}/v1/fragments/${fragment.id}`;

    return res.status(201).set('Location', location).json({ status: 'ok', fragment });
  } catch (err) {
    logger.error({ err }, 'Failed to create fragment');
    return res.status(415).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
