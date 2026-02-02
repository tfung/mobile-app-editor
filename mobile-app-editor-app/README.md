# Mobile App Home Screen Editor

A full-stack web application that allows users to preview and modify a mobile app home screen in real time. Users can configure an image carousel, text section, and call-to-action button, with all configurations persisted to a backend service.

## Features

### Core Functionality
- 📱 **Real-time Preview**: Live preview of mobile app home screen with phone frame mockup
- 🎠 **Image Carousel Editor**: Add, edit, and remove images with support for portrait, landscape, and square aspect ratios
- ✏️ **Text Customization**: Edit title and description with color pickers for custom styling
- 🎯 **CTA Button Configuration**: Customize button label, URL, background, and text colors
- 💾 **Persistent Storage**: Configurations saved to backend service and restored on page reload
- 📤 **Import/Export**: Backup and restore configurations via JSON files

### User Experience
- 🎨 **Responsive Design**: Mobile-first interface that works on all screen sizes
- ⚡ **Instant Updates**: Changes reflected immediately in the preview
- 🖱️ **Intuitive Controls**: Color pickers, drag-free carousel navigation, and clear form inputs
- ♿ **Accessible**: Proper ARIA labels and keyboard navigation support

### Technical Features
- 🔐 **Secure API Communication**: HMAC-SHA256 signed requests with replay attack prevention
- 🏗️ **Server-Side Architecture**: All API calls mediated through server-side loaders/actions
- ✅ **Input Validation**: Client and server-side validation for URLs, hex colors, and required fields
- 🔄 **Schema Versioning**: Built-in support for configuration schema evolution

### Implementation Enhancements

This implementation includes optional enhancements beyond the original specification:

**📜 Configuration History**: Each save creates a new version rather than updating in place, providing:
- Complete audit trail of all changes
- Version dropdown to load and restore previous configurations
- Never lose data - full rollback capability

See [Notable Tradeoffs](#notable-tradeoffs-and-assumptions) for detailed rationale and architectural decisions.

## Technology Stack

- **Framework**: React Router v7 with SSR
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context + Hooks
- **Backend**: Express.js (separate Configuration Service)
- **Database**: SQLite with WAL mode
- **Authentication**: Service-to-service with HMAC signatures
- **Build Tool**: Vite

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React Components (Editor + Preview)               │    │
│  │  • EditorContext (state management)                │    │
│  │  • Real-time updates via React hooks               │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                   │
│                          │ Form submissions                  │
│                          │ (no credentials)                  │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Main App Server (React Router)              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Server-Side Loaders/Actions                       │    │
│  │  • Load configurations on page load                │    │
│  │  • Handle form submissions                         │    │
│  │  • Mediate all Configuration Service calls        │    │
│  │  • Attach auth headers (API key, signature)       │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                   │
│                          │ Authenticated requests            │
│                          │ (with HMAC signatures)            │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            Configuration Service (Express API)               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Authentication Middleware                         │    │
│  │  • Verify API key                                  │    │
│  │  • Validate HMAC signature                         │    │
│  │  • Check timestamp (replay prevention)            │    │
│  │  • Extract user ID from headers                   │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Business Logic                                     │    │
│  │  • CRUD operations for configurations              │    │
│  │  • Input validation                                │    │
│  │  • Ownership verification                          │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                   │
│                          │ SQL queries                       │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    SQLite    │
                    │   Database   │
                    └──────────────┘
```

### Key Architectural Decisions

**1. Server-Side API Mediation**
- All Configuration Service calls go through server-side loaders/actions
- Browser never directly accesses the Configuration Service
- API credentials (keys, secrets) remain server-side only
- User ID extracted from session, not trusted from client

**2. HMAC Request Signing**
- All requests signed with HMAC-SHA256
- Signature includes method, path, body, and timestamp
- Prevents request tampering and replay attacks
- 5-minute timestamp window for clock skew tolerance

**3. Separation of Concerns**
- Main app handles UI, routing, and user sessions
- Configuration Service handles data persistence and validation
- Each service can be scaled independently
- Clear API contract between services

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
cd mobile-app-editor-app
npm install
```

### Environment Variables

Create a `.env` file in the `mobile-app-editor-app` directory:

```bash
# Main App Configuration
PORT=3000

# Configuration Service
CONFIG_SERVICE_URL=http://localhost:3001
CONFIG_SERVICE_API_KEY=service-key-main-app-to-config-service

# HMAC Signature Secret (must match Configuration Service)
# Generate with: openssl rand -hex 32
SIGNATURE_SECRET=signature-secret-change-in-production

# Session Secret
SESSION_SECRET=your-secret-key-change-this-in-production
```

**Important:**
- **All variables (except PORT) are required** - the app will fail to start if any are missing
- The `SIGNATURE_SECRET` must match between this app and the Configuration Service
- Generate strong secrets for production: `openssl rand -hex 32`
- Never commit secrets to version control
- No default fallback values are provided for security reasons

### Running the Application

1. **Start the Configuration Service first** (in a separate terminal):
   ```bash
   cd ../configuration-service
   node app.js
   ```

2. **Start the main app**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Main app: http://localhost:3000
   - Configuration Service: http://localhost:3001 (API only)

## Project Structure

```
mobile-app-editor-app/
├── app/
│   ├── routes/
│   │   └── mobile-app-editor.tsx       # Main route with loader/action
│   ├── mobile-app-editor/
│   │   ├── components/
│   │   │   ├── Editor.tsx              # Configuration editor UI
│   │   │   └── Preview.tsx             # Live preview with phone frame
│   │   ├── context/
│   │   │   └── EditorContext.tsx       # State management
│   │   └── types.ts                    # TypeScript interfaces
│   ├── services/
│   │   └── config-service-client.ts    # Configuration Service client
│   ├── app.css                         # Global styles + utilities
│   └── root.tsx                        # Root layout
├── .env.example                        # Environment variables template
└── vite.config.ts                      # Vite configuration
```

## User Flow

1. **Initial Load**
   - Server-side loader fetches latest configuration from Configuration Service
   - EditorContext initializes with fetched data
   - Preview and editor both render with current configuration

2. **Editing**
   - User modifies fields in the Editor component
   - EditorContext updates state
   - Preview component re-renders immediately (real-time updates)
   - Changes are in-memory only until saved

3. **Saving**
   - User clicks "Save Configuration"
   - Form submitted to server-side action
   - Action validates and forwards to Configuration Service with auth headers
   - Configuration Service validates and persists to database
   - User sees success message
   - Page reloads to show saved state

4. **Import/Export**
   - **Export**: Downloads current configuration as JSON file
   - **Import**: Uploads JSON file, validates, and updates in-memory state
   - Changes not persisted until user clicks "Save Configuration"

## API Integration

### Configuration Service Client

The app uses a typed client (`config-service-client.ts`) to communicate with the Configuration Service:

```typescript
// All calls include HMAC signature generation
await createConfigInService(userId, configData);
await updateConfigInService(userId, configId, configData);
await getAllConfigsFromService(userId);
await getConfigByIdFromService(userId, configId);
await deleteConfigFromService(userId, configId);
```

### Authentication Flow

1. **Request Preparation**:
   - Generate timestamp
   - Construct payload: `METHOD:PATH:BODY:TIMESTAMP`
   - Generate HMAC-SHA256 signature

2. **Request Headers**:
   ```
   X-API-Key: service-key
   X-User-Id: user-id-from-session
   X-Signature: hmac-signature
   X-Timestamp: unix-timestamp-ms
   ```

3. **Server Verification**:
   - Validates API key
   - Reconstructs payload and verifies signature
   - Checks timestamp is within 5-minute window
   - Attaches user ID to database queries

## Configuration Schema

```typescript
interface HomeScreenConfig {
  carousel: {
    images: Array<{
      url: string;      // Valid URL required
      alt: string;
    }>;
    aspectRatio: 'portrait' | 'landscape' | 'square';
  };
  textSection: {
    title: string;
    description: string;
    titleColor: string;        // Hex: #RRGGBB
    descriptionColor: string;  // Hex: #RRGGBB
  };
  cta: {
    label: string;
    url: string;               // Valid URL required
    backgroundColor: string;   // Hex: #RRGGBB
    textColor: string;         // Hex: #RRGGBB
  };
}
```

## Notable Tradeoffs and Assumptions

### 1. Authentication: Service Key vs OAuth
**Choice:** Service-to-service API key + HMAC signatures
**Rationale:**
- ✅ Appropriate for server-to-server communication
- ✅ Simple to implement and test
- ✅ HMAC signatures provide integrity and replay protection
- ⚠️ Tradeoff: No end-user authentication built in

### 2. Validation: Client + Server
**Choice:** Duplicate validation on both sides
**Rationale:**
- ✅ Better UX with immediate client-side feedback
- ✅ Security requires server-side validation
- ⚠️ Tradeoff: Validation logic must be kept in sync
- **Mitigation**: Shared validation logic could be extracted to a shared package

### 3. Configuration History: Versioning vs Update-in-Place
**Choice:** Create new configuration on each save (versioning)
**Rationale:**
- ✅ Full audit trail of all changes
- ✅ Ability to load and restore previous versions
- ✅ Never lose configuration data
- ✅ Simple rollback mechanism
- ⚠️ Deviation from spec: Spec mentions "Update an existing configuration"
- ⚠️ Tradeoff: Database grows with each save (mitigated by SQLite's small footprint)
- **Note**: This implements the optional "support for multiple configurations" enhancement

### 4. Configuration Versioning: Schema Version Field
**Choice:** Single `schemaVersion` number
**Rationale:**
- ✅ Simple to implement and understand
- ✅ Allows for future schema evolution
- ✅ Each record tracks its own version
- ⚠️ Assumption: Schema changes will be backward compatible or handled with migrations

### 5. Real-time Updates: Optimistic UI vs Server State
**Choice:** Optimistic in-memory updates, explicit save required
**Rationale:**
- ✅ Clear distinction between "editing" and "saved" state
- ✅ User controls when to persist changes
- ✅ Prevents accidental overwrites
- ⚠️ Tradeoff: No autosave (could be added as enhancement)

## Testing

### Automated Tests

The app includes comprehensive tests for components and context:

**Test Coverage (20 tests):**
- EditorContext state management (6 tests)
- Preview component rendering (14 tests)

**Running Tests:**

```bash
# Run all tests with coverage
npm test

# Run in interactive watch mode
npm run test:watch

# View coverage report
# After running tests, open: coverage/index.html
```

**Test Framework:**
- Vitest with React Testing Library
- happy-dom for lightweight DOM
- Coverage with v8 provider

**What's Tested:**
- Initial config loading
- Partial state updates (text, carousel, CTA)
- Full config replacement
- Preview rendering with correct content
- Color application
- Carousel images and navigation
- Aspect ratio handling
- Read-only preview behavior

See [TESTING.md](../TESTING.md) for detailed testing guide.

### Manual Testing Checklist

**Editor Functionality:**
- [ ] Add/remove carousel images
- [ ] Change aspect ratio (portrait/landscape/square)
- [ ] Edit title and description text
- [ ] Change colors using color picker
- [ ] Change colors by typing hex values
- [ ] Update CTA button label and URL
- [ ] Change button colors

**Preview Functionality:**
- [ ] Preview updates in real-time as you edit
- [ ] Carousel navigation with arrows
- [ ] Carousel swipe/scroll on mobile
- [ ] Active indicator dots update on scroll
- [ ] Colors apply correctly
- [ ] Phone frame displays properly

**Persistence:**
- [ ] Save configuration
- [ ] Reload page - configuration persists
- [ ] Export configuration to JSON
- [ ] Import configuration from JSON
- [ ] Multiple users have isolated configurations

**Responsive Design:**
- [ ] Works on mobile (< 640px)
- [ ] Works on tablet (640px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Color pickers don't shrink too small

## License

MIT

---

Built with ❤️ using React Router and Express.js
