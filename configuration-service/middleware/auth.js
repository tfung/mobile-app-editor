/**
 * Authentication middleware for the Configuration Service
 * Uses service-to-service authentication with API key + HMAC signature verification
 */

const crypto = require('crypto');

// Service API key for authentication
const SERVICE_API_KEY = process.env.SERVICE_API_KEY || 'service-key-main-app-to-config-service';

// Shared secret for HMAC signature (different from API key)
const SIGNATURE_SECRET = process.env.SIGNATURE_SECRET || 'signature-secret-change-in-production';

/**
 * Generate HMAC signature for a request
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {string} body - Request body (stringified JSON)
 * @param {string} timestamp - Request timestamp
 * @returns {string} HMAC signature
 */
function generateSignature(method, path, body, timestamp) {
  const payload = `${method}:${path}:${body}:${timestamp}`;
  return crypto
    .createHmac('sha256', SIGNATURE_SECRET)
    .update(payload)
    .digest('hex');
}

/**
 * Middleware to require authentication via service API key + signature verification
 * Requires:
 * - X-API-Key: Service API key
 * - X-User-Id: User identifier from trusted service
 * - X-Signature: HMAC signature of the request
 * - X-Timestamp: Request timestamp (for replay attack prevention)
 */
function requireAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];

  console.log('🔐 Auth Check:', {
    method: req.method,
    path: req.path,
    hasApiKey: !!apiKey,
    hasSignature: !!signature,
    hasTimestamp: !!timestamp,
    expectedKey: SERVICE_API_KEY,
    receivedKey: apiKey,
  });

  // 1. Check API key
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Provide X-API-Key header.',
    });
  }

  if (apiKey !== SERVICE_API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
  }

  // 2. Check user ID
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'X-User-Id header is required',
    });
  }

  // 3. Verify signature
  if (!signature) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'X-Signature header is required',
    });
  }

  if (!timestamp) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'X-Timestamp header is required',
    });
  }

  // 4. Check timestamp to prevent replay attacks (5 minute window)
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Date.now();
  const timeDiff = Math.abs(currentTime - requestTime);
  const fiveMinutes = 5 * 60 * 1000;

  if (timeDiff > fiveMinutes) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Request timestamp is too old. Possible replay attack.',
    });
  }

  // 5. Verify signature
  const body = req.body ? JSON.stringify(req.body) : '';

  // Use full path including base URL (req.baseUrl + req.path)
  // This matches what the client sends
  // Normalize by removing trailing slash (unless it's just '/')
  let fullPath = req.baseUrl + req.path;
  if (fullPath.length > 1 && fullPath.endsWith('/')) {
    fullPath = fullPath.slice(0, -1);
  }

  const expectedSignature = generateSignature(
    req.method,
    fullPath,
    body,
    timestamp
  );

  console.log('🔏 Signature Verification:', {
    method: req.method,
    path: req.path,
    baseUrl: req.baseUrl,
    fullPath,
    bodyLength: body.length,
    timestamp,
    receivedSignature: signature,
    expectedSignature,
    match: signature === expectedSignature,
  });

  if (signature !== expectedSignature) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid signature. Request may have been tampered with.',
    });
  }

  // All checks passed - attach user ID to request
  req.userId = userId;
  next();
}

module.exports = {
  requireAuth,
  generateSignature,
};
