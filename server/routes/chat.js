/**
 * @file    routes/chat.js
 * @author  vansh
 * @project Verbalytics AI
 * @desc    Chat routes — start session, send message, get topic suggestions.
 */

const express = require('express');
const router  = express.Router();
const { startSession, sendMessage, getTopics } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// @route  POST /api/chat/start  — create session & get AI's opening message
router.post('/start', protect, startSession);

// @route  POST /api/chat        — send a message, get AI reply
router.post('/', protect, sendMessage);

// @route  GET  /api/chat/topics?mode=debate  — get topic suggestions
router.get('/topics', protect, getTopics);

module.exports = router;
