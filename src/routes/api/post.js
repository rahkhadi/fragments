// fragments/src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const type = req.headers['content-type'];

  logger.debug(
    {
      ownerId,
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body),
      contentType: type,
      bodyLength: req.body.length,
    },
    'Incoming POST /v1/fragments request'
  );

  if (!ownerId || !Buffer.isBuffer(req.body)) {
    logger.warn({ ownerId }, 'Missing ownerId or body');
    return res.status(415).json({ status: 'error', message: 'Invalid request' });
  }

  try {
    const fragment = new Fragment({ ownerId, type, size: req.body.length });
    await fragment.save();
    await fragment.setData(req.body);

    const protocol = req.protocol || 'http';
    const host = req.get('host');
    const location = `${protocol}://${host}/v1/fragments/${fragment.id}`;

    res.status(201).setHeader('Location', location).json({ status: 'ok', fragment });
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack }, 'Failed to create fragment');
    res.status(415).json({ status: 'error', message: err.message });
  }
};
