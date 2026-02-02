# Mobile App Home Screen Editor

A full-stack web application for previewing and configuring mobile app home screens in real-time. Built with React Router, Express.js, and SQLite with HMAC-authenticated service-to-service communication.

## Project Overview

This application allows users to:
- ✨ Configure mobile app home screens with image carousels, text sections, and CTA buttons
- 👀 See changes in real-time with a live preview
- 💾 Save configurations that persist across page reloads
- 📤 Import and export configurations as JSON files
- 🎨 Customize colors, text, and images through an intuitive editor

## Architecture

The project consists of two separate services:

```
mobile-app-editor/
├── mobile-app-editor-app/       # Main web application (React Router)
│   ├── app/                     # React components and routes
│   ├── .env.example             # Environment variables template
│   └── README.md                # Detailed setup and architecture docs
│
└── configuration-service/       # Backend API service (Express.js)
    ├── middleware/              # Authentication and validation
    ├── routes/                  # REST API endpoints
    ├── .env.example             # Environment variables template
    └── README.md                # API contract and documentation
```

### System Design

```
Browser
  ↓
Main App (React Router) - Port 3000
  • UI Components (Editor + Preview)
  • Server-side loaders/actions
  • Session management
  ↓ HMAC-signed requests
Configuration Service (Express) - Port 3001
  • REST API endpoints
  • Authentication & validation
  • Business logic
  ↓
SQLite Database
  • Configuration storage
  • Per-user isolation
```

### Key Features

**Security:**
- 🔐 HMAC-SHA256 request signing
- 🛡️ Server-side API mediation (credentials never exposed to browser)
- ⏱️ Replay attack prevention with timestamp validation
- 👤 Per-user configuration isolation

**Technology:**
- ⚛️ React Router v7 with TypeScript
- 🎨 TailwindCSS for styling
- 🚀 Express.js REST API
- 💾 SQLite with WAL mode
- ✅ Client and server-side validation

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd mobile-app-editor

# Install dependencies for both services
cd mobile-app-editor-app
npm install

cd ../configuration-service
npm install
```

### 2. Configure Environment Variables

**Configuration Service** (`configuration-service/.env`):
```bash
PORT=3001
MAIN_APP_URL=http://localhost:3000
SERVICE_API_KEY=service-key-main-app-to-config-service
SIGNATURE_SECRET=signature-secret-change-in-production
```

**Main App** (`mobile-app-editor-app/.env`):
```bash
PORT=3000
CONFIG_SERVICE_URL=http://localhost:3001
CONFIG_SERVICE_API_KEY=service-key-main-app-to-config-service
SIGNATURE_SECRET=signature-secret-change-in-production
SESSION_SECRET=your-secret-key-change-this-in-production
```

**Important:** The `SIGNATURE_SECRET` must match in both `.env` files.

### 3. Start the Services

**Terminal 1 - Configuration Service:**
```bash
cd configuration-service
node app.js
```

**Terminal 2 - Main App:**
```bash
cd mobile-app-editor-app
npm run dev
```

### 4. Access the Application

Open your browser to: **http://localhost:3000**

## Documentation

### Detailed Documentation

- **[Main App Documentation](mobile-app-editor-app/README.md)**
  - Complete setup instructions
  - Architecture overview
  - State management
  - User flow
  - Notable tradeoffs and assumptions

- **[Configuration Service Documentation](configuration-service/README.md)**
  - Complete API contract
  - Authentication details
  - Request/response schemas
  - Validation rules
  - Security considerations

- **[Testing Guide](TESTING.md)**
  - Comprehensive test coverage (58 tests)
  - Running tests for both services
  - Test philosophy and strategy
  - Adding new tests

### API Overview

The Configuration Service exposes a REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/configurations` | GET | List all configurations |
| `/api/configurations/:id` | GET | Get specific configuration |
| `/api/configurations` | POST | Create new configuration |
| `/api/configurations/:id` | PUT | Update configuration |
| `/api/configurations/:id` | DELETE | Delete configuration |

All endpoints require authentication headers:
- `X-API-Key`: Service API key
- `X-User-Id`: User identifier
- `X-Signature`: HMAC-SHA256 signature
- `X-Timestamp`: Unix timestamp in milliseconds

See [Configuration Service API Documentation](configuration-service/README.md) for complete details.

## Project Structure

```
mobile-app-editor/
│
├── mobile-app-editor-app/
│   ├── app/
│   │   ├── routes/
│   │   │   └── mobile-app-editor.tsx      # Main route (loader/action)
│   │   ├── mobile-app-editor/
│   │   │   ├── components/
│   │   │   │   ├── Editor.tsx             # Configuration editor
│   │   │   │   └── Preview.tsx            # Live preview
│   │   │   ├── context/
│   │   │   │   └── EditorContext.tsx      # State management
│   │   │   └── types.ts                   # TypeScript types
│   │   ├── services/
│   │   │   └── config-service-client.ts   # API client
│   │   └── root.tsx                       # App root
│   └── package.json
│
└── configuration-service/
    ├── middleware/
    │   ├── auth.js                         # HMAC authentication
    │   └── validation.js                   # Input validation
    ├── routes/
    │   └── configurations.js               # REST endpoints
    ├── db.js                               # Database operations
    ├── app.js                              # Express server
    └── package.json
```

## Development Workflow

### Making Changes

1. **Edit the UI**: Modify components in `mobile-app-editor-app/app/`
2. **Add API endpoints**: Update `configuration-service/routes/`
3. **Change validation**: Update `configuration-service/middleware/validation.js`
4. **Modify schema**: Update TypeScript types and database schema

### Testing

**Automated Tests:**

The project includes comprehensive test suites for both services with 58 total tests:

**Configuration Service** (38 tests):
```bash
cd configuration-service
npm test                  # Run all tests with coverage
npm run test:watch        # Run in watch mode
```

**Main App** (20 tests):
```bash
cd mobile-app-editor-app
npm test                  # Run all tests with coverage
npm run test:watch        # Run in interactive watch mode
```

See [TESTING.md](TESTING.md) for detailed testing guide.

**Manual Testing:**
- Use the application at http://localhost:3000
- Check browser console for errors
- Verify configurations persist after page reload

**API Testing:**
- Use cURL commands from [Configuration Service README](configuration-service/README.md)
- Check Configuration Service logs for authentication issues

## Key Architectural Decisions

### 1. Service Separation
- **Main app** handles UI, routing, and user sessions
- **Configuration service** handles data persistence
- Allows independent scaling and deployment

### 2. Server-Side Mediation
- Browser never directly calls Configuration Service
- All API credentials stay server-side
- Prevents credential exposure

### 3. HMAC Request Signing
- All requests signed with HMAC-SHA256
- Prevents tampering and replay attacks
- 5-minute timestamp window for validation

### 4. SQLite for Development
- Zero configuration setup
- Single-file database
- Easy backups
- **Production:** Migrate to PostgreSQL

For detailed rationale, see [Main App README - Notable Tradeoffs](mobile-app-editor-app/README.md#notable-tradeoffs-and-assumptions).

## Production Deployment

### Environment Setup

1. Generate strong secrets:
   ```bash
   openssl rand -hex 32  # For SIGNATURE_SECRET
   openssl rand -hex 32  # For SESSION_SECRET
   ```

2. Configure production environment variables

3. Set up proper user authentication (OAuth, JWT, etc.)

### Database Migration

For production, migrate from SQLite to PostgreSQL:

1. Export data from SQLite
2. Set up PostgreSQL instance
3. Update database connection in `configuration-service/db.js`
4. Import data to PostgreSQL

### Security Checklist

- [ ] Use strong, randomly generated secrets
- [ ] Enable HTTPS/TLS for all communication
- [ ] Implement rate limiting
- [ ] Add request logging and monitoring
- [ ] Set up proper user authentication
- [ ] Configure CORS for production domains
- [ ] Enable security headers (helmet.js)

### Deployment Options

Both services can be deployed to:
- AWS (ECS, Lambda, Elastic Beanstalk)
- Google Cloud (Cloud Run, App Engine)
- Azure (Container Apps, App Service)
- Heroku, Railway, Fly.io
- Digital Ocean App Platform

## Troubleshooting

### "Cannot connect to Configuration Service"
```bash
# Ensure Configuration Service is running on port 3001
cd configuration-service
node app.js
```

### "Invalid signature" errors
1. Check that `SIGNATURE_SECRET` matches in both `.env` files
2. Restart both services after changing environment variables
3. Verify timestamps are within 5-minute window

### Port conflicts
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001

# Change PORT in .env files if needed
```

For more troubleshooting, see individual service READMEs.

## Contributing

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Tailwind for styling

### Before Submitting

1. Test all functionality manually
2. Check for TypeScript errors: `npm run typecheck`
3. Ensure both services start without errors
4. Verify configurations persist after reload
5. Test on different screen sizes

## Specifications Compliance

This project fulfills all requirements from the take-home challenge specifications:

✅ **Functional Requirements:**
- Preview screen with carousel, text section, and CTA
- Real-time preview updates
- Import/export JSON configurations
- Responsive interface

✅ **Backend Requirements:**
- Configuration service with REST API
- Schema versioning and timestamps
- Server-side validation
- SQLite storage with clear tradeoffs documented

✅ **Security Requirements:**
- Private authentication (API keys never exposed to browser)
- Server-side API access via loaders/actions
- HMAC signature verification
- Per-user configuration isolation

✅ **Code Quality:**
- Clean, modular architecture
- Separation of concerns
- TypeScript for type safety
- Comprehensive documentation
- Tested code with 58 passing tests (validation, auth, state, components)

## License

MIT

---

Built with ❤️ using React Router, Express.js, and SQLite
