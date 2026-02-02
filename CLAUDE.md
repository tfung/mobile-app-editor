# Claude Context: Mobile App Home Screen Editor

This file provides context for AI assistants working on this codebase.

## Project Overview

A full-stack application for configuring mobile app home screens with real-time preview. Consists of two separate services with HMAC-authenticated communication.

## Architecture Quick Reference

```
Browser → Main App (React Router, port 3000) → Configuration Service (Express, port 3001) → SQLite
```

**Key principle:** Browser NEVER directly calls Configuration Service. All API calls mediated through server-side loaders/actions.

## Project Structure

```
mobile-app-editor/
├── mobile-app-editor-app/     # React Router app (TypeScript)
│   └── app/__tests__/         # Component & context tests (Vitest)
├── configuration-service/     # Express API (JavaScript)
│   └── __tests__/             # Validation & auth tests (Jest)
└── TESTING.md                 # Comprehensive testing guide
```

## Critical Patterns to Maintain

### 1. Authentication Flow
- Configuration Service requires 4 headers: `X-API-Key`, `X-User-Id`, `X-Signature`, `X-Timestamp`
- HMAC signature format: `HMAC-SHA256("METHOD:PATH:BODY:TIMESTAMP")`
- `SIGNATURE_SECRET` must match in both services' `.env` files
- Timestamp validation: 5-minute window for replay attack prevention

### 2. Server-Side Mediation
- NEVER add direct browser-to-Configuration-Service calls
- Always use React Router loaders (for fetching) and actions (for mutations)
- User ID comes from session, NEVER trust client-provided user ID

### 3. Data Ownership
- All database queries MUST filter by `created_by = userId`
- User isolation is enforced at the database level
- Never expose other users' configurations

### 4. Schema Versioning
- All configs have `schemaVersion` field
- Current version: 1
- Future schema changes: increment version, handle migration

## Common Tasks

### Adding a New Configuration Field

1. Update TypeScript type in `mobile-app-editor-app/app/mobile-app-editor/types.ts`
2. Update validation in `configuration-service/middleware/validation.js`
3. Update Editor component to add input field
4. Update Preview component to display field
5. Test: Edit, save, reload page

### Adding a New API Endpoint

1. Add route in `configuration-service/routes/configurations.js`
2. Add authentication: `router.METHOD('/', requireAuth, handler)`
3. Add validation if needed
4. Update Configuration Service README with API contract
5. Add client function in `mobile-app-editor-app/app/services/config-service-client.ts`
6. Use in loader/action

### Debugging Authentication Issues

1. Check both `.env` files have matching `SIGNATURE_SECRET`
2. Verify Configuration Service is running on port 3001
3. Check timestamp is current (within 5 minutes)
4. Verify path matches exactly (no trailing slash mismatches)
5. Confirm body is JSON.stringify() for POST/PUT, empty string for GET/DELETE

## Important Constraints

### NEVER:
- ❌ Add direct browser fetch to Configuration Service
- ❌ Expose API keys or secrets to browser
- ❌ Trust user ID from client side
- ❌ Skip authentication on Configuration Service endpoints
- ❌ Allow cross-user data access
- ❌ Modify HMAC signature algorithm without updating both services

### ALWAYS:
- ✅ Use server-side loaders/actions for API calls
- ✅ Validate inputs on both client and server
- ✅ Filter database queries by userId
- ✅ Include all 4 auth headers in Configuration Service requests
- ✅ Generate fresh timestamp for each request
- ✅ Keep SIGNATURE_SECRET in sync between services

## File Modification Guidelines

### React Components
- **Editor.tsx**: Use EditorContext for state, useFetcher for saves
- **Preview.tsx**: Pure presentational, reads from EditorContext
- **EditorContext.tsx**: Single source of truth for in-memory state

### API Routes
- **mobile-app-editor.tsx**: Server-side loader/action, extracts userId from session
- **config-service-client.ts**: Handles HMAC signing, never call directly from browser

### Configuration Service
- **auth.js**: Authentication middleware, verifies all 4 security layers
- **validation.js**: Schema validation, checks hex colors, URLs, required fields
- **db.js**: Database operations, ALWAYS filters by userId

## State Management Pattern

```typescript
// In-memory editing state (EditorContext)
User edits → State updates → Preview re-renders

// Persistence
User clicks Save → fetcher.submit → Server action → API call → Database
Page reload → Server loader → API call → Hydrate EditorContext
```

## Testing Strategy

### Automated Tests (58 total)

**Configuration Service (38 tests):**
- Validation logic (40+ test cases)
- Authentication middleware (20+ test cases)
- Run with: `cd configuration-service && npm test`

**Main App (20 tests):**
- EditorContext state management (6 tests)
- Preview component rendering (14 tests)
- Run with: `cd mobile-app-editor-app && npm test`

**Test Frameworks:**
- Configuration Service: Jest + Supertest
- Main App: Vitest + React Testing Library

See [TESTING.md](TESTING.md) for complete guide.

### Manual Testing

When testing manually:
1. Test with multiple users to ensure isolation
2. Test page reload to verify persistence
3. Test import/export JSON functionality
4. Test all validation (colors, URLs, required fields)
5. Test authentication failures (wrong key, expired timestamp)

## Environment Variables

Both services need:
- `SIGNATURE_SECRET` - MUST match exactly
- `SERVICE_API_KEY` / `CONFIG_SERVICE_API_KEY` - MUST match

Configuration Service needs:
- `PORT` (default: 3001)
- `MAIN_APP_URL` (for CORS)

Main App needs:
- `PORT` (default: 3000)
- `CONFIG_SERVICE_URL` (points to Configuration Service)
- `SESSION_SECRET` (for user sessions)

## Database Schema

```sql
CREATE TABLE configurations (
  id TEXT PRIMARY KEY,           -- UUID
  schema_version INTEGER,        -- Current: 1
  created_by TEXT,               -- User ID (for isolation)
  created_at INTEGER,            -- Unix ms
  updated_at INTEGER,            -- Unix ms
  data TEXT                      -- JSON string of HomeScreenConfig
);
```

## Quick Commands

```bash
# Start Configuration Service
cd configuration-service && node app.js

# Start Main App
cd mobile-app-editor-app && npm run dev

# View database
sqlite3 configuration-service/data/configurations.db "SELECT * FROM configurations;"

# Generate secret
openssl rand -hex 32
```

## Common Gotchas

1. **Trailing slashes**: Client sends `/api/configurations`, Express sees `/api/configurations/` - normalized in auth middleware
2. **Body serialization**: Must use JSON.stringify() for signature, not the object directly
3. **Timestamp as string**: Must be string in headers, but parse as int for validation
4. **Color validation**: Must be exact format `#RRGGBB` (6 hex digits)
5. **URL validation**: Uses `new URL()` which throws if invalid

## Design Decisions

- **SQLite**: Easy local development, migrate to PostgreSQL for production
- **HMAC signatures**: Prevents tampering, replay attacks
- **Service separation**: Main app and config service can scale independently
- **Context over Redux**: Simpler for single-page state management
- **Native CSS carousel**: No dependencies, better performance

## Red Flags to Watch For

If you see any of these, it's likely a bug:
- 🚩 `fetch(CONFIG_SERVICE_URL)` in browser code
- 🚩 API key in client-side JavaScript
- 🚩 Database queries without `created_by` filter
- 🚩 Missing authentication on Configuration Service endpoints
- 🚩 Hardcoded user IDs instead of session-based
- 🚩 console.log in production code (removed for final version)

## Additional Context

This is a take-home challenge project demonstrating:
- Full-stack architecture
- Secure service-to-service communication
- Real-time UI updates
- Data persistence and schema versioning
- Proper separation of concerns

The codebase prioritizes clarity and maintainability over clever abstractions.
