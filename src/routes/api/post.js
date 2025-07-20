const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;  // NOTE: req.user is already hashed by auth middleware
  const type = req.headers['content-type'];

  logger.debug({ ownerId, bodyType: typeof req.body, isBuffer: Buffer.isBuffer(req.body), contentType: type }, 'Debugging POST');
  
  if (!ownerId || !Buffer.isBuffer(req.body)) {
    logger.warn({ ownerId }, 'Missing ownerId or body');
    return res.status(415).json({ status: 'error', message: 'Invalid request' });
  }

  try {
    const fragment = new Fragment({ ownerId, type, size: req.body.length });
    await fragment.save();
    await fragment.setData(req.body);

    const protocol = req.protocol || 'http';  // Automatically detect 'http' or 'https'
    const host = req.get('host');             // Get the actual hostname and port used in request
    const location = `${protocol}://${host}/v1/fragments/${fragment.id}`;


    res.status(201).setHeader('Location', location).json({ status: 'ok', fragment });
  } catch (err) {
    logger.error({ err }, 'Failed to create fragment');
    res.status(415).json({ status: 'error', message: err.message });
  }
};
