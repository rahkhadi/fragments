// fragments/src/middleware/rawBody.js
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
        return false;
      }
    },
  });

module.exports = rawBody;