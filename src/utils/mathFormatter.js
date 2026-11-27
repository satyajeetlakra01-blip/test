const SUPERSCRIPT_MAP = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  '(': '⁽',
  ')': '⁾',
  'n': 'ⁿ',
  'x': 'ˣ',
  'y': 'ʸ',
  'a': 'ᵃ',
  'b': 'ᵇ',
};

/**
 * Converts LaTeX expressions ($$...$$, $...$, \frac, \text, \times, \pi, etc.)
 * and ASCII math notation (2^3/6, x^2, 10^5) into clean readable Unicode text.
 */
export function formatMathString(text) {
  if (!text || typeof text !== 'string') return text;

  let s = text;

  // 0. Clean LaTeX block & inline delimiters and common LaTeX commands
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner) => cleanLatex(inner.trim()));
  s = s.replace(/\$([^$\n]+?)\$/g, (_, inner) => cleanLatex(inner.trim()));
  s = cleanLatex(s);

  // 1. Fractions containing powers: e.g. 2^3/6 -> 2³ / 6 or (x+1)^2/4 -> (x+1)² / 4
  s = s.replace(/([a-zA-Z0-9()]+)\^([0-9nx+()ab-]+)\/([a-zA-Z0-9()]+)/g, (match, base, exp, denom) => {
    const superExp = exp.split('').map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `${base}${superExp} / ${denom}`;
  });

  // 2. Standalone powers: e.g. 2^3 -> 2³, x^2 -> x², 10^5 -> 10⁵, cm^2 -> cm²
  s = s.replace(/([a-zA-Z0-9()]+)\^([0-9nx+()ab-]+)/g, (match, base, exp) => {
    const superExp = exp.split('').map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `${base}${superExp}`;
  });

  // 3. Multiplication between numbers: e.g. 3 * 4 -> 3 × 4
  s = s.replace(/(\d+)\s*\*\s*(\d+)/g, '$1 × $2');

  // 4. Common math symbols: +- -> ±, <= -> ≤, >= -> ≥, != -> ≠
  s = s.replace(/\+-/g, '±')
       .replace(/<=/g, '≤')
       .replace(/>=/g, '≥')
       .replace(/!=/g, '≠')
       .replace(/sqrt\(/gi, '√(')
       .replace(/(\d+)\s*\^\s*o\b/g, '$1°'); // e.g. 45^o -> 45°

  return s;
}

function cleanLatex(str) {
  if (!str) return str;
  let out = str;

  // Unwrap \text{...}, \mathrm{...}, \mathbf{...}
  out = out.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^{}]*)\}/g, '$1');

  // Convert \frac{a}{b} (run twice to handle nested \text inside \frac)
  for (let i = 0; i < 2; i++) {
    out = out.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_, num, den) => {
      const n = num.trim();
      const d = den.trim();
      return `${n} / ${d}`;
    });
  }

  // Convert \sqrt{x} -> √(x)
  out = out.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');

  // Convert braced powers ^{2} -> ^2 so the superscript pass handles them
  out = out.replace(/\^\{([^{}]*)\}/g, '^$1');
  // Convert braced subscripts _{i} -> i
  out = out.replace(/_\{([^{}]*)\}/g, '$1');

  // Common LaTeX symbols
  out = out
    .replace(/\\times\b/g, '×')
    .replace(/\\div\b/g, '÷')
    .replace(/\\cdot\b/g, '·')
    .replace(/\\pm\b/g, '±')
    .replace(/\\pi\b/g, 'π')
    .replace(/\\theta\b/g, 'θ')
    .replace(/\\alpha\b/g, 'α')
    .replace(/\\beta\b/g, 'β')
    .replace(/\\Delta\b/g, 'Δ')
    .replace(/\\delta\b/g, 'δ')
    .replace(/\\leq\b/g, '≤')
    .replace(/\\geq\b/g, '≥')
    .replace(/\\neq\b/g, '≠')
    .replace(/\\approx\b/g, '≈')
    .replace(/\\infty\b/g, '∞')
    .replace(/\\degree\b/g, '°')
    .replace(/\\%/g, '%');

  return out;
}

/**
 * Strips raw markdown double asterisks and formats plain text cleanly.
 */
export function cleanMarkdownAsterisks(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\*\*/g, '');
}
