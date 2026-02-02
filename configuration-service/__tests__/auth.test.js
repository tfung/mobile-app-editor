const crypto = require('crypto');

// Set environment variables BEFORE requiring the module
process.env.SERVICE_API_KEY = 'test-api-key';
process.env.SIGNATURE_SECRET = 'test-signature-secret';

// Now require the module after env vars are set
const { requireAuth, generateSignature } = require('../middleware/auth');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      method: 'GET',
      path: '/',
      baseUrl: '/api/configurations',
      body: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('generateSignature', () => {
    test('should generate consistent signatures', () => {
      const sig1 = generateSignature('GET', '/api/configurations', '', '1234567890');
      const sig2 = generateSignature('GET', '/api/configurations', '', '1234567890');
      expect(sig1).toBe(sig2);
    });

    test('should generate different signatures for different inputs', () => {
      const sig1 = generateSignature('GET', '/api/configurations', '', '1234567890');
      const sig2 = generateSignature('POST', '/api/configurations', '', '1234567890');
      expect(sig1).not.toBe(sig2);
    });

    test('should include body in signature', () => {
      const body = JSON.stringify({ data: 'test' });
      const sig1 = generateSignature('POST', '/api/configurations', body, '1234567890');
      const sig2 = generateSignature('POST', '/api/configurations', '', '1234567890');
      expect(sig1).not.toBe(sig2);
    });
  });

  describe('requireAuth', () => {
    test('should reject request without API key', () => {
      req.headers = {};

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'API key is required. Provide X-API-Key header.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid API key', () => {
      req.headers = {
        'x-api-key': 'wrong-key',
        'x-user-id': 'user-1',
        'x-signature': 'sig',
        'x-timestamp': Date.now().toString()
      };

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid API key'
      });
    });

    test('should reject request without user ID', () => {
      req.headers = {
        'x-api-key': 'test-api-key',
        'x-signature': 'sig',
        'x-timestamp': Date.now().toString()
      };

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'X-User-Id header is required'
      });
    });

    test('should reject request without signature', () => {
      req.headers = {
        'x-api-key': 'test-api-key',
        'x-user-id': 'user-1',
        'x-timestamp': Date.now().toString()
      };

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'X-Signature header is required'
      });
    });

    test('should reject request without timestamp', () => {
      req.headers = {
        'x-api-key': 'test-api-key',
        'x-user-id': 'user-1',
        'x-signature': 'sig'
      };

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'X-Timestamp header is required'
      });
    });

    test('should reject request with expired timestamp', () => {
      const oldTimestamp = (Date.now() - 6 * 60 * 1000).toString(); // 6 minutes ago
      const signature = generateSignature('GET', '/api/configurations', '', oldTimestamp);

      req.headers = {
        'x-api-key': 'test-api-key',
        'x-user-id': 'user-1',
        'x-signature': signature,
        'x-timestamp': oldTimestamp
      };

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Request timestamp is too old. Possible replay attack.'
      });
    });

    test('should reject request with invalid signature', () => {
      const timestamp = Date.now().toString();

      req.headers = {
        'x-api-key': 'test-api-key',
        'x-user-id': 'user-1',
        'x-signature': 'invalid-signature',
        'x-timestamp': timestamp
      };

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid signature. Request may have been tampered with.'
      });
    });

    test('should accept request with valid credentials', () => {
      const timestamp = Date.now().toString();
      const signature = generateSignature('GET', '/api/configurations', '', timestamp);

      req.headers = {
        'x-api-key': 'test-api-key',
        'x-user-id': 'user-1',
        'x-signature': signature,
        'x-timestamp': timestamp
      };

      requireAuth(req, res, next);

      expect(req.userId).toBe('user-1');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should handle trailing slash normalization', () => {
      const timestamp = Date.now().toString();
      // Client sends without trailing slash
      const signature = generateSignature('GET', '/api/configurations', '', timestamp);

      // Server sees trailing slash from Express
      req.baseUrl = '/api/configurations';
      req.path = '/';
      req.headers = {
        'x-api-key': 'test-api-key',
        'x-user-id': 'user-1',
        'x-signature': signature,
        'x-timestamp': timestamp
      };

      requireAuth(req, res, next);

      expect(req.userId).toBe('user-1');
      expect(next).toHaveBeenCalled();
    });

    test('should handle POST requests with body', () => {
      const timestamp = Date.now().toString();
      const body = JSON.stringify({ data: { test: 'value' } });
      const signature = generateSignature('POST', '/api/configurations', body, timestamp);

      req.method = 'POST';
      req.body = { data: { test: 'value' } };
      req.headers = {
        'x-api-key': 'test-api-key',
        'x-user-id': 'user-1',
        'x-signature': signature,
        'x-timestamp': timestamp
      };

      requireAuth(req, res, next);

      expect(req.userId).toBe('user-1');
      expect(next).toHaveBeenCalled();
    });

    test('should reject if body is tampered', () => {
      const timestamp = Date.now().toString();
      const body = JSON.stringify({ data: { test: 'value' } });
      const signature = generateSignature('POST', '/api/configurations', body, timestamp);

      req.method = 'POST';
      req.body = { data: { test: 'tampered' } }; // Different from signed body
      req.headers = {
        'x-api-key': 'test-api-key',
        'x-user-id': 'user-1',
        'x-signature': signature,
        'x-timestamp': timestamp
      };

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid signature. Request may have been tampered with.'
      });
    });

    test('should accept timestamp within 5-minute window', () => {
      const timestamp = (Date.now() - 4 * 60 * 1000).toString(); // 4 minutes ago
      const signature = generateSignature('GET', '/api/configurations', '', timestamp);

      req.headers = {
        'x-api-key': 'test-api-key',
        'x-user-id': 'user-1',
        'x-signature': signature,
        'x-timestamp': timestamp
      };

      requireAuth(req, res, next);

      expect(req.userId).toBe('user-1');
      expect(next).toHaveBeenCalled();
    });

    test('should accept future timestamps within 5-minute window', () => {
      const timestamp = (Date.now() + 4 * 60 * 1000).toString(); // 4 minutes in future
      const signature = generateSignature('GET', '/api/configurations', '', timestamp);

      req.headers = {
        'x-api-key': 'test-api-key',
        'x-user-id': 'user-1',
        'x-signature': signature,
        'x-timestamp': timestamp
      };

      requireAuth(req, res, next);

      expect(req.userId).toBe('user-1');
      expect(next).toHaveBeenCalled();
    });
  });
});
