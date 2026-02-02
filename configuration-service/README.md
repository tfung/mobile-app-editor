# Configuration Service

A secure REST API service for storing and managing mobile app home screen configurations. This service implements private service-to-service authentication using API keys and HMAC-SHA256 request signing.

## Features

- RESTful API for configuration CRUD operations
- HMAC-SHA256 request signature verification
- Replay attack prevention with timestamp validation
- SQLite database with WAL mode for data persistence
- Per-user configuration isolation
- Schema versioning support
- Input validation (URLs, hex colors, required fields)

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite with better-sqlite3
- **Authentication:** API Key + HMAC-SHA256 signatures

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd configuration-service
npm install
```

### Environment Variables

Create a `.env` file in the configuration-service directory:

```bash
# Server port
PORT=3001

# Main app URL (for CORS)
MAIN_APP_URL=http://localhost:3000

# Service API Key (must match main app)
SERVICE_API_KEY=service-key-main-app-to-config-service

# HMAC Signature Secret (must match main app)
# Generate with: openssl rand -hex 32
SIGNATURE_SECRET=signature-secret-change-in-production
```

**Security Note:** In production, generate strong secrets using `openssl rand -hex 32` and store them securely.

### Running the Service

```bash
node app.js

# The service will start on http://localhost:3001
```

## Architecture

### System Design

```
Main App (React Router)
  ↓ Server-side loaders/actions
Config Service Client
  ↓ HMAC-signed requests
Configuration Service (Express API)
  ↓ SQL queries with ownership filtering
SQLite Database (WAL mode)
```

### Database Schema

Configurations are stored in SQLite with the following structure:

```sql
CREATE TABLE configurations (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  data TEXT NOT NULL
);
```

**Storage Location:** `./data/configurations.db`

### Authentication & Security

The service implements a four-layer security approach:

1. **API Key Authentication:** Validates the service identity
2. **User ID Header:** Identifies which user's data to access (from trusted service)
3. **HMAC Signature Verification:** Ensures request integrity and prevents tampering
4. **Timestamp Validation:** Prevents replay attacks (5-minute window)

All requests must include these headers:
- `X-API-Key`: Service API key
- `X-User-Id`: User identifier
- `X-Signature`: HMAC-SHA256 signature of the request
- `X-Timestamp`: Unix timestamp in milliseconds

The signature is computed as:
```
HMAC-SHA256(SECRET, "METHOD:PATH:BODY:TIMESTAMP")
```

---

# API Contract

## Base URL

```
http://localhost:3001/api/configurations
```

## Authentication

All endpoints require the following headers:

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `X-API-Key` | string | Yes | Service API key for service-to-service auth |
| `X-User-Id` | string | Yes | User identifier from trusted service |
| `X-Signature` | string | Yes | HMAC-SHA256 signature of the request |
| `X-Timestamp` | string | Yes | Unix timestamp in milliseconds |

### HMAC Signature Generation

To generate a valid signature:

1. **Construct the payload string:**
   ```
   METHOD:PATH:BODY:TIMESTAMP
   ```
   - `METHOD`: HTTP method (GET, POST, PUT, DELETE)
   - `PATH`: Full path (e.g., `/api/configurations`)
   - `BODY`: JSON stringified request body (empty string `''` for GET/DELETE)
   - `TIMESTAMP`: Unix timestamp in milliseconds

2. **Generate HMAC-SHA256 signature:**
   ```javascript
   const crypto = require('crypto');

   const payload = `${method}:${path}:${body}:${timestamp}`;
   const signature = crypto
     .createHmac('sha256', SIGNATURE_SECRET)
     .update(payload)
     .digest('hex');
   ```

### Example Signature Generation (Node.js)

```javascript
const crypto = require('crypto');

const method = 'GET';
const path = '/api/configurations';
const body = '';  // Empty for GET requests
const timestamp = Date.now().toString();
const secret = 'signature-secret-change-in-production';

const payload = `${method}:${path}:${body}:${timestamp}`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

console.log('Timestamp:', timestamp);
console.log('Signature:', signature);
```

---

## Configuration Object Schema

All configuration responses include these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique configuration identifier (UUID) |
| `schemaVersion` | number | Configuration schema version |
| `createdBy` | string | User ID who created the configuration |
| `createdAt` | number | Creation timestamp (Unix ms) |
| `updatedAt` | number | Last update timestamp (Unix ms) |
| `data` | object | Configuration payload (see below) |

### Data Object Schema

The `data` field contains the home screen configuration:

```typescript
{
  carousel: {
    images: Array<{
      url: string;      // Must be valid URL
      alt: string;      // Alt text for image
    }>;
    aspectRatio: 'portrait' | 'landscape' | 'square';
  };
  textSection: {
    title: string;
    description: string;
    titleColor: string;        // Hex color: #RRGGBB
    descriptionColor: string;  // Hex color: #RRGGBB
  };
  cta: {
    label: string;
    url: string;               // Must be valid URL
    backgroundColor: string;   // Hex color: #RRGGBB
    textColor: string;         // Hex color: #RRGGBB
  };
}
```

### Validation Rules

**Carousel:**
- At least one image is required
- Each image `url` must be a valid URL format
- `aspectRatio` must be one of: `portrait`, `landscape`, `square`

**Text Section:**
- `title` and `description` must be non-empty strings
- `titleColor` and `descriptionColor` must be valid hex colors (e.g., `#000000`)

**CTA (Call-to-Action):**
- `label` and `url` must be non-empty strings
- `url` must be a valid URL format
- `backgroundColor` and `textColor` must be valid hex colors (e.g., `#007AFF`)

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common error types:
- `Unauthorized`: Authentication failed
- `Bad Request`: Validation error
- `Not Found`: Resource not found
- `Internal Server Error`: Server error

---

## Endpoints

### 1. List All Configurations

Get all configurations for the authenticated user.

```http
GET /api/configurations
```

**Headers:**
```
X-API-Key: service-key-main-app-to-config-service
X-User-Id: user-1
X-Signature: <hmac-signature>
X-Timestamp: 1234567890123
```

**Success Response:** `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "schemaVersion": 1,
    "createdBy": "user-1",
    "createdAt": 1234567890000,
    "updatedAt": 1234567890000,
    "data": {
      "carousel": {
        "images": [
          {
            "url": "https://placehold.co/400x600",
            "alt": "Example image"
          }
        ],
        "aspectRatio": "portrait"
      },
      "textSection": {
        "title": "Welcome to Our App",
        "description": "Get started with our amazing features",
        "titleColor": "#000000",
        "descriptionColor": "#666666"
      },
      "cta": {
        "label": "Get Started",
        "url": "https://example.com/start",
        "backgroundColor": "#007AFF",
        "textColor": "#FFFFFF"
      }
    }
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Invalid API key, signature, or expired timestamp
- `500 Internal Server Error`: Database or server error

---

### 2. Get Configuration by ID

Retrieve a specific configuration by its ID.

```http
GET /api/configurations/:id
```

**Path Parameters:**
- `id` (string): Configuration UUID

**Headers:**
```
X-API-Key: service-key-main-app-to-config-service
X-User-Id: user-1
X-Signature: <hmac-signature>
X-Timestamp: 1234567890123
```

**Success Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "schemaVersion": 1,
  "createdBy": "user-1",
  "createdAt": 1234567890000,
  "updatedAt": 1234567890000,
  "data": {
    "carousel": { /* ... */ },
    "textSection": { /* ... */ },
    "cta": { /* ... */ }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid authentication
- `404 Not Found`: Configuration not found or user doesn't have access
- `500 Internal Server Error`: Server error

---

### 3. Create Configuration

Create a new configuration for the authenticated user.

```http
POST /api/configurations
```

**Headers:**
```
Content-Type: application/json
X-API-Key: service-key-main-app-to-config-service
X-User-Id: user-1
X-Signature: <hmac-signature>
X-Timestamp: 1234567890123
```

**Request Body:**

```json
{
  "data": {
    "carousel": {
      "images": [
        {
          "url": "https://placehold.co/400x600",
          "alt": "Welcome screen"
        }
      ],
      "aspectRatio": "portrait"
    },
    "textSection": {
      "title": "Welcome to Our App",
      "description": "Get started with our amazing features",
      "titleColor": "#000000",
      "descriptionColor": "#666666"
    },
    "cta": {
      "label": "Get Started",
      "url": "https://example.com/start",
      "backgroundColor": "#007AFF",
      "textColor": "#FFFFFF"
    }
  }
}
```

**Success Response:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "schemaVersion": 1,
  "createdBy": "user-1",
  "createdAt": 1234567890000,
  "updatedAt": 1234567890000,
  "data": {
    /* submitted configuration data */
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid data format or validation error
  ```json
  {
    "error": "Validation Error",
    "message": "Title color must be a valid hex color (e.g., #000000)"
  }
  ```
- `401 Unauthorized`: Invalid authentication
- `500 Internal Server Error`: Server error

---

### 4. Update Configuration

Update an existing configuration. Only the owner can update their configurations.

```http
PUT /api/configurations/:id
```

**Path Parameters:**
- `id` (string): Configuration UUID

**Headers:**
```
Content-Type: application/json
X-API-Key: service-key-main-app-to-config-service
X-User-Id: user-1
X-Signature: <hmac-signature>
X-Timestamp: 1234567890123
```

**Request Body:**

```json
{
  "data": {
    "carousel": { /* updated carousel */ },
    "textSection": { /* updated text section */ },
    "cta": { /* updated CTA */ }
  }
}
```

**Success Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "schemaVersion": 1,
  "createdBy": "user-1",
  "createdAt": 1234567890000,
  "updatedAt": 1234567999999,
  "data": {
    /* updated configuration data */
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid authentication
- `404 Not Found`: Configuration not found or user doesn't have access
- `500 Internal Server Error`: Server error

---

### 5. Delete Configuration

Delete a configuration. Only the owner can delete their configurations.

```http
DELETE /api/configurations/:id
```

**Path Parameters:**
- `id` (string): Configuration UUID

**Headers:**
```
X-API-Key: service-key-main-app-to-config-service
X-User-Id: user-1
X-Signature: <hmac-signature>
X-Timestamp: 1234567890123
```

**Success Response:** `204 No Content`

No response body.

**Error Responses:**
- `401 Unauthorized`: Invalid authentication
- `404 Not Found`: Configuration not found or user doesn't have access
- `500 Internal Server Error`: Server error

---

## Testing the API

### Using cURL

First, generate a signature:

```javascript
// generate-signature.js
const crypto = require('crypto');

const method = 'GET';
const path = '/api/configurations';
const body = '';
const timestamp = Date.now().toString();
const secret = 'signature-secret-change-in-production';

const payload = `${method}:${path}:${body}:${timestamp}`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

console.log('Timestamp:', timestamp);
console.log('Signature:', signature);
```

Then use with cURL:

```bash
# List all configurations
curl -X GET http://localhost:3001/api/configurations \
  -H "X-API-Key: service-key-main-app-to-config-service" \
  -H "X-User-Id: user-1" \
  -H "X-Signature: <generated-signature>" \
  -H "X-Timestamp: <timestamp>"
```

```bash
# Create a configuration
# Note: Generate signature with the JSON body included
curl -X POST http://localhost:3001/api/configurations \
  -H "Content-Type: application/json" \
  -H "X-API-Key: service-key-main-app-to-config-service" \
  -H "X-User-Id: user-1" \
  -H "X-Signature: <generated-signature>" \
  -H "X-Timestamp: <timestamp>" \
  -d '{
    "data": {
      "carousel": {
        "images": [{"url": "https://placehold.co/400x600", "alt": "Image"}],
        "aspectRatio": "portrait"
      },
      "textSection": {
        "title": "Welcome",
        "description": "Test description",
        "titleColor": "#000000",
        "descriptionColor": "#666666"
      },
      "cta": {
        "label": "Get Started",
        "url": "https://example.com",
        "backgroundColor": "#007AFF",
        "textColor": "#FFFFFF"
      }
    }
  }'
```

---

## Security Considerations

### Authentication Flow

1. Main app receives user request
2. Server-side loader/action extracts user ID from session
3. Client generates timestamp and request signature
4. Request sent to Configuration Service with all auth headers
5. Configuration Service verifies:
   - API key matches
   - Timestamp is within 5-minute window
   - Signature is valid for the request
   - User ID is attached to database queries

### Replay Attack Prevention

- Requests with timestamps older than 5 minutes are rejected
- This accounts for minor clock skew between services
- Each request should use a fresh timestamp

### Authorization

- All database queries filter by `created_by = userId`
- Users can only access their own configurations
- User ID comes from trusted authentication headers (never from client)

### Private Authentication

- API keys and signature secrets live only on the server
- Credentials are never exposed to the browser
- Client-side code cannot directly call the Configuration Service

---

## Database Management

### Backup

To backup the database, copy these files:
```bash
cp data/configurations.db data/configurations.db.backup
cp data/configurations.db-wal data/configurations.db-wal.backup
cp data/configurations.db-shm data/configurations.db-shm.backup
```

### Viewing Data

```bash
sqlite3 data/configurations.db "SELECT * FROM configurations;"
```

---

## Testing

### Automated Tests

The service includes comprehensive unit and integration tests:

**Test Coverage (38 tests):**
- Input validation (40+ test cases)
- HMAC authentication (20+ test cases)

**Running Tests:**

```bash
# Run all tests with coverage
npm test

# Run in watch mode
npm run test:watch

# View coverage report
# After running tests, open: coverage/index.html
```

**Test Framework:**
- Jest for testing
- Supertest for API integration tests
- In-memory SQLite for test isolation

**What's Tested:**
- Valid configurations (all aspect ratios, multiple images)
- Invalid configurations (missing fields, invalid formats)
- Hex color validation (#RRGGBB format)
- URL validation
- HMAC signature generation and verification
- API key validation
- User ID requirement
- Timestamp validation (5-minute window)
- Replay attack prevention
- Request tampering detection
- Trailing slash normalization

See [TESTING.md](../TESTING.md) for detailed testing guide.

---

## Troubleshooting

### "Invalid signature" errors

1. Ensure `SIGNATURE_SECRET` matches between main app and configuration service
2. Verify timestamp is current (within 5 minutes)
3. Check that signature payload format matches exactly:
   - Method should be uppercase (GET, POST, PUT, DELETE)
   - Path should include full path (e.g., `/api/configurations`)
   - Body should be JSON.stringify() output for POST/PUT, or empty string for GET/DELETE
4. Ensure no trailing slashes in path

### "Request timestamp is too old" errors

- Server and client clocks are out of sync by more than 5 minutes
- Synchronize system clocks or adjust the timestamp window in middleware

### CORS errors

- Verify `MAIN_APP_URL` in `.env` matches your main app's URL
- Check that all required headers are in `Access-Control-Allow-Headers`

### Database locked errors

- SQLite WAL mode should prevent most locking issues
- Ensure only one process is accessing the database
- Check file permissions on the database directory

---

## Production Deployment

Before deploying to production:

1. **Secrets Management:**
   - Generate strong secrets: `openssl rand -hex 32`
   - Use environment variables or secret management service
   - Never commit secrets to version control

2. **Environment Configuration:**
   - Set appropriate `PORT` and `MAIN_APP_URL`
   - Configure CORS for production domain

3. **Database:**
   - Consider PostgreSQL or MySQL for production scale
   - Implement backup strategy
   - Set up monitoring for database size and performance

4. **Security:**
   - Enable HTTPS/TLS
   - Add rate limiting (e.g., express-rate-limit)
   - Implement request logging
   - Set up monitoring and alerting

5. **Performance:**
   - Add caching layer if needed
   - Monitor API response times
   - Consider horizontal scaling if needed

---

## License

MIT
