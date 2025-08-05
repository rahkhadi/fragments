// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const expand = req.query.expand === '1';

  try {
    const fragments = await Fragment.byUser(ownerId, expand);
    console.log('Fetched fragments:', fragments);
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (e) {
    console.error('Failed to fetch fragments', e);
    res.status(500).json({ status: 'error', message: 'Failed to fetch fragments' });
  }
};