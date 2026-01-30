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
  warning: { r: 200, g: 120, b: 40 },
  lightBg: { r: 248, g: 245, b: 240 },
};

const READING_TYPE_LABELS: Record<string, string> = {
  full: 'Complete Destiny Reading',
  career: 'Career & Wealth Focus',
  love: 'Love & Relationships Focus',
  wealth: 'Wealth & Prosperity Focus',
};

// Current year for timeline calculations - always future focused
const CURRENT_YEAR = new Date().getFullYear();

// Helper to ensure year is future (2026+)
const ensureFutureYear = (yearStr: string): string => {
  const year = parseInt(yearStr);
  if (isNaN(year) || year < CURRENT_YEAR) {
    return String(CURRENT_YEAR);
  }
  return yearStr;
};

// Helper to transform period text to future
const transformPeriodToFuture = (period: string): string => {
  // Replace any year before current year with current/future years
  const yearRegex = /\b(20[0-2][0-9])\b/g;
  return period.replace(yearRegex, (match) => {
    const year = parseInt(match);
    if (year < CURRENT_YEAR) {
      return String(CURRENT_YEAR + (year % 3)); // Offset to create variety
    }
    return match;
  });
};

// Personalization templates based on traits
const getPersonalizedInsight = (
  category: string, 
  strength: string, 
  userName: string
): string => {
  const strengthLevel = strength.toLowerCase();
  const insights: Record<string, Record<string, string>> = {
    lifeLine: {
      'very strong': `${userName}, your life force is exceptionally powerful. You possess remarkable resilience and the ability to overcome any obstacle. Your energy attracts success naturally.`,
      'strong': `${userName}, you have a robust vitality that will carry you through life's challenges. Your determination is your greatest asset.`,
      'moderate': `${userName}, your balanced energy allows for steady progress. Focus on building consistent routines to amplify your natural strength.`,
      'developing': `${userName}, your potential is still unfolding. The next 2-3 years will reveal hidden reserves of strength within you.`,
      'faint': `${userName}, there is untapped potential waiting to emerge. Mindful practices will help you discover your inner power.`,
    },
    heartLine: {
      'very strong': `${userName}, you love deeply and completely. Your emotional intelligence is a rare gift that draws meaningful connections to you.`,
      'strong': `${userName}, your capacity for genuine emotion creates lasting bonds. Trust your heart's wisdom in matters of love.`,
      'moderate': `${userName}, you balance emotion with reason thoughtfully. This wisdom will guide you to the right partnerships.`,
      'developing': `${userName}, your emotional depth is still revealing itself. Allow yourself to be vulnerable with those you trust.`,
      'faint': `${userName}, there are emotions within you yet to be fully expressed. Opening your heart brings unexpected blessings.`,
    },
    headLine: {
      'very strong': `${userName}, your intellectual capacity is exceptional. Complex problems that confuse others are puzzles you naturally solve.`,
      'strong': `${userName}, your mental clarity guides you well. Trust your analytical abilities when making important decisions.`,
      'moderate': `${userName}, you think with balance and practicality. Your grounded approach to problems is a valuable strength.`,
      'developing': `${userName}, new ways of thinking are emerging for you. Stay curious and your mental horizons will expand significantly.`,
      'faint': `${userName}, intuition may guide you more than analysis. Learn to trust those inner knowings that arise spontaneously.`,
    },
    fateLine: {
      'very strong': `${userName}, destiny has marked you for significant achievement. Your career path will be distinguished and impactful.`,
      'strong': `${userName}, your professional trajectory shows consistent upward momentum. Major recognition awaits in the coming years.`,
      'moderate': `${userName}, you will build success through steady, dedicated effort. Each step forward compounds over time.`,
      'developing': `${userName}, your true calling is still crystallizing. Be open to unexpected career opportunities in ${CURRENT_YEAR + 1}.`,
      'faint': `${userName}, you may forge an unconventional path. This flexibility allows you to pivot toward emerging opportunities.`,
    },
    sunLine: {
      'very strong': `${userName}, fame and recognition will find you naturally. Your talents are meant to be shared with a wide audience.`,
      'strong': `${userName}, success and appreciation are written in your destiny. Your work will be celebrated and remembered.`,
      'moderate': `${userName}, recognition comes through consistent excellence. Stay focused on your craft and visibility will follow.`,
      'developing': `${userName}, the spotlight is beginning to turn your way. ${CURRENT_YEAR + 1} brings increased visibility.`,
      'faint': `${userName}, your contributions may be more behind-the-scenes. This quiet influence creates lasting impact.`,
    },
  };

  return insights[category]?.[strengthLevel] || 
    `${userName}, your unique pattern reveals special potential in this area of life.`;
};

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
    
    // Label with proper spacing
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(highlight ? COLORS.gold : COLORS.indigo);
    const labelText = label + ': ';
    doc.text(labelText, startX, y);
    
    // Value with space after colon
    const labelWidth = doc.getTextWidth(labelText);
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
    
    // Box background
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

  // Draw Destiny Score Meter - Premium Visual Element
  const drawDestinyScoreMeter = (score: number, label: string, xPos: number, yPos: number, width: number) => {
    const meterHeight = 8;
    const scoreWidth = (score / 100) * width;
    
    // Label above
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(label, xPos, yPos - 3);
    
    // Background bar
    setFillColor(COLORS.lightBg);
    doc.roundedRect(xPos, yPos, width, meterHeight, 2, 2, 'F');
    
    // Filled bar with gradient effect
    const barColor = score >= 80 ? COLORS.success : score >= 60 ? COLORS.gold : COLORS.warning;
    setFillColor(barColor);
    doc.roundedRect(xPos, yPos, scoreWidth, meterHeight, 2, 2, 'F');
    
    // Score text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(barColor);
    doc.text(`${score}%`, xPos + width + 4, yPos + 6);
  };

  // Draw Career Timeline Bar - Premium Visual
  const drawCareerTimeline = () => {
    checkPageBreak(45);
    
    const timelineY = y;
    const timelineWidth = contentWidth - 20;
    const startX = margin + 10;
    
    // Section title
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text('Career Success Timeline', margin, timelineY);
    y += 10;
    
    // Timeline bar background
    setFillColor(COLORS.lightBg);
    doc.roundedRect(startX, y, timelineWidth, 6, 2, 2, 'F');
    
    // Timeline years (current year to +4)
    const years = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2, CURRENT_YEAR + 3, CURRENT_YEAR + 4];
    const segmentWidth = timelineWidth / years.length;
    
    // Draw segments with varying intensity
    const intensities = ['building', 'rising', 'peak', 'sustaining', 'expanding'];
    const peakIndex = reading.careerWealth.peakPeriods.findIndex(p => 
      p.intensity === 'peak' && parseInt(p.year) >= CURRENT_YEAR
    );
    
    years.forEach((year, index) => {
      const xPos = startX + (index * segmentWidth);
      const matchingPeriod = reading.careerWealth.peakPeriods.find(p => p.year === String(year));
      const isPeak = matchingPeriod?.intensity === 'peak';
      const intensity = matchingPeriod?.intensity || intensities[index];
      
      // Segment color based on intensity
      const segmentColor = isPeak ? COLORS.gold : 
        intensity === 'rising' || intensity === 'expanding' ? COLORS.success : 
        COLORS.accent;
      
      setFillColor(segmentColor);
      doc.roundedRect(xPos + 1, y, segmentWidth - 2, 6, 1, 1, 'F');
      
      // Year label
      doc.setFontSize(7);
      doc.setFont('helvetica', isPeak ? 'bold' : 'normal');
      setColor(isPeak ? COLORS.gold : COLORS.mutedText);
      doc.text(String(year), xPos + segmentWidth / 2, y + 12, { align: 'center' });
      
      // Peak indicator
      if (isPeak) {
        doc.setFontSize(6);
        setColor(COLORS.gold);
        doc.text('PEAK', xPos + segmentWidth / 2, y - 2, { align: 'center' });
      }
    });
    
    y += 18;
  };

  // Draw Lucky Elements Table - Premium Visual
  const drawLuckyElementsTable = () => {
    checkPageBreak(40);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text('Your Lucky Elements', margin, y);
    y += 8;
    
    const elements = [
      { label: 'Best Days', value: 'Wednesday, Friday, Sunday', icon: 'Day' },
      { label: 'Lucky Colors', value: 'Gold, Deep Blue, White', icon: 'Color' },
      { label: 'Power Numbers', value: '3, 7, 9, 21', icon: 'Number' },
      { label: 'Focus Direction', value: 'East & Northeast', icon: 'Direction' },
    ];
    
    const tableWidth = contentWidth;
    const cellWidth = tableWidth / 2;
    const cellHeight = 12;
    let cellX = margin;
    let cellY = y;
    
    elements.forEach((element, index) => {
      if (index === 2) {
        cellX = margin;
        cellY += cellHeight + 2;
      }
      
      const x = cellX + (index % 2) * cellWidth;
      
      // Cell background
      setFillColor(COLORS.cream);
      doc.roundedRect(x, cellY, cellWidth - 4, cellHeight, 2, 2, 'F');
      
      // Label
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      setColor(COLORS.gold);
      doc.text(element.label.toUpperCase(), x + 4, cellY + 4);
      
      // Value
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(COLORS.bodyText);
      doc.text(element.value, x + 4, cellY + 9);
    });
    
    y = cellY + cellHeight + 8;
  };

  const drawLineAnalysis = (
    lineName: string, 
    strength: string, 
    meaning: string, 
    keyInsight: string,
    personalizedInterpretation: string
  ) => {
    checkPageBreak(50);
    
    // Line name with strength badge
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(lineName, margin + 4, y);
    
    // Strength badge
    const nameWidth = doc.getTextWidth(lineName);
    doc.setFontSize(8);
    const strengthColor = strength.toLowerCase().includes('strong') ? COLORS.success : 
      strength.toLowerCase().includes('moderate') ? COLORS.gold : COLORS.mutedText;
    setColor(strengthColor);
    doc.text(`[${strength}]`, margin + 4 + nameWidth + 3, y);
    y += 6;
    
    // Personalized interpretation first (the unique insight)
    drawParagraph(personalizedInterpretation, { indent: 4, size: 9.5, color: COLORS.darkText });
    
    // Technical meaning
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    setColor(COLORS.mutedText);
    const meaningLines = doc.splitTextToSize(`Traditional reading: ${meaning}`, contentWidth - 12);
    meaningLines.forEach((line: string) => {
      doc.text(line, margin + 8, y);
      y += 4;
    });
    y += 2;
    
    // Key Insight box - actionable
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.gold);
    doc.text('Action Insight: ', margin + 4, y);
    const insightX = margin + 4 + doc.getTextWidth('Action Insight: ');
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.bodyText);
    const insightLines = doc.splitTextToSize(keyInsight, contentWidth - 40);
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
  doc.text('PREMIUM DESTINY REPORT', pageWidth / 2, 32, { align: 'center' });

  // Sanskrit blessing (romanized)
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
  doc.text(`${reading.confidenceScore}% Accuracy`, pageWidth - margin - 8, y + 13, { align: 'right' });

  y += 32;

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTINY SCORE METERS - Premium Visual
  // ═══════════════════════════════════════════════════════════════════════════

  checkPageBreak(35);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.indigo);
  doc.text('Your Destiny Scores', margin, y);
  y += 8;

  // Calculate destiny scores based on line strengths
  const strengthToScore: Record<string, number> = {
    'Very Strong': 95, 'Strong': 82, 'Moderate': 68, 'Developing': 55, 'Faint': 40
  };

  const careerScore = strengthToScore[reading.majorLines.fateLine.strength] || 70;
  const loveScore = strengthToScore[reading.majorLines.heartLine.strength] || 70;
  const wealthScore = Math.round((strengthToScore[reading.majorLines.sunLine.strength] + strengthToScore[reading.majorLines.fateLine.strength]) / 2) || 70;
  const healthScore = strengthToScore[reading.majorLines.lifeLine.strength] || 70;

  const meterWidth = (contentWidth - 20) / 2;
  
  drawDestinyScoreMeter(careerScore, 'Career Potential', margin, y, meterWidth - 15);
  drawDestinyScoreMeter(loveScore, 'Love Compatibility', margin + meterWidth + 10, y, meterWidth - 15);
  y += 16;
  drawDestinyScoreMeter(wealthScore, 'Wealth Attraction', margin, y, meterWidth - 15);
  drawDestinyScoreMeter(healthScore, 'Vitality Index', margin + meterWidth + 10, y, meterWidth - 15);
  y += 12;

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTINY HIGHLIGHT BOX
  // ═══════════════════════════════════════════════════════════════════════════

  drawHighlightBox('Your Destiny Highlight', reading.headlineSummary);

  // ═══════════════════════════════════════════════════════════════════════════
  // NEXT 6 MONTHS FOCUS - Premium Feature
  // ═══════════════════════════════════════════════════════════════════════════

  checkPageBreak(40);
  
  drawSectionHeader('Next 6 Months Focus', `Priority guidance for ${userData.name} through mid-${CURRENT_YEAR + 1}`);
  
  const focusAreas = [
    {
      area: 'Primary Focus',
      guidance: `Concentrate your energy on ${reading.careerWealth.bestFields[0] || 'your core strengths'}. Your palm indicates heightened receptivity to new opportunities in this domain.`,
    },
    {
      area: 'Relationship Priority',
      guidance: `${reading.loveRelationships.emotionalStyle}. The next six months favor ${reading.loveRelationships.commitmentTendency.toLowerCase().includes('deep') ? 'deepening existing bonds' : 'authentic new connections'}.`,
    },
    {
      area: 'Growth Action',
      guidance: `${reading.spiritualRemedies[0]?.remedy || 'Daily meditation'} will be particularly powerful during this period. Start small, stay consistent.`,
    },
  ];

  focusAreas.forEach(({ area, guidance }) => {
    checkPageBreak(15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.gold);
    doc.text(area + ':', margin + 4, y);
    y += 5;
    drawParagraph(guidance, { indent: 4, size: 9.5 });
  });

  y += 4;
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONALIZED 3-STEP ACTION PLAN
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Your 3-Step Action Plan', 'Personalized roadmap based on your unique palm analysis');

  // Extract future peak periods only
  const futurePeakPeriods = reading.careerWealth.peakPeriods.filter(p => 
    parseInt(p.year) >= CURRENT_YEAR
  );
  const nextPeakPeriod = futurePeakPeriods.find(p => p.intensity === 'peak') || futurePeakPeriods[0];

  const actionPlan = [
    {
      step: '1',
      title: 'Immediate Action (Now)',
      action: `${userData.name}, leverage your ${reading.majorLines.headLine.strength.toLowerCase()} analytical abilities. Focus on ${reading.careerWealth.bestFields.slice(0, 2).join(' and ') || 'your primary field'} where your natural talents create the most impact.`,
    },
    {
      step: '2',
      title: `Growth Phase (${CURRENT_YEAR}-${CURRENT_YEAR + 1})`,
      action: `Your destiny turning point approaches around age ${reading.careerWealth.turningPointAge}. Prepare now by ${reading.spiritualRemedies[0]?.remedy?.toLowerCase() || 'building daily spiritual practice'} and expanding your ${reading.careerWealth.bestFields[0] || 'professional'} network.`,
    },
    {
      step: '3',
      title: `Peak Opportunity (${nextPeakPeriod?.year || CURRENT_YEAR + 2})`,
      action: nextPeakPeriod 
        ? `${nextPeakPeriod.year} brings ${nextPeakPeriod.intensity} energy for major decisions. Position yourself now for this window - career moves, investments, and partnerships initiated during this period have amplified success potential.`
        : `Your peak period is approaching. Stay consistent with your practices and remain open to unexpected opportunities.`,
    },
  ];

  actionPlan.forEach(({ step, title, action }) => {
    checkPageBreak(22);
    
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

  drawSectionHeader('Major Palm Lines Analysis', `Deep interpretation for ${userData.name}`);

  const linesData = [
    { 
      name: 'Life Line', 
      data: reading.majorLines.lifeLine,
      category: 'lifeLine'
    },
    { 
      name: 'Heart Line', 
      data: reading.majorLines.heartLine,
      category: 'heartLine'
    },
    { 
      name: 'Head Line', 
      data: reading.majorLines.headLine,
      category: 'headLine'
    },
    { 
      name: 'Fate Line', 
      data: reading.majorLines.fateLine,
      category: 'fateLine'
    },
    { 
      name: 'Sun Line', 
      data: reading.majorLines.sunLine,
      category: 'sunLine'
    },
  ];

  linesData.forEach((line) => {
    const personalizedInsight = getPersonalizedInsight(line.category, line.data.strength, userData.name);
    drawLineAnalysis(
      line.name,
      line.data.strength,
      line.data.meaning,
      line.data.keyInsight,
      personalizedInsight
    );
  });

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // PALM MOUNTS ANALYSIS - Fixed Spacing
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Palm Mounts Analysis', 'The five mounts reveal your core personality forces');

  const mountsData = [
    { name: 'Mount of Venus', data: reading.mounts.venus, domain: 'Love, Passion & Vitality' },
    { name: 'Mount of Jupiter', data: reading.mounts.jupiter, domain: 'Ambition & Leadership' },
    { name: 'Mount of Saturn', data: reading.mounts.saturn, domain: 'Wisdom & Discipline' },
    { name: 'Mount of Apollo', data: reading.mounts.apollo, domain: 'Creativity & Fame' },
    { name: 'Mount of Mercury', data: reading.mounts.mercury, domain: 'Communication & Commerce' },
  ];

  mountsData.forEach((mount) => {
    checkPageBreak(18);
    
    // Mount header with level badge
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(mount.name, margin + 4, y);
    
    const nameWidth = doc.getTextWidth(mount.name);
    const levelColor = mount.data.level === 'High' ? COLORS.success : 
      mount.data.level === 'Medium' ? COLORS.gold : COLORS.mutedText;
    doc.setFontSize(8);
    setColor(levelColor);
    doc.text(`[${mount.data.level}]`, margin + 8 + nameWidth, y);
    
    // Domain subtitle
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    setColor(COLORS.mutedText);
    doc.text(mount.domain, margin + 4, y + 4);
    y += 8;
    
    // Meaning with proper formatting - note the space after colon is now handled
    drawParagraph(mount.data.meaning, { indent: 4, size: 9.5 });
    y += 2;
  });

  y += 4;
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // CAREER TIMELINE BAR - Premium Visual
  // ═══════════════════════════════════════════════════════════════════════════

  drawCareerTimeline();
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CAREER & WEALTH ROADMAP
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Career & Wealth Roadmap', `Personalized success path for ${userData.name}`);

  // Best fields with context
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.gold);
  doc.text('Recommended Industries:', margin + 4, y);
  y += 5;
  
  reading.careerWealth.bestFields.forEach((field, index) => {
    checkPageBreak(8);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.bodyText);
    doc.text(`${index + 1}. ${field}`, margin + 8, y);
    y += 5;
  });
  y += 3;

  // Turning point with explanation
  drawKeyValuePair('Career Turning Point', 
    `Around age ${reading.careerWealth.turningPointAge}. This marks a significant shift in your professional trajectory - be prepared to take calculated risks during this window.`);

  // Wealth style
  drawKeyValuePair('Wealth Accumulation Pattern', reading.careerWealth.wealthStyle);

  // Peak periods - ONLY FUTURE YEARS
  if (futurePeakPeriods.length > 0) {
    y += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text('Upcoming Peak Periods:', margin + 4, y);
    y += 5;

    futurePeakPeriods.forEach((period) => {
      checkPageBreak(8);
      const isPeak = period.intensity === 'peak';
      
      doc.setFontSize(9);
      doc.setFont('helvetica', isPeak ? 'bold' : 'normal');
      setColor(isPeak ? COLORS.gold : COLORS.success);
      
      const intensityLabel = period.intensity.charAt(0).toUpperCase() + period.intensity.slice(1);
      const description = isPeak ? '- Maximum opportunity window' : 
        period.intensity === 'rising' ? '- Momentum building phase' :
        period.intensity === 'expanding' ? '- Growth consolidation phase' :
        period.intensity === 'sustaining' ? '- Stability and harvest phase' :
        '- Foundation building phase';
      
      doc.text(`  ${period.year}: ${intensityLabel} ${description}`, margin + 8, y);
      y += 5;
    });
  }

  // Next 12-18 month outlook
  y += 4;
  drawHighlightBox(
    'Best Year Ahead',
    `${userData.name}, ${nextPeakPeriod?.year || CURRENT_YEAR + 2} shows your strongest potential for breakthrough success. Focus on ${reading.careerWealth.bestFields[0] || 'your primary field'} and trust your ${reading.majorLines.headLine.strength.toLowerCase()} mental clarity to guide major decisions.`,
    COLORS.indigo
  );

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // LOVE & RELATIONSHIPS
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Love & Relationship Patterns', `Emotional blueprint for ${userData.name}`);

  // Behavioral patterns - more specific
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.indigo);
  doc.text('Your Emotional Profile:', margin + 4, y);
  y += 6;

  drawParagraph(
    `${userData.name}, your heart line reveals ${reading.loveRelationships.emotionalStyle.toLowerCase()}. This gives you a natural ability to ${reading.majorLines.heartLine.strength === 'Very Strong' || reading.majorLines.heartLine.strength === 'Strong' ? 'form deep, lasting bonds' : 'approach relationships with thoughtful care'}.`,
    { indent: 4, size: 9.5 }
  );

  drawKeyValuePair('Partnership Style', reading.loveRelationships.commitmentTendency);
  
  // Actionable relationship guidance
  y += 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.gold);
  doc.text('Relationship Guidance:', margin + 4, y);
  y += 5;
  drawParagraph(reading.loveRelationships.relationshipAdvice, { indent: 4, size: 9.5 });

  // Personalized note
  y += 2;
  setFillColor(COLORS.cream);
  doc.roundedRect(margin + 4, y, contentWidth - 8, 14, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  setColor(COLORS.mutedText);
  doc.text(`For ${userData.name}: Trust the timing of your heart. Authentic connections align naturally when you honor your true self.`, margin + 8, y + 9);
  y += 20;

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFE PHASES - FUTURE ONLY (2026+)
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Your Destiny Phases', `Key life transitions from ${CURRENT_YEAR} onwards`);

  const phasesData = [
    { 
      name: 'Growth Phase', 
      data: reading.lifePhases.growth,
      timeframe: `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`,
      icon: 'Expansion Period'
    },
    { 
      name: 'Challenge Phase', 
      data: reading.lifePhases.challenge,
      timeframe: `${CURRENT_YEAR + 1}-${CURRENT_YEAR + 2}`,
      icon: 'Transformation Window'
    },
    { 
      name: 'Opportunity Phase', 
      data: reading.lifePhases.opportunity,
      timeframe: `${CURRENT_YEAR + 2}-${CURRENT_YEAR + 4}`,
      icon: 'Breakthrough Cycle'
    },
  ];

  phasesData.forEach(({ name, data, timeframe, icon }) => {
    checkPageBreak(20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(`${name}`, margin + 4, y);
    
    // Future timeframe (not from data.period which might have old dates)
    const nameWidth = doc.getTextWidth(name);
    doc.setFontSize(8);
    setColor(COLORS.gold);
    doc.text(`[${timeframe}]`, margin + 8 + nameWidth, y);
    
    // Icon label
    doc.setFontSize(7);
    setColor(COLORS.mutedText);
    doc.text(icon, pageWidth - margin - doc.getTextWidth(icon), y);
    y += 6;
    
    // Transform description to ensure future orientation
    const futureDescription = transformPeriodToFuture(data.description);
    drawParagraph(futureDescription, { indent: 4, size: 9.5 });
    y += 2;
  });

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // LUCKY ELEMENTS TABLE
  // ═══════════════════════════════════════════════════════════════════════════

  drawLuckyElementsTable();
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // SPIRITUAL REMEDIES - Refined & Practical
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Spiritual Practices & Remedies', 'Practical guidance for balance and growth');

  // Prioritize practical remedies
  const practicalRemedies = [
    {
      remedy: 'Morning Meditation',
      benefit: 'Calms the mind, enhances clarity, and aligns your energy for the day ahead. Even 5-10 minutes creates profound impact.',
      timing: 'Daily, before 8 AM',
      category: 'Core Practice'
    },
    {
      remedy: 'Gratitude Journaling',
      benefit: 'Shifts focus toward abundance and attracts positive opportunities. Write 3 things you are grateful for each evening.',
      timing: 'Every evening before sleep',
      category: 'Daily Habit'
    },
    {
      remedy: 'Nature Grounding',
      benefit: 'Walking barefoot on grass or sitting near trees restores natural energy balance and reduces stress.',
      timing: 'Weekly, ideally Sunday mornings',
      category: 'Weekly Reset'
    },
    {
      remedy: 'Mantra Practice',
      benefit: 'Simple mantras like "Om" or "Om Shanti" create vibrational alignment. No religious requirement - focus on the sound and breath.',
      timing: 'During meditation or stressful moments',
      category: 'As Needed'
    },
  ];

  practicalRemedies.forEach((remedy, index) => {
    checkPageBreak(25);
    
    // Number badge
    setFillColor(COLORS.gold);
    doc.circle(margin + 5, y - 2, 4, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.white);
    doc.text(`${index + 1}`, margin + 5, y, { align: 'center' });
    
    // Remedy title with category
    setColor(COLORS.indigo);
    doc.setFontSize(10);
    doc.text(remedy.remedy, margin + 14, y);
    
    const remedyWidth = doc.getTextWidth(remedy.remedy);
    doc.setFontSize(7);
    setColor(COLORS.mutedText);
    doc.text(`(${remedy.category})`, margin + 18 + remedyWidth, y);
    y += 5;
    
    // Benefit
    drawParagraph(remedy.benefit, { indent: 14, size: 9 });
    
    // Timing
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    setColor(COLORS.gold);
    doc.text(`Best Time: ${remedy.timing}`, margin + 14, y);
    y += 6;
  });

  // Optional gemstone note - secondary
  y += 4;
  setFillColor(COLORS.cream);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.mutedText);
  doc.text('Optional Traditional Practice:', margin + 4, y + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const gemstoneNote = `Gemstone: ${reading.premiumInsights?.gemstoneRecommendation || 'Yellow Sapphire or Pearl'}. Traditionally worn for planetary alignment. This is cultural guidance, not medical advice. Consult a qualified astrologer if interested.`;
  const gemLines = doc.splitTextToSize(gemstoneNote, contentWidth - 10);
  doc.text(gemLines, margin + 4, y + 12);
  y += 24;

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPANDED PREMIUM INSIGHTS
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Premium Insights', `Exclusive advanced analysis for ${userData.name}`);

  if (reading.premiumInsights) {
    // Marriage timing with explanation
    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.gold);
    doc.text('Marriage & Partnership Timing', margin + 4, y);
    y += 5;
    drawParagraph(
      `${reading.premiumInsights.marriageTiming}. Your heart line pattern suggests ${reading.majorLines.heartLine.strength === 'Very Strong' || reading.majorLines.heartLine.strength === 'Strong' ? 'you form deep emotional bonds and value long-term commitment' : 'you approach relationships thoughtfully and value authentic connection'}.`,
      { indent: 4, size: 9.5 }
    );
    y += 2;

    // Career breakthrough roadmap
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.gold);
    doc.text('Career Breakthrough Roadmap', margin + 4, y);
    y += 5;
    drawParagraph(
      `${reading.premiumInsights.careerBreakthrough}. Focus on ${reading.careerWealth.bestFields[0] || 'your primary field'} during your peak window around ${nextPeakPeriod?.year || CURRENT_YEAR + 2}.`,
      { indent: 4, size: 9.5 }
    );
    y += 2;

    // Best months in peak year
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.gold);
    doc.text(`Key Months in ${nextPeakPeriod?.year || CURRENT_YEAR + 2}`, margin + 4, y);
    y += 5;
    drawParagraph(
      `March-April and September-October show heightened opportunity alignment. Major decisions, launches, or commitments during these windows carry amplified success potential.`,
      { indent: 4, size: 9.5 }
    );
    y += 2;

    // Caution periods
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.warning);
    doc.text('Periods of Caution', margin + 4, y);
    y += 5;
    drawParagraph(
      `June-July ${CURRENT_YEAR + 1} may bring temporary challenges or delays. Use this time for planning and reflection rather than major new initiatives. This is a natural cycle - not a period to fear, but to navigate mindfully.`,
      { indent: 4, size: 9.5, color: COLORS.mutedText }
    );
  }

  y += 6;
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL DIVINE BLESSING
  // ═══════════════════════════════════════════════════════════════════════════

  checkPageBreak(55);

  // Blessing container
  const blessingY = y;
  const blessingHeight = 48;
  
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
  doc.text(`- Your PalmMitra Reading for ${userData.name} -`, pageWidth / 2, blessingY + 43, { align: 'center' });

  y = blessingY + blessingHeight + 10;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIDENCE & ACCURACY SECTION
  // ═══════════════════════════════════════════════════════════════════════════

  checkPageBreak(30);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.indigo);
  doc.text('Palm Scan Confidence', margin, y);
  y += 5;

  // Confidence bar
  const barWidth = 80;
  const barHeight = 6;
  const confidenceWidth = (reading.confidenceScore / 100) * barWidth;

  // Background bar
  setFillColor({ r: 230, g: 230, b: 235 });
  doc.roundedRect(margin, y, barWidth, barHeight, 2, 2, 'F');

  // Filled bar
  const confColor = reading.confidenceScore >= 80 ? COLORS.success : 
    reading.confidenceScore >= 60 ? COLORS.gold : COLORS.warning;
  setFillColor(confColor);
  doc.roundedRect(margin, y, confidenceWidth, barHeight, 2, 2, 'F');

  // Score text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(confColor);
  doc.text(`${reading.confidenceScore}%`, margin + barWidth + 5, y + 5);

  y += 12;

  drawParagraph(
    `This premium reading was generated using advanced AI analysis of ${userData.name}'s palm image. The confidence score reflects image clarity and feature visibility. Higher scores indicate more precise readings.`,
    { size: 8, color: COLORS.mutedText }
  );

  // Final page footer
  addFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATE & DOWNLOAD
  // ═══════════════════════════════════════════════════════════════════════════

  const sanitizedName = userData.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `PalmMitra_Premium_Destiny_Report_${sanitizedName}.pdf`;

  doc.save(filename);
}
