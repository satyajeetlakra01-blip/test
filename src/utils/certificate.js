/**
 * Clean High-Resolution Canvas Certificate Generator
 * Standard ISO 2000x1414 resolution (crisp 300 DPI diploma ratio).
 * Clean, prestigious, authentic:
 * - NO unwanted fake person names
 * - NO unwanted fake signatures
 * - NO unwanted third-party logos
 * - Displays student's verified name, grade, school, score breakdown,
 *   honors badge, clean official Olympiad seal, issue date, and authorized signing line.
 */

// Draw an ornate corner fleuron ornament
function drawCornerOrnament(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.strokeStyle = '#B45309';
  ctx.fillStyle = '#B45309';
  ctx.lineWidth = 2.5;

  // L-bracket arms
  ctx.beginPath();
  ctx.moveTo(0, 48);
  ctx.lineTo(0, 0);
  ctx.lineTo(48, 0);
  ctx.stroke();

  // Outer corner flourish
  ctx.beginPath();
  ctx.arc(14, 14, 8, 0, Math.PI * 2);
  ctx.fill();

  // Decorative leaf curve
  ctx.beginPath();
  ctx.moveTo(0, 24);
  ctx.quadraticCurveTo(24, 24, 24, 0);
  ctx.stroke();

  ctx.restore();
}

// Draw academic crest with dual laurel wreaths (purely symbolic for the Olympiad)
function drawScholasticEmblem(ctx, cx, cy, isPrep) {
  ctx.save();
  ctx.translate(cx, cy);

  const goldPrimary = isPrep ? '#0284C7' : '#B45309';
  const goldLight = isPrep ? '#38BDF8' : '#F59E0B';

  // Central medallion
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fillStyle = isPrep ? '#E0F2FE' : '#FEF3C7';
  ctx.fill();
  ctx.strokeStyle = goldPrimary;
  ctx.lineWidth = 3;
  ctx.stroke();

  // 8-point gold faceted star
  ctx.fillStyle = goldLight;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (i * Math.PI) / 4;
    const rOuter = 26;
    const rInner = 12;
    const nextAngle = angle + Math.PI / 8;
    if (i === 0) {
      ctx.moveTo(Math.cos(angle) * rOuter, Math.sin(angle) * rOuter);
    } else {
      ctx.lineTo(Math.cos(angle) * rOuter, Math.sin(angle) * rOuter);
    }
    ctx.lineTo(Math.cos(nextAngle) * rInner, Math.sin(nextAngle) * rInner);
  }
  ctx.closePath();
  ctx.fill();

  // Laurel branches left and right
  ctx.strokeStyle = goldPrimary;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.arc(-26, 0, 38, -Math.PI * 0.45, Math.PI * 0.45, false);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(26, 0, 38, Math.PI * 0.55, Math.PI * 1.45, false);
  ctx.stroke();

  // Laurel leaves
  for (let i = -3; i <= 3; i += 1) {
    const ang = (i * Math.PI) / 10;
    const lx = -48 + Math.cos(ang) * 12;
    const ly = Math.sin(ang) * 32;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 6, 3, ang, 0, Math.PI * 2);
    ctx.fillStyle = goldLight;
    ctx.fill();
    ctx.stroke();

    const rx = 48 - Math.cos(ang) * 12;
    const ry = Math.sin(ang) * 32;
    ctx.beginPath();
    ctx.ellipse(rx, ry, 6, 3, -ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

// Draw clean official Olympiad seal with ribbon tails
function drawOfficialOlympiadSeal(ctx, cx, cy, isPrep, grade) {
  ctx.save();

  // Ribbon tails hanging down
  const ribbonColor = isPrep ? '#0369A1' : '#991B1B';
  const ribbonAccent = isPrep ? '#38BDF8' : '#D97706';

  // Left ribbon
  ctx.beginPath();
  ctx.moveTo(cx - 32, cy + 20);
  ctx.lineTo(cx - 52, cy + 115);
  ctx.lineTo(cx - 32, cy + 96);
  ctx.lineTo(cx - 12, cy + 115);
  ctx.lineTo(cx - 8, cy + 20);
  ctx.fillStyle = ribbonColor;
  ctx.fill();

  ctx.strokeStyle = ribbonAccent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Right ribbon
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy + 20);
  ctx.lineTo(cx + 12, cy + 115);
  ctx.lineTo(cx + 32, cy + 96);
  ctx.lineTo(cx + 52, cy + 115);
  ctx.lineTo(cx + 32, cy + 20);
  ctx.fillStyle = ribbonColor;
  ctx.fill();
  ctx.stroke();

  // 36 scalloped teeth seal
  const teeth = 36;
  const outerR = 64;
  const innerR = 56;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i += 1) {
    const angle = (i * Math.PI) / teeth;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const sealGrad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, outerR);
  if (isPrep) {
    sealGrad.addColorStop(0, '#BAE6FD');
    sealGrad.addColorStop(0.5, '#38BDF8');
    sealGrad.addColorStop(1, '#0284C7');
  } else {
    sealGrad.addColorStop(0, '#FEF08A');
    sealGrad.addColorStop(0.4, '#F59E0B');
    sealGrad.addColorStop(0.85, '#D97706');
    sealGrad.addColorStop(1, '#92400E');
  }
  ctx.fillStyle = sealGrad;
  ctx.fill();
  ctx.strokeStyle = isPrep ? '#0369A1' : '#78350F';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.arc(cx, cy, 46, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI * 2);
  ctx.strokeStyle = isPrep ? '#0369A1' : '#78350F';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Text inside seal
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 13px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isPrep ? 'PREP' : 'OFFICIAL', cx, cy - 8);
  ctx.fillText('VERIFIED', cx, cy + 8);

  ctx.font = '700 11px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = isPrep ? '#082F49' : '#451A03';
  ctx.fillText(`GRADE ${grade}`, cx, cy + 24);

  ctx.restore();
}

/**
 * Main function: Renders the clean, authentic certificate to canvas
 */
export function drawCertificateToCanvas(canvas, result) {
  const width = 2000;
  const height = 1414;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isPrep = !!result.isPrepMode;
  const pct = result.percentage || 0;

  // Determine honor level badge
  let honorTitle = 'CERTIFICATE OF ACHIEVEMENT';
  let honorBadge = '★ SCHOLASTIC COMMENDATION ★';
  let honorBg = '#FEF3C7';
  let honorFg = '#92400E';

  if (isPrep) {
    honorTitle = 'CERTIFICATE OF PREPARATION';
    if (pct >= 90) {
      honorBadge = '★ GOLD PREPARATORY DISTINCTION ★';
    } else if (pct >= 75) {
      honorBadge = '★ SILVER PREPARATORY COMMENDATION ★';
    } else {
      honorBadge = '★ PREPARATORY COMPLETION ★';
    }
    honorBg = '#E0F2FE';
    honorFg = '#0369A1';
  } else {
    if (pct >= 90) {
      honorBadge = '★ GOLD MEDALIST DISTINCTION ★';
      honorBg = '#FEF3C7';
      honorFg = '#78350F';
    } else if (pct >= 75) {
      honorBadge = '★ SILVER MERIT COMMENDATION ★';
      honorBg = '#F1F5F9';
      honorFg = '#1E293B';
    } else if (pct >= 60) {
      honorBadge = '★ BRONZE COMMENDATION ★';
      honorBg = '#FFEDD5';
      honorFg = '#9A3412';
    } else {
      honorBadge = '★ CERTIFICATE OF PARTICIPATION ★';
      honorBg = '#F3F4F6';
      honorFg = '#374151';
    }
  }

  // 1. Parchment radial background
  const bgGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    180,
    width / 2,
    height / 2,
    width * 0.72
  );
  bgGrad.addColorStop(0, '#FCFBF7');
  bgGrad.addColorStop(0.65, '#F8F4EA');
  bgGrad.addColorStop(1, '#EFE8D6');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Guilloche rosette pattern (soft opacity)
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = isPrep ? '#0284C7' : '#92400E';
  ctx.lineWidth = 1.2;
  const cx = width / 2;
  const cy = height * 0.52;
  for (let k = 1; k <= 3; k += 1) {
    ctx.beginPath();
    const R0 = 170 * k;
    const Amp = 28 * k;
    const freq = 18;
    for (let theta = 0; theta <= Math.PI * 2; theta += 0.015) {
      const r = R0 + Amp * Math.cos(freq * theta);
      const px = cx + r * Math.cos(theta);
      const py = cy + r * Math.sin(theta);
      if (theta === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // 3. Multi-tier High Security Borders
  // Tier 1: Outer Navy Border
  ctx.strokeStyle = '#0C1E3A';
  ctx.lineWidth = 18;
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // Tier 2: Gold Border
  const goldColor = isPrep ? '#0284C7' : '#B45309';
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 5;
  ctx.strokeRect(68, 68, width - 136, height - 136);

  // Tier 3: Delicate Inner Pinstripe
  ctx.strokeStyle = isPrep ? '#38BDF8' : '#D97706';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(82, 82, width - 164, height - 164);

  // Tier 4: Corner Baroque Fleurons
  drawCornerOrnament(ctx, 84, 84, 0);
  drawCornerOrnament(ctx, width - 84, 84, Math.PI / 2);
  drawCornerOrnament(ctx, width - 84, height - 84, Math.PI);
  drawCornerOrnament(ctx, 84, height - 84, -Math.PI / 2);

  // 4. Scholastic Olympiad Emblem
  drawScholasticEmblem(ctx, width / 2, 165, isPrep);

  // 5. Header
  ctx.textAlign = 'center';
  ctx.fillStyle = isPrep ? '#0369A1' : '#854D0E';
  ctx.font = '700 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    'NATIONAL SCHOLASTIC OLYMPIAD',
    width / 2,
    242
  );

  ctx.fillStyle = '#475569';
  ctx.font = '600 17px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    'MULTI-SUBJECT ALL-INDIA ASSESSMENT (GRADES 3 - 10)',
    width / 2,
    270
  );

  // 6. Main Certificate Title
  ctx.fillStyle = '#0C1E3A';
  ctx.font = '700 64px "Source Serif 4", Georgia, serif';
  ctx.fillText(honorTitle, width / 2, 344);

  // 7. Honors Distinction Badge Ribbon
  const badgeW = 540;
  const badgeH = 42;
  const badgeX = width / 2 - badgeW / 2;
  const badgeY = 370;

  ctx.fillStyle = honorBg;
  ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

  ctx.fillStyle = honorFg;
  ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(honorBadge, width / 2, badgeY + 27);

  // 8. Citation Intro
  ctx.fillStyle = '#475569';
  ctx.font = '500 25px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    'This certificate is proudly awarded to',
    width / 2,
    458
  );

  // 9. Candidate Name
  ctx.fillStyle = '#0C1E3A';
  ctx.font = '700 68px "Source Serif 4", Georgia, serif';
  ctx.fillText(result.student.name, width / 2, 538);

  // Underline
  const nameMetric = ctx.measureText(result.student.name);
  const lineW = Math.min(1000, Math.max(500, nameMetric.width + 120));
  ctx.strokeStyle = '#0C1E3A';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - lineW / 2, 560);
  ctx.lineTo(width / 2 + lineW / 2, 560);
  ctx.stroke();

  // Central diamond
  ctx.fillStyle = goldColor;
  ctx.beginPath();
  ctx.moveTo(width / 2, 552);
  ctx.lineTo(width / 2 + 8, 560);
  ctx.lineTo(width / 2, 568);
  ctx.lineTo(width / 2 - 8, 560);
  ctx.closePath();
  ctx.fill();

  // 10. Grade and School
  ctx.fillStyle = '#1E293B';
  ctx.font = '600 27px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    `Grade ${result.student.grade}   •   ${result.student.school}`,
    width / 2,
    610
  );

  // 11. Proclamation Paragraph
  ctx.fillStyle = '#475569';
  ctx.font = '400 23px "Plus Jakarta Sans", system-ui, sans-serif';
  if (isPrep) {
    ctx.fillText(
      'for completing the 120-Question Untimed Olympiad Preparatory Curriculum,',
      width / 2,
      664
    );
    ctx.fillText(
      'featuring 30 questions each in English, Science, Social Studies, and Mathematics',
      width / 2,
      698
    );
    ctx.fillText(
      'with Antigravity Gemini AI interactive conceptual diagnostics and review.',
      width / 2,
      732
    );
  } else {
    ctx.fillText(
      'for successfully completing the 80-Question Timed Multi-Subject Olympiad Examination,',
      width / 2,
      664
    );
    ctx.fillText(
      'demonstrating scholastic excellence in English, Science, Social Studies (SST), and Mathematics',
      width / 2,
      698
    );
    ctx.fillText(
      'conducted under standard national examination rules with post-examination diagnostic review.',
      width / 2,
      732
    );
  }

  // 12. Score & Subject Performance Plaque
  const plaqueX = 200;
  const plaqueY = 780;
  const plaqueW = width - 400;
  const plaqueH = 170;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(plaqueX, plaqueY, plaqueW, plaqueH);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.strokeRect(plaqueX, plaqueY, plaqueW, plaqueH);

  ctx.strokeStyle = isPrep ? '#BAE6FD' : '#FEF3C7';
  ctx.lineWidth = 4;
  ctx.strokeRect(plaqueX + 4, plaqueY + 4, plaqueW - 8, plaqueH - 8);

  const stats = [
    {
      label: 'TOTAL SCORE',
      val: `${result.correctCount} / ${result.totalQuestions}`,
      color: '#0C1E3A',
    },
    {
      label: 'ACCURACY',
      val: `${result.percentage}%`,
      color: pct >= 75 ? '#15803D' : pct >= 50 ? '#B45309' : '#B91C1C',
    },
    {
      label: 'ENGLISH',
      val: `${result.subjectStats?.english?.correct ?? 0} / ${
        result.subjectStats?.english?.total ?? (isPrep ? 30 : 20)
      }`,
      color: '#0C1E3A',
    },
    {
      label: 'SCIENCE',
      val: `${result.subjectStats?.science?.correct ?? 0} / ${
        result.subjectStats?.science?.total ?? (isPrep ? 30 : 20)
      }`,
      color: '#0C1E3A',
    },
    {
      label: 'SST',
      val: `${result.subjectStats?.sst?.correct ?? 0} / ${
        result.subjectStats?.sst?.total ?? (isPrep ? 30 : 20)
      }`,
      color: '#0C1E3A',
    },
    {
      label: 'MATHS',
      val: `${result.subjectStats?.maths?.correct ?? 0} / ${
        result.subjectStats?.maths?.total ?? (isPrep ? 30 : 20)
      }`,
      color: '#0C1E3A',
    },
  ];

  const colW = plaqueW / stats.length;
  stats.forEach((s, i) => {
    const boxMidX = plaqueX + colW * i + colW / 2;
    if (i > 0) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(plaqueX + colW * i, plaqueY + 25);
      ctx.lineTo(plaqueX + colW * i, plaqueY + plaqueH - 25);
      ctx.stroke();
    }

    ctx.fillStyle = '#64748B';
    ctx.font = '700 15px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(s.label, boxMidX, plaqueY + 52);

    ctx.fillStyle = s.color;
    ctx.font = '700 36px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(s.val, boxMidX, plaqueY + 114);
  });

  // 13. Official Olympiad Seal in Bottom Center
  drawOfficialOlympiadSeal(ctx, width / 2, 1110, isPrep, result.student.grade);

  // 14. Left: Clean Date of Examination
  const leftX = 220;
  const dateStr = new Date(result.completedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0C1E3A';
  ctx.font = '700 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(dateStr, leftX, 1105);

  ctx.strokeStyle = '#0C1E3A';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(leftX, 1120);
  ctx.lineTo(leftX + 320, 1120);
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '600 17px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(isPrep ? 'Date of Practice' : 'Date of Examination', leftX, 1148);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 15px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('National Scholastic Olympiad', leftX, 1172);

  // 15. Right: Clean Authentic Authorized Signatory Line (no fake names or unwanted persons)
  const rightX = width - 540;

  ctx.strokeStyle = '#0C1E3A';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(rightX, 1120);
  ctx.lineTo(rightX + 320, 1120);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0C1E3A';
  ctx.font = '700 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Authorized Signatory', rightX, 1148);
  ctx.fillStyle = '#64748B';
  ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('School / Examination Authority', rightX, 1172);

  // 16. Bottom: Official Reference ID and Verification
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    `Certificate Reference ID: NSO-2026-${result.attemptId.toUpperCase()}`,
    width / 2,
    1300
  );

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 14px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    'Official candidate credential generated for scholastic performance records.',
    width / 2,
    1326
  );
}

/**
 * Downloads the clean, authentic certificate as high-resolution PNG
 */
export function downloadCertificatePng(result) {
  const canvas = document.createElement('canvas');
  drawCertificateToCanvas(canvas, result);
  const link = document.createElement('a');
  const safeName = result.student.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  const prefix = result.isPrepMode ? 'NSO_Preparatory_Certificate' : 'NSO_Olympiad_Certificate';
  link.download = `${prefix}_Grade${result.student.grade}_${safeName}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
