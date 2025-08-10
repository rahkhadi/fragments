// fragments/src/routes/api/put.js
const express = require('express');
const router = express.Router();
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

const normalize = (t = '') => String(t).split(';')[0].trim().toLowerCase();

router.put('/:id', async (req, res) => {
  try {
    const ownerId = req.user;
    const id = req.params.id;
    const type = normalize(req.headers['content-type']);

    if (!ownerId) {
      return res.status(401).json({ status: 'error', message: 'unauthorized' });
    }

    // NOTE: Since we use express.raw(), req.body is always a Buffer.
    // Keeping this guard anyway for defensive programming.
    if (!Buffer.isBuffer(req.body)) {
      // CHANGE: keep the original 415 guard, but it won’t typically trigger with express.raw()
      return res.status(415).json({ status: 'error', message: 'expected binary body' });
    }

    // CHANGE: Fragment.byId() throws when not found. Catch and return 404 instead of falling to 500.
    let fragment;
    try {
      fragment = await Fragment.byId(ownerId, id);
    } catch {
      return res.status(404).json({ status: 'error', message: 'Fragment not found' });
    }
    if (!fragment) {
      return res.status(404).json({ status: 'error', message: 'Fragment not found' });
    }

    // Optional type update if caller changed Content-Type
    if (type && type !== fragment.type) {
      fragment.type = type;
    }

    await fragment.setData(req.body); // setData persists + updates updated timestamp

    return res.status(200).json({ status: 'ok', fragment });
  } catch (err) {
    // CHANGE: no behavior change here; keeping 500 only for unexpected errors
    logger.error({ err }, 'PUT failed');
    return res.status(500).json({ status: 'error', message: 'update failed' });
  }
});

module.exports = router;
