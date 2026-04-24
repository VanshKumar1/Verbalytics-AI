/**
 * @file    authController.js
 * @author  vansh
 * @project Verbalytics AI
 * @desc    Handles user registration, login, and JWT-based authentication.
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: sign JWT ─────────────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── Helper: strip sensitive fields for client response ───────────────────
const sanitizeUser = (user) => ({
  _id:              user._id,
  name:             user.name,
  email:            user.email,
  avatar:           user.avatar,
  totalSessions:    user.totalSessions,
  avgLogicScore:    user.avgLogicScore,
  avgClarityScore:  user.avgClarityScore,
  avgRelevanceScore:user.avgRelevanceScore,
  createdAt:        user.createdAt,
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Input validation ──
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // ── Check for duplicate email ──
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // ── Create user (password hashed via pre-save hook) ──
    const user = await User.create({ name, email, password });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    // Mongoose duplicate key error fallback
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already in use.' });
    }
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    // ── Fetch user with password (select: false by default, must explicitly include) ──
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // ── Compare password ──
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current logged-in user's profile
// @route   GET /api/auth/me
// @access  Private (requires JWT)
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { register, login, getMe };

