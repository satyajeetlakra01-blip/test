import { lazy, Suspense, useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import SkeletonLoader from './components/SkeletonLoader';
import {
  completeExamSession,
  getActiveExamSession,
  getTheme,
  recordExamStart,
  saveTheme,
} from './utils/storage';

const LoginPage = lazy(() => import('./components/LoginPage'));
const ExamPage = lazy(() => import('./components/ExamPage'));
const ResultPage = lazy(() => import('./components/ResultPage'));

export default function App() {
  const [theme, setTheme] = useState(() => getTheme());
  const [activeSession, setActiveSession] = useState(() => getActiveExamSession());
  const [result, setResult] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  // Brief initial skeleton hydration state for smooth visual entry
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  function triggerSkeletonTransition(callback) {
    setIsPageLoading(true);
    setTimeout(() => {
      callback();
      setIsPageLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 280);
  }

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  function handleStartExam(form, mode = 'official') {
    triggerSkeletonTransition(() => {
      const session = recordExamStart(form, mode);
      setResult(null);
      setActiveSession(session);
    });
  }

  function handleFinishExam(resultSummary) {
    triggerSkeletonTransition(() => {
      completeExamSession(resultSummary);
      setActiveSession(null);
      setResult(resultSummary);
    });
  }

  function handleViewPreviousResult(previousResult) {
    triggerSkeletonTransition(() => {
      setActiveSession(null);
      setResult(previousResult);
    });
  }

  function handleReturnHome() {
    triggerSkeletonTransition(() => {
      setResult(null);
      setActiveSession(null);
    });
  }

  const activeCandidate = activeSession?.student || result?.student || null;
  const currentSkeletonVariant = activeSession ? 'exam' : result ? 'result' : 'home';

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        candidate={activeCandidate}
      />

      <main className="main-content">
        {isPageLoading ? (
          <SkeletonLoader variant={currentSkeletonVariant} />
        ) : (
          <Suspense fallback={<SkeletonLoader variant={currentSkeletonVariant} />}>
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
          </Suspense>
        )}
      </main>

      <footer className="site-footer">
        National Scholastic Olympiad Portal | Grades 3 to 10 | Official Examination (80 Mins) and Preparatory Mode (Untimed)
      </footer>
    </div>
  );
}
