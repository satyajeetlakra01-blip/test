import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://eqqbfvssravtufvarwkc.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_a9W2G6wEDV5BZiJW6QEcYg_EZWDRZiL';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

export const supabase =
  SUPABASE_URL && SUPABASE_URL.startsWith('http')
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

export function isSupabaseConfigured() {
  return !!supabase;
}

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Saves or updates a registered candidate record to Supabase cloud.
 */
export async function saveCandidateToCloud(candidate) {
  if (!supabase) return { ok: false, error: 'SUPABASE_URL_NOT_CONFIGURED' };

  try {
    const { data, error } = await supabase
      .from('candidates')
      .upsert(
        {
          email: candidate.email.toLowerCase().trim(),
          mobile: candidate.mobile.trim(),
          name: candidate.name.trim(),
          grade: Number(candidate.grade),
          gender: candidate.gender,
          school: candidate.school.trim(),
          password: candidate.password,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select();

    if (error) {
      console.warn('Supabase candidate sync error:', error.message);
      return { ok: false, error };
    }
    return { ok: true, data };
  } catch (err) {
    console.warn('Supabase network error:', err);
    return { ok: false, error: err };
  }
}

/**
 * Saves a completed exam or practice result to Supabase cloud.
 */
export async function saveExamResultToCloud(result) {
  if (!supabase) return { ok: false, error: 'SUPABASE_URL_NOT_CONFIGURED' };

  try {
    const { data, error } = await supabase.from('exam_results').insert([
      {
        attempt_id: result.attemptId,
        candidate_email: result.student.email.toLowerCase().trim(),
        candidate_name: result.student.name,
        grade: Number(result.student.grade),
        school: result.student.school,
        mode: result.mode,
        is_prep_mode: !!result.isPrepMode,
        total_questions: result.totalQuestions,
        correct_count: result.correctCount,
        wrong_count: result.wrongCount,
        unanswered_count: result.unansweredCount,
        percentage: result.percentage,
        elapsed_seconds: result.elapsedSeconds,
        subject_stats: result.subjectStats,
        auto_submitted: !!result.autoSubmitted,
        completed_at: new Date(result.completedAt).toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase exam result sync error:', error.message);
      return { ok: false, error };
    }
    return { ok: true, data };
  } catch (err) {
    console.warn('Supabase network error:', err);
    return { ok: false, error: err };
  }
}

/**
 * Checks Supabase cloud database (`candidates` and `exam_results`) to enforce
 * password verification and the strict 1-year re-attempt cooldown across devices/browsers.
 */
export async function checkCloudEligibility(email, mobile, password, requestedGrade) {
  if (!supabase) return { allowed: true };

  const normEmail = email.toLowerCase().trim();
  const normMobile = mobile.trim();
  const oneYearAgoMs = Date.now() - ONE_YEAR_MS;
  const oneYearAgoIso = new Date(oneYearAgoMs).toISOString();

  try {
    // 1. Check existing candidate in `candidates` by email or mobile
    const { data: candidateRows, error: candErr } = await supabase
      .from('candidates')
      .select('*')
      .or(`email.eq.${normEmail},mobile.eq.${normMobile}`)
      .limit(1);

    const existingCandidate = !candErr && candidateRows && candidateRows.length > 0
      ? candidateRows[0]
      : null;

    if (existingCandidate && existingCandidate.password !== password) {
      return {
        allowed: false,
        errorType: 'AUTH_FAILED',
        message:
          'An account with this email or mobile number already exists in the database, and the password does not match.',
      };
    }

    // 2. Check completed official attempts in `exam_results` within the past 1 year
    const candidateEmailToCheck = existingCandidate ? existingCandidate.email : normEmail;
    const { data: resultRows, error: resErr } = await supabase
      .from('exam_results')
      .select('*')
      .eq('candidate_email', candidateEmailToCheck)
      .eq('mode', 'official')
      .gte('completed_at', oneYearAgoIso)
      .order('completed_at', { ascending: false })
      .limit(1);

    if (!resErr && resultRows && resultRows.length > 0) {
      const latest = resultRows[0];
      const attemptTime = new Date(latest.completed_at).getTime();
      const eligibleDate = new Date(attemptTime + ONE_YEAR_MS);
      const attemptDate = new Date(attemptTime);
      const sameClass = String(latest.grade) === String(requestedGrade);

      const reconstructedResult = {
        attemptId: latest.attempt_id,
        student: {
          name: latest.candidate_name,
          grade: latest.grade,
          school: latest.school,
          email: latest.candidate_email,
        },
        mode: latest.mode,
        isPrepMode: !!latest.is_prep_mode,
        totalQuestions: latest.total_questions,
        correctCount: latest.correct_count,
        wrongCount: latest.wrong_count,
        unansweredCount: latest.unanswered_count,
        percentage: latest.percentage,
        elapsedSeconds: latest.elapsed_seconds,
        subjectStats: latest.subject_stats,
        autoSubmitted: !!latest.auto_submitted,
        completedAt: attemptTime,
      };

      return {
        allowed: false,
        errorType: 'COOLDOWN_ACTIVE',
        sameClass,
        lastAttempt: { result: reconstructedResult },
        eligibleDate,
        attemptDate,
        message: sameClass
          ? `Database record found: You already attended the Grade ${latest.grade} Official Olympiad on ${attemptDate.toLocaleDateString()}. You cannot repeat the same class before 1 year (eligible after ${eligibleDate.toLocaleDateString()}).`
          : `Database record found: You already attended the Grade ${latest.grade} Official Olympiad on ${attemptDate.toLocaleDateString()}. Students may not attend another grade or repeat the Olympiad before 1 year (eligible after ${eligibleDate.toLocaleDateString()}).`,
      };
    }

    // 3. Also block if candidate already registered & started an official exam within 1 year
    if (existingCandidate && existingCandidate.updated_at) {
      const registeredAt = new Date(existingCandidate.updated_at).getTime();
      if (registeredAt >= oneYearAgoMs) {
        const eligibleDate = new Date(registeredAt + ONE_YEAR_MS);
        const attemptDate = new Date(registeredAt);
        const sameClass = String(existingCandidate.grade) === String(requestedGrade);

        return {
          allowed: false,
          errorType: 'COOLDOWN_ACTIVE',
          sameClass,
          eligibleDate,
          attemptDate,
          message: sameClass
            ? `Database record found: You already registered and started the Grade ${existingCandidate.grade} Official Olympiad on ${attemptDate.toLocaleDateString()}. Multiple attempts within 1 year are not allowed (eligible after ${eligibleDate.toLocaleDateString()}).`
            : `Database record found: You already registered for the Grade ${existingCandidate.grade} Official Olympiad on ${attemptDate.toLocaleDateString()}. You cannot attempt another grade before 1 year (eligible after ${eligibleDate.toLocaleDateString()}).`,
        };
      }
    }

    return { allowed: true };
  } catch (err) {
    console.warn('Cloud eligibility check failed, falling back to local:', err);
    return { allowed: true };
  }
}
