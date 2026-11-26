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
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}m ${secs}s`;
}

export default function ResultPage({ result, onReturnHome }) {
  const canvasRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [activeGeminiId, setActiveGeminiId] = useState(null);

  const isPrep = !!result.isPrepMode;
  const activeSubjects = isPrep ? PREP_SUBJECTS : SUBJECTS;

  const questions = useMemo(() => {
    return isPrep
      ? getPrepQuestionsForGrade(result.student.grade)
      : getQuestionsForGrade(result.student.grade);
  }, [isPrep, result.student.grade]);

  useEffect(() => {
    if (canvasRef.current) {
      drawCertificateToCanvas(canvasRef.current, result);
    }
  }, [result]);

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
    setActiveGeminiId((prev) => (prev === id ? null : id));
  }

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
              {result.student.name} | Grade {result.student.grade} |{' '}
              {result.student.school}
              {result.autoSubmitted
                ? ' (Auto-submitted when 80-minute timer ended)'
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

        <p className="brand-subtitle">
          Mode: <strong>{isPrep ? 'Preparatory Practice (Untimed, 120 Questions)' : 'Official Olympiad (80 Mins)'}</strong> |{' '}
          Time Spent: <strong>{formatDuration(result.elapsedSeconds)}</strong> |{' '}
          Reference ID: <strong>{result.attemptId}</strong>
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
                        15 Official Test + 15 AI Practice
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

      <section className="certificate-section" aria-labelledby="cert-heading">
        <div className="certificate-toolbar">
          <div>
            <h2 id="cert-heading">
              {isPrep ? 'Preparatory Certificate of Readiness' : 'Official Certificate'}
            </h2>
            <p className="login-subtitle" style={{ margin: '0.2rem 0 0' }}>
              {isPrep
                ? 'Commemorating completion of the 120-question multi-subject preparatory curriculum.'
                : 'Verified certificate of achievement for the National Scholastic Olympiad.'}
            </p>
          </div>
          <div className="certificate-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => downloadCertificatePng(result)}
            >
              Download Certificate (PNG)
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

        <canvas
          ref={canvasRef}
          className="certificate-canvas"
          aria-label={`Olympiad Certificate for ${result.student.name}, Grade ${result.student.grade}`}
        />
      </section>

      <section className="review-section" aria-labelledby="review-heading">
        <div className="review-controls">
          <div>
            <h2 id="review-heading">Answer Key and Antigravity Gemini AI Tutor Review</h2>
            <p className="login-subtitle" style={{ margin: '0.2rem 0 0' }}>
              Review your responses. Click any question to reveal why incorrect choices failed, what the right answer is, and the core concept explanation.
            </p>
          </div>
          <div className="certificate-actions">
            <button
              type="button"
              className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilter('all')}
            >
              All ({questions.length})
            </button>
            <button
              type="button"
              className={filter === 'wrong' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setFilter('wrong')}
            >
              Wrong Answers ({result.wrongCount})
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
                  Official Test Bank (60)
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
        </div>

        {filteredQuestions.length === 0 ? (
          <p className="login-subtitle">
            No questions match this filter. Try switching to All Questions.
          </p>
        ) : (
          <div className="review-list">
            {filteredQuestions.map((item) => {
              const isCorrect = item.chosen === item.answer;
              const isUnanswered = item.chosen === undefined;
              const isGeminiOpen = activeGeminiId === item.id;

              return (
                <article key={item.id} className="review-item">
                  <div className="review-item-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span>
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
                          ? 'Correct'
                          : 'Wrong'}
                      </span>
                      <button
                        type="button"
                        className="btn-secondary gemini-review-trigger-btn"
                        onClick={() => toggleGemini(item.id)}
                        aria-expanded={isGeminiOpen}
                      >
                        {isGeminiOpen ? 'Hide Gemini Tutor' : 'Gemini AI Explanation'}
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>{item.q}</p>

                  <p style={{ margin: '0 0 0.4rem', fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
                    Your answer:{' '}
                    <strong>
                      {isUnanswered
                        ? 'None'
                        : `${OPTION_LETTERS[item.chosen]}. ${item.options[item.chosen]}`}
                    </strong>{' '}
                    | Correct answer:{' '}
                    <strong className="status-correct">
                      {OPTION_LETTERS[item.answer]}. {item.options[item.answer]}
                    </strong>
                  </p>

                  {/* Gemini Diagnostic Card for this question */}
                  {isGeminiOpen && (
                    <div style={{ marginTop: '0.85rem' }}>
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
