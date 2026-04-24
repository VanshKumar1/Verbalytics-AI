/**
 * @file    chatController.js
 * @author  vansh
 * @project Verbalytics AI
 * @desc    Session lifecycle, AI message exchange, and evaluation scoring.
 */

const Session  = require('../models/Session');
const User     = require('../models/User');
const { buildSystemPrompt, buildStarterPrompt, TOPIC_SUGGESTIONS } = require('../services/promptBuilder');
const { chatWithAI } = require('../services/openai');
const { getFallbackOpening } = require('../services/fallbackAI');

// Sliding window: keep last N messages for context (controls token cost)
const MAX_CONTEXT_MESSAGES = 14;

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Start a brand-new session — AI speaks FIRST
// @route  POST /api/chat/start
// @access Private
// ─────────────────────────────────────────────────────────────────────────────
const startSession = async (req, res) => {
  try {
    const { mode, topic } = req.body;
    const userId = req.user.id;

    if (!mode || !topic?.trim()) {
      return res.status(400).json({ error: 'Mode and topic are required.' });
    }

    const validModes = ['debate', 'interview', 'evaluate'];
    if (!validModes.includes(mode.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid mode. Choose debate, interview, or evaluate.' });
    }

    // Create session in DB
    const session = await Session.create({
      userId,
      mode:       mode.toLowerCase(),
      topic:      topic.trim(),
      messages:   [],
      difficulty: 'beginner',
      turnCount:  0,
    });

    // Increment user session count
    await User.findByIdAndUpdate(userId, { $inc: { totalSessions: 1 } });

    let openingMessage;

    try {
      // Try OpenAI first (will auto-fallback inside chatWithAI if quota exceeded)
      const starterPrompt = buildStarterPrompt(mode, topic.trim(), 'beginner');
      const rawOpening = await chatWithAI(
        starterPrompt,
        [],
        { maxTokens: 200, temperature: 0.7 }
      );
      // If the result looks like JSON (fallback engine returned evaluate JSON), use text fallback
      if (rawOpening && rawOpening.trim().startsWith('{')) {
        openingMessage = getFallbackOpening(mode.toLowerCase(), topic.trim(), 'beginner');
      } else {
        openingMessage = rawOpening;
      }
    } catch (aiErr) {
      console.warn('[Session Start] AI call failed, using fallback opening:', aiErr.message);
      openingMessage = getFallbackOpening(mode.toLowerCase(), topic.trim(), 'beginner');
    }

    // Ensure openingMessage is always a string
    if (typeof openingMessage === 'object') {
      openingMessage = JSON.stringify(openingMessage);
    }

    // Store the AI's opening in the session
    session.messages.push({ role: 'assistant', content: openingMessage });
    await session.save();

    res.status(201).json({
      sessionId:     session._id,
      mode:          session.mode,
      topic:         session.topic,
      openingMessage,
      difficulty:    session.difficulty,
    });
  } catch (err) {
    console.error('Start session error:', err);
    res.status(500).json({ error: 'Failed to start session. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Send a message and get AI response in an existing session
// @route  POST /api/chat
// @access Private
// ─────────────────────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user.id;

    if (!sessionId) return res.status(400).json({ error: 'sessionId is required.' });
    if (!message?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    // ── Add user message ────────────────────────────────────────────────────
    session.messages.push({ role: 'user', content: message.trim() });
    session.turnCount += 1;

    // ── Dynamic difficulty adjustment (Interview mode) ───────────────────────
    if (session.mode === 'interview') {
      if (session.turnCount >= 6 && session.turnCount < 12) session.difficulty = 'intermediate';
      else if (session.turnCount >= 12) session.difficulty = 'advanced';
    }

    // ── Build system prompt & sliding context window ─────────────────────────
    const systemPrompt    = buildSystemPrompt(session.mode, session.topic, session.difficulty);
    const contextMessages = session.messages.slice(-MAX_CONTEXT_MESSAGES);

    // ── Call AI (with automatic fallback) ───────────────────────────────────
    let rawResponse;
    try {
      rawResponse = await chatWithAI(systemPrompt, contextMessages);
    } catch (aiErr) {
      // Last-resort emergency fallback (should rarely reach here)
      const { getFallbackResponse } = require('../services/fallbackAI');
      const fb = getFallbackResponse(
        session.mode, session.topic, message.trim(), session.messages, session.difficulty
      );
      rawResponse = typeof fb === 'object' ? JSON.stringify(fb) : fb;
    }

    // Ensure rawResponse is always a string for storage
    const aiResponseText = typeof rawResponse === 'object' ? JSON.stringify(rawResponse) : rawResponse;

    // ── Store AI reply ──────────────────────────────────────────────────────
    session.messages.push({ role: 'assistant', content: aiResponseText });

    // ── Parse evaluation JSON (evaluate mode only) ───────────────────────────
    let evaluationResult = null;
    if (session.mode === 'evaluate') {
      try {
        const cleaned = aiResponseText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        evaluationResult = JSON.parse(cleaned);

        // Validate required fields
        if (
          typeof evaluationResult.logic     !== 'number' ||
          typeof evaluationResult.clarity   !== 'number' ||
          typeof evaluationResult.relevance !== 'number'
        ) {
          throw new Error('Invalid evaluation structure');
        }

        session.scores = {
          logic:     evaluationResult.logic,
          clarity:   evaluationResult.clarity,
          relevance: evaluationResult.relevance,
        };
        session.feedback     = evaluationResult.feedback     || '';
        session.improvements = evaluationResult.improvements || '';
        session.avgScore     = +(
          (evaluationResult.logic + evaluationResult.clarity + evaluationResult.relevance) / 3
        ).toFixed(2);
        session.isComplete = true;

        // ── Update user's rolling average scores ────────────────────────────
        const user = await User.findById(userId);
        if (user) {
          const n = Math.max(user.totalSessions, 1);
          await User.findByIdAndUpdate(userId, {
            avgLogicScore:
              +((user.avgLogicScore * (n - 1) + evaluationResult.logic) / n).toFixed(2),
            avgClarityScore:
              +((user.avgClarityScore * (n - 1) + evaluationResult.clarity) / n).toFixed(2),
            avgRelevanceScore:
              +((user.avgRelevanceScore * (n - 1) + evaluationResult.relevance) / n).toFixed(2),
          });
        }
      } catch (parseErr) {
        console.warn('[Chat] Evaluation JSON parse failed — raw response shown to user');
        // Do NOT mark session as complete if parse failed
      }
    }

    await session.save();

    res.status(200).json({
      sessionId:  session._id,
      reply:      aiResponseText,
      evaluation: evaluationResult,
      difficulty: session.difficulty,
      turnCount:  session.turnCount,
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get topic suggestions for a given mode
// @route  GET /api/chat/topics?mode=debate
// @access Private
// ─────────────────────────────────────────────────────────────────────────────
const getTopics = (req, res) => {
  const mode = req.query.mode || 'debate';
  const topics = TOPIC_SUGGESTIONS[mode] || TOPIC_SUGGESTIONS.debate;
  // Return 5 random suggestions
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  res.json({ topics: shuffled.slice(0, 5) });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get all sessions for the current user
// @route  GET /api/sessions
// @access Private
// ─────────────────────────────────────────────────────────────────────────────
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id })
      .select('-messages')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc   Get a single session with full message history
// @route  GET /api/sessions/:id
// @access Private
// ─────────────────────────────────────────────────────────────────────────────
const getSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session.' });
  }
};

module.exports = { startSession, sendMessage, getTopics, getSessions, getSession };
