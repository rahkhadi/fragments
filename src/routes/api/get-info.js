const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  try {
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json({ status: 'error', message: 'Fragment not found' });
    }

    res.status(200).json({ status: 'ok', fragment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
