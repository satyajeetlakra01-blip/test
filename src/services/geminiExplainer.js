import { formatMathString } from '../utils/mathFormatter';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const GEMINI_API_KEY = import.meta?.env?.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta?.env?.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

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
Formatting rules: Do not use raw markdown asterisks (no '**'). For math, write powers and fractions clearly (e.g. '2³ / 6' or 'x²', never write '2^3/6').
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

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
];

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

  // 1. Try Live Gemini API call across candidate models if within 15 RPM limit
  if (GEMINI_API_KEY && slot.allowed) {
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

Respond concisely and supportively (2-3 sentences max) as a Grade ${grade} academic tutor. Answer the student's exact doubt directly (for example, if they ask where something is found or why another option is wrong, explain where that substance is found and why it does not match this question). Do not use filler. Formatting rules: Do not use raw markdown asterisks (no '**'). For math, format powers and fractions clearly (e.g. '2³ / 6' or 'x²', never write '2^3/6').`
        : message;

    conversationContents.push({
      role: 'user',
      parts: [{ text: promptText }],
    });

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: conversationContents,
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 900,
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
              reply: formatMathString(text.trim()),
              engine: `Google Gemini Flash (${slot.remaining}/${RATE_LIMIT_RPM} RPM left)`,
            };
          }
        }
      } catch {
        // Try next candidate model
      }
    }
  }

  // 2. Comprehensive Pedagogical Client Response with Context Awareness
  return generateClientChatReply({
    question,
    options,
    correctIndex,
    correctOptionText,
    curatedExplanation,
    subject,
    grade,
    message,
    history,
    rateLimited: !slot.allowed,
    retryAfterSec: slot.retryAfterSec,
  });
}

const ACADEMIC_KNOWLEDGE_BASE = {
  // Acids, Bases & Chemistry
  'lactic acid': {
    definition: 'Lactic acid is an organic acid found in sour milk, curd, yogurt, and cottage cheese. It is also produced in human muscles during strenuous exercise when oxygen is low, which causes muscle fatigue and cramps.',
    sources: 'Curd, yogurt, sour milk, fermented dairy, and fatigued muscle cells during anaerobic exercise.',
  },
  'citric acid': {
    definition: 'Citric acid is a weak organic acid found naturally in citrus fruits, giving them their characteristic sour, sharp taste.',
    sources: 'Citrus fruits including lemons, limes, oranges, grapefruits, and amla (Indian gooseberry).',
  },
  'acetic acid': {
    definition: 'Acetic acid (ethanoic acid) is the primary constituent of vinegar (5-8% aqueous solution), widely used as a food preservative and flavoring.',
    sources: 'Vinegar, fermented fruit juices, and pickled foods.',
  },
  'hydrochloric acid': {
    definition: 'Hydrochloric acid (HCl) is a strong mineral acid. In the human body, gastric glands in the stomach lining secrete HCl to kill ingested microbes and activate the enzyme pepsin for protein breakdown.',
    sources: 'Human gastric juice (stomach), chemical laboratories, and industrial pickling of steel.',
  },
  'tartaric acid': {
    definition: 'Tartaric acid is a white crystalline organic acid that provides a sharp tart flavor and acts as a leavening agent in baking powder.',
    sources: 'Tamarind (imli), grapes, unripe mangoes, and bananas.',
  },
  'formic acid': {
    definition: 'Formic acid (methanoic acid, HCOOH) is the simplest carboxylic acid, known for producing a stinging, burning sensation when injected into skin.',
    sources: 'Stings of red ants, bee venom, and stinging nettle plant leaves.',
  },
  'methanoic acid': {
    definition: 'Methanoic acid (commonly known as formic acid) is an irritant acid injected by biting insects.',
    sources: 'Ant stings and stinging nettle hair.',
  },
  'oxalic acid': {
    definition: 'Oxalic acid is an organic compound that binds with minerals like calcium to form oxalates.',
    sources: 'Tomatoes, spinach, rhubarb, and cocoa.',
  },
  'ascorbic acid': {
    definition: 'Ascorbic acid is the chemical name for Vitamin C, an essential water-soluble antioxidant that prevents scurvy and boosts immune defense.',
    sources: 'Amla (richest natural source), citrus fruits, guava, bell peppers, and kiwi.',
  },
  'malic acid': {
    definition: 'Malic acid is a dicarboxylic acid that contributes to the sour taste of green fruits.',
    sources: 'Apples, pears, cherries, and watermelons.',
  },
  'carbonic acid': {
    definition: 'Carbonic acid (H2CO3) is a weak acid formed when carbon dioxide gas dissolves in water under pressure.',
    sources: 'Carbonated soft drinks, sparkling water, and blood buffer systems.',
  },
  'sulfuric acid': {
    definition: 'Sulfuric acid (H2SO4) is a highly corrosive mineral acid called the "King of Chemicals" because of its immense industrial importance.',
    sources: 'Car batteries (lead-acid accumulators), fertilizer manufacturing, and petroleum refining.',
  },
  'nitric acid': {
    definition: 'Nitric acid (HNO3) is a strong, highly oxidizing mineral acid used to make fertilizers and explosives.',
    sources: 'Manufacture of ammonium nitrate fertilizers, purification of gold and silver.',
  },
  'calcium hydroxide': {
    definition: 'Calcium hydroxide (Ca(OH)2), commonly called slaked lime, is an alkaline base used in whitewashing walls and neutralizing acidic agricultural soils.',
    sources: 'Formed when quicklime (CaO) reacts with water; used in mortar and soil treatment.',
  },
  'sodium hydroxide': {
    definition: 'Sodium hydroxide (NaOH), known as caustic soda, is a strong alkali base used to manufacture soaps, rayon, and paper.',
    sources: 'Industrial chlor-alkali process; used in drain cleaners and soap making.',
  },
  'magnesium hydroxide': {
    definition: 'Magnesium hydroxide (Milk of Magnesia) is a mild base used as an antacid to neutralize excess hydrochloric acid in the stomach and relieve indigestion.',
    sources: 'Antacid tablets, liquid suspensions, and laxatives.',
  },
  'sodium bicarbonate': {
    definition: 'Sodium hydrogen carbonate (NaHCO3), or baking soda, is a mild alkaline salt that releases carbon dioxide when heated or mixed with acid, making dough fluffy.',
    sources: 'Baking powder, antacids, and soda-acid fire extinguishers.',
  },
  'litmus': {
    definition: 'Litmus is a natural pH indicator dye extracted from lichens. It turns red in acidic solutions (pH < 7) and blue in basic alkaline solutions (pH > 7).',
    sources: 'Extracted from species of lichens (such as Roccella tinctoria).',
  },
  'phenolphthalein': {
    definition: 'Phenolphthalein is a synthetic pH indicator that remains colorless in neutral and acidic solutions, turning vivid pink/magenta in basic solutions above pH 8.2.',
    sources: 'Chemical indicator for acid-base titrations.',
  },

  // Biology & Human Body
  'pepsin': {
    definition: 'Pepsin is an active proteolytic digestive enzyme produced by gastric chief cells that breaks down dietary proteins into smaller peptides in the stomach.',
    sources: 'Gastric juice in the human stomach, active only in an acidic environment (pH 1.5 - 2.0).',
  },
  'bile': {
    definition: 'Bile is a greenish-yellow alkaline fluid produced by the liver and stored in the gallbladder. It contains bile salts that emulsify large fat globules into tiny droplets for lipase enzymes to digest.',
    sources: 'Produced continuously by the liver, stored in the gall bladder, and released into the duodenum.',
  },
  'mucus': {
    definition: 'The gastric mucus layer is a protective alkaline gel secreted by goblet cells that coats the stomach wall, shielding it from hydrochloric acid and pepsin autodigestion.',
    sources: 'Epithelial lining of the digestive, respiratory, and reproductive tracts.',
  },
  'photosynthesis': {
    definition: 'Photosynthesis is the autotrophic process by which green plants use light energy, carbon dioxide from the air, and water from the soil to produce glucose and oxygen: 6CO2 + 6H2O + Light -> C6H12O6 + 6O2.',
    sources: 'Chloroplasts containing chlorophyll in the green leaves and stems of plants.',
  },
  'stomata': {
    definition: 'Stomata are microscopic pores on the epidermal surface of plant leaves surrounded by two bean-shaped guard cells, controlling transpiration and gas exchange (CO2 and O2).',
    sources: 'Underside of plant leaves.',
  },
  'xylem': {
    definition: 'Xylem is a specialized vascular plant tissue that conducts water and dissolved mineral nutrients unidirectionally from the roots upward to the rest of the plant.',
    sources: 'Vascular bundles in plant roots, stems, and leaf veins.',
  },
  'phloem': {
    definition: 'Phloem is the vascular tissue responsible for translocation of soluble photosynthetic products (sucrose) bidirectionally from leaves to storage and growing tissues.',
    sources: 'Vascular bundles in plants alongside xylem.',
  },

  // English Figures of Speech & Grammar
  'personification': {
    definition: 'Personification is a literary device in which human qualities, emotions, or actions are attributed to non-human things, animals, or inanimate objects (e.g., "The leaves danced in the wind").',
    sources: 'Poetry, creative literature, and descriptive prose.',
  },
  'metaphor': {
    definition: 'A metaphor is a figure of speech that directly compares two unrelated things by stating one thing IS another, without using "like" or "as" (e.g., "Time is a thief", "The classroom was a zoo").',
    sources: 'Poetry, idioms, and expressive writing.',
  },
  'simile': {
    definition: 'A simile compares two different things using the explicit connector words "like" or "as" (e.g., "As brave as a lion", "He ran like the wind").',
    sources: 'Literature, idioms, and everyday descriptive speech.',
  },
  'alliteration': {
    definition: 'Alliteration is the repetition of the identical initial consonant sound in a sequence of adjacent or closely connected words (e.g., "Peter Piper picked a peck of pickled peppers").',
    sources: 'Poetry, tongue twisters, and advertising slogans.',
  },
  'hyperbole': {
    definition: 'Hyperbole is an intentional and dramatic exaggeration not intended to be taken literally, used for emphasis or humor (e.g., "I have told you a thousand times", "This suitcase weighs a ton").',
    sources: 'Literature, comedic speech, and rhetorical emphasis.',
  },
  'onomatopoeia': {
    definition: 'Onomatopoeia refers to words that phonetically imitate or resemble the sound they describe (e.g., "buzz", "bang", "hiss", "splash", "roar").',
    sources: 'Poetry, comic books, and descriptive storytelling.',
  },
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
  history = [],
  rateLimited,
  retryAfterSec,
}) {
  const lowerMsg = message.toLowerCase().trim();

  // Find mentioned key from message OR previous user queries in history (context tracking)
  let foundKey = Object.keys(ACADEMIC_KNOWLEDGE_BASE).find((k) => lowerMsg.includes(k));

  if (!foundKey && history.length > 0) {
    // Check if user is asking a follow-up ("where is it found", "why not this", "tell me about it")
    const isPronounFollowUp =
      lowerMsg.includes('it') ||
      lowerMsg.includes('this') ||
      lowerMsg.includes('that') ||
      lowerMsg.includes('where') ||
      lowerMsg.includes('found');

    if (isPronounFollowUp) {
      for (let i = history.length - 1; i >= 0; i--) {
        const pastText = history[i].text.toLowerCase();
        const pastKey = Object.keys(ACADEMIC_KNOWLEDGE_BASE).find((k) => pastText.includes(k));
        if (pastKey) {
          foundKey = pastKey;
          break;
        }
      }
    }
  }

  // Also match options in question
  const matchedOption = options?.find((opt) => lowerMsg.includes(opt.toLowerCase()));
  const isAskingLocation =
    lowerMsg.includes('where') ||
    lowerMsg.includes('found') ||
    lowerMsg.includes('source') ||
    lowerMsg.includes('origin') ||
    lowerMsg.includes('obtain');
  const isAskingWhyNot =
    lowerMsg.includes('why not') ||
    lowerMsg.includes("why isn't") ||
    lowerMsg.includes('why is it not') ||
    lowerMsg.includes('why not the') ||
    (lowerMsg.includes('why') && matchedOption);

  let reply = '';

  // 1. Specific Query About Location / Occurrence ("where lactic acid is found", "where itis found")
  if (isAskingLocation) {
    if (foundKey && ACADEMIC_KNOWLEDGE_BASE[foundKey]) {
      const info = ACADEMIC_KNOWLEDGE_BASE[foundKey];
      const isCorrectAnswer =
        options && correctIndex !== undefined && options[correctIndex]?.toLowerCase().includes(foundKey);

      reply = isCorrectAnswer
        ? `${foundKey.charAt(0).toUpperCase() + foundKey.slice(1)} is found in: ${info.sources} That is exactly why ${correctOptionText} is the correct answer to "${question}".`
        : `${foundKey.charAt(0).toUpperCase() + foundKey.slice(1)} is found in: ${info.sources} It is NOT found in the item asked in the question ("${question}"), which is why ${correctOptionText} is the right choice instead.`;
    } else if (matchedOption) {
      reply = `"${matchedOption}" occurs in different natural sources and does not match the conditions of "${question}". The correct answer is ${correctOptionText}.`;
    } else {
      reply = `For "${question}", the relevant source is ${correctOptionText}. ${curatedExplanation || ''}`;
    }
  }
  // 2. Explaining "Why not [Option]?" with authentic pedagogical reasoning
  else if (isAskingWhyNot) {
    if (foundKey && ACADEMIC_KNOWLEDGE_BASE[foundKey]) {
      const info = ACADEMIC_KNOWLEDGE_BASE[foundKey];
      const isCorrectAnswer =
        options && correctIndex !== undefined && options[correctIndex]?.toLowerCase().includes(foundKey);

      reply = isCorrectAnswer
        ? `${foundKey.charAt(0).toUpperCase() + foundKey.slice(1)} IS the correct answer! ${info.definition}`
        : `${foundKey.charAt(0).toUpperCase() + foundKey.slice(1)} does not fit here because: ${info.definition} In this question ("${question}"), the correct choice is ${correctOptionText}.`;
    } else if (matchedOption) {
      reply = `Option "${matchedOption}" is incorrect because it describes a different principle and does not satisfy the requirements of "${question}". ${curatedExplanation || `The correct answer is ${correctOptionText}.`}`;
    } else {
      reply = `The alternative choices do not satisfy the specific conditions of "${question}". ${curatedExplanation || `The correct principle points directly to ${correctOptionText}.`}`;
    }
  }
  // 3. Definition or Concept inquiry ("what is lactic acid", "explain personification")
  else if (foundKey && ACADEMIC_KNOWLEDGE_BASE[foundKey]) {
    const info = ACADEMIC_KNOWLEDGE_BASE[foundKey];
    const isCorrectAnswer =
      options && correctIndex !== undefined && options[correctIndex]?.toLowerCase().includes(foundKey);

    reply = isCorrectAnswer
      ? `${info.definition} That directly answers "${question}" (${correctOptionText}).`
      : `${info.definition} For "${question}", the governing answer is ${correctOptionText}.`;
  }
  // 4. Matched Option without specific intent
  else if (matchedOption) {
    const isRight = options[correctIndex]?.toLowerCase() === matchedOption.toLowerCase();
    reply = isRight
      ? `"${matchedOption}" is indeed the correct choice! ${curatedExplanation || `It directly satisfies the question "${question}".`}`
      : `"${matchedOption}" is not correct for this question. ${curatedExplanation || `The correct answer is ${correctOptionText}.`}`;
  }
  // 5. Simpler explanation request
  else if (lowerMsg.includes('simpler') || lowerMsg.includes('simple') || lowerMsg.includes('easy')) {
    reply = curatedExplanation
      ? `In simple words: ${curatedExplanation} Therefore, ${correctOptionText} is the correct choice.`
      : `Simply put, ${correctOptionText} is the only option that directly answers "${question}".`;
  }
  // 6. Request for an example
  else if (lowerMsg.includes('example') || lowerMsg.includes('another')) {
    reply = `Here is a clear example: In Grade ${grade} ${subject}, remember the core governing rule for ${correctOptionText}. Test each option against that rule before choosing.`;
  }
  // 7. General explanation fallback
  else {
    reply = curatedExplanation
      ? `${curatedExplanation} (Correct Answer: ${correctOptionText})`
      : `For "${question}", the fundamental concept tested in Grade ${grade} ${subject} points directly to ${correctOptionText}.`;
  }

  if (rateLimited) {
    reply += ` (Live AI resets in ${retryAfterSec}s.)`;
  }

  return {
    reply: formatMathString(reply),
    engine: rateLimited ? 'Google Gemini AI Tutor (Offline Knowledge Engine)' : 'Google Gemini AI Tutor',
  };
}
