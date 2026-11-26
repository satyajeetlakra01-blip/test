import { useEffect, useState } from 'react';
import { getGeminiExplanation } from '../services/geminiExplainer';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function GeminiExplanationCard({
  question,
  chosenIndex,
  correctIndex,
  grade,
  onClose,
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);

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

  const chosenLetter =
    chosenIndex !== undefined && chosenIndex !== null
      ? OPTION_LETTERS[chosenIndex]
      : 'None';
  const chosenText =
    chosenIndex !== undefined && chosenIndex !== null
      ? question.options[chosenIndex]
      : 'Unanswered';

  return (
    <div className="gemini-diagnostic-card" role="region" aria-label="Gemini AI Explanation">
      <div className="gemini-card-header">
        <div className="gemini-badge-title">
          <span className="gemini-badge-mark" aria-hidden="true">
            AGY
          </span>
          <div>
            <strong>Antigravity Gemini AI Tutor</strong>
            <span className="gemini-badge-sub">Academic Diagnostic Analysis</span>
          </div>
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

      {loading ? (
        <div className="gemini-loading-state" aria-live="polite">
          <div className="gemini-spinner" aria-hidden="true" />
          <span>Antigravity Gemini is analyzing your response and conceptual reasoning...</span>
        </div>
      ) : data ? (
        <div className="gemini-card-body">
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

          <div className="gemini-card-footer">
            <span>Powered by {data.engine}</span>
          </div>
        </div>
      ) : (
        <p className="gemini-error-text">Unable to load explanation at this moment.</p>
      )}
    </div>
  );
}
