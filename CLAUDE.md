# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack mobile app home screen editor that allows users to preview and modify a mobile app home screen configuration in real time. The configuration includes:
- Image carousel (with portrait/landscape/square aspect ratios)
- Text section (title, description, customizable colors)
- Call-to-action button (label, URL, customizable colors)

## Architecture Requirements

Based on specifications.md, this application must follow these architectural patterns:

### Framework Choice
- Preferred: Remix or React Router
- Alternative: Next.js with server runtime
- Language: TypeScript or JavaScript

### API Architecture
The application uses a **server-mediated architecture** for security:
1. Browser communicates ONLY with the app's server layer (loaders/actions)
2. Server layer communicates with the private configuration service
3. Direct browser-to-config-service calls are forbidden

This protects private authentication credentials (API keys, tokens) which must live only on the server.

### Data Flow
```
Browser <-> Server Loaders/Actions <-> Configuration Service API
```

- **Loaders**: Fetch configuration data on initial page load
- **Actions**: Persist configuration updates
- **Configuration Service**: Backend API (REST or GraphQL) that stores configurations

### Configuration Service Schema
Each configuration must include:
- `id`: string
- `schemaVersion`: number
- `updatedAt`: timestamp
- `data`: configuration payload containing carousel, text section, and CTA data

### API Operations Required
- Load a configuration by ID
- Create a configuration
- Update an existing configuration

## Key Implementation Constraints

### Authentication & Security
- Configuration API must use private authentication
- Credentials must NEVER be exposed to the browser
- Use environment variables for secrets
- All API calls from browser must go through server-side code

### Real-Time Preview
- Changes in editor must reflect immediately in preview
- State management via React Context and Hooks (or framework equivalent)

### Data Validation
- Hex color values validation
- URL validation
- Input validation on both client and server

### Import/Export
- Support importing valid JSON configuration files
- Support exporting current configuration as JSON

### Persistence
- Page reload must restore the saved configuration
- Storage approach is flexible (SQLite, Postgres, file-based, in-memory)
- Document storage tradeoffs in README

## Code Organization Principles

Maintain clear separation of concerns:
- UI components
- State management
- Server-side data access
- API contract definitions and validation

## Development Checklist

When implementing this project, ensure:
1. Server-side loaders/actions are used for ALL config service communication
2. Environment variables are used for authentication credentials
3. API contracts have explicit request/response schemas
4. Input validation is implemented
5. Error responses are consistent with appropriate status codes
6. Responsive and user-friendly UI
7. Real-time preview updates work correctly
