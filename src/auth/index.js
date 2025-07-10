// Make sure our env isn't configured for both AWS Cognito and HTTP Basic Auth.
// We can only do one or the other.  If your .env file contains all 3 of these
// variables, something is wrong.  It should have AWS_COGNITO_POOL_ID and
// AWS_COGNITO_CLIENT_ID together OR HTPASSWD_FILE on its own.

const logger = require('../logger');
let authModule;

if (
  process.env.AWS_COGNITO_POOL_ID &&
  process.env.AWS_COGNITO_CLIENT_ID &&
  process.env.HTPASSWD_FILE
) {
  throw new Error(
    'env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.'
  );
}

if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  logger.info('Auth index: Using AWS Cognito strategy');
  authModule = require('./cognito');
} else if (process.env.HTPASSWD_FILE && process.env.NODE_ENV !== 'production') {
  logger.info('Auth index: Using HTTP Basic Auth strategy');
  authModule = require('./basic-auth');
} else {
  throw new Error('missing env vars: no authorization configuration found');
}

module.exports.strategy = authModule.strategy;
module.exports.authenticate = authModule.authenticate;
