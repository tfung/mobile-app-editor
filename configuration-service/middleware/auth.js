/**
 * Authentication middleware for the Configuration Service
 * Validates API key from headers and extracts user ID
 */

// In a real application, you would:
// 1. Store API keys in a database with associated user IDs
// 2. Use JWT tokens with proper signing
// 3. Implement rate limiting
// 4. Add request logging

// For demo purposes, we'll use simple API key validation
const VALID_API_KEYS = {
  'config-api-key-user-1': 'user-1',
  'config-api-key-user-2': 'user-2',
  'config-api-key-user-3': 'user-3',
};

/**
 * Middleware to require authentication via API key
 */
function requireAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Provide X-API-Key header.',
    });
  }

  const userId = VALID_API_KEYS[apiKey];

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
  }

  // Attach user ID to request for use in route handlers
  req.userId = userId;
  next();
}

module.exports = {
  requireAuth,
};
