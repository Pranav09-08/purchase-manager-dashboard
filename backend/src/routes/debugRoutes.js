// Debug routes for troubleshooting
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Public endpoint - shows what headers are being received
router.get('/debug/headers', (req, res) => {
  res.json({
    message: 'Headers received by server:',
    headers: req.headers,
    authorization: req.headers['authorization'] || 'NO AUTHORIZATION HEADER',
    token: req.headers['authorization'] 
      ? req.headers['authorization'].split(' ')[1] 
      : 'NO TOKEN',
    timestamp: new Date().toISOString(),
  });
});

// Test the authenticateToken middleware
router.get('/debug/test-auth', require('../controllers/authController').authenticateToken, (req, res) => {
  res.json({
    message: 'Authentication successful!',
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// Check localStorage on admin dashboard
router.post('/debug/test-token', (req, res) => {
  const { token } = req.body;
  
  res.json({
    message: 'Token received for testing:',
    tokenReceived: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? token.substring(0, 50) + '...' : 'NONE',
    tokenEndsCorrectly: token ? token.split('.').length === 3 : 'NOT JWT',
  });
});

// Verify JWT token
router.post('/debug/verify-jwt', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token required in body' });
  }

  try {
    const decoded = jwt.decode(token, { complete: true });
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    res.json({
      success: true,
      message: 'Token is valid ✅',
      decoded: decoded,
      verified: verified,
      expiresAt: new Date(verified.exp * 1000),
    });
  } catch (err) {
    res.json({
      success: false,
      message: 'Token verification failed ❌',
      error: err.message,
      decoded: jwt.decode(token, { complete: true }),
      jwtSecret: process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET (using default: "your-secret-key")',
    });
  }
});

// Check environment
router.get('/debug/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || 'not set',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET (using default)',
    CORS_ENABLED: true,
    PORT: process.env.PORT || 3000,
    API_BASE_URL: process.env.API_BASE_URL || 'not set',
  });
});

module.exports = router;
