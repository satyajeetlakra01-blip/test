import { useState } from 'react';
import { GRADES } from '../data/questionBank';
import { validateLoginAndEligibility } from '../utils/storage';

const INITIAL_FORM = {
  name: '',
  grade: '',
  gender: '',
  mobile: '',
  school: '',
  email: '',
  password: '',
};

export default function LoginPage({ onStartExam, onViewPreviousResult }) {
  const [mode, setMode] = useState('official'); // 'official' or 'prep'
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [blockInfo, setBlockInfo] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (blockInfo) {
      setBlockInfo(null);
    }
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    if (blockInfo && nextMode === 'prep') {
      setBlockInfo(null);
    }
  }

  function validateFields() {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = 'Enter your full name (at least 2 characters).';
    }
    if (!form.grade) {
      next.grade = 'Select your class (Grade 3 to Grade 10).';
    }
    if (!form.gender) {
      next.gender = 'Select your gender.';
    }
    if (!/^\d{10}$/.test(form.mobile.trim())) {
      next.mobile = 'Enter a valid 10-digit mobile number.';
    }
    if (!form.school.trim() || form.school.trim().length < 2) {
      next.school = 'Enter your school name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!form.password || form.password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const check = validateLoginAndEligibility(form, mode);
    if (!check.allowed) {
      setBlockInfo(check);
      return;
    }

    onStartExam(form, mode);
  }

  const isPrep = mode === 'prep';

  return (
    <div className="home-grid">
      <section className="exam-brief" aria-labelledby="olympiad-title">
        <p className="brief-kicker">
          {isPrep ? 'Preparatory Study and Skill Building' : 'Annual Scholastic Assessment'}
        </p>
        <h1 id="olympiad-title" className="brief-heading">
          {isPrep
            ? 'Olympiad Preparatory Mode for Grades 3 to 10'
            : 'National Scholastic Olympiad for Grades 3 to 10'}
        </h1>
        <p className="brief-lead">
          {isPrep
            ? 'Untimed preparatory practice with 30 questions per subject (120 total) combining questions from the official test and AI-generated practice bank.'
            : 'A single 80-minute multiple-choice examination testing core reasoning across English, Science, Social Studies, and Mathematics.'}
        </p>

        <div className="mode-selection-tabs" role="tablist" aria-label="Portal Mode">
          <button
            type="button"
            role="tab"
            aria-selected={!isPrep}
            className={`mode-tab-btn ${!isPrep ? 'active' : ''}`}
            onClick={() => handleModeChange('official')}
          >
            <strong>Official Olympiad</strong>
            <span>80 Questions | 80 Mins | 1-Year Rule</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isPrep}
            className={`mode-tab-btn ${isPrep ? 'active' : ''}`}
            onClick={() => handleModeChange('prep')}
          >
            <strong>Preparatory Mode</strong>
            <span>120 Questions (30/subj) | Untimed | Unlimited</span>
          </button>
        </div>

        <table className="syllabus-table" aria-label="Examination structure">
          <thead>
            <tr>
              <th>Subject Section</th>
              <th>Questions</th>
              <th>Question Sources</th>
              <th>Format</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>English</td>
              <td className="tabular-nums">{isPrep ? '30' : '20'}</td>
              <td>{isPrep ? '15 Official Test + 15 AI Practice' : 'Curriculum Test'}</td>
              <td>Multiple Choice (MCQ)</td>
            </tr>
            <tr>
              <td>Science</td>
              <td className="tabular-nums">{isPrep ? '30' : '20'}</td>
              <td>{isPrep ? '15 Official Test + 15 AI Practice' : 'Curriculum Test'}</td>
              <td>Multiple Choice (MCQ)</td>
            </tr>
            <tr>
              <td>Social Studies (SST)</td>
              <td className="tabular-nums">{isPrep ? '30' : '20'}</td>
              <td>{isPrep ? '15 Official Test + 15 AI Practice' : 'Curriculum Test'}</td>
              <td>Multiple Choice (MCQ)</td>
            </tr>
            <tr>
              <td>Mathematics</td>
              <td className="tabular-nums">{isPrep ? '30' : '20'}</td>
              <td>{isPrep ? '15 Official Test + 15 AI Practice' : 'Curriculum Test'}</td>
              <td>Multiple Choice (MCQ)</td>
            </tr>
            <tr>
              <td>Total Examination</td>
              <td className="tabular-nums">{isPrep ? '120' : '80'}</td>
              <td>{isPrep ? '50% Official Test / 50% AI Practice' : 'Official Olympiad Paper'}</td>
              <td className="tabular-nums">{isPrep ? 'No Time Limit (Self-Paced)' : '80 Minutes'}</td>
            </tr>
          </tbody>
        </table>

        <div className="rules-box">
          <h2>{isPrep ? 'Preparatory Mode Benefits' : 'Eligibility and Examination Rules'}</h2>
          {isPrep ? (
            <ul className="rules-list">
              <li>
                No time limit: solve each question thoughtfully without countdown anxiety.
              </li>
              <li>
                Features 30 questions per subject curated specifically for your grade level: 15 drawn from official papers and 15 generated with AI.
              </li>
              <li>
                Includes comprehensive question explanations and step-by-step reasoning on submission.
              </li>
              <li>
                Does not trigger the 1-year lockout: you can repeat preparatory practice as many times as you want to strengthen your readiness.
              </li>
            </ul>
          ) : (
            <ul className="rules-list">
              <li>
                Once you log in and begin the Official Olympiad, you cannot repeat the same class or attend another grade before 1 full year (365 days).
              </li>
              <li>
                The 80-minute timer begins immediately after login. When time expires, your answers are saved and submitted automatically.
              </li>
              <li>
                Upon submission, you receive your exact correct and wrong answer counts along with an official certificate of achievement.
              </li>
            </ul>
          )}
        </div>
      </section>

      <section className="login-card" aria-labelledby="login-heading">
        <h2 id="login-heading">
          {isPrep ? 'Candidate Login (Preparatory Mode)' : 'Candidate Login (Official Olympiad)'}
        </h2>
        <p className="login-subtitle">
          {isPrep
            ? 'Enter your details to start the untimed 120-question practice set.'
            : 'Enter your details to begin the 80-question timed Olympiad for your grade.'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-field full-width">
              <label htmlFor="name">Student Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="grade">Class / Grade</label>
              <select
                id="grade"
                name="grade"
                value={form.grade}
                onChange={handleChange}
                required
              >
                <option value="">Select Grade</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
              {errors.grade && <span className="field-error">{errors.grade}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <span className="field-error">{errors.gender}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={form.mobile}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
              {errors.mobile && (
                <span className="field-error">{errors.mobile}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="school">School Name</label>
              <input
                id="school"
                name="school"
                type="text"
                placeholder="Your school name"
                value={form.school}
                onChange={handleChange}
                required
              />
              {errors.school && (
                <span className="field-error">{errors.school}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="student@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>
          </div>

          {blockInfo && (
            <div className="alert-banner" role="alert">
              <strong>
                {blockInfo.errorType === 'COOLDOWN_ACTIVE'
                  ? '1-Year Re-Attempt Restriction Active for Official Exam'
                  : 'Login Verification Failed'}
              </strong>
              <span>{blockInfo.message}</span>
              <div className="alert-actions" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                {blockInfo.errorType === 'COOLDOWN_ACTIVE' && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleModeChange('prep')}
                  >
                    Switch to Preparatory Mode (Unlimited)
                  </button>
                )}
                {blockInfo.lastAttempt?.result && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onViewPreviousResult(blockInfo.lastAttempt.result)}
                  >
                    View Previous Result and Certificate
                  </button>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary submit-login-btn">
            {isPrep
              ? 'Start 120-Question Preparatory Practice (Untimed)'
              : 'Login and Start 80-Minute Olympiad'}
          </button>
        </form>
      </section>
    </div>
  );
}
