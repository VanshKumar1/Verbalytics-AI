const express = require('express');
const router  = express.Router();
const { getSessions, getSession } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// @route  GET /api/sessions
router.get('/', protect, getSessions);

// @route  GET /api/sessions/:id
router.get('/:id', protect, getSession);

module.exports = router;
