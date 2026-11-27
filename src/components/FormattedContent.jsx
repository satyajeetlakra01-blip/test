import { formatMathString } from '../utils/mathFormatter';

/**
 * FormattedContent renders AI tutor content with:
 * - Clean bold parsing (no raw '**' anywhere)
 * - Clean italics (no raw '*word*')
 * - Mathematical formatting (clean superscripts like 2³ / 6, x², 10⁶)
 * - Structured paragraphs and bullet points
 */
export default function FormattedContent({ content, className = '' }) {
  if (!content) return null;

  const rawText = String(content);
  // Merge orphan bullet lines (e.g. "•\nText") so bullets never sit alone on a line
  const normalizedText = rawText.replace(/^([*\-•])\s*\n+\s*/gm, '$1 ');
  const lines = normalizedText.split('\n');

  return (
    <div className={`formatted-ai-content ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="ai-spacer" style={{ height: '0.35rem' }} />;
        }

        // Horizontal rule: --- or ***
        if (/^[-*_]{3,}$/.test(trimmed)) {
          return (
            <hr
              key={lineIdx}
              className="ai-divider"
              style={{ border: 'none', borderTop: '1px solid var(--border-light, rgba(148,163,184,0.25))', margin: '0.55rem 0' }}
            />
          );
        }

        // Markdown headings: ### Heading -> clean styled heading
        const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
        if (headingMatch) {
          const headingText = formatMathString(headingMatch[1]);
          return (
            <div
              key={lineIdx}
              className="ai-heading"
              style={{ fontWeight: 700, fontSize: '0.96rem', margin: '0.5rem 0 0.25rem', lineHeight: 1.4 }}
            >
              {parseInlineMarkdown(headingText)}
            </div>
          );
        }

        // Bullet point detection: * item or - item or • item
        const isBullet = /^[*\-•]\s+/.test(trimmed);
        const lineContent = isBullet ? trimmed.replace(/^[*\-•]\s+/, '') : trimmed;

        // Apply math formatting first (2^3/6 -> 2³ / 6, x^2 -> x², LaTeX -> Unicode)
        const mathProcessed = formatMathString(lineContent);

        // Parse bold **text** and italics *text*
        const elements = parseInlineMarkdown(mathProcessed);

        if (isBullet) {
          return (
            <div
              key={lineIdx}
              className="ai-bullet-item"
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}
            >
              <span
                className="ai-bullet-dot"
                aria-hidden="true"
                style={{ color: 'var(--accent)', fontWeight: 700, lineHeight: 1.4 }}
              >
                •
              </span>
              <span className="ai-bullet-text" style={{ flex: 1, lineHeight: 1.55 }}>
                {elements}
              </span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="ai-text-para" style={{ margin: '0 0 0.45rem', lineHeight: 1.58 }}>
            {elements}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parses bold **text** and clean tokens from a line of text, stripping stray asterisks.
 */
function parseInlineMarkdown(str) {
  if (!str) return null;

  const parts = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      const plain = str.slice(lastIndex, match.index).replace(/\*\*/g, '');
      if (plain) parts.push(plain);
    }

    if (match[2]) {
      parts.push(
        <strong key={`b-${match.index}`} className="ai-bold" style={{ fontWeight: 700, color: 'inherit' }}>
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <em key={`i-${match.index}`} className="ai-italic">
          {match[3]}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    const trailing = str.slice(lastIndex).replace(/\*\*/g, '');
    if (trailing) parts.push(trailing);
  }

  return parts.length > 0 ? parts : str.replace(/\*\*/g, '');
}
