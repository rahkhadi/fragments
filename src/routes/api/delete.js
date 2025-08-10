// fragments/src/routes/api/delete.js
// Single handler function (NOT an Express router).
// routes/api/index.js will do: router.delete('/fragments/:id', delHandler)

const { Fragment } = require('../../model/fragment');

/**
 * DELETE /v1/fragments/:id
 * Requires req.user to be set by auth (mounted at /v1 in app.js).
 */
module.exports = async function deleteFragment(req, res, next) {
  try {
    const ownerId = req.user;
    const { id } = req.params;

    // 404 if the fragment doesn't exist for this user
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json({ status: 'error', message: 'Fragment not found' });
    }

    // Delete and return ok
    await Fragment.delete(ownerId, id);
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
};
