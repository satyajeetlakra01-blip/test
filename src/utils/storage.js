import { saveCandidateToCloud, saveExamResultToCloud } from '../services/supabase';

const RECORDS_KEY = 'olympiad_student_records_v1';
const ACTIVE_EXAM_KEY = 'olympiad_active_exam_v1';
const THEME_KEY = 'olympiad_theme_v1';

export const EXAM_DURATION_SECONDS = 80 * 60; // 80 minutes
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function getTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'dark' ? 'dark' : 'light';
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function getRecords() {
  return readJson(RECORDS_KEY, []);
}

export function findStudentRecord(email, mobile) {
  const normEmail = email.trim().toLowerCase();
  const normMobile = mobile.trim();
  const records = getRecords();
  return records.find(
    (r) =>
      r.email.toLowerCase() === normEmail ||
      (normMobile && r.mobile === normMobile)
  );
}

/**
 * Checks login credentials and eligibility.
 * For Official mode: enforces the strict 1-year cooldown rule.
 * For Preparatory mode: allows unlimited practice attempts with no cooldown restriction.
 */
export function validateLoginAndEligibility(form, mode = 'official') {
  const existing = findStudentRecord(form.email, form.mobile);

  if (!existing) {
    return { allowed: true, isReturning: false };
  }

  if (existing.password !== form.password) {
    return {
      allowed: false,
      errorType: 'AUTH_FAILED',
      message:
        'An account with this email or mobile number already exists, and the password does not match.',
    };
  }

  // Preparatory mode has no time limit and no 1-year restriction
  if (mode === 'prep') {
    return { allowed: true, isReturning: true, student: existing };
  }

  const attempts = existing.attempts || [];
  if (attempts.length === 0) {
    return { allowed: true, isReturning: true };
  }

  const latestAttempt = attempts[attempts.length - 1];
  const elapsed = Date.now() - latestAttempt.startedAt;

  if (elapsed < ONE_YEAR_MS) {
    const eligibleDate = new Date(latestAttempt.startedAt + ONE_YEAR_MS);
    const attemptDate = new Date(latestAttempt.startedAt);
    const sameClass = String(latestAttempt.grade) === String(form.grade);

    return {
      allowed: false,
      errorType: 'COOLDOWN_ACTIVE',
      sameClass,
      lastAttempt: latestAttempt,
      eligibleDate,
      attemptDate,
      student: existing,
      message: sameClass
        ? `You have already attended the Grade ${latestAttempt.grade} Official Olympiad on ${attemptDate.toLocaleDateString()}. You cannot repeat the same class before 1 year (eligible after ${eligibleDate.toLocaleDateString()}). You can still practice freely in Preparatory Mode.`
        : `You have already attended the Grade ${latestAttempt.grade} Official Olympiad on ${attemptDate.toLocaleDateString()}. Students may not attend another grade or repeat the Olympiad before 1 year (eligible after ${eligibleDate.toLocaleDateString()}). You can still practice freely in Preparatory Mode.`,
    };
  }

  return { allowed: true, isReturning: true };
}

export function recordExamStart(student, mode = 'official') {
  const records = getRecords();
  const normEmail = student.email.trim().toLowerCase();
  const now = Date.now();
  const isPrep = mode === 'prep';

  const attempt = {
    attemptId: `${isPrep ? 'PREP' : 'OLY'}-${now.toString(36).toUpperCase()}`,
    grade: Number(student.grade),
    startedAt: now,
    completedAt: null,
    result: null,
    isPrepMode: isPrep,
  };

  const idx = records.findIndex(
    (r) => r.email.toLowerCase() === normEmail || r.mobile === student.mobile.trim()
  );

  if (idx >= 0) {
    const update = {
      ...records[idx],
      name: student.name.trim(),
      gender: student.gender,
      school: student.school.trim(),
    };
    if (isPrep) {
      update.prepAttempts = [...(records[idx].prepAttempts || []), attempt];
    } else {
      update.attempts = [...(records[idx].attempts || []), attempt];
    }
    records[idx] = update;
  } else {
    records.push({
      name: student.name.trim(),
      gender: student.gender,
      mobile: student.mobile.trim(),
      school: student.school.trim(),
      email: normEmail,
      password: student.password,
      attempts: isPrep ? [] : [attempt],
      prepAttempts: isPrep ? [attempt] : [],
    });
  }

  writeJson(RECORDS_KEY, records);

  const activeSession = {
    email: normEmail,
    attemptId: attempt.attemptId,
    mode: isPrep ? 'prep' : 'official',
    isPrepMode: isPrep,
    student: {
      name: student.name.trim(),
      grade: Number(student.grade),
      gender: student.gender,
      mobile: student.mobile.trim(),
      school: student.school.trim(),
      email: normEmail,
    },
    startedAt: now,
    endTime: isPrep ? null : now + EXAM_DURATION_SECONDS * 1000,
    answers: {},
    marked: [],
    currentIndex: 0,
  };

  writeJson(ACTIVE_EXAM_KEY, activeSession);

  // Sync candidate registration to Supabase cloud asynchronously
  saveCandidateToCloud(student).catch(() => {});

  return activeSession;
}

export function getActiveExamSession() {
  return readJson(ACTIVE_EXAM_KEY, null);
}

export function updateActiveExamSession(patch) {
  const current = getActiveExamSession();
  if (!current) return null;
  const updated = { ...current, ...patch };
  writeJson(ACTIVE_EXAM_KEY, updated);
  return updated;
}

export function completeExamSession(resultSummary) {
  const current = getActiveExamSession();
  if (current) {
    const records = getRecords();
    const idx = records.findIndex(
      (r) => r.email.toLowerCase() === current.email.toLowerCase()
    );
    if (idx >= 0) {
      if (current.isPrepMode) {
        const prepAttempts = [...(records[idx].prepAttempts || [])];
        const aIdx = prepAttempts.findIndex((a) => a.attemptId === current.attemptId);
        if (aIdx >= 0) {
          prepAttempts[aIdx] = {
            ...prepAttempts[aIdx],
            completedAt: Date.now(),
            result: resultSummary,
          };
        }
        records[idx] = { ...records[idx], prepAttempts };
      } else {
        const attempts = [...(records[idx].attempts || [])];
        const aIdx = attempts.findIndex((a) => a.attemptId === current.attemptId);
        if (aIdx >= 0) {
          attempts[aIdx] = {
            ...attempts[aIdx],
            completedAt: Date.now(),
            result: resultSummary,
          };
        }
        records[idx] = { ...records[idx], attempts };
      }
      writeJson(RECORDS_KEY, records);
    }
  }

  // Sync final exam result and scorecard to Supabase cloud asynchronously
  saveExamResultToCloud(resultSummary).catch(() => {});

  localStorage.removeItem(ACTIVE_EXAM_KEY);
}
