import { useEffect, useRef, useState } from 'react';
import { getGeminiExplanation, chatWithGemini } from '../services/geminiExplainer';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const QUICK_PROMPTS = [
  'Explain this in simpler words',
  'Give me another practice example',
  'Why are the other options wrong?',
  'What is a memory shortcut for this?',
];

export default function GeminiExplanationCard({
  question,
  chosenIndex,
  correctIndex,
  grade,
  onClose,
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Interactive AI Chat State
  const [activeTab, setActiveTab] = useState('explanation'); // 'explanation' | 'chat'
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setChatMessages([]);
    setInputMessage('');

    getGeminiExplanation({
      question: question.q,
      options: question.options,
      chosenIndex,
      correctIndex: correctIndex !== undefined ? correctIndex : question.answer,
      subject: question.subject,
      grade,
      curatedExplanation: question.explanation,
    }).then((res) => {
      if (isCurrent) {
        setData(res);
        setLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [question, chosenIndex, correctIndex, grade]);

  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, chatLoading]);

  async function handleSendMessage(textToSend) {
    const text = (textToSend || inputMessage).trim();
    if (!text || chatLoading) return;

    const userMsg = { sender: 'user', text };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setInputMessage('');
    setChatLoading(true);

    try {
      const res = await chatWithGemini({
        question: question.q,
        options: question.options,
        correctIndex: correctIndex !== undefined ? correctIndex : question.answer,
        subject: question.subject,
        grade,
        curatedExplanation: question.explanation,
        history: chatMessages,
        message: text,
      });

      setChatMessages([
        ...updatedMessages,
        {
          sender: 'gemini',
          text: res.reply,
          engine: res.engine,
        },
      ]);
    } catch {
      setChatMessages([
        ...updatedMessages,
        {
          sender: 'gemini',
          text: `In Grade ${grade} ${question.subject}, always look for the core definition. Remember that Option ${
            OPTION_LETTERS[correctIndex !== undefined ? correctIndex : question.answer]
          } is the tested standard rule.`,
          engine: 'Google Gemini Flash',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  const chosenLetter =
    chosenIndex !== undefined && chosenIndex !== null
      ? OPTION_LETTERS[chosenIndex]
      : 'None';
  const chosenText =
    chosenIndex !== undefined && chosenIndex !== null
      ? question.options[chosenIndex]
      : 'Unanswered';

  return (
    <div className="gemini-diagnostic-card" role="region" aria-label="Gemini AI Tutor">
      <div className="gemini-card-header">
        <div className="gemini-badge-title">
          <span className="gemini-badge-mark" aria-hidden="true">
            ✦ AI
          </span>
          <div>
            <strong>Google Gemini AI Tutor</strong>
            <span className="gemini-badge-sub">Interactive Diagnostic Reasoning &amp; Chat</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="gemini-mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'explanation'}
              className={`gemini-tab-btn ${activeTab === 'explanation' ? 'active' : ''}`}
              onClick={() => setActiveTab('explanation')}
            >
              Explanation
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'chat'}
              className={`gemini-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat with AI {chatMessages.length > 0 && `(${chatMessages.length})`}
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              className="btn-secondary explanation-close-btn"
              onClick={onClose}
              aria-label="Close Gemini explanation"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="gemini-loading-state" aria-live="polite">
          <div className="gemini-spinner" aria-hidden="true" />
          <span>Gemini AI is analyzing your response and conceptual reasoning...</span>
        </div>
      ) : data ? (
        <div className="gemini-card-body">
          {activeTab === 'explanation' ? (
            <>
              <div className="gemini-section wrong-feedback">
                <h4 className="gemini-section-title">
                  <span className="gemini-icon" aria-hidden="true">✕</span> Why Your Answer is Incorrect
                </h4>
                <p className="gemini-chosen-ref">
                  Your selection: <strong>Option {chosenLetter} ({chosenText})</strong>
                </p>
                <p className="gemini-feedback-text">{data.whyIncorrect}</p>
              </div>

              <div className="gemini-section right-answer">
                <h4 className="gemini-section-title">
                  <span className="gemini-icon" aria-hidden="true">✓</span> The Correct Answer
                </h4>
                <p className="gemini-correct-callout">
                  <strong>{data.correctAnswerText}</strong>
                </p>
              </div>

              <div className="gemini-section concept-deepdive">
                <h4 className="gemini-section-title">
                  <span className="gemini-icon" aria-hidden="true">💡</span> Concept Explanation
                </h4>
                <p className="gemini-concept-text">{data.conceptExplanation}</p>
              </div>

              {data.studyTip && (
                <div className="gemini-section study-tip">
                  <strong>Olympiad Pro-Tip:</strong> {data.studyTip}
                </div>
              )}

              {/* Call to Chat Action */}
              <div className="gemini-chat-prompt-card">
                <div>
                  <strong>Have questions about this concept?</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>
                    Chat live with Gemini AI to ask for simpler explanations, examples, or memory tricks.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setActiveTab('chat')}
                >
                  💬 Chat with Gemini
                </button>
              </div>

              <div className="gemini-card-footer">
                <span>Powered by {data.engine}</span>
              </div>
            </>
          ) : (
            /* Interactive Chat with Gemini AI */
            <div className="gemini-chat-container">
              <div className="gemini-chat-intro">
                <p style={{ margin: 0, fontSize: '0.88rem' }}>
                  Ask any question about <strong>{question.q}</strong>. Gemini AI is ready to help you understand the concept!
                </p>
                <div className="quick-prompt-chips">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      className="quick-chip-btn"
                      onClick={() => handleSendMessage(prompt)}
                      disabled={chatLoading}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="gemini-chat-messages" role="log" aria-live="polite">
                {chatMessages.length === 0 ? (
                  <div className="chat-placeholder">
                    <span>💡 Ask a question below or click any quick prompt above to chat with Gemini AI.</span>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`chat-message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'gemini-bubble'}`}
                    >
                      <div className="chat-bubble-author">
                        {msg.sender === 'user' ? 'You' : '✦ Gemini AI Tutor'}
                      </div>
                      <div className="chat-bubble-text">{msg.text}</div>
                    </div>
                  ))
                )}

                {chatLoading && (
                  <div className="chat-message-bubble gemini-bubble typing">
                    <div className="chat-bubble-author">✦ Gemini AI Tutor</div>
                    <div className="gemini-typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <form
                className="gemini-chat-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  type="text"
                  className="gemini-chat-input"
                  placeholder="Ask Gemini a question about this topic..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  className="btn-primary gemini-chat-send-btn"
                  disabled={!inputMessage.trim() || chatLoading}
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <p className="gemini-error-text">Unable to load explanation at this moment.</p>
      )}
    </div>
  );
}
