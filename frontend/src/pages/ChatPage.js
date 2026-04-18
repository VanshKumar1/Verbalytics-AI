import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';

const MODE_LABELS = {
  debate: 'Debate Mode',
  interview: 'Interview Mode',
  evaluation: 'Evaluation Mode',
};

const MODE_PLACEHOLDER = {
  debate:
    'Chat API is being connected in Step 4 & 5. For now, enter your point and we will display a placeholder AI response.',
  interview:
    'Chat API is being connected in Step 4 & 5. For now, enter your answer and we will display a placeholder AI response.',
  evaluation:
    'Evaluation Mode will be wired with structured scoring in Step 6–7. For now, we will show a placeholder evaluation.',
};

export default function ChatPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [searchParams] = useSearchParams();

  const mode = (searchParams.get('mode') || 'debate').toLowerCase();
  const modeLabel = MODE_LABELS[mode] || MODE_LABELS.debate;

  const [messages, setMessages] = useState(() => []);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    const placeholderAi =
      mode === 'evaluation'
        ? {
            role: 'ai',
            content:
              'Placeholder evaluation:\n\n- logic: 0\n- clarity: 0\n- relevance: 0\n\nWe will replace this with real structured scoring in Step 6.',
          }
        : {
            role: 'ai',
            content: `${MODE_PLACEHOLDER[mode]}\n\nMode: ${modeLabel}.`,
          };

    setMessages([{ role: 'ai', content: placeholderAi.content }]);
  }, [mode, modeLabel, token, navigate]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages.
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!canSend) return;

    const userMessage = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setSending(true);

    // Placeholder response until Step 4/5 implements backend chat.
    await new Promise((r) => setTimeout(r, 900));

    const aiContent =
      mode === 'evaluation'
        ? 'Placeholder response: Thanks! In Step 6 we will return JSON scores + written improvements.'
        : `Placeholder response (${modeLabel}): In Step 4/5 we will generate the real AI reply here.`;

    setMessages((prev) => [...prev, { role: 'ai', content: aiContent }]);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 via-white to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{modeLabel}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              UI is ready; AI connection comes in Step 4 & 5.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/dashboard')}
          >
            Back
          </button>
        </div>

        <div className="mt-6 card border-border bg-white/80 backdrop-blur-sm shadow-sm">
          <div
            ref={listRef}
            className="h-[52vh] md:h-[58vh] overflow-y-auto p-4 space-y-3"
          >
            {messages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={`message-bubble ${
                  m.role === 'user' ? 'message-user animate-slide-up' : 'message-ai animate-fade-in'
                }`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {m.content}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm px-2 py-1">
                <Spinner />
                AI is thinking...
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="border-t border-border p-3 md:p-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Your message</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={2}
                  className="input border-input min-h-[44px] resize-none"
                  placeholder={
                    mode === 'evaluation'
                      ? 'Paste your answer for evaluation...'
                      : 'Type your stance/answer...'
                  }
                />
              </div>
              <button
                type="submit"
                disabled={!canSend}
                className={`btn btn-primary px-5 ${!canSend ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Note: AI responses will be wired to backend in Step 4/5. This page is still fully functional UI-wise.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

