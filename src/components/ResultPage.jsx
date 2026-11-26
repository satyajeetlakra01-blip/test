import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getPrepQuestionsForGrade,
  getQuestionsForGrade,
  PREP_SUBJECTS,
  SUBJECTS,
} from '../data/questionBank';
import {
  downloadCertificatePng,
  drawCertificateToCanvas,
} from '../utils/certificate';
import GeminiExplanationCard from './GeminiExplanationCard';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}m ${secs}s`;
}

export default function ResultPage({ result, onReturnHome }) {
  const canvasRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [openGeminiIds, setOpenGeminiIds] = useState(() => new Set());

  const isPrep = !!result.isPrepMode;
  const activeSubjects = isPrep ? PREP_SUBJECTS : SUBJECTS;

  const questions = useMemo(() => {
    return isPrep
      ? getPrepQuestionsForGrade(result.student.grade)
      : getQuestionsForGrade(result.student.grade);
  }, [isPrep, result.student.grade]);

  // Redraw certificate whenever result updates or fonts load (Official mode only)
  useEffect(() => {
    if (!isPrep && canvasRef.current) {
      drawCertificateToCanvas(canvasRef.current, result);
    }
    if (!isPrep && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (canvasRef.current) {
          drawCertificateToCanvas(canvasRef.current, result);
        }
      });
    }
  }, [result, isPrep]);

  const filteredQuestions = useMemo(() => {
    return questions
      .map((q, idx) => ({
        ...q,
        idx,
        chosen: result.answers?.[idx],
      }))
      .filter((item) => {
        if (filter === 'wrong') {
          return item.chosen !== undefined && item.chosen !== item.answer;
        }
        if (filter === 'unanswered') {
          return item.chosen === undefined;
        }
        if (filter === 'official') {
          return item.sourceType === 'official';
        }
        if (filter === 'ai') {
          return item.sourceType === 'ai';
        }
        return true;
      });
  }, [questions, result.answers, filter]);

  function toggleGemini(id) {
    setOpenGeminiIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function expandAllWrong() {
    const wrongIds = new Set();
    questions.forEach((q, idx) => {
      const chosen = result.answers?.[idx];
      if (chosen !== undefined && chosen !== q.answer) {
        wrongIds.add(q.id);
      }
    });
    setOpenGeminiIds(wrongIds);
    setFilter('wrong');
  }

  function expandAllFiltered() {
    const allFilteredIds = new Set(filteredQuestions.map((q) => q.id));
    setOpenGeminiIds(allFilteredIds);
  }

  function collapseAll() {
    setOpenGeminiIds(new Set());
  }

  const allFilteredOpen =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((q) => openGeminiIds.has(q.id));

  return (
    <div>
      <section className="result-summary-card" aria-labelledby="result-heading">
        <div className="result-header">
          <div>
            <h1 id="result-heading">
              {isPrep
                ? 'Preparatory Practice Performance Analysis'
                : 'Olympiad Examination Result'}
            </h1>
            <p className="login-subtitle">
              Candidate: <strong>{result.student.name}</strong> | Grade {result.student.grade} |{' '}
              {result.student.school}
              {result.autoSubmitted
                ? ' (Auto-submitted when 80-minute countdown expired)'
                : ''}
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={onReturnHome}>
            Return to Home
          </button>
        </div>

        <div className="result-metrics">
          <div className="metric-box correct">
            <div className="metric-label">Correct Answers</div>
            <div className="metric-value tabular-nums">{result.correctCount}</div>
          </div>
          <div className="metric-box wrong">
            <div className="metric-label">Wrong Answers</div>
            <div className="metric-value tabular-nums">{result.wrongCount}</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Unanswered</div>
            <div className="metric-value tabular-nums">{result.unansweredCount}</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Overall Accuracy</div>
            <div className="metric-value tabular-nums">
              {result.correctCount} / {result.totalQuestions} ({result.percentage}%)
            </div>
          </div>
        </div>

        <p className="brand-subtitle" style={{ margin: '0.85rem 0 1.25rem' }}>
          Mode: <strong>{isPrep ? 'Preparatory Practice (Untimed, 120 Questions)' : 'Official Olympiad (Timed, 80 Questions)'}</strong> |{' '}
          Duration: <strong>{formatDuration(result.elapsedSeconds)}</strong> |{' '}
          Reference Credential: <strong>NSO-2026-{result.attemptId.slice(0, 10).toUpperCase()}</strong>
        </p>

        <table className="breakdown-table" aria-label="Subject-wise score breakdown">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Total Questions</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>Unanswered</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {activeSubjects.map((subj) => {
              const stat = result.subjectStats?.[subj.key] || {
                total: subj.count,
                correct: 0,
                wrong: 0,
                unanswered: 0,
              };
              const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              return (
                <tr key={subj.key}>
                  <td>
                    <strong>{subj.label}</strong>
                    {isPrep && (
                      <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        15 Official Curriculum + 15 AI Practice
                      </span>
                    )}
                  </td>
                  <td className="tabular-nums">{stat.total}</td>
                  <td className="tabular-nums status-correct">{stat.correct}</td>
                  <td className="tabular-nums status-wrong">{stat.wrong}</td>
                  <td className="tabular-nums">{stat.unanswered}</td>
                  <td className="tabular-nums font-weight-bold">{acc}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Official Certificate (Official Olympiad Mode Only) */}
      {!isPrep && (
        <section className="certificate-section" aria-labelledby="cert-heading">
          <div className="certificate-toolbar">
            <div>
              <h2 id="cert-heading">Official National Olympiad Certificate</h2>
              <p className="login-subtitle" style={{ margin: '0.2rem 0 0' }}>
                High-resolution 300 DPI diploma with academic seal, gold borders, guilloche watermark, and digital verification QR code.
              </p>
            </div>
            <div className="certificate-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => downloadCertificatePng(result)}
              >
                Download High-Res Diploma (PNG)
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.print()}
              >
                Print Certificate
              </button>
            </div>
          </div>

          <div className="certificate-canvas-wrapper">
            <canvas
              ref={canvasRef}
              className="certificate-canvas"
              aria-label={`Official Olympiad Certificate for ${result.student.name}, Grade ${result.student.grade}`}
            />
          </div>
        </section>
      )}

      {/* End-of-Examination Gemini AI Explanation Banner */}
      <section className="review-section" aria-labelledby="review-heading">
        <div className="end-of-exam-explainer-banner">
          <div className="explainer-banner-top">
            <div className="explainer-banner-title">
              <span className="explainer-badge">End-of-Examination Review</span>
              <h2 id="review-heading" style={{ margin: '0.35rem 0 0', fontFamily: 'var(--font-serif)', fontSize: '1.45rem' }}>
                Antigravity Gemini AI Question Diagnostic & Concept Tutor
              </h2>
            </div>
            <div className="explainer-banner-actions">
              {result.wrongCount > 0 && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={expandAllWrong}
                >
                  Explain All Wrong Answers ({result.wrongCount})
                </button>
              )}
              <button
                type="button"
                className="btn-secondary"
                onClick={allFilteredOpen ? collapseAll : expandAllFiltered}
              >
                {allFilteredOpen ? 'Collapse All Explanations' : 'Expand All in Current View'}
              </button>
            </div>
          </div>
          <p className="login-subtitle" style={{ margin: '0.65rem 0 0' }}>
            {isPrep
              ? 'Preparatory mode completed. Review below to examine how the AI analyzes misconceptions and reinforces curriculum mastery.'
              : 'As designed for official examination integrity, question answers and Gemini AI conceptual explanations are revealed here at the conclusion of your test. For each question, discover why incorrect choices failed, understand the correct answer, and review essential study takeaways.'}
          </p>
        </div>

        <div className="review-controls">
          <div className="certificate-actions">
            <button
              type="button"
              className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilter('all')}
            >
              All Questions ({questions.length})
            </button>
            <button
              type="button"
              className={filter === 'wrong' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilter('wrong')}
            >
              Incorrect Only ({result.wrongCount})
            </button>
            <button
              type="button"
              className={filter === 'unanswered' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilter('unanswered')}
            >
              Unanswered ({result.unansweredCount})
            </button>
            {isPrep && (
              <>
                <button
                  type="button"
                  className={filter === 'official' ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setFilter('official')}
                >
                  Curriculum Bank (60)
                </button>
                <button
                  type="button"
                  className={filter === 'ai' ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setFilter('ai')}
                >
                  AI Practice Bank (60)
                </button>
              </>
            )}
          </div>
          <span className="tabular-nums" style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
            Showing {filteredQuestions.length} of {questions.length} questions
          </span>
        </div>

        {filteredQuestions.length === 0 ? (
          <p className="login-subtitle" style={{ padding: '2rem 0', textAlign: 'center' }}>
            No questions match the selected filter. Try switching to All Questions.
          </p>
        ) : (
          <div className="review-list">
            {filteredQuestions.map((item) => {
              const isCorrect = item.chosen === item.answer;
              const isUnanswered = item.chosen === undefined;
              const isGeminiOpen = openGeminiIds.has(item.id);

              return (
                <article key={item.id} className="review-item">
                  <div className="review-item-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700 }}>
                        Q{item.number} ({item.subject})
                      </span>
                      {item.source && (
                        <span
                          className={`source-badge ${
                            item.sourceType === 'ai' ? 'ai-source' : 'official-source'
                          }`}
                        >
                          {item.source}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        className={
                          isUnanswered
                            ? 'status-unanswered'
                            : isCorrect
                            ? 'status-correct'
                            : 'status-wrong'
                        }
                      >
                        {isUnanswered
                          ? 'Unanswered'
                          : isCorrect
                          ? 'Correct (+1)'
                          : 'Incorrect (0)'}
                      </span>
                      <button
                        type="button"
                        className="btn-secondary gemini-review-trigger-btn"
                        onClick={() => toggleGemini(item.id)}
                        aria-expanded={isGeminiOpen}
                      >
                        {isGeminiOpen ? 'Hide Explanation' : 'Gemini AI Explanation'}
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 0.65rem', fontWeight: 600, fontSize: '1.02rem' }}>{item.q}</p>

                  <div className="review-options-summary">
                    <div className="review-answer-line">
                      <span>Your Answer:</span>
                      <strong>
                        {isUnanswered ? (
                          <span style={{ color: 'var(--ink-muted)' }}>Not attempted</span>
                        ) : (
                          <span className={isCorrect ? 'status-correct' : 'status-wrong'}>
                            {OPTION_LETTERS[item.chosen]}. {item.options[item.chosen]}
                          </span>
                        )}
                      </strong>
                    </div>
                    <div className="review-answer-line">
                      <span>Correct Answer:</span>
                      <strong className="status-correct">
                        {OPTION_LETTERS[item.answer]}. {item.options[item.answer]}
                      </strong>
                    </div>
                  </div>

                  {/* Gemini AI Diagnostic Explanation */}
                  {isGeminiOpen && (
                    <div style={{ marginTop: '1rem' }}>
                      <GeminiExplanationCard
                        question={item}
                        chosenIndex={item.chosen}
                        correctIndex={item.answer}
                        grade={result.student.grade}
                        onClose={() => toggleGemini(item.id)}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
