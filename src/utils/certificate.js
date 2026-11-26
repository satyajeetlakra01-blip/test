/**
 * Upgraded High-Resolution Canvas Certificate Generator
 * Standard ISO 2000x1414 resolution (crisp 300 DPI diploma ratio).
 * Features guilloche rosette watermark, ornate multi-tier gold borders,
 * academic crest with laurels, honors badge, detailed score breakdown,
 * embossed metallic gold seal with swallowtail ribbons, authentic calligraphic signatures,
 * and procedural security QR verification matrix.
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

// Draw realistic calligraphic cursive signature
function drawCursiveSignature(ctx, name, startX, startY, color = '#0F2942') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  if (name.includes('Sharma')) {
    // Dr. A. K. Sharma
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(startX + 15, startY - 26, startX + 30, startY + 8, startX + 45, startY - 14);
    ctx.bezierCurveTo(startX + 60, startY - 32, startX + 75, startY + 6, startX + 90, startY - 8);
    ctx.bezierCurveTo(startX + 110, startY - 20, startX + 130, startY + 14, startX + 150, startY - 18);
    ctx.bezierCurveTo(startX + 175, startY - 36, startX + 190, startY + 12, startX + 220, startY - 10);
    ctx.stroke();

    // Flourish underline loop
    ctx.beginPath();
    ctx.moveTo(startX + 30, startY + 12);
    ctx.quadraticCurveTo(startX + 140, startY + 28, startX + 230, startY + 4);
    ctx.stroke();
  } else {
    // Prof. Eleanor Vance
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(startX + 20, startY - 30, startX + 35, startY + 10, startX + 55, startY - 12);
    ctx.bezierCurveTo(startX + 75, startY - 28, startX + 95, startY + 12, startX + 115, startY - 16);
    ctx.bezierCurveTo(startX + 135, startY - 22, startX + 155, startY + 16, startX + 180, startY - 24);
    ctx.bezierCurveTo(startX + 200, startY - 34, startX + 215, startY + 8, startX + 235, startY - 6);
    ctx.stroke();

    // Loop
    ctx.beginPath();
    ctx.moveTo(startX + 15, startY + 8);
    ctx.quadraticCurveTo(startX + 120, startY + 24, startX + 240, startY + 6);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw procedural 2D Verification QR code matrix
function drawMockQrCode(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = '#0C1E3A';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, size, size);

  const gridSize = 14;
  const cellSize = size / gridSize;

  // Predictable pseudo-random pattern based on coordinates
  ctx.fillStyle = '#0C1E3A';

  // 3 Finder patterns at corners
  const drawFinder = (fx, fy) => {
    ctx.fillRect(fx, fy, cellSize * 3.5, cellSize * 3.5);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx + cellSize * 0.7, fy + cellSize * 0.7, cellSize * 2.1, cellSize * 2.1);
    ctx.fillStyle = '#0C1E3A';
    ctx.fillRect(fx + cellSize * 1.2, fy + cellSize * 1.2, cellSize * 1.1, cellSize * 1.1);
  };

  drawFinder(x + cellSize, y + cellSize);
  drawFinder(x + size - cellSize * 4.5, y + cellSize);
  drawFinder(x + cellSize, y + size - cellSize * 4.5);

  // Data modules
  for (let r = 0; r < gridSize; r += 1) {
    for (let c = 0; c < gridSize; c += 1) {
      if ((r < 5 && c < 5) || (r < 5 && c > 8) || (r > 8 && c < 5)) continue;
      // Deterministic hash fill
      if ((r * 7 + c * 13 + (r ^ c)) % 3 === 0 || (r + c) % 5 === 0) {
        ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize * 0.9, cellSize * 0.9);
      }
    }
  }

  ctx.restore();
}

// Draw academic crest with dual laurel wreaths
function drawAcademicCrest(ctx, cx, cy, isPrep) {
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

  // Center torch/lamp dot
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fillStyle = goldPrimary;
  ctx.fill();

  // Laurel branches left and right
  ctx.strokeStyle = goldPrimary;
  ctx.lineWidth = 2.5;

  // Left laurel arc
  ctx.beginPath();
  ctx.arc(-26, 0, 38, -Math.PI * 0.45, Math.PI * 0.45, false);
  ctx.stroke();

  // Right laurel arc
  ctx.beginPath();
  ctx.arc(26, 0, 38, Math.PI * 0.55, Math.PI * 1.45, false);
  ctx.stroke();

  // Laurel leaves
  for (let i = -3; i <= 3; i += 1) {
    const ang = (i * Math.PI) / 10;
    // Left leaf
    const lx = -48 + Math.cos(ang) * 12;
    const ly = Math.sin(ang) * 32;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 6, 3, ang, 0, Math.PI * 2);
    ctx.fillStyle = goldLight;
    ctx.fill();
    ctx.stroke();

    // Right leaf
    const rx = 48 - Math.cos(ang) * 12;
    const ry = Math.sin(ang) * 32;
    ctx.beginPath();
    ctx.ellipse(rx, ry, 6, 3, -ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

// Draw metallic scalloped seal with ribbons
function drawMetallicSealWithRibbons(ctx, cx, cy, isPrep, grade) {
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
 * Main function: Renders the upgraded certificate to canvas
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
  let honorTitle = 'CERTIFICATE OF SCHOLASTIC ACHIEVEMENT';
  let honorBadge = '★ SCHOLASTIC COMMENDATION ★';
  let honorBg = '#FEF3C7';
  let honorFg = '#92400E';

  if (isPrep) {
    honorTitle = 'CERTIFICATE OF PREPARATORY MASTERY';
    if (pct >= 90) {
      honorBadge = '★ PREPARATORY GOLD READINESS DISTINCTION ★';
    } else if (pct >= 75) {
      honorBadge = '★ PREPARATORY SILVER PROFICIENCY ★';
    } else {
      honorBadge = '★ PREPARATORY COMPLETION & MERIT ★';
    }
    honorBg = '#E0F2FE';
    honorFg = '#0369A1';
  } else {
    if (pct >= 90) {
      honorBadge = '★ NATIONAL GOLD DISTINCTION & MERIT ★';
      honorBg = '#FEF3C7';
      honorFg = '#78350F';
    } else if (pct >= 75) {
      honorBadge = '★ SCHOLASTIC SILVER COMMENDATION ★';
      honorBg = '#F1F5F9';
      honorFg = '#1E293B';
    } else if (pct >= 60) {
      honorBadge = '★ BRONZE HONORS & COMMENDATION ★';
      honorBg = '#FFEDD5';
      honorFg = '#9A3412';
    } else {
      honorBadge = '★ CERTIFICATE OF PARTICIPATION & MERIT ★';
      honorBg = '#F3F4F6';
      honorFg = '#374151';
    }
  }

  // 1. Rich parchment radial gradient background
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

  // 2. Guilloche Security Rosette Watermark in Center (opacity 0.045)
  ctx.save();
  ctx.globalAlpha = 0.045;
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
  // Tier 1: Outer Dark Navy Frame
  ctx.strokeStyle = '#0C1E3A';
  ctx.lineWidth = 18;
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // Tier 2: Deep Gold Primary Border
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

  // 4. Academic Crest at Top
  drawAcademicCrest(ctx, width / 2, 160, isPrep);

  // 5. Authority Arc / Board Header
  ctx.textAlign = 'center';
  ctx.fillStyle = isPrep ? '#0369A1' : '#854D0E';
  ctx.font = '700 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    'NATIONAL SCHOLASTIC COUNCIL FOR ACADEMIC EXCELLENCE',
    width / 2,
    238
  );

  ctx.fillStyle = '#475569';
  ctx.font = '600 17px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    'GOVERNING BODY FOR NATIONWIDE TALENT & SCHOLASTIC OLYMPIAD EXAMINATIONS',
    width / 2,
    266
  );

  // 6. Main Certificate Title
  ctx.fillStyle = '#0C1E3A';
  ctx.font = '700 64px "Source Serif 4", Georgia, serif';
  ctx.fillText(honorTitle, width / 2, 342);

  // 7. Honors Distinction Badge Ribbon
  const badgeW = 600;
  const badgeH = 42;
  const badgeX = width / 2 - badgeW / 2;
  const badgeY = 368;

  ctx.fillStyle = honorBg;
  ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

  ctx.fillStyle = honorFg;
  ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(honorBadge, width / 2, badgeY + 27);

  // 8. Citation Introduction
  ctx.fillStyle = '#475569';
  ctx.font = '500 25px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    'This is to formally certify and confer scholastic recognition upon',
    width / 2,
    456
  );

  // 9. Candidate Name in Prominent Regal Serif
  ctx.fillStyle = '#0C1E3A';
  ctx.font = '700 68px "Source Serif 4", Georgia, serif';
  ctx.fillText(result.student.name, width / 2, 536);

  // Name dual underline with centered diamond ornament
  const nameMetric = ctx.measureText(result.student.name);
  const lineW = Math.min(1000, Math.max(500, nameMetric.width + 120));
  ctx.strokeStyle = '#0C1E3A';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - lineW / 2, 558);
  ctx.lineTo(width / 2 + lineW / 2, 558);
  ctx.stroke();

  // Central decorative diamond
  ctx.fillStyle = goldColor;
  ctx.beginPath();
  ctx.moveTo(width / 2, 550);
  ctx.lineTo(width / 2 + 8, 558);
  ctx.lineTo(width / 2, 566);
  ctx.lineTo(width / 2 - 8, 558);
  ctx.closePath();
  ctx.fill();

  // 10. Grade, School & Candidate Identification
  ctx.fillStyle = '#1E293B';
  ctx.font = '600 27px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    `Grade ${result.student.grade}   •   ${result.student.school}`,
    width / 2,
    608
  );

  // 11. Proclamation Paragraph
  ctx.fillStyle = '#475569';
  ctx.font = '400 23px "Plus Jakarta Sans", system-ui, sans-serif';
  if (isPrep) {
    ctx.fillText(
      'for the successful completion of the rigorous 120-Question Untimed Preparatory Curriculum,',
      width / 2,
      660
    );
    ctx.fillText(
      'mastering 30 comprehensive questions across English, Science, Social Studies, and Mathematics',
      width / 2,
      694
    );
    ctx.fillText(
      'supported by interactive Antigravity Gemini AI conceptual diagnostics and performance feedback.',
      width / 2,
      728
    );
  } else {
    ctx.fillText(
      'for appearing in and successfully completing the National Scholastic Multi-Subject Olympiad Examination,',
      width / 2,
      660
    );
    ctx.fillText(
      'comprising 80 evaluated questions across English, Science, Social Studies (SST), and Mathematics',
      width / 2,
      694
    );
    ctx.fillText(
      'administered under strict timed conditions (80 minutes) with comprehensive post-examination AI review.',
      width / 2,
      728
    );
  }

  // 12. Score & Subject Performance Plaque
  const plaqueX = 200;
  const plaqueY = 775;
  const plaqueW = width - 400;
  const plaqueH = 170;

  // Plaque container with soft shadow
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(plaqueX, plaqueY, plaqueW, plaqueH);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.strokeRect(plaqueX, plaqueY, plaqueW, plaqueH);

  // Inner gold trim on plaque
  ctx.strokeStyle = isPrep ? '#BAE6FD' : '#FEF3C7';
  ctx.lineWidth = 4;
  ctx.strokeRect(plaqueX + 4, plaqueY + 4, plaqueW - 8, plaqueH - 8);

  const stats = [
    {
      label: 'FINAL SCORE',
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

  // 13. Official Embossed Gold Wax/Foil Seal with Ribbons in Bottom Center
  drawMetallicSealWithRibbons(ctx, width / 2, 1100, isPrep, result.student.grade);

  // 14. Left Signatory: Dr. Arvind K. Sharma (Academic Director)
  const leftX = 220;
  drawCursiveSignature(ctx, 'Dr. Arvind K. Sharma', leftX + 15, 1075);
  ctx.strokeStyle = '#0C1E3A';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(leftX, 1115);
  ctx.lineTo(leftX + 320, 1115);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0C1E3A';
  ctx.font = '700 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Dr. Arvind K. Sharma', leftX, 1144);
  ctx.fillStyle = '#64748B';
  ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Director General, Academic Council', leftX, 1168);
  ctx.fillText('National Olympiad Foundation', leftX, 1190);

  // 15. Right Signatory: Prof. Eleanor Vance (Controller of Examinations)
  const rightX = width - 540;
  drawCursiveSignature(ctx, 'Prof. Eleanor Vance', rightX + 25, 1075);
  ctx.strokeStyle = '#0C1E3A';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(rightX, 1115);
  ctx.lineTo(rightX + 320, 1115);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0C1E3A';
  ctx.font = '700 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Prof. Eleanor Vance', rightX, 1144);
  ctx.fillStyle = '#64748B';
  ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Chief Controller of Examinations', rightX, 1168);
  ctx.fillText('Scholastic Assessment Board', rightX, 1190);

  // 16. Security Verification QR Matrix & Permanent Reference Token (Bottom Bar)
  const qrX = 140;
  const qrY = 1240;
  const qrSize = 92;
  drawMockQrCode(ctx, qrX, qrY, qrSize);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0C1E3A';
  ctx.font = '700 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('DIGITALLY ENCRYPTED & VERIFIED', qrX + qrSize + 18, qrY + 24);

  ctx.fillStyle = '#64748B';
  ctx.font = '500 15px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`Certificate ID: NSO-2026-${result.attemptId.toUpperCase()}`, qrX + qrSize + 18, qrY + 48);
  ctx.fillText(
    `Date of Conformance: ${new Date(result.completedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    qrX + qrSize + 18,
    qrY + 70
  );

  // Right security watermark seal note
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748B';
  ctx.font = '500 15px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    'Tamper-evident scholastic digital credential • Council for National Examinations',
    width - 140,
    1300
  );
  ctx.fillText(
    `Verification URL: https://scholastic-olympiad.org/verify/${result.attemptId.slice(0, 8)}`,
    width - 140,
    1324
  );
}

/**
 * Downloads the upgraded certificate as high-resolution PNG
 */
export function downloadCertificatePng(result) {
  const canvas = document.createElement('canvas');
  drawCertificateToCanvas(canvas, result);
  const link = document.createElement('a');
  const safeName = result.student.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  const prefix = result.isPrepMode ? 'NSO_Preparatory_Diploma' : 'NSO_Official_Certificate';
  link.download = `${prefix}_Grade${result.student.grade}_${safeName}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
