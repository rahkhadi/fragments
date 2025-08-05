const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../model/fragment');

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req.headers['content-type']);
        return Fragment.isSupportedType(type);
      } catch (err) {
        console.warn('Invalid content-type header:', req.headers['content-type'], err.message);
        return false;
      }
    },
  });

module.exports = rawBody;
