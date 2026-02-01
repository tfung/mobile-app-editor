const express = require('express');
const configurationsRouter = require('./routes/configurations');

const app = express();
const PORT = process.env.PORT || 3001; // Different port from main app

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS middleware (allow requests from your React app)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Adjust to your React app port
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
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

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Configuration Service running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/configurations`);
  console.log(`🔐 Authentication: Use X-API-Key header`);
});
