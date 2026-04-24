/**
 * ─────────────────────────────────────────────────────────────────────────────
 * VERBALYTICS AI — Fallback AI Engine
 * Provides realistic, mode-aware responses when OpenAI API quota is exhausted.
 * Used automatically when a 429 / quota error occurs.
 * ─────────────────────────────────────────────────────────────────────────────
 * @file    fallbackAI.js
 * @author  vansh
 * @project Verbalytics AI
 */

// ── Debate fallback responses ─────────────────────────────────────────────────
const DEBATE_COUNTERS = [
  {
    counter: "While your argument has surface-level appeal, it fundamentally ignores the systemic consequences. History has shown us repeatedly that similar reasoning led to outcomes no one intended. The burden of proof lies entirely with you to demonstrate this won't follow the same pattern.",
    question: "Can you provide a single verified case study where this approach succeeded at scale without significant unintended consequences?"
  },
  {
    counter: "Your position relies on a false premise. You're assuming correlation implies causation, which is a classic logical fallacy. The evidence actually points in the opposite direction — when independent researchers controlled for confounding variables, the results contradicted your claim entirely.",
    question: "How do you account for the studies from Oxford and MIT that directly contradict the statistical basis of your argument?"
  },
  {
    counter: "Let's take your logic to its natural conclusion — if we accept your premise, we must also accept outcomes that most reasonable people would find unacceptable. This reductio ad absurdum reveals a fundamental flaw in your reasoning that you haven't addressed.",
    question: "Where exactly do you draw the line, and what principled reason prevents your argument from being extended to those extreme conclusions?"
  },
  {
    counter: "You're presenting a false dichotomy by implying there are only two options. There are at least three well-documented alternatives that achieve the same goal without the drawbacks you're advocating for. Ignoring them weakens your position significantly.",
    question: "Have you considered the hybrid approach adopted by Nordic countries in 2018 that produced measurably better results than either extreme you're presenting?"
  },
  {
    counter: "The precedent simply doesn't support your view. Every major civilization that implemented a similar policy saw diminishing returns within a decade. You're proposing we repeat a known failure while expecting a different result — which itself is an irrational position.",
    question: "What makes you confident that the conditions today are so fundamentally different that we would avoid the same pitfalls?"
  },
  {
    counter: "Your argument ignores the voices of the people most affected by this issue. The stakeholders directly impacted overwhelmingly oppose this position — and dismissing their lived experience in favor of abstract theory is both intellectually dishonest and ethically problematic.",
    question: "How do you justify advocating for a policy when those with the most to lose are telling us it would harm them?"
  },
  {
    counter: "I'll grant that your point has partial validity in a narrow context. However, you're applying a micro-level observation to a macro-level problem — a scope error that invalidates the conclusion. The principle of scale changes everything here.",
    question: "Can you demonstrate that the same logic holds when applied at a national or global level, rather than just the isolated examples you've cited?"
  },
];

// ── Interview fallback questions by level ─────────────────────────────────────
const INTERVIEW_QUESTIONS = {
  beginner: [
    "Tell me about yourself and what draws you to this field.",
    "What do you understand by the core principles of this domain?",
    "How would you handle a situation where you disagreed with your team's approach?",
    "Why are you interested in pursuing a career in this area?",
    "Describe a project or experience that you're particularly proud of.",
    "What are your greatest strengths that make you suitable for this role?",
  ],
  intermediate: [
    "Walk me through how you would approach designing a solution from scratch for a complex problem in this domain.",
    "Describe a challenging technical or professional obstacle you faced and how you overcame it.",
    "How do you prioritize competing tasks when everything seems urgent?",
    "Tell me about a time you had to influence stakeholders who were resistant to your idea.",
    "What's your approach to staying current with developments in this field?",
    "How would you handle a situation where you discovered a critical error close to a deadline?",
  ],
  advanced: [
    "How would you build and scale a cross-functional initiative from concept to execution in a large organization?",
    "Describe the most significant professional failure you've experienced and what it taught you.",
    "How do you make high-stakes decisions when you have incomplete or conflicting information?",
    "Walk me through how you would evaluate and modernize an outdated system while keeping operations running.",
    "How do you build alignment between technical teams and business leadership when they have opposing priorities?",
    "Where do you see this industry evolving over the next 5–10 years, and how are you positioning yourself for that future?",
  ],
};

const INTERVIEW_ACKNOWLEDGEMENTS = [
  "Interesting perspective.",
  "Good example.",
  "I see.",
  "Thank you for sharing that.",
  "That's a thoughtful approach.",
  "I appreciate the detail there.",
];

// ── Evaluation fallback scoring ───────────────────────────────────────────────
const generateEvaluationScore = (userText) => {
  const words    = userText.trim().split(/\s+/);
  const len      = words.length;
  const hasEvidence = /\b(study|research|data|evidence|statistic|percent|survey|report|according|shows|found|proves)\b/i.test(userText);
  const hasStructure = /\b(first|second|third|furthermore|however|therefore|because|since|although|in conclusion|to summarize)\b/i.test(userText);
  const isOnTopic = len > 20;
  const hasClearSentences = userText.split(/[.!?]/).filter(s => s.trim().length > 10).length >= 2;

  // Score logic (0-10)
  let logic = 5;
  if (len > 50)  logic += 1;
  if (len > 100) logic += 1;
  if (hasEvidence)  logic += 2;
  if (hasStructure) logic += 1;
  logic = Math.min(10, Math.max(1, logic));

  // Score clarity
  let clarity = 4;
  if (hasClearSentences) clarity += 2;
  if (len > 30 && len < 300) clarity += 1;
  if (hasStructure) clarity += 2;
  clarity = Math.min(10, Math.max(1, clarity));

  // Score relevance
  let relevance = 5;
  if (isOnTopic) relevance += 2;
  if (len > 30)  relevance += 1;
  if (hasEvidence) relevance += 1;
  relevance = Math.min(10, Math.max(1, relevance));

  const avg = +((logic + clarity + relevance) / 3).toFixed(1);

  // Generate feedback based on scores
  let feedback, improvements;
  if (avg >= 7.5) {
    feedback = "Strong response overall. Your argument is well-constructed with clear logical flow. You demonstrate an understanding of the topic and support your claims effectively.";
    improvements = "To reach a 9+, add verified statistics or cite specific examples. Also consider acknowledging a counter-argument and refuting it — this shows intellectual honesty and strengthens your position.";
  } else if (avg >= 5.5) {
    feedback = "A reasonable attempt with a clear central idea. However, the argument could benefit from stronger supporting evidence and more precise language. Some sections felt underdeveloped.";
    improvements = "Focus on three things: (1) Add at least one concrete statistic or real-world example, (2) Use transitional phrases to connect your points clearly, (3) End with a strong summary sentence that reinforces your main claim.";
  } else {
    feedback = "The response has a basic premise but lacks sufficient development. The argument is difficult to follow in places, and the connection between your points and the topic isn't always clear.";
    improvements = "Start by stating your main position in one clear sentence. Then provide two or three supporting reasons, each with a brief example. Structure your response as: Claim → Reason → Evidence → Conclusion.";
  }

  return { logic, clarity, relevance, feedback, improvements };
};

// ── Master fallback function ──────────────────────────────────────────────────
/**
 * Generate a realistic fallback response without calling OpenAI.
 * @param {string} mode  - 'debate' | 'interview' | 'evaluate'
 * @param {string} topic - Session topic
 * @param {string} userMessage - Latest user message
 * @param {Array}  history - Message history
 * @param {string} difficulty - 'beginner' | 'intermediate' | 'advanced'
 * @returns {string|object} AI response text, or JSON object for evaluate mode
 */
const getFallbackResponse = (mode, topic, userMessage, history = [], difficulty = 'beginner') => {
  const turnIndex = history.filter(m => m.role === 'user').length;

  if (mode === 'debate') {
    const counter = DEBATE_COUNTERS[turnIndex % DEBATE_COUNTERS.length];
    return `**Counter:** ${counter.counter}\n\n**Follow-up Question:** ${counter.question}`;
  }

  if (mode === 'interview') {
    const level = difficulty || 'beginner';
    const questions = INTERVIEW_QUESTIONS[level] || INTERVIEW_QUESTIONS.beginner;
    const questionIndex = Math.min(turnIndex, questions.length - 1);
    const ack = INTERVIEW_ACKNOWLEDGEMENTS[turnIndex % INTERVIEW_ACKNOWLEDGEMENTS.length];

    if (turnIndex === 0) {
      return `Good to meet you! I'm your interviewer today. We'll be focusing on **${topic || 'this field'}**. I'll ask you questions one at a time — take your time with each answer.\n\n${questions[0]}`;
    }
    return `${ack}\n\n${questions[questionIndex]}`;
  }

  if (mode === 'evaluate') {
    return generateEvaluationScore(userMessage);
  }

  // Default
  return "Thank you for your response. Could you elaborate further on your main point?";
};

// ── Opening message fallback ──────────────────────────────────────────────────
const getFallbackOpening = (mode, topic, difficulty) => {
  if (mode === 'debate') {
    return `Welcome to the debate! The topic is: **"${topic}"**\n\nI will be arguing the **opposing position**. I believe the statement is fundamentally flawed and I'm prepared to demonstrate why.\n\nPlease present your **opening argument** — make your strongest case for your position.`;
  }
  if (mode === 'interview') {
    return `Hello! I'll be your interviewer today for the **${topic}** role. This will be a structured interview — I'll ask one question at a time, and I encourage you to give detailed answers.\n\nLet's begin:\n\n**Tell me about yourself and what motivated you to pursue ${topic}?**`;
  }
  if (mode === 'evaluate') {
    return `Welcome to Evaluation Mode! 📊\n\nThe topic for today is: **"${topic}"**\n\nType your argument or response in the chat below. I will score it on:\n- **Logic** (0–10) — How well-reasoned is your argument?\n- **Clarity** (0–10) — How clearly do you express your ideas?\n- **Relevance** (0–10) — How on-topic is your response?\n\nWhenever you're ready, go ahead and make your argument!`;
  }
  return `Session started on: **"${topic}"**. Please begin.`;
};

module.exports = { getFallbackResponse, getFallbackOpening, generateEvaluationScore };
