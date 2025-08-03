// fragments/src/routes/api/delete.js
const express = require('express');
const router = express.Router();
const { Fragment } = require('../../model/fragment');
const authenticate = require('../../auth/auth-middleware');

router.delete('/fragments/:id', authenticate('http'), async (req, res, next) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    if (!fragment) {
      return res.status(404).json({ status: 'error', message: 'Fragment not found' });
    }

    await Fragment.delete(req.user, req.params.id);
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
