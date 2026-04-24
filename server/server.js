/**
 * @file    server.js
 * @author  vansh
 * @project Verbalytics AI
 * @desc    Express server entry point — bootstraps middleware, routes and DB.
 */

'use strict';

require('dotenv').config();

// ── Author integrity seal — MUST be first ─────────────────────────────────────
const _seal = require('./core/vansh');
_seal.verify();
_seal.printBanner();
_seal.startWatchdog();
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express');
const cors     = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { validateOpenAIKey } = require('./services/openai');

// Connect to MongoDB
connectDB();

// Validate OpenAI key asynchronously (non-blocking)
validateOpenAIKey();

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// CORS — allow requests from React dev server & production
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', // alternate Vite port
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

// Global rate limiter — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/evaluations', require('./routes/evaluation'));
app.use('/api/sessions', require('./routes/sessions'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Verbalytics AI API',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Verbalytics AI server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});
