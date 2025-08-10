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

    if (!ownerId) return res.status(401).json({ status: 'error', message: 'unauthorized' });
    if (!Buffer.isBuffer(req.body))
      return res.status(415).json({ status: 'error', message: 'expected binary body' });

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) return res.status(404).json({ status: 'error', message: 'Fragment not found' });

    if (type && type !== fragment.type) fragment.type = type;

    await fragment.setData(req.body);
    // await fragment.save();

    res.status(200).json({ status: 'ok', fragment });
  } catch (err) {
    logger.error({ err }, 'PUT failed');
    res.status(500).json({ status: 'error', message: 'update failed' });
  }
});

module.exports = router;
