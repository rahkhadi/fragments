// fragments/src/routes/api/delete.js
// Single handler function (NOT an Express router).
// routes/api/index.js will do: router.delete('/fragments/:id', delHandler)

const { Fragment } = require('../../model/fragment');

module.exports = async function deleteFragment(req, res, next) {
  try {
    const ownerId = req.user;
    const { id } = req.params;

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

    await Fragment.delete(ownerId, id);
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    // unchanged: unexpected errors bubble to error middleware
    next(err);
  }
};
