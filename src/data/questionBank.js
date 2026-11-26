import { ENGLISH_QUESTIONS } from './englishQuestions.js';
import { SCIENCE_QUESTIONS } from './scienceQuestions.js';
import { SST_QUESTIONS } from './sstQuestions.js';
import { MATHS_QUESTIONS } from './mathsQuestions.js';

import { PREP_AI_ENGLISH } from './prepEnglishQuestions.js';
import { PREP_AI_SCIENCE } from './prepScienceQuestions.js';
import { PREP_AI_SST } from './prepSstQuestions.js';
import { PREP_AI_MATHS } from './prepMathsQuestions.js';

export const SUBJECTS = [
  { key: 'English', label: 'English', start: 0, count: 20 },
  { key: 'Science', label: 'Science', start: 20, count: 20 },
  { key: 'SST', label: 'Social Studies (SST)', start: 40, count: 20 },
  { key: 'Maths', label: 'Mathematics', start: 60, count: 20 },
];

export const PREP_SUBJECTS = [
  { key: 'English', label: 'English', start: 0, count: 30 },
  { key: 'Science', label: 'Science', start: 30, count: 30 },
  { key: 'SST', label: 'Social Studies (SST)', start: 60, count: 30 },
  { key: 'Maths', label: 'Mathematics', start: 90, count: 30 },
];

export const GRADES = [3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Returns the 80-question official timed examination paper for a grade.
 * 20 questions per subject across English, Science, SST, and Maths.
 */
export function getQuestionsForGrade(grade) {
  const g = Number(grade);
  const english = (ENGLISH_QUESTIONS[g] || []).map((item, i) => ({
    ...item,
    id: `g${g}-eng-${i + 1}`,
    number: i + 1,
    subject: 'English',
    source: 'Official Test Bank',
  }));
  const science = (SCIENCE_QUESTIONS[g] || []).map((item, i) => ({
    ...item,
    id: `g${g}-sci-${i + 1}`,
    number: 21 + i,
    subject: 'Science',
    source: 'Official Test Bank',
  }));
  const sst = (SST_QUESTIONS[g] || []).map((item, i) => ({
    ...item,
    id: `g${g}-sst-${i + 1}`,
    number: 41 + i,
    subject: 'SST',
    source: 'Official Test Bank',
  }));
  const maths = (MATHS_QUESTIONS[g] || []).map((item, i) => ({
    ...item,
    id: `g${g}-mat-${i + 1}`,
    number: 61 + i,
    subject: 'Maths',
    source: 'Official Test Bank',
  }));

  return [...english, ...science, ...sst, ...maths];
}

/**
 * Returns 120 questions for Preparatory Mode (30 questions each for English, Science, SST, Maths)
 * Composed of:
 * - 15 questions selected from the Official Grade Test
 * - 15 questions generated from the AI Practice Bank
 */
export function getPrepQuestionsForGrade(grade) {
  const g = Number(grade);

  function buildSubjectPrep(officialList, aiList, subjectKey, startIndex) {
    const fromOfficial = (officialList || []).slice(0, 15).map((item, i) => ({
      ...item,
      id: `prep-g${g}-${subjectKey.toLowerCase()}-off-${i + 1}`,
      number: startIndex + i + 1,
      subject: subjectKey,
      source: 'Official Test Bank',
      sourceType: 'official',
    }));

    const fromAi = (aiList || []).slice(0, 15).map((item, i) => ({
      ...item,
      id: `prep-g${g}-${subjectKey.toLowerCase()}-ai-${i + 1}`,
      number: startIndex + 15 + i + 1,
      subject: subjectKey,
      source: 'AI Practice Bank',
      sourceType: 'ai',
    }));

    return [...fromOfficial, ...fromAi];
  }

  const english = buildSubjectPrep(ENGLISH_QUESTIONS[g], PREP_AI_ENGLISH[g], 'English', 0);
  const science = buildSubjectPrep(SCIENCE_QUESTIONS[g], PREP_AI_SCIENCE[g], 'Science', 30);
  const sst = buildSubjectPrep(SST_QUESTIONS[g], PREP_AI_SST[g], 'SST', 60);
  const maths = buildSubjectPrep(MATHS_QUESTIONS[g], PREP_AI_MATHS[g], 'Maths', 90);

  return [...english, ...science, ...sst, ...maths];
}
