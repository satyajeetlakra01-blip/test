import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import ExamPage from './components/ExamPage';
import ResultPage from './components/ResultPage';
import {
  completeExamSession,
  getActiveExamSession,
  getTheme,
  recordExamStart,
  saveTheme,
} from './utils/storage';

export default function App() {
  const [theme, setTheme] = useState(() => getTheme());
  const [activeSession, setActiveSession] = useState(() => getActiveExamSession());
  const [result, setResult] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  function handleStartExam(form, mode = 'official') {
    const session = recordExamStart(form, mode);
    setResult(null);
    setActiveSession(session);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleFinishExam(resultSummary) {
    completeExamSession(resultSummary);
    setActiveSession(null);
    setResult(resultSummary);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleViewPreviousResult(previousResult) {
    setActiveSession(null);
    setResult(previousResult);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleReturnHome() {
    setResult(null);
    setActiveSession(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeCandidate = activeSession?.student || result?.student || null;

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        candidate={activeCandidate}
      />

      <main className="main-content">
        {activeSession ? (
          <ExamPage session={activeSession} onFinishExam={handleFinishExam} />
        ) : result ? (
          <ResultPage result={result} onReturnHome={handleReturnHome} />
        ) : (
          <LoginPage
            onStartExam={handleStartExam}
            onViewPreviousResult={handleViewPreviousResult}
          />
        )}
      </main>

      <footer className="site-footer">
        National Scholastic Olympiad Portal | Grades 3 to 10 | Official Examination (80 Mins) and Preparatory Mode (Untimed)
      </footer>
    </div>
  );
}
