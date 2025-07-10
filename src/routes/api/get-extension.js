const express = require('express');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const router = express.Router();
const { Fragment } = require('../../model/fragment');
const authMiddleware = require('../../middleware/auth-middleware');  // Use your auth middleware wrapper here!

router.get('/fragments/:id.:ext', authMiddleware('http'), async (req, res) => {
  const { id, ext } = req.params;
  const ownerId = req.user;  // Already hashed by middleware

  try {
    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      return res.status(404).json({ status: 'error', message: 'Fragment not found' });
    }

    const data = await fragment.getData();

    if (ext === 'html' && fragment.type === 'text/markdown') {
      const html = md.render(data.toString());
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    if (ext === 'md' && fragment.type === 'text/markdown') {
      res.setHeader('Content-Type', 'text/markdown');
      return res.status(200).send(data);
    }

    return res.status(415).json({ status: 'error', message: 'Unsupported extension conversion' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
