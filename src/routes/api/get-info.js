const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  try {
    // CHANGE: Fragment.byId() throws when not found; catch and return 404
    let fragment;
    try {
      fragment = await Fragment.byId(ownerId, id);
    } catch {
      return res.status(404).json({ status: 'error', message: 'Fragment not found' });
    }
    if (!fragment) {
      return res.status(404).json({ status: 'error', message: 'Fragment not found' });
    }

    return res.status(200).json({ status: 'ok', fragment });
  } catch (err) {
    // unchanged: true server errors are 500
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
