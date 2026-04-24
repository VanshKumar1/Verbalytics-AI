import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Swords, BriefcaseBusiness, BarChart3, Send,
  Plus, RotateCcw, ChevronDown, Bot, User,
  Lightbulb, AlertCircle
} from 'lucide-react';

// ── Mode config ───────────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'debate',
    label: 'Debate',
    icon: Swords,
    color: '#6c63ff',
    bg: '#6c63ff18',
    border: '#6c63ff35',
    placeholder: 'e.g. Social media does more harm than good',
    topicLabel: 'Debate Topic',
    hint: 'AI will argue the OPPOSING side and challenge your reasoning.',
  },
  {
    id: 'interview',
    label: 'Interview',
    icon: BriefcaseBusiness,
    color: '#22d3ee',
    bg: '#22d3ee12',
    border: '#22d3ee30',
    placeholder: 'e.g. Software Engineering, Product Management',
    topicLabel: 'Interview Role / Field',
    hint: 'AI acts as your interviewer, one question at a time.',
  },
  {
    id: 'evaluate',
    label: 'Evaluate',
    icon: BarChart3,
    color: '#10b981',
    bg: '#10b98115',
    border: '#10b98130',
    placeholder: 'e.g. Renewable energy is the future',
    topicLabel: 'Topic to Evaluate',
    hint: 'Type your argument below and receive scores on Logic, Clarity & Relevance.',
  },
];

// ── Score Display Component ───────────────────────────────────────────────────
function EvaluationCard({ evaluation }) {
  if (!evaluation) return null;
  const { logic, clarity, relevance, feedback, improvements } = evaluation;
  const avg = ((logic + clarity + relevance) / 3).toFixed(1);
  const scoreColor = avg >= 7 ? '#10b981' : avg >= 5 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="eval-card">
      <div className="eval-header">
        <span className="eval-title">📊 Evaluation Results</span>
        <span className="eval-avg" style={{ color: scoreColor }}>{avg}/10 avg</span>
      </div>
      <div className="eval-scores">
        {[['Logic', logic, '#6c63ff'], ['Clarity', clarity, '#22d3ee'], ['Relevance', relevance, '#10b981']].map(
          ([label, score, color]) => (
            <div key={label} className="eval-score-item">
              <div className="eval-score-label">{label}</div>
              <div className="eval-bar-wrap">
                <div className="eval-bar" style={{ width: `${score * 10}%`, background: color }} />
              </div>
              <div className="eval-score-num" style={{ color }}>{score}/10</div>
            </div>
          )
        )}
      </div>
      {feedback && (
        <div className="eval-feedback">
          <Lightbulb size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <p>{feedback}</p>
        </div>
      )}
      {improvements && (
        <div className="eval-improvements">
          <AlertCircle size={14} style={{ color: '#6c63ff', flexShrink: 0 }} />
          <p>{improvements}</p>
        </div>
      )}
    </div>
  );
}

// ── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="msg-row msg-row-ai">
      <div className="msg-avatar msg-avatar-ai"><Bot size={14} /></div>
      <div className="typing-indicator">
        <span /><span /><span />
      </div>
    </div>
  );
}

// ── Main Chat Component ───────────────────────────────────────────────────────
export default function Chat() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'debate';

  const [selectedMode, setSelectedMode] = useState(
    MODES.find((m) => m.id === initialMode) || MODES[0]
  );
  const [topic, setTopic]                 = useState('');
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState('');
  const [sessionId, setSessionId]         = useState(null);
  const [loading, setLoading]             = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [difficulty, setDifficulty]       = useState('beginner');
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const chatBoxRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input after session starts
  useEffect(() => {
    if (sessionStarted) inputRef.current?.focus();
  }, [sessionStarted]);

  // Fetch topic suggestions when mode changes
  useEffect(() => {
    if (sessionStarted) return;
    const fetchTopics = async () => {
      setLoadingTopics(true);
      try {
        const token = localStorage.getItem('verbalytics_token');
        if (!token) return;
        const { data } = await api.get(`/chat/topics?mode=${selectedMode.id}`);
        setSuggestedTopics(data.topics || []);
      } catch {
        setSuggestedTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, [selectedMode.id]);

  const currentMode = selectedMode;

  const startSession = async () => {
    if (!topic.trim()) {
      toast.error(`Please enter a ${currentMode.topicLabel.toLowerCase()} first.`);
      return;
    }
    setSessionStarted(true);
    setMessages([]);
    setSessionId(null);
    setLoading(true);

    try {
      const { data } = await api.post('/chat/start', {
        mode:  currentMode.id,
        topic: topic.trim(),
      });

      setSessionId(data.sessionId);
      setDifficulty(data.difficulty || 'beginner');

      // Show the AI's real opening message from the backend
      setMessages([{ role: 'assistant', content: data.openingMessage }]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to start session. Please try again.';
      toast.error(msg);
      setSessionStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setSessionStarted(false);
    setMessages([]);
    setSessionId(null);
    setTopic('');
    setInput('');
    setDifficulty('beginner');
    toast.success('Session reset!');
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/chat', {
        sessionId,
        message: userMsg,
      });

      setSessionId(data.sessionId);
      setDifficulty(data.difficulty);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, evaluation: data.evaluation },
      ]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to get AI response.';
      toast.error(msg);
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
      setInput(userMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageContent = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="chat-shell">
        {/* ── Left Panel: Config ─────────────────────────────── */}
        <aside className="chat-config">
          <div className="chat-config-inner">
            <h2 className="config-title">AI Practice</h2>
            <p className="config-sub">Configure your session</p>

            {/* Mode Selector */}
            <div className="config-section">
              <label className="config-label">Mode</label>
              <div className="mode-selector">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const active = selectedMode.id === m.id;
                  return (
                    <button
                      key={m.id}
                      id={`mode-btn-${m.id}`}
                      className={`mode-btn ${active ? 'mode-btn-active' : ''}`}
                      style={active ? { '--mc': m.color, '--mb': m.bg, '--mbo': m.border } : {}}
                      onClick={() => { setSelectedMode(m); resetSession(); }}
                      disabled={sessionStarted}
                    >
                      <Icon size={15} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Hint */}
            <div className="mode-hint" style={{ background: currentMode.bg, border: `1px solid ${currentMode.border}` }}>
              <p style={{ color: currentMode.color, fontSize: '0.8rem' }}>{currentMode.hint}</p>
            </div>

            {/* Topic Input */}
            <div className="config-section">
              <label className="config-label" htmlFor="topic-input">{currentMode.topicLabel}</label>
              <input
                id="topic-input"
                className="input"
                placeholder={currentMode.placeholder}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={sessionStarted}
                onKeyDown={(e) => e.key === 'Enter' && !sessionStarted && startSession()}
              />
            </div>

            {/* Suggested Topics (Step 10: Dynamic context-aware) */}
            {!sessionStarted && (
              <div className="config-section">
                <label className="config-label">💡 Quick Topics</label>
                {loadingTopics ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                    <div className="spinner" style={{ width: 16, height: 16 }} />
                  </div>
                ) : (
                  <div className="topic-chips">
                    {suggestedTopics.map((t) => (
                      <button
                        key={t}
                        className="topic-chip"
                        style={{ '--tc': currentMode.color, '--tcbg': currentMode.bg, '--tcbd': currentMode.border }}
                        onClick={() => setTopic(t)}
                        title={t}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Difficulty Badge (for interview mode) */}
            {sessionStarted && selectedMode.id === 'interview' && (
              <div className="config-section">
                <label className="config-label">Current Difficulty</label>
                <span className={`badge ${
                  difficulty === 'beginner' ? 'badge-emerald' :
                  difficulty === 'intermediate' ? 'badge-cyan' : 'badge-primary'
                }`} style={{ fontSize: '0.8rem' }}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="config-actions">
              {!sessionStarted ? (
                <button
                  id="start-session-btn"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={startSession}
                >
                  <Plus size={16} /> Start Session
                </button>
              ) : (
                <button
                  id="reset-session-btn"
                  className="btn btn-ghost"
                  style={{ width: '100%' }}
                  onClick={resetSession}
                >
                  <RotateCcw size={15} /> New Session
                </button>
              )}
            </div>

            {/* Message count */}
            {sessionStarted && messages.length > 0 && (
              <div className="msg-count">
                {messages.filter((m) => m.role === 'user').length} message{messages.filter((m) => m.role === 'user').length !== 1 ? 's' : ''} sent
              </div>
            )}
          </div>
        </aside>

        {/* ── Right Panel: Chat ──────────────────────────────── */}
        <div className="chat-main">
          {/* Header bar */}
          <div className="chat-topbar">
            <div className="chat-topbar-info">
              {(() => { const Icon = currentMode.icon; return <Icon size={18} style={{ color: currentMode.color }} />; })()}
              <span className="chat-topbar-mode" style={{ color: currentMode.color }}>{currentMode.label} Mode</span>
              {topic && <span className="chat-topbar-topic">— {topic}</span>}
            </div>
            {sessionStarted && (
              <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={resetSession}>
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="chat-messages" ref={chatBoxRef}>
            {!sessionStarted ? (
              <div className="chat-empty">
                {(() => { const Icon = currentMode.icon; return <Icon size={48} style={{ color: currentMode.color, opacity: 0.4 }} />; })()}
                <h3>Ready to Practice?</h3>
                <p>Select a mode, enter your topic, and hit <strong>Start Session</strong> to begin.</p>
                <div className="chat-empty-modes">
                  {MODES.map((m) => {
                    const Icon = m.icon;
                    return (
                      <div key={m.id} className="chat-empty-mode-chip" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                        <Icon size={13} style={{ color: m.color }} />
                        <span style={{ color: m.color, fontSize: '0.78rem', fontWeight: 600 }}>{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  if (msg.role === 'system-info') {
                    return (
                      <div key={idx} className="msg-system-info">
                        <p dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }} />
                      </div>
                    );
                  }
                  const isUser = msg.role === 'user';
                  return (
                    <div key={idx} className={`msg-row ${isUser ? 'msg-row-user' : 'msg-row-ai'}`}>
                      {!isUser && (
                        <div className="msg-avatar msg-avatar-ai">
                          <Bot size={14} />
                        </div>
                      )}
                      <div className={isUser ? 'bubble-user' : 'bubble-ai'}>
                        <p dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }} />
                        {msg.evaluation && <EvaluationCard evaluation={msg.evaluation} />}
                      </div>
                      {isUser && (
                        <div className="msg-avatar msg-avatar-user">
                          <User size={14} />
                        </div>
                      )}
                    </div>
                  );
                })}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className={`chat-input-bar ${!sessionStarted ? 'chat-input-bar-disabled' : ''}`}>
            <div className="chat-input-wrap">
              <textarea
                ref={inputRef}
                id="chat-input"
                className="chat-textarea"
                placeholder={
                  !sessionStarted
                    ? 'Start a session to begin chatting...'
                    : currentMode.id === 'evaluate'
                    ? 'Type your argument here to be evaluated...'
                    : 'Type your message... (Enter to send, Shift+Enter for new line)'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!sessionStarted || loading}
                rows={1}
              />
              <button
                id="send-message-btn"
                className="chat-send-btn"
                style={{ background: `linear-gradient(135deg, ${currentMode.color}, ${currentMode.color}bb)` }}
                onClick={sendMessage}
                disabled={!sessionStarted || loading || !input.trim()}
              >
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Send size={16} />}
              </button>
            </div>
            <p className="chat-input-hint">
              {currentMode.id === 'evaluate'
                ? 'Your full response will be scored on Logic, Clarity, and Relevance.'
                : 'Press Enter to send • Shift+Enter for new line'}
            </p>
          </div>
        </div>
      </div>

      <style>{chatStyles}</style>
    </div>
  );
}

const chatStyles = `
/* ── Layout ─────────────────────────────────────────────────── */
.chat-shell {
  flex: 1; display: flex; min-height: 100vh; overflow: hidden;
}

/* ── Config Panel ───────────────────────────────────────────── */
.chat-config {
  width: 280px; min-width: 280px;
  border-right: 1px solid var(--border);
  background: var(--bg-surface);
  display: flex; flex-direction: column;
  overflow-y: auto;
}
.chat-config-inner {
  padding: 28px 20px;
  display: flex; flex-direction: column; gap: 20px;
}
.config-title { font-size: 1.1rem; font-weight: 700; }
.config-sub { font-size: 0.8rem; color: var(--text-muted); margin-top: -14px; }
.config-label {
  display: block; font-size: 0.78rem; font-weight: 600;
  color: var(--text-secondary); letter-spacing: 0.04em; margin-bottom: 8px;
}
.config-section { display: flex; flex-direction: column; }

.mode-selector { display: flex; flex-direction: column; gap: 6px; }
.mode-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; border-radius: 8px;
  border: 1px solid var(--border); background: transparent;
  color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s; text-align: left;
}
.mode-btn:hover:not(:disabled) { background: var(--bg-card); color: var(--text-primary); }
.mode-btn-active {
  background: var(--mb) !important;
  border-color: var(--mbo) !important;
  color: var(--mc) !important;
  font-weight: 600;
}
.mode-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.mode-hint { border-radius: 8px; padding: 10px 12px; }

.config-actions {}
.msg-count {
  font-size: 0.75rem; color: var(--text-muted);
  text-align: center; padding: 8px;
  background: var(--bg-card); border-radius: 8px;
}

/* ── Chat Main ──────────────────────────────────────────────── */
.chat-main {
  flex: 1; display: flex; flex-direction: column;
  background: var(--bg-base); overflow: hidden;
}

/* Top bar */
.chat-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px; border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
}
.chat-topbar-info { display: flex; align-items: center; gap: 8px; }
.chat-topbar-mode { font-weight: 700; font-size: 0.9rem; }
.chat-topbar-topic { color: var(--text-secondary); font-size: 0.85rem; }

/* Messages */
.chat-messages {
  flex: 1; overflow-y: auto; padding: 24px;
  display: flex; flex-direction: column; gap: 16px;
}

/* Empty state */
.chat-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px; text-align: center; color: var(--text-secondary);
  padding: 60px 20px;
}
.chat-empty h3 { font-size: 1.2rem; color: var(--text-primary); }
.chat-empty p { font-size: 0.875rem; max-width: 360px; line-height: 1.6; }
.chat-empty-modes { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
.chat-empty-mode-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 999px;
}

/* Message rows */
.msg-row { display: flex; align-items: flex-end; gap: 8px; animation: fadeInUp 0.3s ease; }
.msg-row-user { flex-direction: row-reverse; }
.msg-row-ai  { flex-direction: row; }

.msg-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 0.75rem;
}
.msg-avatar-ai   { background: #6c63ff25; color: var(--accent-secondary); border: 1px solid #6c63ff30; }
.msg-avatar-user { background: #ffffff10; color: var(--text-muted); border: 1px solid var(--border); }

.bubble-user, .bubble-ai { max-width: 68%; font-size: 0.9rem; line-height: 1.65; }

/* System info bubble */
.msg-system-info {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 12px; padding: 14px 18px;
  font-size: 0.875rem; color: var(--text-secondary);
  max-width: 600px; margin: 0 auto; text-align: center;
  line-height: 1.7;
}

/* Typing indicator */
.typing-indicator {
  display: flex; gap: 5px; align-items: center;
  background: var(--bg-card); border: 1px solid var(--border);
  padding: 14px 18px; border-radius: 18px 18px 18px 4px;
}
.typing-indicator span {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--text-muted); display: block;
  animation: typing-bounce 1.2s ease infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%            { transform: translateY(-6px); opacity: 1; }
}

/* Evaluation card inside ai bubble */
.eval-card {
  margin-top: 14px; padding: 16px;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 12px; display: flex; flex-direction: column; gap: 12px;
}
.eval-header { display: flex; justify-content: space-between; align-items: center; }
.eval-title { font-size: 0.85rem; font-weight: 700; }
.eval-avg { font-size: 1.1rem; font-weight: 800; font-family: 'Outfit', sans-serif; }
.eval-scores { display: flex; flex-direction: column; gap: 8px; }
.eval-score-item { display: flex; align-items: center; gap: 10px; }
.eval-score-label { font-size: 0.78rem; min-width: 62px; color: var(--text-secondary); }
.eval-bar-wrap { flex: 1; height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; }
.eval-bar { height: 100%; border-radius: 999px; transition: width 0.8s ease; }
.eval-score-num { font-size: 0.8rem; font-weight: 700; min-width: 36px; text-align: right; }
.eval-feedback, .eval-improvements {
  display: flex; gap: 8px; font-size: 0.8rem; line-height: 1.6;
  color: var(--text-secondary); padding: 10px 12px;
  background: var(--bg-card); border-radius: 8px;
}

/* Input bar */
.chat-input-bar {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--border);
  background: var(--bg-surface);
}
.chat-input-bar-disabled { opacity: 0.5; pointer-events: none; }
.chat-input-wrap {
  display: flex; align-items: flex-end; gap: 10px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 14px; padding: 10px 10px 10px 16px;
  transition: border-color 0.2s;
}
.chat-input-wrap:focus-within { border-color: var(--accent-primary); box-shadow: 0 0 0 3px #6c63ff18; }
.chat-textarea {
  flex: 1; background: none; border: none; outline: none;
  color: var(--text-primary); font-family: 'Inter', sans-serif;
  font-size: 0.9rem; resize: none; line-height: 1.5;
  max-height: 140px; overflow-y: auto;
}
.chat-textarea::placeholder { color: var(--text-muted); }
.chat-send-btn {
  width: 38px; height: 38px; border-radius: 10px;
  border: none; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  transition: transform 0.15s, opacity 0.15s;
}
.chat-send-btn:hover:not(:disabled) { transform: scale(1.08); }
.chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.chat-input-hint { font-size: 0.72rem; color: var(--text-muted); margin-top: 8px; text-align: center; }

@media (max-width: 900px) {
  .chat-config { width: 220px; min-width: 220px; }
}
@media (max-width: 700px) {
  .chat-shell { flex-direction: column; }
  .chat-config { width: 100%; border-right: none; border-bottom: 1px solid var(--border); }
}

/* ── Topic chips ─────────────────────────────────────────────────── */
.topic-chips { display: flex; flex-direction: column; gap: 5px; }
.topic-chip {
  padding: 6px 10px; border-radius: 7px; font-size: 0.75rem;
  background: var(--tcbg); border: 1px solid var(--tcbd);
  color: var(--tc); cursor: pointer; text-align: left;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: all 0.15s; font-weight: 500;
}
.topic-chip:hover {
  opacity: 0.85;
  transform: translateX(3px);
}
`;
