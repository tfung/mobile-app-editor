# Configuration Service

A standalone Express.js API service for managing mobile app home screen configurations.

## Features

- RESTful API for configuration management (CRUD operations)
- SQLite database with WAL mode for better concurrency
- API key authentication
- Request validation (hex colors, URLs, required fields)
- Ownership verification (users can only access their own configs)

## Architecture

This service acts as the **Configuration Service** layer in the application architecture:

```
Main App (React Router)
  ↓ Server-side fetch with session forwarding
Configuration Service (Express API)
  ↓ SQL queries
SQLite Database
```

## Installation

```bash
cd configuration-service
npm install
```

## Running the Service

```bash
npm start
```

The service will start on `http://localhost:3001`

## API Endpoints

All endpoints require authentication via multiple security headers.

### Authentication

**Required Headers:**
```
X-API-Key: service-key-main-app-to-config-service
X-User-Id: user-1
X-Signature: <hmac-sha256-signature>
X-Timestamp: <unix-timestamp-ms>
```

**Security Layers:**
1. **API Key**: Service-to-service authentication
2. **User ID**: Identifies which user's data to access
3. **HMAC Signature**: Prevents request tampering
4. **Timestamp**: Prevents replay attacks (5-minute window)

**Signature Generation:**
```javascript
const payload = `${method}:${path}:${body}:${timestamp}`;
const signature = crypto
  .createHmac('sha256', SIGNATURE_SECRET)
  .update(payload)
  .digest('hex');
```

### Endpoints

#### GET /api/configurations
List all configurations for the authenticated user

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "schemaVersion": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "data": { /* HomeScreenConfig */ }
  }
]
```

#### GET /api/configurations/:id
Get a specific configuration by ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "schemaVersion": 1,
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "data": { /* HomeScreenConfig */ }
}
```

**Errors:**
- `404 Not Found` - Configuration doesn't exist or user doesn't own it

#### POST /api/configurations
Create a new configuration

**Request Body:**
```json
{
  "data": {
    "carousel": {
      "images": [
        { "url": "https://example.com/image.jpg", "alt": "Description" }
      ],
      "aspectRatio": "portrait"
    },
    "textSection": {
      "title": "Welcome",
      "description": "Description text",
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
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "schemaVersion": 1,
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "data": { /* HomeScreenConfig */ }
}
```

**Errors:**
- `400 Bad Request` - Invalid configuration format

#### PUT /api/configurations/:id
Update an existing configuration

**Request Body:** Same as POST

**Response:** `200 OK`

**Errors:**
- `404 Not Found` - Configuration doesn't exist or user doesn't own it
- `400 Bad Request` - Invalid configuration format

#### DELETE /api/configurations/:id
Delete a configuration

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` - Configuration doesn't exist or user doesn't own it

## Validation Rules

The API validates all configurations with the following rules:

### Carousel
- At least one image required
- Each image must have valid URL and alt text
- Aspect ratio must be: `portrait`, `landscape`, or `square`

### Text Section
- Title and description are required strings
- Colors must be valid hex format: `#RRGGBB` (e.g., `#000000`)

### CTA (Call-to-Action)
- Label and URL are required strings
- URL must be valid format
- Colors must be valid hex format: `#RRGGBB`

## Example cURL Requests

### List all configurations
```bash
curl -X GET http://localhost:3001/api/configurations \
  -H "X-API-Key: config-api-key-user-1"
```

### Create a configuration
```bash
curl -X POST http://localhost:3001/api/configurations \
  -H "X-API-Key: config-api-key-user-1" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "carousel": {
        "images": [{"url": "https://placehold.co/400x600", "alt": "Image"}],
        "aspectRatio": "portrait"
      },
      "textSection": {
        "title": "Welcome",
        "description": "Test",
        "titleColor": "#000000",
        "descriptionColor": "#666666"
      },
      "cta": {
        "label": "Start",
        "url": "https://example.com",
        "backgroundColor": "#007AFF",
        "textColor": "#FFFFFF"
      }
    }
  }'
```

### Get a specific configuration
```bash
curl -X GET http://localhost:3001/api/configurations/{id} \
  -H "X-API-Key: config-api-key-user-1"
```

### Update a configuration
```bash
curl -X PUT http://localhost:3001/api/configurations/{id} \
  -H "X-API-Key: config-api-key-user-1" \
  -H "Content-Type: application/json" \
  -d '{
    "data": { /* updated config */ }
  }'
```

### Delete a configuration
```bash
curl -X DELETE http://localhost:3001/api/configurations/{id} \
  -H "X-API-Key: config-api-key-user-1"
```

## Database

The service uses SQLite with Write-Ahead Logging (WAL) mode for better concurrency. The database file is created at:

```
configuration-service/configurations.db
```

## Security Features

- ✅ API key authentication
- ✅ Ownership verification (users can only access their own configs)
- ✅ Input validation (URLs, hex colors, required fields)
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS configuration for specific origins

## Integration with Main App

Update your main app's `createSessionFetch` calls to point to this service:

```typescript
const response = await sessionFetch('http://localhost:3001/api/configurations', {
  headers: {
    'X-API-Key': 'config-api-key-user-1', // Map from user session
  },
});
```

## Production Considerations

Before deploying to production:

1. **Authentication**: Replace demo API keys with proper key management (database, JWT, OAuth)
2. **Environment Variables**: Use `.env` file for configuration
3. **Rate Limiting**: Add rate limiting middleware (e.g., `express-rate-limit`)
4. **Logging**: Implement structured logging (e.g., Winston, Pino)
5. **Monitoring**: Add health checks and metrics
6. **CORS**: Configure allowed origins properly
7. **HTTPS**: Use TLS/SSL in production
8. **Database**: Consider PostgreSQL or MySQL for production scale

## License

ISC
