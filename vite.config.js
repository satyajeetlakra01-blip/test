import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import https from 'https';

const GEMINI_API_KEY =
  process.env.VITE_GEMINI_API_KEY ||
  'AQ.Ab8RN6JstXVAFG--0qaZoI1EtYO6LepUsO5ZkFz_-cCr0T-09w';
const GEMINI_MODEL = process.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview';

// Server-side 15 RPM (Requests Per Minute) sliding-window rate limiter per IP
const RATE_LIMIT_RPM = 15;
const RATE_WINDOW_MS = 60 * 1000;
const ipRequestLog = new Map();

function checkServerRateLimit(ip) {
  const now = Date.now();
  const timestamps = (ipRequestLog.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_RPM) {
    const retryAfterSec = Math.max(1, Math.ceil((timestamps[0] + RATE_WINDOW_MS - now) / 1000));
    ipRequestLog.set(ip, timestamps);
    return { allowed: false, retryAfterSec };
  }

  timestamps.push(now);
  ipRequestLog.set(ip, timestamps);
  return { allowed: true, remaining: RATE_LIMIT_RPM - timestamps.length };
}

function geminiMiddleware(req, res, next) {
  if (req.method === 'POST' && req.url === '/api/gemini-explain') {
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local';
    const rateCheck = checkServerRateLimit(String(clientIp));

    res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_RPM));
    res.setHeader('X-RateLimit-Remaining', String(rateCheck.remaining ?? 0));

    if (!rateCheck.allowed) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Retry-After', String(rateCheck.retryAfterSec));
      res.end(
        JSON.stringify({
          error: `Rate limit exceeded (15 RPM). Please retry in ${rateCheck.retryAfterSec} seconds.`,
        })
      );
      return;
    }

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

        const prompt = `You are the Google Gemini Flash Academic Tutor for an Olympiad student in Grade ${grade}.
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

        const requestData = JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const apiReq = https.request(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(requestData),
            },
            timeout: 8000,
          },
          (apiRes) => {
            let apiBody = '';
            apiRes.on('data', (d) => {
              apiBody += d;
            });
            apiRes.on('end', () => {
              res.setHeader('Content-Type', 'application/json');
              try {
                if (apiRes.statusCode === 200) {
                  const apiJson = JSON.parse(apiBody);
                  const text = apiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    const parsed = JSON.parse(text);
                    if (parsed.whyIncorrect && parsed.conceptExplanation) {
                      res.end(JSON.stringify(parsed));
                      return;
                    }
                  }
                }
              } catch {
                // fall through to fallback
              }

              res.end(
                JSON.stringify({
                  whyIncorrect: `Option ${chosenLetter} ("${chosenText}") is incorrect. This is a common distractor choice that confuses similar definitions or makes an arithmetic oversight.`,
                  correctAnswerText: `Option ${correctLetter}: "${correctText}"`,
                  conceptExplanation: curatedExplanation
                    ? `${curatedExplanation}`
                    : `In Grade ${grade} ${subject}, Option ${correctLetter} ("${correctText}") is the correct answer according to core principles.`,
                  studyTip: 'In Olympiads, always re-check your steps before marking your final choice.',
                })
              );
            });
          }
        );

        apiReq.on('error', () => {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              whyIncorrect: `Option ${chosenLetter} ("${chosenText}") is incorrect because it does not fit the required conditions of this question.`,
              correctAnswerText: `Option ${correctLetter}: "${correctText}"`,
              conceptExplanation: curatedExplanation || `Standard Grade ${grade} ${subject} rule applies.`,
              studyTip: 'Eliminate contradicting options before picking your final answer.',
            })
          );
        });

        apiReq.write(requestData);
        apiReq.end();
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
