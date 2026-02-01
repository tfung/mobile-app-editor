/**
 * Authentication middleware for the Configuration Service
 * Uses service-to-service authentication with a single trusted service key
 */

// Service API key for main app authentication
const SERVICE_API_KEY = process.env.SERVICE_API_KEY || 'service-key-main-app-to-config-service';

/**
 * Middleware to require authentication via service API key
 * Requires both X-API-Key (service key) and X-User-Id (user identifier) headers
 */
function requireAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Provide X-API-Key header.',
    });
  }

  // Verify service API key
  if (apiKey !== SERVICE_API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
  }

  // Require user ID from trusted service
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'X-User-Id header is required',
    });
  }

  // Attach user ID to request for use in route handlers
  req.userId = userId;
  next();
}

module.exports = {
  requireAuth,
};
