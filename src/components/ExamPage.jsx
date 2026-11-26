import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getPrepQuestionsForGrade,
  getQuestionsForGrade,
  PREP_SUBJECTS,
  SUBJECTS,
} from '../data/questionBank';
import { updateActiveExamSession } from '../utils/storage';
import GeminiExplanationCard from './GeminiExplanationCard';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ExamPage({ session, onFinishExam }) {
  const isPrep = !!session.isPrepMode;
  const activeSubjects = isPrep ? PREP_SUBJECTS : SUBJECTS;

  const questions = useMemo(() => {
    return isPrep
      ? getPrepQuestionsForGrade(session.student.grade)
      : getQuestionsForGrade(session.student.grade);
  }, [isPrep, session.student.grade]);

  const [answers, setAnswers] = useState(session.answers || {});
  const [marked, setMarked] = useState(() => new Set(session.marked || []));
  const [currentIndex, setCurrentIndex] = useState(session.currentIndex || 0);

  // For timed official mode: countdown. For prep mode: upward elapsed counter.
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (isPrep || !session.endTime) return null;
    return Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000));
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    return Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000));
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [showGeminiExplain, setShowGeminiExplain] = useState(false);

  const submittedRef = useRef(false);

  function finalizeExam(autoSubmitted = false) {
    if (submittedRef.current) return;
    submittedRef.current = true;

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const subjectStats = {};
    activeSubjects.forEach((s) => {
      subjectStats[s.key] = {
        label: s.label,
        total: s.count,
        correct: 0,
        wrong: 0,
        unanswered: 0,
      };
    });

    questions.forEach((q, idx) => {
      const chosen = answers[idx];
      const bucket = subjectStats[q.subject];
      if (chosen === undefined || chosen === null) {
        unansweredCount += 1;
        if (bucket) bucket.unanswered += 1;
      } else if (chosen === q.answer) {
        correctCount += 1;
        if (bucket) bucket.correct += 1;
      } else {
        wrongCount += 1;
        if (bucket) bucket.wrong += 1;
      }
    });

    const elapsed = Math.max(
      1,
      Math.round((Date.now() - session.startedAt) / 1000)
    );

    const resultSummary = {
      attemptId: session.attemptId,
      student: session.student,
      mode: isPrep ? 'prep' : 'official',
      isPrepMode: isPrep,
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      unansweredCount,
      percentage: Math.round((correctCount / questions.length) * 100),
      subjectStats,
      answers,
      autoSubmitted,
      elapsedSeconds: elapsed,
      completedAt: Date.now(),
    };

    onFinishExam(resultSummary);
  }

  // Timer effect: countdown for official exam, elapsed tracking for prep mode
  useEffect(() => {
    const tick = () => {
      if (isPrep) {
        setElapsedSeconds(Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000)));
      } else if (session.endTime) {
        const remaining = Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          finalizeExam(true);
        }
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrep, session.endTime, session.startedAt]);

  // Close confirmation dialog on Escape (R-32)
  useEffect(() => {
    if (!showConfirm) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowConfirm(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showConfirm]);

  function selectOption(optionIdx) {
    const nextAnswers = { ...answers, [currentIndex]: optionIdx };
    setAnswers(nextAnswers);
    updateActiveExamSession({ answers: nextAnswers });
  }

  function clearResponse() {
    const nextAnswers = { ...answers };
    delete nextAnswers[currentIndex];
    setAnswers(nextAnswers);
    setShowGeminiExplain(false);
    updateActiveExamSession({ answers: nextAnswers });
  }

  function toggleMark() {
    const next = new Set(marked);
    if (next.has(currentIndex)) {
      next.delete(currentIndex);
    } else {
      next.add(currentIndex);
    }
    setMarked(next);
    updateActiveExamSession({ marked: Array.from(next) });
  }

  function goToQuestion(idx) {
    setCurrentIndex(idx);
    setShowGeminiExplain(false);
    updateActiveExamSession({ currentIndex: idx });
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const isUrgent = !isPrep && secondsLeft !== null && secondsLeft <= 300;
  const currentChosen = answers[currentIndex];
  const isCurrentIncorrect = currentChosen !== undefined && currentChosen !== currentQuestion.answer;

  if (!currentQuestion) {
    return (
      <div className="alert-banner" role="alert">
        <strong>Questions Unavailable</strong>
        <span>Unable to load questions for Grade {session.student.grade}.</span>
      </div>
    );
  }

  return (
    <div>
      <div className="exam-topbar">
        <div className="candidate-meta">
          <span>
            <strong>{session.student.name}</strong>
          </span>
          <span>Grade {session.student.grade}</span>
          <span>{session.student.school}</span>
          <span className="mode-indicator-pill">
            {isPrep ? 'Preparatory Practice' : 'Official Olympiad'}
          </span>
          <span className="tabular-nums">
            Answered: <strong>{answeredCount}</strong> / {questions.length}
          </span>
        </div>

        <div className="timer-group">
          {isPrep ? (
            <div
              className="timer-box tabular-nums prep-timer"
              aria-live="polite"
              aria-label={`Untimed practice, elapsed time ${formatTime(elapsedSeconds)}`}
            >
              No Time Limit | Elapsed: {formatTime(elapsedSeconds)}
            </div>
          ) : (
            <div
              className={`timer-box tabular-nums ${isUrgent ? 'urgent' : ''}`}
              aria-live="polite"
              aria-label={`Time remaining ${formatTime(secondsLeft)}`}
            >
              Time Left: {formatTime(secondsLeft)}
            </div>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowConfirm(true)}
          >
            {isPrep ? 'Finish Practice' : 'Submit Olympiad'}
          </button>
        </div>
      </div>

      <div className="subject-tabs" role="tablist" aria-label="Olympiad subjects">
        {activeSubjects.map((subj) => {
          const isCurrentSubject = currentQuestion.subject === subj.key;
          let subjAnswered = 0;
          for (let i = subj.start; i < subj.start + subj.count; i += 1) {
            if (answers[i] !== undefined) subjAnswered += 1;
          }
          return (
            <button
              key={subj.key}
              type="button"
              role="tab"
              aria-selected={isCurrentSubject}
              className={`subject-tab ${isCurrentSubject ? 'active' : ''}`}
              onClick={() => goToQuestion(subj.start)}
            >
              <span>{subj.label}</span>
              <span className="subject-count tabular-nums">
                ({subjAnswered}/{subj.count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="exam-layout">
        <section className="question-card" aria-labelledby="question-heading">
          <div className="question-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span id="question-heading" className="q-number tabular-nums">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="q-subject-tag">{currentQuestion.subject}</span>
              {isPrep && (
                <span
                  className={`source-badge ${
                    currentQuestion.sourceType === 'ai' ? 'ai-source' : 'official-source'
                  }`}
                >
                  {currentQuestion.source}
                </span>
              )}
            </div>

            {isPrep && (
              <button
                type="button"
                className="btn-secondary explanation-toggle-btn"
                onClick={() => setShowGeminiExplain((prev) => !prev)}
                aria-expanded={showGeminiExplain}
              >
                {showGeminiExplain ? 'Hide Gemini Tutor' : 'Ask Gemini Explain'}
              </button>
            )}
          </div>

          <h1 className="q-prompt">{currentQuestion.q}</h1>

          <div className="options-list" role="radiogroup" aria-labelledby="question-heading">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentIndex] === idx;
              const inputId = `q-${currentIndex}-opt-${idx}`;
              return (
                <label
                  key={inputId}
                  htmlFor={inputId}
                  className={`option-label ${isSelected ? 'selected' : ''}`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name={`question-${currentIndex}`}
                    checked={isSelected}
                    onChange={() => selectOption(idx)}
                  />
                  <span className="option-key">{OPTION_LETTERS[idx]}.</span>
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>

          {/* Gemini AI Diagnostic Tutor in Practice Mode */}
          {isPrep && (showGeminiExplain || isCurrentIncorrect) && (
            <div style={{ marginTop: '1.25rem' }}>
              <GeminiExplanationCard
                question={currentQuestion}
                chosenIndex={answers[currentIndex]}
                correctIndex={currentQuestion.answer}
                grade={session.student.grade}
                onClose={() => setShowGeminiExplain(false)}
              />
            </div>
          )}

          {/* Official Mode Integrity Notice */}
          {!isPrep && (
            <div className="exam-mode-note">
              <span className="exam-mode-note-icon">🔒</span>
              <span>
                Official Olympiad Examination: Answer keys and Antigravity Gemini AI explanations are sealed until your final submission and will be presented on your end-of-examination report.
              </span>
            </div>
          )}

          <div className="question-footer">
            <div className="footer-left">
              <button
                type="button"
                className="btn-secondary"
                onClick={toggleMark}
              >
                {marked.has(currentIndex) ? 'Unmark Review' : 'Mark for Review'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={clearResponse}
                disabled={answers[currentIndex] === undefined}
              >
                Clear Response
              </button>
            </div>

            <div className="footer-right">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => goToQuestion(currentIndex + 1)}
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowConfirm(true)}
                >
                  {isPrep ? 'Finish and View Analysis' : 'Finish and Submit'}
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="palette-card" aria-label="Question navigator">
          <h3>Question Navigator</h3>
          <div className="palette-legend">
            <span className="legend-item">
              <span className="legend-swatch swatch-current" /> Current
            </span>
            <span className="legend-item">
              <span className="legend-swatch swatch-answered" /> Answered
            </span>
            <span className="legend-item">
              <span className="legend-swatch swatch-marked" /> Review
            </span>
            <span className="legend-item">
              <span className="legend-swatch" /> Unanswered
            </span>
          </div>

          <div className="palette-grid">
            {questions.map((_, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = answers[idx] !== undefined;
              const isMarked = marked.has(idx);
              let cls = 'palette-num tabular-nums';
              if (isCurrent) cls += ' current';
              else if (isMarked) cls += ' marked';
              else if (isAnswered) cls += ' answered';

              return (
                <button
                  key={idx}
                  type="button"
                  className={cls}
                  onClick={() => goToQuestion(idx)}
                  aria-label={`Question ${idx + 1}${isAnswered ? ', answered' : ''}${isMarked ? ', marked for review' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {showConfirm && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-submit-title"
        >
          <div className="modal-dialog">
            <h2 id="confirm-submit-title">
              {isPrep ? 'Finish Preparatory Practice?' : 'Submit Olympiad Examination?'}
            </h2>
            <p>
              {isPrep
                ? 'Your answers will be calculated into a detailed performance report with full question explanations and Gemini AI diagnostic breakdown.'
                : 'Once submitted, your answers are final and you cannot re-attempt this examination for 1 year.'}
            </p>

            <div className="modal-stats">
              <div className="modal-stat">
                <strong className="tabular-nums">{answeredCount}</strong>
                <span>Answered</span>
              </div>
              <div className="modal-stat">
                <strong className="tabular-nums">{unansweredCount}</strong>
                <span>Unanswered</span>
              </div>
              <div className="modal-stat">
                <strong className="tabular-nums">{marked.size}</strong>
                <span>Marked</span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                Return to Questions
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => finalizeExam(false)}
              >
                {isPrep ? 'Confirm and View Results' : 'Confirm and Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
