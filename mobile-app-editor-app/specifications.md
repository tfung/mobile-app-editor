# Take-Home Challenge – Mobile App Home Screen Editor Backend API

## Objective

Build a full-stack web application that allows users to preview and modify a mobile app home screen in real time.  
Users should be able to configure a screen with an image carousel, a text section, and a call-to-action (CTA) button.  
The configuration must be persisted to a backend configuration service via a private API, and reloading the page should restore the saved configuration.  

## Technology Requirements

- Framework: Remix or React Router preferred, or Next.js with a server runtime.  
- Language: TypeScript or JavaScript.  
- API protocol: REST or GraphQL.  
- State management: React Context and Hooks, or an equivalent idiomatic approach in the chosen framework.  

## Functional Requirements

### 1. Preview Screen Components

**Carousel Section**  
- Horizontally scrolling carousel (third-party library allowed).  
- Ability to add, edit, and remove image URLs.  
- Support portrait, landscape, and square aspect ratios.  

**Text Section**  
- Displays a title and description.  
- Editable title and description text.  
- Editable hex color values for both title and description.  

**Call-to-Action Section**  
- Displays a button with a label.  
- Editable button label and destination URL.  
- Editable hex color values for button background and label text.  

### 2. Editor Behavior

- Changes must be reflected in real time in the preview.  
- Provide a clear UI for editing all configurable fields.  
- Interface must be responsive and user-friendly.  
- Support importing and exporting a valid JSON configuration file, allowing users to back up and restore configurations.  

## Backend Persistence Requirements

### 3. Configuration Service

Implement a backend service responsible for storing and retrieving app home screen configurations.  

Each configuration must include at minimum:  
- `id`: string  
- `schemaVersion`: number  
- `updatedAt`: timestamp  
- `data`: configuration payload  

The configuration payload should include:  
- Carousel images and aspect ratio  
- Text section title, description, colors  
- CTA label, URL, colors  

Storage approach is flexible (e.g., SQLite, Postgres, file-based, or in-memory), but tradeoffs must be documented in the README.  

### 4. API Design

- Use either REST or GraphQL (choose one).  
- Implement endpoints/operations to:  
  - Load a configuration by ID  
  - Create a configuration  
  - Update an existing configuration  

Apply best practices for API contracts, including:  
- Clear, explicit request and response schemas.  
- Validation of inputs (e.g., hex colors, URLs).  
- Consistent error responses.  
- Appropriate HTTP status codes for REST, or typed errors for GraphQL.  
- Considerations for versioning or schema evolution.  

### 5. Private Authentication

- The configuration API must be protected using private authentication.  
- Authentication credentials (API key, token, secret) must:  
  - Live only on the server.  
  - Never be exposed to the browser.  
- Direct client-side calls from the browser to the configuration service using credentials are not allowed.  

### 6. Server-Side API Access

All interaction between the UI and the configuration service must go through server-side loaders/actions.  

- Use loaders to fetch configuration data on initial page load.  
- Use server actions to persist configuration updates.  
- The browser should communicate only with your app’s server layer, not directly with the configuration service.  
- Reloading the page must restore the persisted configuration.  

## Suggested User Flow

1. App loads with a default or previously saved configuration.  
2. User edits the home screen using the editor.  
3. Preview updates immediately.  
4. User saves changes.  
5. Refreshing the page restores the saved configuration.  

Autosave and support for multiple configurations are optional enhancements.  

## Technical Code Quality Requirements

- Clean, modular, maintainable, and tested code.  
- Clear separation of concerns:  
  - UI components  
  - State management  
  - Server-side data access  
  - API contract definitions and validation  
- Use environment variables for secrets and configuration.  
- Sensible defaults and graceful error handling.  

## Submission Instructions

- Provide a link to a public Git repository.  
- Include a README with:  
  - Local setup instructions  
  - Required environment variables  
  - How to run the app and backend (if separate)  
  - High-level architecture overview  
  - Notable tradeoffs or assumptions  

## Evaluation Criteria

1. Functionality: Editor and preview work as expected; configuration is persisted and restored correctly.  
2. API architecture: Well-designed API contracts; proper server-side mediation and private authentication.  
3. Code quality: Readable, structured, and maintainable code.  
4. User experience: Intuitive, responsive interface.  
5. Pragmatism and clarity: Thoughtful tradeoffs and clear documentation.  
