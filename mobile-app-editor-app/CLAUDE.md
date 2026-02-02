# Claude Context: Main App (React Router)

Context for AI assistants working on the main application.

## Service Role

This is the **main web application** that users interact with. It handles:
- UI rendering (Editor + Preview)
- User sessions
- Server-side API mediation
- Real-time state updates

## Key Files

```
app/
├── routes/
│   └── mobile-app-editor.tsx          # Loader/action for API calls
├── mobile-app-editor/
│   ├── components/
│   │   ├── Editor.tsx                 # Form inputs for configuration
│   │   └── Preview.tsx                # Live preview with phone frame
│   ├── context/
│   │   └── EditorContext.tsx          # In-memory state management
│   ├── types.ts                       # TypeScript interfaces
│   └── index.tsx                      # Main page layout
├── services/
│   └── config-service-client.ts       # Configuration Service client
├── __tests__/
│   ├── setup.ts                       # Test setup (@testing-library/jest-dom)
│   ├── EditorContext.test.tsx         # Context state management tests
│   └── Preview.test.tsx               # Preview component tests
└── root.tsx                           # App root with meta tags
```

## Critical Patterns

### 1. State Management (EditorContext)

```typescript
// Single source of truth for in-memory state
const EditorContext = createContext<EditorContextType>()

// State updates are immediate (optimistic UI)
updateTextSection({ title: 'New Title' })  // Preview updates instantly

// Persistence requires explicit save
fetcher.submit(formData, { method: 'post' })  // Saves to database
```

**Rules:**
- Editor reads/writes to context
- Preview reads from context (never writes)
- Changes are in-memory until "Save" is clicked
- Context resets to saved state on page reload

### 2. Server-Side Data Flow

```typescript
// Loader: Runs on server, called on page load
export async function loader() {
  const userId = 'user-1'; // From session in production
  const configs = await getAllConfigsFromService(userId);
  return json({ configs });
}

// Action: Runs on server, called on form submit
export async function action({ request }) {
  const userId = 'user-1'; // From session in production
  const formData = await request.formData();
  const config = JSON.parse(formData.get('config'));
  await createConfigInService(userId, config);
  return json({ success: true });
}
```

**Rules:**
- ALL Configuration Service calls happen in loader/action
- NEVER call Configuration Service from browser code
- userId comes from session (not from client)
- Return JSON responses for client consumption

### 3. Configuration Service Client

```typescript
// Located in: app/services/config-service-client.ts

// Generates HMAC signature for each request
function generateSignature(method, path, body, timestamp) {
  const payload = `${method}:${path}:${body}:${timestamp}`;
  return crypto.createHmac('sha256', SIGNATURE_SECRET).update(payload).digest('hex');
}

// All requests include 4 auth headers
headers.set('X-API-Key', SERVICE_API_KEY);
headers.set('X-User-Id', userId);
headers.set('X-Signature', signature);
headers.set('X-Timestamp', timestamp);
```

**Rules:**
- Only call from server-side code (loaders/actions)
- userId parameter is REQUIRED for all functions
- Timestamp is generated fresh for each request
- Body must be JSON.stringify() for POST/PUT, empty string for GET/DELETE

## Component Guidelines

### Editor.tsx

**Purpose:** Configuration form with all input fields

**State:**
- Reads: `config` from EditorContext
- Writes: Updates via `updateTextSection`, `updateCTA`, `updateCarousel`
- Saves: `fetcher.submit()` to trigger server action

**Patterns:**
```typescript
// Reading state
const { config, updateTextSection } = useEditor();

// Updating state (optimistic, in-memory only)
updateTextSection({ title: e.target.value });

// Persisting state
const handleSave = () => {
  const formData = new FormData();
  formData.append('config', JSON.stringify(config));
  fetcher.submit(formData, { method: 'post' });
};
```

**Reusable Components:**
- `ColorInput` - Reusable color picker with hex input (used 4 times)
  - Takes: label, value, onChange, placeholder
  - Includes `min-w-16` to prevent shrinking on small screens

**Adding new fields:**
1. Add input element with `value={config.section.field}`
2. Add `onChange` handler that calls `updateSection({ field: newValue })`
3. Add to `types.ts` if new field
4. Update validation in Configuration Service

### Preview.tsx

**Purpose:** Real-time preview of configuration in phone frame

**State:**
- Reads: `config` from EditorContext
- Writes: NEVER (read-only component)

**Patterns:**
```typescript
// Only reads from context
const { config } = useEditor();

// Applies styles directly from config
<h3 style={{ color: config.textSection.titleColor }}>
  {config.textSection.title}
</h3>

// Carousel state (internal only, not persisted)
const [currentImageIndex, setCurrentImageIndex] = useState(0);
```

**UI features:**
- Phone frame with notch (portrait only)
- Responsive sizing (mobile-first)
- Horizontal scroll carousel with snap points
- Navigation arrows and indicator dots
- Status bar mockup

### EditorContext.tsx

**Purpose:** Centralized state management for in-memory configuration

**Provides:**
```typescript
{
  config: HomeScreenConfig,           // Current state
  setConfig: (config) => void,        // Replace entire config
  updateCarousel: (partial) => void,  // Update carousel section
  updateTextSection: (partial) => void,
  updateCTA: (partial) => void
}
```

**Patterns:**
```typescript
// Partial updates
updateTextSection({ title: 'New' });  // Only updates title, keeps other fields

// Full replacement (for import)
setConfig(importedConfig);

// Initial state from loader
<EditorProvider initialConfig={loaderData.config}>
```

## TypeScript Types

**Located in:** `app/mobile-app-editor/types.ts`

```typescript
interface HomeScreenConfig {
  carousel: {
    images: Array<{ url: string; alt: string }>;
    aspectRatio: 'portrait' | 'landscape' | 'square';
  };
  textSection: {
    title: string;
    description: string;
    titleColor: string;        // #RRGGBB format
    descriptionColor: string;
  };
  cta: {
    label: string;
    url: string;
    backgroundColor: string;
    textColor: string;
  };
}
```

**When adding fields:**
1. Update this interface
2. Update validation in Configuration Service
3. Update default config in EditorContext
4. Add input in Editor.tsx
5. Add display in Preview.tsx

## Styling Patterns

**Framework:** TailwindCSS

**Responsive breakpoints:**
```typescript
// Mobile-first approach
className="w-full sm:w-auto"  // Full width on mobile, auto on tablet+

// Breakpoints
sm: 640px   // Tablet
md: 768px   // Small desktop
lg: 1024px  // Large desktop
```

**Common patterns:**
```typescript
// Responsive grid
"grid grid-cols-1 lg:grid-cols-2"  // Stack on mobile, side-by-side on desktop

// Responsive text
"text-sm md:text-base"  // Smaller on mobile

// Responsive spacing
"p-4 md:p-6"  // Less padding on mobile
```

**Color pickers:**
```typescript
// Must have min-w to prevent shrinking
className="h-11 w-16 min-w-16"  // Fixed width color input
```

## Common Tasks

### Add New Color Field

1. Add to TypeScript type:
```typescript
textSection: {
  subtitleColor: string;  // NEW
}
```

2. Add to Editor:
```typescript
<input
  type="color"
  value={config.textSection.subtitleColor}
  onChange={(e) => updateTextSection({ subtitleColor: e.target.value })}
  className="h-11 w-16 min-w-16"
/>
```

3. Add to Preview:
```typescript
<p style={{ color: config.textSection.subtitleColor }}>
  {config.textSection.subtitle}
</p>
```

4. Update validation in Configuration Service

### Add Import Validation

Located in `Editor.tsx`:

```typescript
const validateConfig = (data: unknown): data is HomeScreenConfig => {
  // Add validation logic
  // Return false if invalid
}
```

## Environment Variables

```bash
PORT=3000                                           # App port (optional, defaults to 3000)
CONFIG_SERVICE_URL=http://localhost:3001           # Configuration Service URL (REQUIRED)
CONFIG_SERVICE_API_KEY=service-key-main-app-to-config-service  # (REQUIRED)
SIGNATURE_SECRET=signature-secret-change-in-production  # MUST match Configuration Service (REQUIRED)
SESSION_SECRET=your-secret-key-change-this-in-production  # (REQUIRED)
```

**Important:** All variables except PORT are required. The app validates environment variables at startup and will throw clear errors if any are missing. No default fallbacks are provided for security.

## Automated Testing

**Test Coverage (20 tests):**
- EditorContext state management (6 tests)
- Preview component rendering (14 tests)

**Running Tests:**
```bash
npm test              # Run all tests with coverage
npm run test:watch    # Interactive watch mode
```

**Test Framework:**
- Vitest with React Testing Library
- happy-dom environment
- Coverage with v8 provider

**What's Tested:**
- Initial config from loader
- Partial state updates (updateTextSection, updateCTA, updateCarousel)
- Full config replacement (setConfig)
- Field preservation during partial updates
- Preview renders correct content
- Color styles applied correctly
- Carousel images and navigation
- Aspect ratio handling
- Read-only preview behavior

See [TESTING.md](../TESTING.md) for full guide.

## Manual Testing Checklist

- [ ] Edit fields → Preview updates immediately
- [ ] Click Save → Success message appears
- [ ] Reload page → Changes persist
- [ ] Export → Downloads JSON file
- [ ] Import → Loads configuration (not persisted until Save)
- [ ] Multiple users → Configurations isolated
- [ ] Responsive → Works on mobile/tablet/desktop
- [ ] Color pickers → Don't shrink on small screens
- [ ] Carousel → Arrows and dots work
- [ ] Validation → Invalid data shows error

## Common Issues

**"Failed to fetch configurations: Unauthorized"**
- Check SIGNATURE_SECRET matches in both .env files
- Verify Configuration Service is running
- Check CONFIG_SERVICE_API_KEY matches SERVICE_API_KEY

**Changes don't persist after reload**
- Did you click "Save Configuration"?
- Check browser console for errors
- Verify Configuration Service received the request

**Preview doesn't update**
- Check if updateSection functions are called
- Verify EditorContext is providing latest state
- Check React DevTools for state updates

**Import doesn't work**
- Check JSON format matches HomeScreenConfig type
- Verify validateConfig function logic
- Look for error message in UI

## Red Flags

- 🚩 `fetch(CONFIG_SERVICE_URL)` in browser code
- 🚩 Environment variables accessed in components
- 🚩 User ID hardcoded instead of from session
- 🚩 Direct database access from this service
- 🚩 Missing error handling on API calls

## Architecture Notes

This service is intentionally a thin layer that:
1. Renders UI
2. Manages in-memory state
3. Mediates API calls

Business logic and validation live in Configuration Service.

**Don't:**
- Add database access here
- Add complex business logic
- Call Configuration Service from browser code
- Store sensitive data in state

**Do:**
- Keep components focused and simple
- Use TypeScript for type safety
- Handle errors gracefully
- Provide good UX feedback (loading states, error messages)
