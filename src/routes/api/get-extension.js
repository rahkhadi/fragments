const express = require('express');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const router = express.Router();
const { Fragment } = require('../../model/fragment');

router.get('/fragments/:id.:ext', async (req, res) => {
  const { id, ext } = req.params;
  const ownerId = req.user;

  try {
    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      return res.status(404).json({ status: 'error', message: 'Fragment not found' });
    }

    // Get raw data
    const data = await fragment.getData();

    // Handle Markdown (.md) to HTML (.html)
    if (ext === 'html' && fragment.type === 'text/markdown') {
      const html = md.render(data.toString());
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    // Optional: Handle raw markdown
    if (ext === 'md' && fragment.type === 'text/markdown') {
      res.setHeader('Content-Type', 'text/markdown');
      return res.status(200).send(data);
    }

    // Unsupported type
    return res.status(415).json({ status: 'error', message: 'Unsupported extension conversion' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
