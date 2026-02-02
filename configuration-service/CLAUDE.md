# Claude Context: Configuration Service (Express API)

Context for AI assistants working on the Configuration Service.

## Service Role

This is the **backend API service** responsible for:
- Storing and retrieving configurations
- Authentication and authorization
- Data validation
- Business logic enforcement

## Key Files

```
configuration-service/
├── app.js                          # Express server setup
├── db.js                           # SQLite database operations
├── middleware/
│   ├── auth.js                     # HMAC authentication
│   └── validation.js               # Input validation
├── routes/
│   └── configurations.js           # REST API endpoints
└── __tests__/
    ├── validation.test.js          # Validation unit tests (40+ tests)
    └── auth.test.js                # Auth middleware tests (20+ tests)
```

## Critical Security Layers

### 1. HMAC Authentication (middleware/auth.js)

Four-layer authentication:

```javascript
// Layer 1: API Key verification
if (apiKey !== SERVICE_API_KEY) return 401;

// Layer 2: User ID required
if (!userId) return 401;

// Layer 3: HMAC signature verification
const payload = `${method}:${path}:${body}:${timestamp}`;
const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
if (signature !== expectedSig) return 401;

// Layer 4: Timestamp validation (5-minute window)
if (Date.now() - timestamp > 5 * 60 * 1000) return 401;
```

**Rules:**
- NEVER skip any authentication layer
- NEVER allow requests without all 4 headers
- ALWAYS verify signature matches exactly
- ALWAYS check timestamp freshness
- Path normalization removes trailing slashes

### 2. Input Validation (middleware/validation.js)

```javascript
// Validates entire HomeScreenConfig structure
function validateConfig(data) {
  // Check carousel
  if (!Array.isArray(data.carousel.images)) return error;
  if (images.length === 0) return error;

  // Validate URLs
  for (image of images) {
    new URL(image.url);  // Throws if invalid
  }

  // Validate hex colors
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(color)) return error;

  // Validate aspect ratio
  if (!['portrait', 'landscape', 'square'].includes(ratio)) return error;
}
```

**Rules:**
- Validate ALL fields
- Use `new URL()` for URL validation (throws on invalid)
- Hex colors MUST be exactly `#RRGGBB` format
- At least one carousel image required
- Return descriptive error messages

### 3. Ownership Verification (db.js)

```javascript
// ALWAYS filter by user ID
function getConfigById(id, userId) {
  return db.prepare('SELECT * FROM configurations WHERE id = ? AND created_by = ?')
    .get(id, userId);
}

function updateConfig(id, userId, data) {
  return db.prepare('UPDATE configurations SET data = ?, updated_at = ? WHERE id = ? AND created_by = ?')
    .run(JSON.stringify(data), Date.now(), id, userId);
}
```

**Rules:**
- EVERY query MUST include `created_by = ?`
- NEVER trust user ID from client (comes from auth headers)
- Users can only access their own configurations
- Return 404 for configs user doesn't own (not 403)

## Database Schema

```sql
CREATE TABLE configurations (
  id TEXT PRIMARY KEY,              -- UUID v4
  schema_version INTEGER NOT NULL,  -- Current: 1
  created_by TEXT NOT NULL,         -- User ID for isolation
  created_at INTEGER NOT NULL,      -- Unix timestamp (ms)
  updated_at INTEGER NOT NULL,      -- Unix timestamp (ms)
  data TEXT NOT NULL                -- JSON string of HomeScreenConfig
);
```

**Storage location:** `./data/configurations.db`

**Important:**
- SQLite with WAL mode enabled
- `data` column stores JSON as TEXT
- `schema_version` allows future migrations
- All timestamps in Unix milliseconds

## API Endpoints

### GET /api/configurations

List all configs for authenticated user.

```javascript
router.get('/', requireAuth, (req, res) => {
  const configs = getAllConfigs(req.userId);  // userId from auth middleware
  res.json(configs);
});
```

### GET /api/configurations/:id

Get specific config by ID.

```javascript
router.get('/:id', requireAuth, (req, res) => {
  const config = getConfigById(req.params.id, req.userId);
  if (!config) return res.status(404).json({ error: 'Not Found' });
  res.json(config);
});
```

### POST /api/configurations

Create new config.

```javascript
router.post('/', requireAuth, validateConfigMiddleware, (req, res) => {
  const config = createConfig(req.userId, req.body.data);
  res.status(201).json(config);
});
```

**Rules:**
- Validation middleware runs before handler
- Returns 201 Created on success
- Auto-generates UUID for `id`
- Sets `schema_version` to 1
- Sets timestamps to current time

### PUT /api/configurations/:id

Update existing config.

```javascript
router.put('/:id', requireAuth, validateConfigMiddleware, (req, res) => {
  const config = updateConfig(req.params.id, req.userId, req.body.data);
  res.json(config);
});
```

**Rules:**
- Validation middleware runs before handler
- Returns 404 if not found or not owned
- Only updates `data` and `updated_at`
- `created_at` and `created_by` never change

### DELETE /api/configurations/:id

Delete config.

```javascript
router.delete('/:id', requireAuth, (req, res) => {
  const deleted = deleteConfig(req.params.id, req.userId);
  if (!deleted) return res.status(404).json({ error: 'Not Found' });
  res.status(204).send();
});
```

**Rules:**
- Returns 204 No Content on success
- Returns 404 if not found or not owned
- No response body on success

## Environment Variables

```bash
PORT=3001                                    # Server port
MAIN_APP_URL=http://localhost:3000         # For CORS
SERVICE_API_KEY=service-key-main-app-to-config-service
SIGNATURE_SECRET=signature-secret-change-in-production  # MUST match Main App
```

**Critical:**
- `SIGNATURE_SECRET` must match Main App exactly
- `SERVICE_API_KEY` must match Main App's `CONFIG_SERVICE_API_KEY`
- Never commit secrets to version control

## Common Tasks

### Add New Validation Rule

In `middleware/validation.js`:

```javascript
function validateConfig(data) {
  // ... existing validation ...

  // Add new rule
  if (data.textSection.title.length > 100) {
    return 'Title must be 100 characters or less';
  }

  return null;  // Valid
}
```

### Add New Endpoint

In `routes/configurations.js`:

```javascript
// 1. Add route with auth middleware
router.get('/search', requireAuth, (req, res) => {
  // 2. Get userId from auth middleware
  const { query } = req.query;

  // 3. Call db function with userId
  const results = searchConfigs(req.userId, query);

  // 4. Return JSON
  res.json(results);
});
```

### Change Schema Version

When updating config structure:

1. Increment `SCHEMA_VERSION` in db.js
2. Add migration logic for old versions
3. Update validation rules
4. Update API documentation
5. Test with old and new configs

## Error Response Format

All errors follow this structure:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

**Error types:**
- `Unauthorized`: Authentication failed (401)
- `Bad Request`: Validation error (400)
- `Not Found`: Resource not found (404)
- `Internal Server Error`: Server error (500)

## CORS Configuration

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', MAIN_APP_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-User-Id, X-Signature, X-Timestamp');
  // ...
});
```

**Rules:**
- Only allow Main App origin
- Include all auth headers in allowed headers
- Handle OPTIONS preflight requests

## Automated Testing

**Test Coverage (38 tests):**
- Input validation (40+ test cases)
- HMAC authentication (20+ test cases)

**Running Tests:**
```bash
npm test              # Run all tests with coverage
npm run test:watch    # Watch mode
```

**Test Framework:**
- Jest for unit tests
- Supertest for API integration tests
- In-memory SQLite for test isolation

**What's Tested:**
- **Validation**: Valid configs, invalid formats, hex colors, URLs, aspect ratios, edge cases
- **Authentication**: Signature generation, API key validation, timestamp validation, replay prevention, request tampering detection, trailing slash normalization

**Coverage:**
- Validation: 76.47% statements, 84.48% branches
- Auth: 100% statements, 87.5% branches

See [TESTING.md](../TESTING.md) for full guide.

## Manual Testing with cURL

Generate signature first:

```javascript
// generate-signature.js
const crypto = require('crypto');
const method = 'GET';
const path = '/api/configurations';
const body = '';
const timestamp = Date.now().toString();
const secret = 'signature-secret-change-in-production';

const payload = `${method}:${path}:${body}:${timestamp}`;
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

console.log('Timestamp:', timestamp);
console.log('Signature:', signature);
```

Then use with cURL:

```bash
curl -X GET http://localhost:3001/api/configurations \
  -H "X-API-Key: service-key-main-app-to-config-service" \
  -H "X-User-Id: user-1" \
  -H "X-Signature: <signature>" \
  -H "X-Timestamp: <timestamp>"
```

## Common Issues

**"Invalid signature" errors**
1. Check `SIGNATURE_SECRET` matches Main App
2. Verify payload construction: `METHOD:PATH:BODY:TIMESTAMP`
3. For GET/DELETE, body must be empty string `''`
4. For POST/PUT, body must be `JSON.stringify(req.body)`
5. Path normalization removes trailing slashes

**"Request timestamp is too old"**
- Timestamp must be within 5 minutes
- Check system clocks are synchronized
- Generate fresh timestamp for each request

**Database locked errors**
- WAL mode should prevent most locks
- Ensure only one process accesses database
- Check file permissions on database directory

## Security Checklist

- [ ] All endpoints require authentication
- [ ] All database queries filter by `created_by`
- [ ] All inputs are validated
- [ ] Secrets are in environment variables
- [ ] CORS restricted to Main App only
- [ ] Error messages don't leak sensitive info
- [ ] Timestamps validated for replay prevention
- [ ] HMAC signatures verified correctly

## Red Flags

- 🚩 Endpoint without `requireAuth` middleware
- 🚩 Database query without `created_by` filter
- 🚩 Hardcoded secrets or API keys
- 🚩 CORS allowing all origins (`*`)
- 🚩 Missing input validation
- 🚩 Exposing internal error details to client
- 🚩 Trusting client-provided user ID

## Architecture Notes

This service is:
- **Stateless**: No session storage
- **Isolated**: Users can't access each other's data
- **Validated**: All inputs checked before persistence
- **Authenticated**: Four-layer security

Don't add:
- UI components
- User authentication (trust Main App's user ID)
- Complex business logic (keep it simple)

Do add:
- Input validation for all new fields
- Database queries with ownership filtering
- Consistent error handling
- Clear API documentation
