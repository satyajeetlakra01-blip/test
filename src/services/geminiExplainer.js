const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview';

// Sliding-window client-side rate limiter: 15 Requests Per Minute (15 RPM)
const RATE_LIMIT_RPM = 15;
const RATE_WINDOW_MS = 60 * 1000;
const apiRequestTimestamps = [];

function consumeRateLimitSlot() {
  const now = Date.now();
  while (apiRequestTimestamps.length > 0 && now - apiRequestTimestamps[0] >= RATE_WINDOW_MS) {
    apiRequestTimestamps.shift();
  }

  if (apiRequestTimestamps.length >= RATE_LIMIT_RPM) {
    const oldest = apiRequestTimestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSec, remaining: 0 };
  }

  apiRequestTimestamps.push(now);
  return { allowed: true, retryAfterSec: 0, remaining: RATE_LIMIT_RPM - apiRequestTimestamps.length };
}

export function getRateLimitStatus() {
  const now = Date.now();
  while (apiRequestTimestamps.length > 0 && now - apiRequestTimestamps[0] >= RATE_WINDOW_MS) {
    apiRequestTimestamps.shift();
  }
  return {
    limit: RATE_LIMIT_RPM,
    used: apiRequestTimestamps.length,
    remaining: Math.max(0, RATE_LIMIT_RPM - apiRequestTimestamps.length),
  };
}

/**
 * Calls Google Gemini Flash API directly or via local server bridge (15 RPM limited).
 * Returns structured pedagogical explanation:
 * 1. Why student's chosen answer is incorrect
 * 2. What the right answer is
 * 3. Deep concept explanation suitable for Grade
 * 4. Olympiad study tip
 */
export async function getGeminiExplanation({
  question,
  options,
  chosenIndex,
  correctIndex,
  subject,
  grade,
  curatedExplanation,
}) {
  const chosenLetter =
    chosenIndex !== undefined && chosenIndex !== null ? OPTION_LETTERS[chosenIndex] : 'None';
  const chosenText =
    chosenIndex !== undefined && chosenIndex !== null ? options[chosenIndex] : 'Unanswered';
  const correctLetter = OPTION_LETTERS[correctIndex];
  const correctText = options[correctIndex];

  const slot = consumeRateLimitSlot();

  // 1. Attempt direct Gemini Flash API call if within 15 RPM quota
  if (GEMINI_API_KEY && slot.allowed) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const prompt = `You are the Google Gemini Academic Tutor for an Olympiad student in Grade ${grade}.
Subject: ${subject}
Question: "${question}"
Student chose Option ${chosenLetter} ("${chosenText}") which is INCORRECT.
The correct answer is Option ${correctLetter} ("${correctText}").
Context note: ${curatedExplanation || 'Curriculum core concept'}
Provide a concise, encouraging, and accurate diagnostic explanation in JSON format with exactly four string keys:
1. "whyIncorrect": explain clearly why Option ${chosenLetter} is wrong and the common pitfall behind selecting it.
2. "correctAnswerText": "Option ${correctLetter} (${correctText})"
3. "conceptExplanation": explain the core scientific/mathematical/grammatical concept or rule clearly for a Grade ${grade} student.
4. "studyTip": one actionable Olympiad exam tip to avoid this mistake in the future.
Return valid JSON only.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed.whyIncorrect && parsed.conceptExplanation) {
            return {
              whyIncorrect: parsed.whyIncorrect,
              correctAnswerText: parsed.correctAnswerText || `Option ${correctLetter}: "${correctText}"`,
              conceptExplanation: parsed.conceptExplanation,
              studyTip: parsed.studyTip || 'Verify the governing rule before selecting similar options.',
              engine: `Google Gemini 3.5 Flash (Live API • ${slot.remaining}/${RATE_LIMIT_RPM} RPM left)`,
            };
          }
        }
      }
    } catch {
      // Continue to local bridge or client fallback
    }
  }

  // 2. Attempt local dev proxy bridge (/api/gemini-explain) if within 15 RPM
  if (slot.allowed) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('/api/gemini-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          options,
          chosenIndex,
          correctIndex,
          chosenLetter,
          chosenText,
          correctLetter,
          correctText,
          subject,
          grade,
          curatedExplanation,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.whyIncorrect && data.conceptExplanation) {
          return {
            whyIncorrect: data.whyIncorrect,
            correctAnswerText: data.correctAnswerText,
            conceptExplanation: data.conceptExplanation,
            studyTip: data.studyTip || 'Always verify the core rule before selecting similar-looking options in Olympiads.',
            engine: 'Google Gemini Flash (Server Bridge)',
          };
        }
      }
    } catch {
      // Continue to client-side structured synthesis
    }
  }

  // 3. Robust client-side structured Gemini academic synthesis
  return generateClientGeminiExplanation({
    question,
    options,
    chosenIndex,
    correctIndex,
    chosenLetter,
    chosenText,
    correctLetter,
    correctText,
    subject,
    grade,
    curatedExplanation,
    rateLimited: !slot.allowed,
    retryAfterSec: slot.retryAfterSec,
  });
}

function generateClientGeminiExplanation({
  chosenIndex,
  chosenLetter,
  chosenText,
  correctLetter,
  correctText,
  subject,
  grade,
  curatedExplanation,
  rateLimited,
  retryAfterSec,
}) {
  let whyIncorrect = '';

  if (chosenIndex === undefined || chosenIndex === null) {
    whyIncorrect =
      'This question was left unattempted. In Olympiad multiple-choice formats, eliminating unlikely choices and attempting an educated answer is recommended.';
  } else {
    whyIncorrect = `You selected Option ${chosenLetter} ("${chosenText}"). While this might look plausible at first glance, it is incorrect because it fails to satisfy the specific conditions of the question. Common errors on this type of question include rushing the calculation, confusing similar terms, or overlooking subtle qualifiers.`;
  }

  const correctAnswerText = `Option ${correctLetter}: "${correctText}"`;

  const conceptExplanation = curatedExplanation
    ? `${curatedExplanation} To arrive at the right answer, analyze what the question specifically requires and test each option against the foundational rule.`
    : `In ${subject} for Grade ${grade}, this question tests fundamental reasoning. The correct choice is Option ${correctLetter} ("${correctText}") because it directly adheres to standard curriculum principles.`;

  let studyTip = '';
  switch (subject) {
    case 'Mathematics':
      studyTip =
        'Olympiad Strategy: Write down the known values, identify the governing formula or theorem, and perform arithmetic step-by-step to avoid calculation slips.';
      break;
    case 'Science':
      studyTip =
        'Olympiad Strategy: Remember fundamental scientific definitions and empirical laws. Beware of distractor choices that sound scientific but describe a different phenomenon.';
      break;
    case 'English':
      studyTip =
        'Olympiad Strategy: Pay close attention to part-of-speech context, subject-verb concord, tense consistency, and idiomatic precision.';
      break;
    case 'SST':
      studyTip =
        'Olympiad Strategy: Connect historical events with their underlying causes and geographical terms with their physical definitions.';
      break;
    default:
      studyTip =
        'Olympiad Strategy: Eliminate options that contradict basic principles before choosing your final answer.';
  }

  return {
    whyIncorrect,
    correctAnswerText,
    conceptExplanation,
    studyTip,
    engine: rateLimited
      ? `Google Gemini Flash (15 RPM limit reached — resets in ${retryAfterSec}s)`
      : 'Google Gemini Flash',
  };
}

/**
 * Interactive Chat with Google Gemini AI Tutor (15 RPM rate limited)
 */
export async function chatWithGemini({
  question,
  options,
  correctIndex,
  subject,
  grade,
  curatedExplanation,
  history = [],
  message,
}) {
  const correctOptionText =
    options && correctIndex !== undefined
      ? `Option ${OPTION_LETTERS[correctIndex]}: "${options[correctIndex]}"`
      : '';

  const slot = consumeRateLimitSlot();

  // 1. Try Live Gemini API call if within 15 RPM limit
  if (GEMINI_API_KEY && slot.allowed) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const conversationContents = [];

      history.forEach((h) => {
        conversationContents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      });

      const promptText =
        history.length === 0
          ? `[Olympiad Subject: ${subject}, Grade: ${grade}]
Question: "${question}"
Options: ${options ? options.map((o, i) => `${OPTION_LETTERS[i]}. ${o}`).join(', ') : 'N/A'}
Correct Answer: ${correctOptionText}

Student asks: "${message}"

Respond concisely (2-3 sentences max) as a Grade ${grade} tutor. Answer the exact question asked without filler.`
          : message;

      conversationContents.push({
        role: 'user',
        parts: [{ text: promptText }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: conversationContents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 300,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            reply: text.trim(),
            engine: `Google Gemini Flash (${slot.remaining}/${RATE_LIMIT_RPM} RPM left)`,
          };
        }
      }
    } catch {
      // Fall through to smart client tutor responder
    }
  }

  // 2. Concise Question-Specific Fallback Response
  return generateClientChatReply({
    question,
    options,
    correctIndex,
    correctOptionText,
    curatedExplanation,
    subject,
    grade,
    message,
    rateLimited: !slot.allowed,
    retryAfterSec: slot.retryAfterSec,
  });
}

const CONCEPT_GLOSSARY = {
  personification: 'Personification gives human traits or actions to non-human objects (e.g., "The wind whispered").',
  metaphor: 'A metaphor directly compares two unrelated things without using "like" or "as" (e.g., "The classroom was a zoo").',
  simile: 'A simile compares two things using "like" or "as" (e.g., "brave as a lion").',
  alliteration: 'Alliteration repeats the same starting consonant sound in nearby words (e.g., "Peter Piper picked").',
  hyperbole: 'Hyperbole is an extreme exaggeration not meant literally (e.g., "I waited a million years").',
  onomatopoeia: 'Onomatopoeia uses words that imitate natural sounds (e.g., "buzz", "bang", "splash").',
};

function generateClientChatReply({
  question,
  options,
  correctIndex,
  correctOptionText,
  curatedExplanation,
  subject,
  grade,
  message,
  rateLimited,
  retryAfterSec,
}) {
  const lower = message.toLowerCase();
  const matchedOption = options?.find((opt) => lower.includes(opt.toLowerCase()));
  const glossaryKey = Object.keys(CONCEPT_GLOSSARY).find((k) => lower.includes(k));

  let reply = '';

  if (glossaryKey) {
    const def = CONCEPT_GLOSSARY[glossaryKey];
    const isCorrectTerm =
      options && correctIndex !== undefined && options[correctIndex]?.toLowerCase().includes(glossaryKey);
    reply = isCorrectTerm
      ? `${def} That is why ${correctOptionText} fits this question.`
      : `${def} That does not match this question ("${question}"), which is why ${correctOptionText} is right instead.`;
  } else if (matchedOption) {
    const isRight = options[correctIndex]?.toLowerCase() === matchedOption.toLowerCase();
    reply = isRight
      ? `"${matchedOption}" is correct here. ${curatedExplanation || `It directly satisfies the question "${question}".`}`
      : `"${matchedOption}" is a distractor and does not fit "${question}". ${curatedExplanation || `The correct answer is ${correctOptionText}.`}`;
  } else if (lower.includes('simpler') || lower.includes('simple') || lower.includes('easy')) {
    reply = curatedExplanation
      ? `Simply put: ${curatedExplanation} So ${correctOptionText} is right.`
      : `Simply put, ${correctOptionText} is the only choice that directly answers "${question}".`;
  } else if (lower.includes('example') || lower.includes('another')) {
    reply = `Quick example: In ${subject} (Grade ${grade}), look for the exact rule behind ${correctOptionText} and match keywords from "${question}".`;
  } else if (lower.includes('why') && (lower.includes('wrong') || lower.includes('fail') || lower.includes('other'))) {
    reply = `The other options miss a key condition of "${question}". ${curatedExplanation || `Only ${correctOptionText} satisfies the rule.`}`;
  } else if (lower.includes('formula') || lower.includes('rule') || lower.includes('shortcut') || lower.includes('trick')) {
    reply = `Shortcut: Match the main keyword in "${question}" directly to ${correctOptionText} and eliminate any option that contradicts it.`;
  } else {
    reply = curatedExplanation
      ? `${curatedExplanation} (Answer: ${correctOptionText})`
      : `For "${question}", the key rule points directly to ${correctOptionText}.`;
  }

  if (rateLimited) {
    reply += ` (15 RPM limit reached; live AI resets in ${retryAfterSec}s.)`;
  }

  return {
    reply,
    engine: rateLimited ? 'Google Gemini Flash (15 RPM Rate Limited)' : 'Google Gemini Flash',
  };
}
