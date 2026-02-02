# Mobile App Home Screen Editor

A full-stack web application for previewing and configuring mobile app home screens in real-time. Built with React Router, Express.js, and SQLite with HMAC-authenticated service-to-service communication.

## Project Overview

This application allows users to:
- ✨ Configure mobile app home screens with image carousels, text sections, and CTA buttons
- 👀 See changes in real-time with a live preview
- 💾 Save configurations that persist across page reloads
- 📤 Import and export configurations as JSON files
- 🎨 Customize colors, text, and images through an intuitive editor

## Demo

[Demo Video](https://drive.google.com/file/d/1-gUZXWXZZ71rJcoIRwKI5JNF7Duu3NcF/view?usp=sharing)

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
cp .env.example .env

cd ..

cd configuration-service
npm install
cp .env.example .env
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

**Important:**
- All environment variables (except PORT) are **required** - there are no default fallbacks
- The `SIGNATURE_SECRET` must match in both `.env` files
- The application will fail to start if any required variables are missing

### 3. Start the Services

**Terminal 1 - Configuration Service:**
```bash
cd configuration-service
npm run dev
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

## License

MIT

---

Built with ❤️ using React Router, Express.js, and SQLite
