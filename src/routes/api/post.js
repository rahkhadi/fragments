// src/routes/api/post.js

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const type = req.headers['content-type'];

  if (!ownerId || !Buffer.isBuffer(req.body)) {
    logger.warn({ ownerId }, 'Missing ownerId or body');
    return res.status(415).json({ status: 'error', message: 'Invalid request' });
  }

  try {
    const fragment = new Fragment({ ownerId, type, size: req.body.length });
    await fragment.save();
    await fragment.setData(req.body);

    const host = process.env.API_URL || `http://${req.headers.host}`;
    const location = `${host}/v1/fragments/${fragment.id}`;

    res.status(201).setHeader('Location', location).json({ status: 'ok', fragment });
  } catch (err) {
    logger.error({ err }, 'Failed to create fragment');
    res.status(415).json({ status: 'error', message: err.message });
  }
};
