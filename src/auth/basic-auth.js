const auth = require('http-auth');
const passport = require('passport');
const authPassport = require('http-auth-passport');
const logger = require('../logger');
const path = require('path'); // ✅ you're already importing it here

if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

logger.info('Using HTTP Basic Auth for auth');

module.exports.strategy = () =>
  authPassport(
    auth.basic({
      file: path.resolve(process.env.HTPASSWD_FILE), // ✅ use `path` directly
    })
  );

module.exports.authenticate = () => passport.authenticate('http', { session: false });
