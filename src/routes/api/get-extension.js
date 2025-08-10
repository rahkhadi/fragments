const express = require('express');
const MarkdownIt = require('markdown-it');
const escapeHtml = require('escape-html');
const sharp = require('sharp');
const { Fragment } = require('../../model/fragment');

const router = express.Router();
const md = new MarkdownIt();

const EXT_TO_MIME = {
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

router.get('/fragments/:id.:ext', async (req, res) => {
  const { id, ext } = req.params;
  const ownerId = req.user;

  try {
    const fragment = await Fragment.byId(ownerId, id);
    const srcType = fragment.mimeType; // e.g., 'text/plain', 'image/png'
    const wantMime = EXT_TO_MIME[ext?.toLowerCase()];

    if (!wantMime) {
      return res.status(415).json({ status: 'error', message: 'Unknown extension' });
    }

    const data = await fragment.getData(); // Buffer
    const text = () => data.toString('utf8');

    // ---------- TEXT / JSON ----------
    if (wantMime.startsWith('text/') || wantMime === 'application/json') {
      // JSON -> JSON
      if (srcType === 'application/json' && wantMime === 'application/json') {
        // CHANGE: normalize JSON so tests (and clients) always get the *actual* JSON,
        // not a stringified Buffer object like {"type":"Buffer","data":[...]}.
        let raw = text(); // UTF-8 string of whatever was stored
        try {
          const firstParse = JSON.parse(raw);
          // If the stored string looks like a Buffer JSON ({"type":"Buffer","data":[...]}),
          // unwrap it back to the original inner string.
          if (firstParse && firstParse.type === 'Buffer' && Array.isArray(firstParse.data)) {
            const inner = Buffer.from(firstParse.data).toString('utf8');
            // If the inner string is itself JSON, return that JSON.
            try {
              raw = JSON.stringify(JSON.parse(inner));
            } catch {
              // Inner wasn’t valid JSON; just return the inner string as-is.
              raw = inner;
            }
          }
        } catch {
          // If raw wasn't JSON at all, just return it unchanged.
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(raw);
      }

      // TEXT/MARKDOWN family conversions
      if (srcType === 'text/markdown') {
        if (wantMime === 'text/html') {
          const html = md.render(text());
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(html);
        }
        if (wantMime === 'text/plain') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.status(200).send(text());
        }
        if (wantMime === 'text/markdown') {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          return res.status(200).send(data);
        }
      }

      if (srcType === 'text/plain') {
        if (wantMime === 'text/html') {
          // Escape and wrap so it renders as HTML
          const html = `<pre>${escapeHtml(text())}</pre>`;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(html);
        }
        if (wantMime === 'text/markdown') {
          // Treat plain text as raw markdown
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          return res.status(200).send(text());
        }
        if (wantMime === 'text/plain') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.status(200).send(data);
        }
      }

      if (srcType === 'text/html') {
        if (wantMime === 'text/plain') {
          // quick & simple strip of tags (good enough for demo)
          const stripped = text().replace(/<[^>]*>/g, '');
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.status(200).send(stripped);
        }
        if (wantMime === 'text/html') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(data);
        }
        // html -> md would require a library like Turndown
      }

      return res.status(415).json({ status: 'error', message: 'Unsupported extension conversion' });
    }

    // ---------- IMAGES (sharp) ----------
    if (srcType.startsWith('image/')) {
      let out;
      const img = sharp(data);
      switch (ext.toLowerCase()) {
        case 'png':
          out = await img.png().toBuffer();
          break;
        case 'jpg':
        case 'jpeg':
          out = await img.jpeg().toBuffer();
          break;
        case 'webp':
          out = await img.webp().toBuffer();
          break;
        case 'gif':
          // sharp can write animated webp/gif with additional options; keep simple
          out = await img.gif().toBuffer();
          break;
        default:
          return res.status(415).json({ status: 'error', message: 'Unsupported image extension' });
      }
      res.setHeader('Content-Type', wantMime);
      return res.status(200).send(out);
    }

    return res.status(415).json({ status: 'error', message: 'Unsupported extension conversion' });
  } catch (err) {
    console.error(`GET /fragments/${id}.${ext} failed`, err);
    return res.status(404).json({ status: 'error', message: 'Fragment not found' });
  }
});

module.exports = router;
