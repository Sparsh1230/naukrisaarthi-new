require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { auth } = require('express-openid-connect');
const path = require('path');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());

// Auth0 configuration
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    routes: {
        callback: '/callback'
    }
};

app.use(auth(config));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth routes
app.get('/login', (req, res) => {
    res.oidc.login({ returnTo: '/dashboard' });
});

app.get('/signup', (req, res) => {
    res.oidc.login({
        returnTo: '/onboarding',
        authorizationParams: { screen_hint: 'signup' }
    });
});

app.get('/logout', (req, res) => {
    res.oidc.logout({ returnTo: '/' });
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

// Start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
