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
 * Transforms math notation like 2^3/6, x^2, 10^5 into clean unicode superscripts and readable fractions.
 */
export function formatMathString(text) {
  if (!text || typeof text !== 'string') return text;

  let s = text;

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

/**
 * Strips raw markdown double asterisks and formats plain text cleanly.
 */
export function cleanMarkdownAsterisks(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\*\*/g, '');
}
