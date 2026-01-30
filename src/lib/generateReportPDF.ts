import jsPDF from 'jspdf';
import type { PalmReading } from '@/components/report/types';

interface UserData {
  name: string;
  readingType: 'full' | 'career' | 'love' | 'wealth';
  generatedAt: string;
}

// PalmMitra Brand Colors (RGB)
const COLORS = {
  indigo: { r: 48, g: 38, b: 100 },
  gold: { r: 212, g: 175, b: 55 },
  darkGray: { r: 26, g: 26, b: 26 },
  mediumGray: { r: 102, g: 102, b: 102 },
  lightGray: { r: 245, g: 245, b: 245 },
};

const READING_TYPE_LABELS: Record<string, string> = {
  full: 'Complete Destiny Reading',
  career: 'Career & Wealth Focus',
  love: 'Love & Relationships Focus',
  wealth: 'Wealth & Prosperity Focus',
};

export function generateReportPDF(reading: PalmReading, userData: UserData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper functions
  const setColor = (color: { r: number; g: number; b: number }) => {
    doc.setTextColor(color.r, color.g, color.b);
  };

  const setDrawColor = (color: { r: number; g: number; b: number }) => {
    doc.setDrawColor(color.r, color.g, color.b);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const drawSectionHeader = (title: string, emoji: string) => {
    checkPageBreak(20);
    
    // Gold accent line
    setDrawColor(COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(`${emoji} ${title}`, margin, y);
    y += 10;
  };

  const drawText = (text: string, options?: { bold?: boolean; size?: number; color?: typeof COLORS.darkGray }) => {
    const size = options?.size || 11;
    const color = options?.color || COLORS.darkGray;
    
    doc.setFontSize(size);
    doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
    setColor(color);
    
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = size * 0.45;
    
    checkPageBreak(lines.length * lineHeight + 5);
    
    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += lineHeight;
    });
    
    y += 3;
  };

  const drawBulletPoint = (label: string, value: string) => {
    checkPageBreak(12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(`• ${label}:`, margin + 2, y);
    
    const labelWidth = doc.getTextWidth(`• ${label}: `);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.darkGray);
    
    const valueLines = doc.splitTextToSize(value, contentWidth - labelWidth - 5);
    doc.text(valueLines[0], margin + 2 + labelWidth, y);
    y += 5;
    
    if (valueLines.length > 1) {
      valueLines.slice(1).forEach((line: string) => {
        doc.text(line, margin + 5, y);
        y += 5;
      });
    }
  };

  // ===== HEADER SECTION =====
  // Indigo header background
  doc.setFillColor(COLORS.indigo.r, COLORS.indigo.g, COLORS.indigo.b);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PALMMITRA DESTINY REPORT', margin, 20);

  // Sanskrit accent
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.gold.r, COLORS.gold.g, COLORS.gold.b);
  doc.text('Om Shubh Aashirvaad', margin, 28);

  // User info
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`For: ${userData.name}`, margin, 38);
  
  const formattedDate = new Date(userData.generatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Generated: ${formattedDate}`, pageWidth - margin - 60, 38);

  // Reading type badge
  doc.setFontSize(9);
  doc.setTextColor(COLORS.gold.r, COLORS.gold.g, COLORS.gold.b);
  doc.text(READING_TYPE_LABELS[userData.readingType] || 'Complete Reading', margin, 43);

  y = 55;

  // ===== KEY DESTINY INSIGHT =====
  drawSectionHeader('KEY DESTINY INSIGHT', '✨');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  setColor(COLORS.indigo);
  const summaryLines = doc.splitTextToSize(`"${reading.headlineSummary}"`, contentWidth - 10);
  summaryLines.forEach((line: string) => {
    checkPageBreak(8);
    doc.text(line, margin + 5, y);
    y += 6;
  });
  y += 8;

  // ===== MAJOR PALM LINES =====
  drawSectionHeader('MAJOR PALM LINES', '🖐️');

  const lines = [
    { name: 'Life Line', data: reading.majorLines.lifeLine, emoji: '🌿' },
    { name: 'Heart Line', data: reading.majorLines.heartLine, emoji: '❤️' },
    { name: 'Head Line', data: reading.majorLines.headLine, emoji: '🧠' },
    { name: 'Fate Line', data: reading.majorLines.fateLine, emoji: '⭐' },
    { name: 'Sun Line', data: reading.majorLines.sunLine, emoji: '☀️' },
  ];

  lines.forEach((line) => {
    checkPageBreak(25);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(`${line.emoji} ${line.name} (${line.data.strength})`, margin + 2, y);
    y += 5;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.darkGray);
    const meaningLines = doc.splitTextToSize(line.data.meaning, contentWidth - 10);
    meaningLines.forEach((mLine: string) => {
      doc.text(mLine, margin + 5, y);
      y += 4.5;
    });
    
    doc.setFont('helvetica', 'italic');
    setColor(COLORS.gold);
    doc.text(`Key Insight: ${line.data.keyInsight}`, margin + 5, y);
    y += 8;
  });

  // ===== PALM MOUNTS ANALYSIS =====
  drawSectionHeader('PALM MOUNTS ANALYSIS', '🏔️');

  const mounts = [
    { name: 'Mount of Venus', data: reading.mounts.venus, meaning: 'Love & Passion' },
    { name: 'Mount of Jupiter', data: reading.mounts.jupiter, meaning: 'Ambition & Leadership' },
    { name: 'Mount of Saturn', data: reading.mounts.saturn, meaning: 'Wisdom & Discipline' },
    { name: 'Mount of Apollo', data: reading.mounts.apollo, meaning: 'Creativity & Fame' },
    { name: 'Mount of Mercury', data: reading.mounts.mercury, meaning: 'Communication & Commerce' },
  ];

  mounts.forEach((mount) => {
    checkPageBreak(15);
    drawBulletPoint(`${mount.name} (${mount.data.level})`, mount.data.meaning);
  });
  y += 5;

  // ===== CAREER & WEALTH =====
  drawSectionHeader('CAREER & WEALTH', '💼');

  drawBulletPoint('Best Career Fields', reading.careerWealth.bestFields.join(', '));
  drawBulletPoint('Turning Point Age', reading.careerWealth.turningPointAge);
  drawBulletPoint('Wealth Style', reading.careerWealth.wealthStyle);
  
  if (reading.careerWealth.peakPeriods.length > 0) {
    const peakPeriodsText = reading.careerWealth.peakPeriods
      .map((p) => `${p.year} (${p.intensity})`)
      .join(', ');
    drawBulletPoint('Peak Periods', peakPeriodsText);
  }
  y += 5;

  // ===== LOVE & RELATIONSHIPS =====
  drawSectionHeader('LOVE & RELATIONSHIPS', '💕');

  drawBulletPoint('Emotional Style', reading.loveRelationships.emotionalStyle);
  drawBulletPoint('Commitment Tendency', reading.loveRelationships.commitmentTendency);
  drawBulletPoint('Relationship Advice', reading.loveRelationships.relationshipAdvice);
  y += 5;

  // ===== LIFE PHASES =====
  drawSectionHeader('LIFE PHASES', '🌙');

  const phases = [
    { name: 'Growth Phase', data: reading.lifePhases.growth },
    { name: 'Challenge Phase', data: reading.lifePhases.challenge },
    { name: 'Opportunity Phase', data: reading.lifePhases.opportunity },
  ];

  phases.forEach((phase) => {
    checkPageBreak(15);
    drawBulletPoint(`${phase.name} (${phase.data.period})`, phase.data.description);
  });
  y += 5;

  // ===== SPIRITUAL REMEDIES =====
  drawSectionHeader('SPIRITUAL REMEDIES', '🙏');

  reading.spiritualRemedies.forEach((remedy, index) => {
    checkPageBreak(20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(`${index + 1}. ${remedy.remedy}`, margin + 2, y);
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.darkGray);
    doc.text(`   Benefit: ${remedy.benefit}`, margin + 2, y);
    y += 4.5;
    doc.text(`   Best Time: ${remedy.timing}`, margin + 2, y);
    y += 7;
  });

  // ===== FINAL BLESSING =====
  checkPageBreak(40);
  
  // Gold accent box
  setDrawColor(COLORS.gold);
  doc.setLineWidth(1);
  doc.rect(margin, y, contentWidth, 35, 'S');
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.gold);
  doc.text('DIVINE BLESSING', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  setColor(COLORS.indigo);
  const blessingLines = doc.splitTextToSize(`"${reading.finalBlessing}"`, contentWidth - 20);
  blessingLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, y, { align: 'center' });
    y += 5;
  });

  // ===== FOOTER =====
  const footerY = pageHeight - 15;
  
  // Footer line
  setDrawColor(COLORS.gold);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(COLORS.mediumGray);
  doc.text('www.palmmitra.com', margin, footerY);
  doc.text('Om Shubh Aashirvaad', pageWidth / 2, footerY, { align: 'center' });
  
  doc.setFontSize(7);
  doc.text('For entertainment purposes only. Not medical, legal, or financial advice.', pageWidth - margin, footerY, { align: 'right' });

  // Generate filename
  const sanitizedName = userData.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `PalmMitra_Destiny_Report_${sanitizedName}.pdf`;

  // Download the PDF
  doc.save(filename);
}
