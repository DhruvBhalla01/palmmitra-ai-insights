import jsPDF from 'jspdf';
import type { PalmReading } from '@/components/report/types';

interface UserData {
  name: string;
  readingType: 'full' | 'career' | 'love' | 'wealth';
  generatedAt: string;
}

// PalmMitra Premium Brand Colors (RGB)
const COLORS = {
  indigo: { r: 48, g: 38, b: 100 },
  indigoDark: { r: 30, g: 24, b: 70 },
  gold: { r: 212, g: 175, b: 55 },
  goldLight: { r: 245, g: 225, b: 150 },
  white: { r: 255, g: 255, b: 255 },
  cream: { r: 255, g: 252, b: 245 },
  darkText: { r: 30, g: 30, b: 35 },
  bodyText: { r: 55, g: 55, b: 60 },
  mutedText: { r: 120, g: 120, b: 130 },
  success: { r: 34, g: 139, b: 34 },
  accent: { r: 168, g: 135, b: 60 },
};

const READING_TYPE_LABELS: Record<string, string> = {
  full: 'Complete Destiny Reading',
  career: 'Career & Wealth Focus',
  love: 'Love & Relationships Focus',
  wealth: 'Wealth & Prosperity Focus',
};

// Current year for timeline calculations
const CURRENT_YEAR = new Date().getFullYear();

export function generateReportPDF(reading: PalmReading, userData: UserData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  let pageNumber = 1;

  // Helper functions
  const setColor = (color: { r: number; g: number; b: number }) => {
    doc.setTextColor(color.r, color.g, color.b);
  };

  const setFillColor = (color: { r: number; g: number; b: number }) => {
    doc.setFillColor(color.r, color.g, color.b);
  };

  const setDrawColor = (color: { r: number; g: number; b: number }) => {
    doc.setDrawColor(color.r, color.g, color.b);
  };

  const addFooter = () => {
    const footerY = pageHeight - 12;
    
    // Footer divider
    setDrawColor(COLORS.gold);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
    
    // Left: Brand
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.mutedText);
    doc.text('PalmMitra', margin, footerY);
    
    // Center: Page number
    setColor(COLORS.gold);
    doc.setFont('helvetica', 'bold');
    doc.text(`- ${pageNumber} -`, pageWidth / 2, footerY, { align: 'center' });
    
    // Right: Disclaimer
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.mutedText);
    doc.setFontSize(6.5);
    doc.text('AI Spiritual Guidance | For Entertainment Only', pageWidth - margin, footerY, { align: 'right' });
  };

  const checkPageBreak = (neededHeight: number): boolean => {
    if (y + neededHeight > pageHeight - 20) {
      addFooter();
      doc.addPage();
      pageNumber++;
      y = margin;
      return true;
    }
    return false;
  };

  const drawGoldDivider = (fullWidth = false) => {
    const startX = fullWidth ? margin : margin + 20;
    const endX = fullWidth ? pageWidth - margin : pageWidth - margin - 20;
    
    setDrawColor(COLORS.gold);
    doc.setLineWidth(0.4);
    doc.line(startX, y, endX, y);
    y += 6;
  };

  const drawSectionHeader = (title: string, subtitle?: string) => {
    checkPageBreak(25);
    
    y += 4;
    
    // Section title with gold accent
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(title.toUpperCase(), margin, y);
    
    // Gold underline for title
    const titleWidth = doc.getTextWidth(title.toUpperCase());
    setDrawColor(COLORS.gold);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 2, margin + titleWidth + 10, y + 2);
    
    y += 8;
    
    if (subtitle) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      setColor(COLORS.mutedText);
      doc.text(subtitle, margin, y);
      y += 6;
    }
    
    y += 2;
  };

  const drawParagraph = (text: string, options?: { 
    bold?: boolean; 
    size?: number; 
    color?: typeof COLORS.darkText;
    indent?: number;
    maxWidth?: number;
  }) => {
    const size = options?.size || 10;
    const color = options?.color || COLORS.bodyText;
    const indent = options?.indent || 0;
    const maxWidth = options?.maxWidth || (contentWidth - indent);
    
    doc.setFontSize(size);
    doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
    setColor(color);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = size * 0.42;
    
    checkPageBreak(lines.length * lineHeight + 3);
    
    lines.forEach((line: string) => {
      doc.text(line, margin + indent, y);
      y += lineHeight;
    });
    
    y += 2;
  };

  const drawKeyValuePair = (label: string, value: string, highlight = false) => {
    checkPageBreak(10);
    
    const startX = margin + 4;
    
    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(highlight ? COLORS.gold : COLORS.indigo);
    doc.text(label + ':', startX, y);
    
    // Value
    const labelWidth = doc.getTextWidth(label + ': ');
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.bodyText);
    
    const valueLines = doc.splitTextToSize(value, contentWidth - labelWidth - 10);
    doc.text(valueLines[0], startX + labelWidth, y);
    y += 4.5;
    
    if (valueLines.length > 1) {
      valueLines.slice(1).forEach((line: string) => {
        doc.text(line, startX + 5, y);
        y += 4.5;
      });
    }
    
    y += 1;
  };

  const drawHighlightBox = (title: string, content: string, accentColor = COLORS.gold) => {
    checkPageBreak(35);
    
    const boxHeight = 28;
    const boxY = y;
    
    // Box background with subtle gradient effect (using lighter fill)
    setFillColor({ r: 252, g: 248, b: 235 });
    doc.roundedRect(margin, boxY, contentWidth, boxHeight, 3, 3, 'F');
    
    // Gold left border accent
    setFillColor(accentColor);
    doc.rect(margin, boxY, 3, boxHeight, 'F');
    
    // Title
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(accentColor);
    doc.text(title.toUpperCase(), margin + 8, boxY + 7);
    
    // Content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.darkText);
    const contentLines = doc.splitTextToSize(content, contentWidth - 15);
    doc.text(contentLines.slice(0, 2).join(' '), margin + 8, boxY + 15);
    
    y = boxY + boxHeight + 8;
  };

  const drawLineAnalysis = (
    lineName: string, 
    strength: string, 
    meaning: string, 
    keyInsight: string,
    interpretation: string
  ) => {
    checkPageBreak(40);
    
    // Line name with strength badge
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(lineName, margin + 4, y);
    
    // Strength badge
    const nameWidth = doc.getTextWidth(lineName);
    doc.setFontSize(8);
    setColor(COLORS.success);
    doc.text(`[${strength}]`, margin + 4 + nameWidth + 3, y);
    y += 6;
    
    // Meaning
    drawParagraph(meaning, { indent: 4, size: 9.5 });
    
    // Key Insight box
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    setColor(COLORS.gold);
    doc.text('Key Insight: ', margin + 4, y);
    const insightX = margin + 4 + doc.getTextWidth('Key Insight: ');
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.bodyText);
    const insightLines = doc.splitTextToSize(keyInsight, contentWidth - 35);
    doc.text(insightLines[0], insightX, y);
    y += 4;
    if (insightLines.length > 1) {
      doc.text(insightLines.slice(1).join(' '), margin + 8, y);
      y += 4;
    }
    
    y += 6;
  };

  // Format date nicely
  const formattedDate = new Date(userData.generatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1: PREMIUM TITLE PAGE
  // ═══════════════════════════════════════════════════════════════════════════

  // Full-width indigo header
  setFillColor(COLORS.indigo);
  doc.rect(0, 0, pageWidth, 55, 'F');

  // Decorative gold line at header bottom
  setFillColor(COLORS.gold);
  doc.rect(0, 55, pageWidth, 2, 'F');

  // Main title
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PALMMITRA', pageWidth / 2, 22, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.gold.r, COLORS.gold.g, COLORS.gold.b);
  doc.text('DESTINY REPORT', pageWidth / 2, 32, { align: 'center' });

  // Sanskrit blessing (romanized to avoid encoding issues)
  doc.setFontSize(9);
  doc.setTextColor(COLORS.goldLight.r, COLORS.goldLight.g, COLORS.goldLight.b);
  doc.text('Om Shubh Aashirvaad', pageWidth / 2, 42, { align: 'center' });

  // Report type badge
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(READING_TYPE_LABELS[userData.readingType] || 'Complete Reading', pageWidth / 2, 50, { align: 'center' });

  y = 68;

  // User info card
  setFillColor(COLORS.cream);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
  setDrawColor(COLORS.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.indigo);
  doc.text(`Prepared for: ${userData.name}`, margin + 8, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(COLORS.mutedText);
  doc.text(`Generated: ${formattedDate}`, margin + 8, y + 17);

  // Confidence score on right
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.success);
  doc.text(`${reading.confidenceScore}% Confidence`, pageWidth - margin - 8, y + 13, { align: 'right' });

  y += 32;

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTINY HIGHLIGHT BOX (Featured Insight)
  // ═══════════════════════════════════════════════════════════════════════════

  drawHighlightBox('Your Destiny Highlight', reading.headlineSummary);

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONALIZED 3-STEP ACTION PLAN
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Your 3-Step Action Plan', 'Personalized guidance based on your palm analysis');

  // Extract peak periods for action plan
  const nextPeakPeriod = reading.careerWealth.peakPeriods.find(p => 
    parseInt(p.year) >= CURRENT_YEAR
  ) || reading.careerWealth.peakPeriods[0];

  const actionPlan = [
    {
      step: '1',
      title: 'Immediate Focus (Next 6 Months)',
      action: `Build on your ${reading.careerWealth.bestFields[0] || 'primary'} strengths. Your palm shows strong potential in ${reading.careerWealth.bestFields.slice(0, 2).join(' and ') || 'creative endeavors'}.`,
    },
    {
      step: '2',
      title: 'Growth Phase',
      action: `Your turning point approaches around age ${reading.careerWealth.turningPointAge}. Prepare by ${reading.spiritualRemedies[0]?.remedy?.toLowerCase() || 'maintaining daily spiritual practice'}.`,
    },
    {
      step: '3',
      title: 'Peak Opportunity',
      action: nextPeakPeriod 
        ? `${nextPeakPeriod.year} shows ${nextPeakPeriod.intensity} energy. Align major decisions with this cycle for maximum success.`
        : 'Your peak period approaches. Stay consistent with your spiritual practices.',
    },
  ];

  actionPlan.forEach(({ step, title, action }) => {
    checkPageBreak(18);
    
    // Step number circle
    setFillColor(COLORS.gold);
    doc.circle(margin + 5, y - 2, 4, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.white);
    doc.text(step, margin + 5, y, { align: 'center' });
    
    // Title
    setColor(COLORS.indigo);
    doc.text(title, margin + 14, y);
    y += 5;
    
    // Action text
    drawParagraph(action, { indent: 14, size: 9.5 });
    y += 2;
  });

  y += 4;
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // MAJOR PALM LINES ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Major Palm Lines Analysis', 'Detailed breakdown of your five primary lines');

  const linesData = [
    { 
      name: 'Life Line', 
      data: reading.majorLines.lifeLine,
      interpretation: `For ${userData.name}, this indicates sustained vitality and a life path marked by resilience.`
    },
    { 
      name: 'Heart Line', 
      data: reading.majorLines.heartLine,
      interpretation: `Your emotional expression style suggests deep connections and meaningful relationships.`
    },
    { 
      name: 'Head Line', 
      data: reading.majorLines.headLine,
      interpretation: `This reveals your thinking patterns and decision-making approach.`
    },
    { 
      name: 'Fate Line', 
      data: reading.majorLines.fateLine,
      interpretation: `Your career trajectory and life purpose are strongly influenced by this line.`
    },
    { 
      name: 'Sun Line', 
      data: reading.majorLines.sunLine,
      interpretation: `This indicates your potential for recognition, success, and creative fulfillment.`
    },
  ];

  linesData.forEach((line) => {
    drawLineAnalysis(
      line.name,
      line.data.strength,
      line.data.meaning,
      line.data.keyInsight,
      line.interpretation
    );
  });

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // PALM MOUNTS ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Palm Mounts Analysis', 'The seven mounts reveal your core strengths and tendencies');

  const mountsData = [
    { name: 'Mount of Venus', data: reading.mounts.venus, domain: 'Love, Passion & Vitality' },
    { name: 'Mount of Jupiter', data: reading.mounts.jupiter, domain: 'Ambition & Leadership' },
    { name: 'Mount of Saturn', data: reading.mounts.saturn, domain: 'Wisdom & Discipline' },
    { name: 'Mount of Apollo', data: reading.mounts.apollo, domain: 'Creativity & Fame' },
    { name: 'Mount of Mercury', data: reading.mounts.mercury, domain: 'Communication & Commerce' },
  ];

  mountsData.forEach((mount) => {
    checkPageBreak(12);
    drawKeyValuePair(`${mount.name} (${mount.data.level})`, mount.data.meaning);
  });

  y += 4;
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // CAREER & WEALTH ROADMAP
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Career & Wealth Roadmap', `Personalized career guidance for ${userData.name}`);

  // Best fields
  drawKeyValuePair('Recommended Industries', reading.careerWealth.bestFields.join(', '), true);

  // Turning point
  drawKeyValuePair('Career Turning Point', `Around age ${reading.careerWealth.turningPointAge}`);

  // Wealth style
  drawKeyValuePair('Wealth Accumulation Style', reading.careerWealth.wealthStyle);

  // Peak periods with future focus
  if (reading.careerWealth.peakPeriods.length > 0) {
    y += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text('Peak Career Periods:', margin + 4, y);
    y += 5;

    reading.careerWealth.peakPeriods.forEach((period) => {
      checkPageBreak(8);
      const yearNum = parseInt(period.year);
      const isFuture = yearNum >= CURRENT_YEAR;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(isFuture ? COLORS.success : COLORS.mutedText);
      doc.text(`  ${period.year}: ${period.intensity.charAt(0).toUpperCase() + period.intensity.slice(1)} phase${isFuture ? ' (upcoming)' : ''}`, margin + 8, y);
      y += 4.5;
    });
  }

  // Next 12-18 month outlook
  y += 4;
  drawHighlightBox(
    'Next 12-18 Month Career Focus',
    `Focus on ${reading.careerWealth.bestFields[0] || 'your primary field'}. ${reading.careerWealth.wealthStyle}. Your palm suggests building foundations now will compound significantly by ${CURRENT_YEAR + 2}.`,
    COLORS.indigo
  );

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // LOVE & RELATIONSHIPS
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Love & Relationship Patterns', 'Emotional tendencies and partnership guidance');

  drawKeyValuePair('Emotional Expression Style', reading.loveRelationships.emotionalStyle);
  drawKeyValuePair('Commitment Tendency', reading.loveRelationships.commitmentTendency);
  drawKeyValuePair('Relationship Guidance', reading.loveRelationships.relationshipAdvice);

  y += 2;
  drawParagraph(
    `For ${userData.name}: Your heart line suggests ${reading.loveRelationships.emotionalStyle.toLowerCase()}. This is a strength that, when balanced with awareness, leads to deep and fulfilling connections.`,
    { size: 9, color: COLORS.mutedText }
  );

  y += 4;
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFE PHASES (Future-focused from current year)
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Your Destiny Phases', `Key life transitions from ${CURRENT_YEAR} onwards`);

  const phasesData = [
    { 
      name: 'Growth Phase', 
      data: reading.lifePhases.growth,
      icon: 'Expansion'
    },
    { 
      name: 'Challenge Phase', 
      data: reading.lifePhases.challenge,
      icon: 'Transformation'
    },
    { 
      name: 'Opportunity Phase', 
      data: reading.lifePhases.opportunity,
      icon: 'Breakthrough'
    },
  ];

  phasesData.forEach(({ name, data, icon }) => {
    checkPageBreak(15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(`${name}`, margin + 4, y);
    
    // Period badge
    const nameWidth = doc.getTextWidth(name);
    doc.setFontSize(8);
    setColor(COLORS.gold);
    doc.text(`[${data.period}]`, margin + 8 + nameWidth, y);
    y += 5;
    
    drawParagraph(data.description, { indent: 4, size: 9.5 });
    y += 2;
  });

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // SPIRITUAL REMEDIES & PRACTICES
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Spiritual Remedies & Practices', 'Culturally-grounded guidance for balance and growth');

  reading.spiritualRemedies.forEach((remedy, index) => {
    checkPageBreak(22);
    
    // Number badge
    setFillColor(COLORS.gold);
    doc.circle(margin + 5, y - 2, 4, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.white);
    doc.text(`${index + 1}`, margin + 5, y, { align: 'center' });
    
    // Remedy title
    setColor(COLORS.indigo);
    doc.setFontSize(10);
    doc.text(remedy.remedy, margin + 14, y);
    y += 5;
    
    // Benefit
    drawParagraph(`Benefit: ${remedy.benefit}`, { indent: 14, size: 9 });
    
    // Timing
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    setColor(COLORS.mutedText);
    doc.text(`Best Time: ${remedy.timing}`, margin + 14, y);
    y += 6;
  });

  // Note about remedies
  y += 2;
  drawParagraph(
    'Note: These practices are suggested as supportive rituals. Gemstone recommendations are presented as traditional options, not medical advice. Always consult qualified practitioners for health concerns.',
    { size: 8, color: COLORS.mutedText }
  );

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // PREMIUM INSIGHTS SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Premium Insights', 'Advanced analysis exclusive to your reading');

  if (reading.premiumInsights) {
    drawKeyValuePair('Marriage & Partnership Timing', reading.premiumInsights.marriageTiming, true);
    drawKeyValuePair('Career Breakthrough Window', reading.premiumInsights.careerBreakthrough, true);
    drawKeyValuePair('Gemstone Recommendation', reading.premiumInsights.gemstoneRecommendation + ' (optional traditional practice)', true);
  }

  y += 6;
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL DIVINE BLESSING
  // ═══════════════════════════════════════════════════════════════════════════

  checkPageBreak(50);

  // Blessing container
  const blessingY = y;
  const blessingHeight = 45;
  
  // Gold border box
  setDrawColor(COLORS.gold);
  doc.setLineWidth(1.5);
  doc.roundedRect(margin, blessingY, contentWidth, blessingHeight, 4, 4, 'S');
  
  // Inner fill
  setFillColor({ r: 255, g: 252, b: 240 });
  doc.roundedRect(margin + 2, blessingY + 2, contentWidth - 4, blessingHeight - 4, 3, 3, 'F');

  // Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.gold);
  doc.text('DIVINE BLESSING', pageWidth / 2, blessingY + 12, { align: 'center' });

  // Blessing text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  setColor(COLORS.indigo);
  const blessingLines = doc.splitTextToSize(`"${reading.finalBlessing}"`, contentWidth - 25);
  let blessingTextY = blessingY + 22;
  blessingLines.slice(0, 3).forEach((line: string) => {
    doc.text(line, pageWidth / 2, blessingTextY, { align: 'center' });
    blessingTextY += 5;
  });

  // Signature
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(COLORS.gold);
  doc.text(`- Your PalmMitra Reading for ${userData.name} -`, pageWidth / 2, blessingY + 40, { align: 'center' });

  y = blessingY + blessingHeight + 10;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIDENCE & ACCURACY SECTION
  // ═══════════════════════════════════════════════════════════════════════════

  checkPageBreak(25);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.indigo);
  doc.text('Analysis Confidence', margin, y);
  y += 5;

  // Confidence bar
  const barWidth = 80;
  const barHeight = 6;
  const confidenceWidth = (reading.confidenceScore / 100) * barWidth;

  // Background bar
  setFillColor({ r: 230, g: 230, b: 235 });
  doc.roundedRect(margin, y, barWidth, barHeight, 2, 2, 'F');

  // Filled bar
  setFillColor(COLORS.success);
  doc.roundedRect(margin, y, confidenceWidth, barHeight, 2, 2, 'F');

  // Score text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.success);
  doc.text(`${reading.confidenceScore}%`, margin + barWidth + 5, y + 5);

  y += 12;

  drawParagraph(
    'This reading was generated using advanced AI analysis of your palm image. The confidence score reflects image clarity and feature visibility. For best results, ensure good lighting and a clear palm image.',
    { size: 8, color: COLORS.mutedText }
  );

  // Final page footer
  addFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATE & DOWNLOAD
  // ═══════════════════════════════════════════════════════════════════════════

  const sanitizedName = userData.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `PalmMitra_Destiny_Report_${sanitizedName}.pdf`;

  doc.save(filename);
}
