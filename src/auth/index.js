// src/auth/index.js

/**
 * This module conditionally exports an authentication strategy (Cognito or Basic Auth)
 * depending on the environment and available environment variables.
 * 
 * We support:
 * - AWS Cognito for production environments
 * - HTTP Basic Auth (via .htpasswd) for local development and CI testing
 */

const isDev = process.env.NODE_ENV !== 'production';

// Check for misconfiguration: all three vars defined, which is not allowed in production
if (
  process.env.AWS_COGNITO_POOL_ID &&
  process.env.AWS_COGNITO_CLIENT_ID &&
  process.env.HTPASSWD_FILE &&
  !isDev // only throw error in production
) {
  throw new Error(
    'env contains configuration for both AWS Cognito and HTTP Basic Auth in production. Only one is allowed.'
  );
}

// ✅ Use AWS Cognito if configured (prefer this in production)
if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  console.log('Using AWS Cognito for authentication');
  module.exports = require('./cognito');
}

// ✅ Use HTTP Basic Auth in non-production environments
else if (process.env.HTPASSWD_FILE && isDev) {
  console.log('Using HTTP Basic Auth for development/testing');
  module.exports = require('./basic-auth');
}

// ❌ If neither is configured correctly, throw error
else {
  throw new Error('missing env vars: no authorization configuration found');
}
