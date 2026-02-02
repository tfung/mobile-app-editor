// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const configurationsRouter = require('./routes/configurations');

const app = express();
const PORT = process.env.PORT || 3001;

// Validate required environment variables
const MAIN_APP_URL = process.env.MAIN_APP_URL;
if (!MAIN_APP_URL) {
  throw new Error('MAIN_APP_URL environment variable is required');
}

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS middleware (allow requests from your React app)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', MAIN_APP_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-User-Id, X-Signature, X-Timestamp');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Configuration Service',
    version: '1.0.0',
    status: 'running',
  });
});

// Mount configurations API routes
app.use('/api/configurations', configurationsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Only start the server if this file is run directly (not in tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Configuration Service running on http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/configurations`);
    console.log(`🔐 Authentication: Use X-API-Key header`);
  });
}

// Export app for testing
module.exports = app;
