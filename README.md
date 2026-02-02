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

## Key Decisions

### 1. Database: SQLite
**Reasoning**: SQLite was chosen as the database due to the minimal setup required for this demo project. SQLite is lightweight, simple to use, and offers features very similar to a full RDBMS database. It provides ACID compliance, supports concurrent reads via WAL mode, and requires zero configuration.

**For Production**: For production deployments requiring high availability and horizontal scaling, migrating to PostgreSQL or MySQL is recommended. These databases offer:
- Built-in replication and clustering
- Better performance for high-concurrency workloads
- Advanced query optimization and indexing capabilities
- Horizontal scaling through sharding

### 2. API Protocol: REST
**Reasoning**: Given the straightforward CRUD operations required by this application, REST is sufficient and appropriate. REST is:
- Quick to implement in any language and framework
- Easy to debug with standard HTTP tools
- Well-understood by developers
- Provides clear semantics through HTTP methods and status codes

**Tradeoffs**: In a scaled production application, REST can lead to overfetching or underfetching, potentially causing additional latency and bandwidth usage.

**For Production**: If the system scales to serve multiple client types with varying data requirements, GraphQL becomes a compelling option. GraphQL allows:
- Clients to declare exactly what data they need
- Single endpoint for all queries
- Strongly-typed schema preventing API contract mistakes
- Reduced network overhead from overfetching

### 3. HMAC Authentication
**Reasoning**: HMAC-SHA256 signatures provide cryptographic verification of request integrity. This prevents:
- Tampering with request payloads in transit
- Replay attacks (via timestamp validation)
- Unauthorized modification of requests

Each request is signed using a shared secret, and the signature includes the HTTP method, path, body, and timestamp. The Configuration Service validates the signature before processing any request.

### 4. API Key Authentication
**Reasoning**: API keys identify the calling application in a service-to-service architecture. Each service (Main App, potential future services) has its own associated API key and signature secret. This allows:
- Service-level access control
- Audit trails showing which service made requests
- Independent secret rotation per service
- Ability to revoke access for specific services

### 5. Environment Variables
**Reasoning**: All secrets and configuration values are defined in `.env` files to:
- Keep sensitive data out of source control
- Enable convenient secret rotation without code changes
- Centralize all critical application configuration in one discoverable location
- Support different configurations per environment (dev, staging, production)

**Required variables are validated at startup** - the application will fail fast with clear error messages if any required environment variable is missing, preventing runtime errors from misconfiguration.

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

## License

MIT

---

Built with ❤️ using React Router, Express.js, and SQLite
