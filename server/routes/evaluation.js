/**
 * @file    routes/evaluation.js
 * @author  vansh
 * @project Verbalytics AI
 * @desc    Evaluation routes — fetch scored sessions, stats, and analytics.
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const Session = require('../models/Session');
const User    = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get all completed evaluations for the logged-in user
// @route  GET /api/evaluations
// @access Private
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const evaluations = await Session.find({
      userId:     req.user.id,
      isComplete: true,
      mode:       'evaluate',
    })
      .select('topic scores avgScore feedback improvements createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ evaluations });
  } catch (err) {
    console.error('Fetch evaluations error:', err);
    res.status(500).json({ error: 'Failed to fetch evaluations.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get detailed stats for analytics (all modes)
// @route  GET /api/evaluations/stats
// @access Private
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Session counts by mode
    const [debateCount, interviewCount, evaluateCount] = await Promise.all([
      Session.countDocuments({ userId, mode: 'debate' }),
      Session.countDocuments({ userId, mode: 'interview' }),
      Session.countDocuments({ userId, mode: 'evaluate' }),
    ]);

    // Last 10 evaluation scores for the progress chart
    const recentEvals = await Session.find({
      userId,
      isComplete: true,
      mode: 'evaluate',
    })
      .select('topic scores avgScore createdAt')
      .sort({ createdAt: 1 })
      .limit(10);

    // Best and worst sessions
    const bestSession = await Session.findOne({ userId, isComplete: true })
      .sort({ avgScore: -1 })
      .select('topic mode avgScore scores createdAt');

    const user = await User.findById(userId).select(
      'name avgLogicScore avgClarityScore avgRelevanceScore totalSessions'
    );

    // Identify weakest skill
    const scores = {
      Logic:     user?.avgLogicScore     || 0,
      Clarity:   user?.avgClarityScore   || 0,
      Relevance: user?.avgRelevanceScore || 0,
    };
    const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0];

    res.json({
      sessionCounts: { debate: debateCount, interview: interviewCount, evaluate: evaluateCount },
      recentEvals,
      bestSession,
      averages: scores,
      weakestSkill: weakest,
      totalSessions: user?.totalSessions || 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get a single evaluation by session ID
// @route  GET /api/evaluations/:sessionId
// @access Private
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:sessionId', protect, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id:    req.params.sessionId,
      userId: req.user.id,
    }).select('topic mode scores avgScore feedback improvements messages createdAt');

    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch evaluation.' });
  }
});

module.exports = router;
