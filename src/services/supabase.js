import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_KEY = 'sb_publishable_a9W2G6wEDV5BZiJW6QEcYg_EZWDRZiL';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

// Initialize client only when URL is present to prevent invalid URL exceptions
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

/**
 * Saves or updates a registered candidate record to Supabase cloud.
 * Falls back silently if cloud is not yet connected.
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
 * Checks for past attempts in Supabase cloud to reinforce 1-year cooldown.
 */
export async function checkCloudCooldown(email, grade) {
  if (!supabase) return null;

  try {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('candidate_email', email.toLowerCase().trim())
      .eq('mode', 'official')
      .gte('completed_at', oneYearAgo)
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0];
  } catch {
    return null;
  }
}
