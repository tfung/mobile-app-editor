const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Define a basic GET route
app.get('/', (req, res) => {
  res.send('Hello World! This is an Express API server.');
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}/`);
});
