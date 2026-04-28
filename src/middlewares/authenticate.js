const { admin } = require('../config/firebase');
const { ApiError } = require('../utils/apiError');

async function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Missing bearer token'));
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'Invalid Firebase ID token'));
  }
}

module.exports = { authenticate };
