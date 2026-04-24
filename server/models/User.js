/**
 * @file    User.js
 * @author  vansh
 * @project Verbalytics AI
 * @desc    Mongoose schema for user accounts with bcrypt password hashing.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    avatar: {
      type: String,
      default: '', // initials-based avatar generated on frontend
    },
    totalSessions: { type: Number, default: 0 },
    avgLogicScore:     { type: Number, default: 0 },
    avgClarityScore:   { type: Number, default: 0 },
    avgRelevanceScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Pre-save hook: hash password before storing ────────────────────────────
UserSchema.pre('save', async function (next) {
  // Only hash if the password field was modified
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare plain password vs stored hash ────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
