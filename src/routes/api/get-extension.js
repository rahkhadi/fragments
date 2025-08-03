// fragments/src/routes/api/get-extension.js
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
    const data = await fragment.getData();

    if (ext === 'html' && fragment.mimeType === 'text/markdown') {
      const html = md.render(data.toString());
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    if (ext === 'json' && fragment.mimeType === 'application/json') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(JSON.parse(data.toString()));
    }

    if (ext === 'txt' && fragment.mimeType === 'text/plain') {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(data);
    }

    if (ext === 'md' && fragment.mimeType === 'text/markdown') {
      res.setHeader('Content-Type', 'text/markdown');
      return res.status(200).send(data);
    }

    return res.status(415).json({ status: 'error', message: 'Unsupported extension conversion' });
  } catch (err) {
    console.error(err);
    return res.status(404).json({ status: 'error', message: 'Fragment not found' });
  }
});

module.exports = router;
