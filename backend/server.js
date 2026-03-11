const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const FileCleanup = require('./utils/fileCleanup');

const app = express();

// Initialize Supabase client
const supabase = connectDB();

// Make supabase client available to all routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Schedule temporary file cleanup every hour
setInterval(() => {
  FileCleanup.cleanupTempDir();
}, 3600000); // 1 hour

// Init Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? null : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/payment', require('./routes/payment'));

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  // Clean up temp directory on startup
  FileCleanup.cleanupTempDir();
});