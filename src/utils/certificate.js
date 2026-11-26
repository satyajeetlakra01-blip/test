export function drawCertificateToCanvas(canvas, result) {
  const width = 1600;
  const height = 1130;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isPrep = !!result.isPrepMode;

  // Warm parchment background
  ctx.fillStyle = '#FAF7F0';
  ctx.fillRect(0, 0, width, height);

  // Outer deep navy frame
  ctx.strokeStyle = '#14213D';
  ctx.lineWidth = 14;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // Inner burnished gold rule
  ctx.strokeStyle = isPrep ? '#0284C7' : '#B45309';
  ctx.lineWidth = 3;
  ctx.strokeRect(64, 64, width - 128, height - 128);

  // Corner scholastic ticks
  const corners = [
    [64, 64, 1, 1],
    [width - 64, 64, -1, 1],
    [64, height - 64, 1, -1],
    [width - 64, height - 64, -1, -1],
  ];
  ctx.strokeStyle = '#14213D';
  ctx.lineWidth = 4;
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * 36);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * 36, cy);
    ctx.stroke();
  });

  // Top Header
  ctx.fillStyle = isPrep ? '#0369A1' : '#9A4406';
  ctx.font = '700 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    isPrep
      ? 'NATIONAL SCHOLASTIC OLYMPIAD | PREPARATORY PROGRAM'
      : 'NATIONAL SCHOLASTIC OLYMPIAD',
    width / 2,
    148
  );

  ctx.fillStyle = '#14213D';
  ctx.font = '700 62px "Source Serif 4", Georgia, serif';
  ctx.fillText(
    isPrep ? 'Certificate of Preparation' : 'Certificate of Achievement',
    width / 2,
    226
  );

  // Divider line
  ctx.strokeStyle = isPrep ? '#38BDF8' : '#D9A066';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 240, 260);
  ctx.lineTo(width / 2 + 240, 260);
  ctx.stroke();

  // Presented to
  ctx.fillStyle = '#475569';
  ctx.font = '500 26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('This certificate is proudly presented to', width / 2, 330);

  // Student Name
  ctx.fillStyle = '#14213D';
  ctx.font = '700 56px "Source Serif 4", Georgia, serif';
  ctx.fillText(result.student.name, width / 2, 412);

  // Underline for name
  const nameWidth = Math.min(840, Math.max(380, ctx.measureText(result.student.name).width + 80));
  ctx.strokeStyle = '#14213D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - nameWidth / 2, 434);
  ctx.lineTo(width / 2 + nameWidth / 2, 434);
  ctx.stroke();

  // School & Grade line
  ctx.fillStyle = '#334155';
  ctx.font = '600 26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    `Grade ${result.student.grade}  |  ${result.student.school}`,
    width / 2,
    494
  );

  // Description
  ctx.fillStyle = '#475569';
  ctx.font = '400 22px "Plus Jakarta Sans", system-ui, sans-serif';
  if (isPrep) {
    ctx.fillText(
      'for completing the 120-Question Untimed Olympiad Preparatory Examination',
      width / 2,
      556
    );
    ctx.fillText(
      'featuring 30 questions each in English, Science, Social Studies, and Mathematics (Official Test and AI Question Banks).',
      width / 2,
      592
    );
  } else {
    ctx.fillText(
      'for successfully completing the 80-Question Multi-Subject Olympiad Examination',
      width / 2,
      556
    );
    ctx.fillText(
      'covering English, Science, Social Studies (SST), and Mathematics.',
      width / 2,
      592
    );
  }

  // Score Summary Box
  const boxX = 240;
  const boxY = 648;
  const boxW = width - 480;
  const boxH = 148;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = '#C8C0B2';
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  const cols = [
    { label: 'SCORE', value: `${result.correctCount} / ${result.totalQuestions}` },
    { label: 'CORRECT', value: String(result.correctCount), color: '#15803D' },
    { label: 'WRONG', value: String(result.wrongCount), color: '#B91C1C' },
    { label: 'ACCURACY', value: `${result.percentage}%` },
  ];

  const colW = boxW / cols.length;
  cols.forEach((col, i) => {
    const cx = boxX + colW * i + colW / 2;
    if (i > 0) {
      ctx.strokeStyle = '#E2DDD3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(boxX + colW * i, boxY + 24);
      ctx.lineTo(boxX + colW * i, boxY + boxH - 24);
      ctx.stroke();
    }
    ctx.fillStyle = '#556178';
    ctx.font = '700 16px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(col.label, cx, boxY + 48);

    ctx.fillStyle = col.color || '#14213D';
    ctx.font = '700 38px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(col.value, cx, boxY + 104);
  });

  // Geometric Olympiad Seal on bottom center
  const sealX = width / 2;
  const sealY = 935;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 64, 0, Math.PI * 2);
  ctx.fillStyle = isPrep ? '#E0F2FE' : '#FDF3E7';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = isPrep ? '#0284C7' : '#B45309';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sealX, sealY, 52, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#14213D';
  ctx.stroke();

  ctx.fillStyle = '#14213D';
  ctx.font = '700 15px "Source Serif 4", Georgia, serif';
  ctx.fillText(isPrep ? 'PRACTICE' : 'VERIFIED', sealX, sealY - 4);
  ctx.fillStyle = isPrep ? '#0369A1' : '#9A4406';
  ctx.font = '700 14px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(`GRADE ${result.student.grade}`, sealX, sealY + 18);

  // Left signature / date
  ctx.textAlign = 'left';
  ctx.fillStyle = '#14213D';
  ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    new Date(result.completedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    140,
    938
  );
  ctx.strokeStyle = '#14213D';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, 952);
  ctx.lineTo(420, 952);
  ctx.stroke();
  ctx.fillStyle = '#556178';
  ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(isPrep ? 'Date of Practice' : 'Date of Examination', 140, 980);

  // Right Certificate ID
  ctx.textAlign = 'right';
  ctx.fillStyle = '#14213D';
  ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(result.attemptId, width - 140, 938);
  ctx.beginPath();
  ctx.moveTo(width - 420, 952);
  ctx.lineTo(width - 140, 952);
  ctx.stroke();
  ctx.fillStyle = '#556178';
  ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('Reference ID', width - 140, 980);
}

export function downloadCertificatePng(result) {
  const canvas = document.createElement('canvas');
  drawCertificateToCanvas(canvas, result);
  const link = document.createElement('a');
  const safeName = result.student.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  const prefix = result.isPrepMode ? 'Olympiad_Prep_Certificate' : 'Olympiad_Certificate';
  link.download = `${prefix}_Grade${result.student.grade}_${safeName}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
