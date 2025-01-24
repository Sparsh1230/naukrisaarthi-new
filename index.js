const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Basic routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Serve static files
app.use(express.static('public'));

// Handle all routes
app.get('*', (req, res) => {
    if (req.url.startsWith('/api/')) return;
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Export for Vercel
module.exports = app;
