/**
 * @file    Session.js
 * @author  vansh
 * @project Verbalytics AI
 * @desc    Mongoose schema for chat sessions, messages, and evaluation scores.
 */

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false, timestamps: false }
);

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ['debate', 'interview', 'evaluate'],
      required: true,
    },
    topic: {
      type: String,
      default: '',
      trim: true,
    },
    messages: [MessageSchema],
    // Evaluation scores (set when mode = 'evaluate' or after session)
    scores: {
      logic:     { type: Number, default: null },
      clarity:   { type: Number, default: null },
      relevance: { type: Number, default: null },
    },
    feedback:     { type: String, default: '' },
    improvements: { type: String, default: '' },
    avgScore:     { type: Number, default: null },
    isComplete:   { type: Boolean, default: false },
    // Track difficulty for interview mode
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    turnCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', SessionSchema);
