// fragments/src/routes/api/post.js
const express = require('express');
const router = express.Router();
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

// Normalize header like "text/plain; charset=utf-8" → "text/plain"
const normalize = (t = '') => String(t).split(';')[0].trim().toLowerCase();

router.post('/', async (req, res) => {
  const ownerId = req.user; // set by auth middleware
  const rawType = req.headers['content-type'];
  const type = normalize(rawType);

  // NOTE: keep the debug; it’s useful when CI fails
  logger.debug(
    { ownerId, contentType: rawType, normalizedType: type, bodyIsBuffer: Buffer.isBuffer(req.body) },
    'Incoming POST /v1/fragments'
  );

  // CHANGED: only check auth here. We no longer fail just because body isn't a Buffer;
  // we’ll coerce strings/objects to Buffer below (for JSON / text).
  if (!ownerId) {
    return res.status(401).json({ status: 'error', message: 'unauthorized' });
  }

  if (!Fragment.isSupportedType(type)) {
    return res.status(415).json({ status: 'error', message: `Unsupported Content-Type: ${rawType}` });
  }

  try {
    // CHANGED: coerce non-Buffer bodies for JSON and text/* to a Buffer.
    // For images and other binary types, still require Buffer.
    let data = req.body;

    if (!Buffer.isBuffer(data)) {
      if (type === 'application/json') {
        // Allow plain string or JS object for JSON
        if (typeof data === 'string') {
          data = Buffer.from(data, 'utf8');
        } else {
          data = Buffer.from(JSON.stringify(data ?? {}), 'utf8');
        }
      } else if (type.startsWith('text/')) {
        // Allow plain strings for text/*
        if (typeof data === 'string') {
          data = Buffer.from(data, 'utf8');
        } else {
          // If it isn’t a string, treat as invalid for text/*
          return res.status(415).json({ status: 'error', message: 'expected text body' });
        }
      } else {
        // For non-text types (e.g., images), we still require a binary Buffer
        return res.status(415).json({ status: 'error', message: 'expected binary body' });
      }
    }

    const fragment = new Fragment({ ownerId, type, size: data.length });
    await fragment.save();
    await fragment.setData(data); // setData() updates 'updated' and persists data + meta

    // Construct a helpful Location header
    const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host = req.get('host');
    const base = process.env.API_URL || `${proto}://${host}`;
    const location = `${base}/v1/fragments/${fragment.id}`;

    return res.status(201).set('Location', location).json({ status: 'ok', fragment });
  } catch (err) {
    logger.error({ err }, 'Failed to create fragment');
    // Keep 415 for bad payloads (e.g., JSON that can’t stringify)
    return res.status(415).json({ status: 'error', message: err.message });
  }
});

module.exports = router;


