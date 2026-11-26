import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { execFile } from 'child_process';

function geminiMiddleware(req, res, next) {
  if (req.method === 'POST' && req.url === '/api/gemini-explain') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const {
          question,
          chosenLetter,
          chosenText,
          correctLetter,
          correctText,
          subject,
          grade,
          curatedExplanation,
        } = payload;

        const prompt = `You are the Google Antigravity Gemini Academic Tutor for an Olympiad student in Grade ${grade}.
Question: "${question}"
Student chose Option ${chosenLetter} ("${chosenText}") which is INCORRECT.
The correct answer is Option ${correctLetter} ("${correctText}").
Context note: ${curatedExplanation || 'Standard curriculum concept'}
Provide a concise, supportive explanation in JSON format with exactly four string keys:
1. "whyIncorrect": explain clearly why the chosen option is wrong and the common pitfall behind it.
2. "correctAnswerText": "Option ${correctLetter}: ${correctText}"
3. "conceptExplanation": explain the concept, rule, or formula in an encouraging way suitable for Grade ${grade}.
4. "studyTip": one short Olympiad exam tip to remember.
Return only valid JSON without markdown code blocks.`;

        // Attempt invocation of Antigravity CLI (agy.exe) with an 8-second timeout
        const child = execFile(
          'agy.exe',
          ['-p', prompt],
          { timeout: 8000 },
          (err, stdout) => {
            res.setHeader('Content-Type', 'application/json');
            if (!err && stdout) {
              try {
                // Strip possible markdown blocks if present
                const cleaned = stdout.replace(/```json/gi, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);
                if (parsed.whyIncorrect && parsed.conceptExplanation) {
                  res.end(JSON.stringify(parsed));
                  return;
                }
              } catch {
                // If not valid JSON, treat text as concept explanation
                res.end(
                  JSON.stringify({
                    whyIncorrect: `Option ${chosenLetter} ("${chosenText}") is incorrect because it does not fit the required conditions of this question.`,
                    correctAnswerText: `Option ${correctLetter}: "${correctText}"`,
                    conceptExplanation: stdout.trim(),
                    studyTip: 'Carefully compare the given condition against each option in Olympiad questions.',
                  })
                );
                return;
              }
            }

            // Fallback response if agy took longer or CLI exited
            res.end(
              JSON.stringify({
                whyIncorrect: `Option ${chosenLetter} ("${chosenText}") is incorrect. This is a common distractor choice that confuses similar rules or makes an arithmetic oversight.`,
                correctAnswerText: `Option ${correctLetter}: "${correctText}"`,
                conceptExplanation: curatedExplanation
                  ? `${curatedExplanation}`
                  : `In Grade ${grade} ${subject}, Option ${correctLetter} ("${correctText}") is the correct answer according to core principles.`,
                studyTip: 'In Olympiads, always re-check your steps before marking your final choice.',
              })
            );
          }
        );
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    next();
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'gemini-explain-api',
      configureServer(server) {
        server.middlewares.use(geminiMiddleware);
      },
      configurePreviewServer(server) {
        server.middlewares.use(geminiMiddleware);
      },
    },
  ],
  preview: {
    allowedHosts: true,
  },
});
