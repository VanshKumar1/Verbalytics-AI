/**
 * @file    openai.js
 * @author  vansh
 * @project Verbalytics AI
 * @desc    OpenAI wrapper with auto-fallback to local AI engine on quota errors.
 */

const OpenAI = require('openai');
const { getFallbackResponse, getFallbackOpening } = require('./fallbackAI');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Track whether OpenAI is usable (set to false after quota error)
let openAIAvailable = true;

/**
 * Rough token estimator (4 chars ≈ 1 token).
 */
const estimateTokens = (messages) =>
  messages.reduce((sum, m) => sum + Math.ceil((m.content || '').length / 4), 0);

/**
 * Extract session context from system prompt and message history.
 * Used by the fallback engine to produce mode-aware responses.
 */
const extractContext = (systemPrompt, messages) => {
  // Detect mode — checks BOTH the full system prompt AND the short starter prompt formats
  let mode = 'debate';
  if (/\binterviewer\b/i.test(systemPrompt)) {
    mode = 'interview';
  } else if (/evaluation coach|scoring rubric|evaluate the user.{0,30}response|logic.*0.{0,5}10.*clarity.*0.{0,5}10/is.test(systemPrompt)) {
    mode = 'evaluate';
  }
  // Default stays 'debate'

  // Detect topic — look for quoted text in system prompt
  const topicMatch = systemPrompt.match(/"([^"]{3,80})"/);
  const topic = topicMatch ? topicMatch[1] : 'the given topic';

  // Detect difficulty
  let difficulty = 'beginner';
  if (/intermediate/i.test(systemPrompt)) difficulty = 'intermediate';
  if (/advanced/i.test(systemPrompt))     difficulty = 'advanced';

  // Get last user message
  const userMessages = messages.filter(m => m.role === 'user');
  const lastUser = userMessages[userMessages.length - 1]?.content || '';

  return { mode, topic, difficulty, lastUser, history: messages };
};

/**
 * Call OpenAI chat completions with automatic retry on rate-limit (429).
 * Falls back to the local fallback AI engine if quota is exceeded.
 *
 * @param {string} systemPrompt   - Mode-specific system instructions
 * @param {Array}  messages       - Conversation history [{role, content}]
 * @param {Object} options        - Optional overrides
 * @returns {Promise<string|object>} AI response text (or object for evaluate)
 */
const chatWithAI = async (systemPrompt, messages, options = {}) => {
  const {
    model       = process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens   = parseInt(process.env.MAX_TOKENS || '600'),
    temperature = 0.75,
    retries     = 1,
  } = options;

  // ── If OpenAI is known to be unavailable, go straight to fallback ──────────
  if (!openAIAvailable) {
    console.log('[AI] Using fallback engine (OpenAI quota exceeded).');
    return useFallback(systemPrompt, messages);
  }

  if (process.env.NODE_ENV === 'development') {
    const estimated = estimateTokens([{ content: systemPrompt }, ...messages]);
    console.log(`[OpenAI] ~${estimated} input tokens (${model}) | history: ${messages.length} msgs`);
  }

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens:  maxTokens,
    temperature,
  };

  // ── Retry loop ─────────────────────────────────────────────────────────────
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client.chat.completions.create(payload);
      const text = response.choices[0]?.message?.content?.trim();
      if (!text) throw new Error('Empty response from OpenAI');

      if (process.env.NODE_ENV === 'development') {
        const used = response.usage;
        console.log(`[OpenAI] ✅ Tokens used — prompt: ${used?.prompt_tokens}, completion: ${used?.completion_tokens}, total: ${used?.total_tokens}`);
      }
      return text;

    } catch (err) {
      const isQuotaExceeded = err?.status === 429 ||
        err?.code === 'rate_limit_exceeded' ||
        err?.code === 'insufficient_quota' ||
        (err?.message || '').toLowerCase().includes('quota');

      const isLastAttempt = attempt === retries;

      if (isQuotaExceeded && !isLastAttempt) {
        const waitMs = Math.pow(2, attempt + 1) * 1000;
        console.warn(`[OpenAI] Rate limited. Retrying in ${waitMs / 1000}s...`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (isQuotaExceeded) {
        // Mark OpenAI as unavailable for the rest of this server session
        openAIAvailable = false;
        console.warn('[AI] ⚠️  OpenAI quota exceeded. Switching to fallback AI engine.');
        return useFallback(systemPrompt, messages);
      }

      // For non-quota errors (network, 401, etc.) — rethrow
      throw err;
    }
  }
};

/**
 * Use the local fallback engine to generate a response.
 */
const useFallback = (systemPrompt, messages) => {
  const { mode, topic, difficulty, lastUser, history } = extractContext(systemPrompt, messages);
  const response = getFallbackResponse(mode, topic, lastUser, history, difficulty);

  // For evaluate mode, the fallback returns an object — convert to JSON string
  if (mode === 'evaluate' && typeof response === 'object') {
    return JSON.stringify(response);
  }
  return response;
};

/**
 * Validate that the OpenAI key is set and reachable.
 * Called once on server start.
 */
const validateOpenAIKey = async () => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai')) {
    console.warn('⚠️  OPENAI_API_KEY is not set. Using fallback AI engine.');
    openAIAvailable = false;
    return false;
  }
  try {
    await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5,
    });
    console.log('✅ OpenAI API key validated successfully. Using live AI.');
    openAIAvailable = true;
    return true;
  } catch (err) {
    if (err?.status === 401) {
      console.error('❌ OpenAI API key is INVALID. Using fallback AI engine.');
    } else if (err?.status === 429 ||
               err?.code === 'insufficient_quota' ||
               (err?.message || '').includes('quota')) {
      console.warn('⚠️  OpenAI quota exceeded. Using fallback AI engine for all requests.');
    } else {
      console.warn(`⚠️  OpenAI check failed: ${err.message}. Using fallback AI engine.`);
    }
    openAIAvailable = false;
    return false;
  }
};

module.exports = { chatWithAI, validateOpenAIKey, estimateTokens };
