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

// Current date for timeline calculations
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth(); // 0-11

// Month names for date formatting
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];

// Calculate exact 6-month period from now
const getNext6MonthsPeriod = (): string => {
  const startMonth = MONTH_NAMES[CURRENT_MONTH];
  const endMonthIndex = (CURRENT_MONTH + 6) % 12;
  const endMonth = MONTH_NAMES[endMonthIndex];
  const endYear = CURRENT_MONTH + 6 >= 12 ? CURRENT_YEAR + 1 : CURRENT_YEAR;
  return `${startMonth} ${CURRENT_YEAR} – ${endMonth} ${endYear}`;
};

// Helper to capitalize name properly
const capitalizeName = (name: string): string => {
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper to clean text of double punctuation and grammar issues
const cleanText = (text: string): string => {
  return text
    .replace(/\.{2,}/g, '.') // Remove double periods
    .replace(/\s{2,}/g, ' ') // Remove double spaces
    .replace(/,{2,}/g, ',') // Remove double commas
    .replace(/\s+\./g, '.') // Remove space before period
    .replace(/\s+,/g, ',') // Remove space before comma
    .trim();
};

// Trust-safe language transformations
const makeTrustSafe = (text: string): string => {
  return text
    .replace(/you will definitely/gi, 'you may')
    .replace(/you will live long/gi, 'suggests strong vitality')
    .replace(/you will succeed/gi, 'indicates potential for success')
    .replace(/you will find/gi, 'you may discover')
    .replace(/guaranteed/gi, 'potential')
    .replace(/will definitely/gi, 'may')
    .replace(/certainly will/gi, 'suggests the possibility of')
    .replace(/destined to/gi, 'shows potential to')
    .replace(/will be rich/gi, 'indicates wealth potential')
    .replace(/will get married/gi, 'suggests favorable timing for partnership');
};

// Personalization templates with trust-safe language
const getPersonalizedInsight = (
  category: string, 
  strength: string, 
  userName: string
): string => {
  const name = capitalizeName(userName);
  const strengthLevel = strength.toLowerCase();
  
  const insights: Record<string, Record<string, string>> = {
    lifeLine: {
      'very strong': `${name}, your life line suggests exceptional vitality and resilience. This pattern often indicates a robust constitution and the inner strength to navigate life's challenges with grace. Your energy appears to be a natural asset that may attract opportunities.`,
      'strong': `${name}, your life line reflects solid vitality that may serve you well through various life phases. This pattern suggests determination and the capacity to overcome obstacles with persistence.`,
      'moderate': `${name}, your life line indicates balanced energy that may be channeled effectively through consistent routines. This pattern suggests steady progress and adaptability.`,
      'developing': `${name}, your life line shows evolving potential. The coming years may reveal hidden reserves of strength as you continue to grow and develop.`,
      'faint': `${name}, your life line suggests untapped potential waiting to emerge. Mindful practices and self-care may help you access deeper wells of energy.`,
    },
    heartLine: {
      'very strong': `${name}, your heart line suggests deep emotional capacity and the ability to form meaningful connections. This pattern often indicates strong intuition in matters of the heart.`,
      'strong': `${name}, your heart line reflects genuine emotional depth that may create lasting bonds with those you trust. This pattern suggests loyalty and warmth in relationships.`,
      'moderate': `${name}, your heart line indicates a thoughtful balance between emotion and reason. This pattern may guide you toward partnerships built on mutual understanding.`,
      'developing': `${name}, your heart line suggests your emotional depth is still revealing itself. Allowing vulnerability with trusted individuals may open unexpected blessings.`,
      'faint': `${name}, your heart line indicates emotions yet to be fully expressed. Opening your heart gradually may bring meaningful connections.`,
    },
    headLine: {
      'very strong': `${name}, your head line suggests exceptional analytical capacity. Complex challenges that puzzle others may come naturally to you.`,
      'strong': `${name}, your head line reflects clear mental focus that may serve you well in decision-making. This pattern suggests practical wisdom.`,
      'moderate': `${name}, your head line indicates balanced thinking that combines logic with intuition. This grounded approach may be valuable in many situations.`,
      'developing': `${name}, your head line suggests new perspectives are emerging. Staying curious may expand your mental horizons significantly.`,
      'faint': `${name}, your head line indicates intuition may guide you as much as analysis. Learning to trust these inner knowings could be beneficial.`,
    },
    fateLine: {
      'very strong': `${name}, your fate line suggests a marked path toward meaningful achievement. Your career trajectory may be distinguished by purposeful work.`,
      'strong': `${name}, your fate line reflects consistent professional momentum. Recognition for your efforts appears likely in the coming years.`,
      'moderate': `${name}, your fate line indicates success built through steady, dedicated effort. Each step forward may compound over time.`,
      'developing': `${name}, your fate line suggests your true calling is still crystallizing. Remaining open to unexpected opportunities may reveal your path.`,
      'faint': `${name}, your fate line indicates an unconventional path may suit you. This flexibility could allow you to pivot toward emerging opportunities.`,
    },
    sunLine: {
      'very strong': `${name}, your sun line suggests natural visibility and recognition. Your talents appear meant to be shared with a wider audience.`,
      'strong': `${name}, your sun line reflects potential for success and appreciation. Your work may receive the recognition it deserves.`,
      'moderate': `${name}, your sun line indicates recognition that comes through consistent excellence. Staying focused on your craft may increase visibility.`,
      'developing': `${name}, your sun line suggests the spotlight may gradually turn your way. The coming period could bring increased visibility.`,
      'faint': `${name}, your sun line indicates your contributions may be more behind-the-scenes. This quiet influence can create lasting impact.`,
    },
  };

  return insights[category]?.[strengthLevel] || 
    `${name}, your unique pattern reveals special potential in this area of life.`;
};

// Enhanced mount interpretations with real-life impact (2-3 lines each)
const getMountInterpretation = (
  mountName: string,
  level: string,
  userName: string
): string => {
  const name = capitalizeName(userName);
  const levelLower = level.toLowerCase();
  
  const interpretations: Record<string, Record<string, string>> = {
    venus: {
      'high': `${name}, your prominent Venus mount suggests a warm, magnetic personality that naturally draws people toward you. This often indicates strong aesthetic sensibilities and the capacity for deep, passionate connections. In daily life, this may manifest as creative talents, appreciation for beauty, and fulfilling relationships.`,
      'medium': `${name}, your Venus mount indicates a balanced approach to love and pleasure. You likely appreciate beauty and connection while maintaining healthy boundaries. This suggests the ability to form stable, nurturing relationships without losing yourself in them.`,
      'low': `${name}, your Venus mount suggests you may approach relationships thoughtfully rather than impulsively. This can indicate a preference for meaningful connections over superficial ones. Cultivating self-love practices may help you open more fully to others.`,
    },
    jupiter: {
      'high': `${name}, your pronounced Jupiter mount suggests natural leadership qualities and ambitious drive. People may naturally look to you for guidance and direction. This pattern often indicates success in management, entrepreneurship, or any role requiring vision and confidence.`,
      'medium': `${name}, your Jupiter mount reflects balanced ambition combined with realistic expectations. You likely pursue goals steadily without overreaching. This suggests the wisdom to lead when appropriate while remaining a gracious collaborator.`,
      'low': `${name}, your Jupiter mount indicates you may prefer supporting roles or working independently rather than leading. This can be a strength, allowing you to contribute without the pressures of visibility. Your influence may be felt through quiet competence.`,
    },
    saturn: {
      'high': `${name}, your well-developed Saturn mount suggests strong self-discipline and a serious approach to responsibilities. You likely excel in structured environments and long-term planning. This pattern often indicates success in finance, research, or any field requiring patience and persistence.`,
      'medium': `${name}, your Saturn mount reflects a practical balance between discipline and flexibility. You can commit to long-term goals while adapting to changing circumstances. This suggests reliability without rigidity in both work and personal life.`,
      'low': `${name}, your Saturn mount indicates you may prefer spontaneity over rigid structure. While this can make routine challenging, it also suggests adaptability and creative problem-solving. Finding systems that allow flexibility may serve you well.`,
    },
    apollo: {
      'high': `${name}, your prominent Apollo mount suggests artistic talent and a natural flair for self-expression. You may have gifts in creative fields or any work involving aesthetics and presentation. This pattern often indicates potential for recognition and appreciation of your unique contributions.`,
      'medium': `${name}, your Apollo mount indicates appreciation for creativity balanced with practical considerations. You can express yourself artistically while remaining grounded. This suggests success in fields that blend creativity with functionality.`,
      'low': `${name}, your Apollo mount suggests creativity that may be more private or analytical than flamboyant. You might express innovation through problem-solving rather than traditional arts. Exploring creative outlets at your own pace may reveal hidden talents.`,
    },
    mercury: {
      'high': `${name}, your developed Mercury mount suggests excellent communication skills and quick thinking. You may excel in writing, speaking, business negotiations, or any field requiring verbal dexterity. This pattern often indicates success in commerce, teaching, or counseling.`,
      'medium': `${name}, your Mercury mount reflects solid communication abilities combined with good listening skills. You can express ideas clearly while remaining receptive to others. This balanced approach may serve you well in collaborative environments.`,
      'low': `${name}, your Mercury mount indicates you may prefer thoughtful communication over quick responses. While this can make small talk challenging, it often results in more meaningful conversations. Quality over quantity may be your communication style.`,
    },
  };

  const mountKey = mountName.toLowerCase().replace('mount of ', '');
  return interpretations[mountKey]?.[levelLower] || 
    `${name}, your ${mountName} reveals unique qualities that influence your approach to this area of life.`;
};

// Score-matched insights based on percentage
const getScoreMatchedInsight = (score: number, category: string): string => {
  if (score >= 80) {
    return `Strong foundation with excellent potential for ${category.toLowerCase()}.`;
  } else if (score >= 60) {
    return `Solid indicators with room for growth in ${category.toLowerCase()}.`;
  } else if (score >= 45) {
    return `Developing potential that may strengthen with focused effort in ${category.toLowerCase()}.`;
  } else {
    return `Emerging qualities that suggest untapped potential in ${category.toLowerCase()}.`;
  }
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
  
  // Properly capitalize user name
  const userName = capitalizeName(userData.name);

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
    
    setDrawColor(COLORS.gold);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.mutedText);
    doc.text('PalmMitra', margin, footerY);
    
    setColor(COLORS.gold);
    doc.setFont('helvetica', 'bold');
    doc.text(`– ${pageNumber} –`, pageWidth / 2, footerY, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.mutedText);
    doc.setFontSize(6.5);
    doc.text('AI Spiritual Guidance | For Entertainment Purposes Only', pageWidth - margin, footerY, { align: 'right' });
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
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(title.toUpperCase(), margin, y);
    
    const titleWidth = doc.getTextWidth(title.toUpperCase());
    setDrawColor(COLORS.gold);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 2, margin + titleWidth + 10, y + 2);
    
    y += 8;
    
    if (subtitle) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      setColor(COLORS.mutedText);
      doc.text(cleanText(subtitle), margin, y);
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
    
    // Clean and make text trust-safe
    const cleanedText = makeTrustSafe(cleanText(text));
    const lines = doc.splitTextToSize(cleanedText, maxWidth);
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
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(highlight ? COLORS.gold : COLORS.indigo);
    const labelText = label + ': ';
    doc.text(labelText, startX, y);
    
    const labelWidth = doc.getTextWidth(labelText);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.bodyText);
    
    const cleanedValue = makeTrustSafe(cleanText(value));
    const valueLines = doc.splitTextToSize(cleanedValue, contentWidth - labelWidth - 10);
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
    
    setFillColor({ r: 252, g: 248, b: 235 });
    doc.roundedRect(margin, boxY, contentWidth, boxHeight, 3, 3, 'F');
    
    setFillColor(accentColor);
    doc.rect(margin, boxY, 3, boxHeight, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(accentColor);
    doc.text(title.toUpperCase(), margin + 8, boxY + 7);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.darkText);
    const cleanedContent = makeTrustSafe(cleanText(content));
    const contentLines = doc.splitTextToSize(cleanedContent, contentWidth - 15);
    doc.text(contentLines.slice(0, 2).join(' '), margin + 8, boxY + 15);
    
    y = boxY + boxHeight + 8;
  };

  const drawDestinyScoreMeter = (score: number, label: string, xPos: number, yPos: number, width: number) => {
    const meterHeight = 8;
    const scoreWidth = (score / 100) * width;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(label, xPos, yPos - 3);
    
    // Score-matched description
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.mutedText);
    const insight = getScoreMatchedInsight(score, label);
    doc.text(insight.substring(0, 50), xPos, yPos - 0.5);
    
    setFillColor(COLORS.lightBg);
    doc.roundedRect(xPos, yPos + 2, width, meterHeight, 2, 2, 'F');
    
    const barColor = score >= 80 ? COLORS.success : score >= 60 ? COLORS.gold : COLORS.warning;
    setFillColor(barColor);
    doc.roundedRect(xPos, yPos + 2, scoreWidth, meterHeight, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(barColor);
    doc.text(`${score}%`, xPos + width + 4, yPos + 8);
  };

  const drawCareerTimeline = () => {
    checkPageBreak(45);
    
    const timelineY = y;
    const timelineWidth = contentWidth - 20;
    const startX = margin + 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text('Career Success Timeline', margin, timelineY);
    y += 10;
    
    setFillColor(COLORS.lightBg);
    doc.roundedRect(startX, y, timelineWidth, 6, 2, 2, 'F');
    
    const years = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2, CURRENT_YEAR + 3, CURRENT_YEAR + 4];
    const segmentWidth = timelineWidth / years.length;
    
    const intensities = ['building', 'rising', 'peak', 'sustaining', 'expanding'];
    
    years.forEach((year, index) => {
      const xPos = startX + (index * segmentWidth);
      const matchingPeriod = reading.careerWealth.peakPeriods.find(p => p.year === String(year));
      const isPeak = matchingPeriod?.intensity === 'peak';
      const intensity = matchingPeriod?.intensity || intensities[index];
      
      const segmentColor = isPeak ? COLORS.gold : 
        intensity === 'rising' || intensity === 'expanding' ? COLORS.success : 
        COLORS.accent;
      
      setFillColor(segmentColor);
      doc.roundedRect(xPos + 1, y, segmentWidth - 2, 6, 1, 1, 'F');
      
      doc.setFontSize(7);
      doc.setFont('helvetica', isPeak ? 'bold' : 'normal');
      setColor(isPeak ? COLORS.gold : COLORS.mutedText);
      doc.text(String(year), xPos + segmentWidth / 2, y + 12, { align: 'center' });
      
      if (isPeak) {
        doc.setFontSize(6);
        setColor(COLORS.gold);
        doc.text('PEAK', xPos + segmentWidth / 2, y - 2, { align: 'center' });
      }
    });
    
    y += 18;
  };

  const drawLuckyElementsTable = () => {
    checkPageBreak(40);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text('Your Lucky Elements', margin, y);
    y += 8;
    
    const elements = [
      { label: 'Best Days', value: 'Wednesday, Friday, Sunday' },
      { label: 'Lucky Colors', value: 'Gold, Deep Blue, White' },
      { label: 'Power Numbers', value: '3, 7, 9, 21' },
      { label: 'Focus Direction', value: 'East & Northeast' },
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
      
      setFillColor(COLORS.cream);
      doc.roundedRect(x, cellY, cellWidth - 4, cellHeight, 2, 2, 'F');
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      setColor(COLORS.gold);
      doc.text(element.label.toUpperCase(), x + 4, cellY + 4);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(COLORS.bodyText);
      doc.text(element.value, x + 4, cellY + 9);
    });
    
    y = cellY + cellHeight + 8;
  };

  // Premium line analysis - single natural paragraph, no template labels
  const drawLineAnalysis = (
    lineName: string, 
    strength: string, 
    meaning: string, 
    keyInsight: string,
    personalizedInterpretation: string
  ) => {
    checkPageBreak(45);
    
    // Line name with strength badge
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(lineName, margin + 4, y);
    
    const nameWidth = doc.getTextWidth(lineName);
    doc.setFontSize(8);
    const strengthColor = strength.toLowerCase().includes('strong') ? COLORS.success : 
      strength.toLowerCase().includes('moderate') ? COLORS.gold : COLORS.mutedText;
    setColor(strengthColor);
    doc.text(`[${strength}]`, margin + 4 + nameWidth + 3, y);
    y += 6;
    
    // Single premium paragraph combining insight and meaning naturally
    const combinedInsight = cleanText(`${personalizedInterpretation} ${meaning}`);
    drawParagraph(combinedInsight, { indent: 4, size: 9.5, color: COLORS.darkText });
    
    // Key insight as actionable guidance
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.gold);
    doc.text('Guidance: ', margin + 4, y);
    const insightX = margin + 4 + doc.getTextWidth('Guidance: ');
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.bodyText);
    const cleanedInsight = makeTrustSafe(cleanText(keyInsight));
    const insightLines = doc.splitTextToSize(cleanedInsight, contentWidth - 40);
    doc.text(insightLines[0], insightX, y);
    y += 4;
    if (insightLines.length > 1) {
      doc.text(insightLines.slice(1).join(' '), margin + 8, y);
      y += 4;
    }
    
    y += 5;
  };

  // Format date
  const formattedDate = new Date(userData.generatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1: PREMIUM TITLE PAGE
  // ═══════════════════════════════════════════════════════════════════════════

  setFillColor(COLORS.indigo);
  doc.rect(0, 0, pageWidth, 55, 'F');

  setFillColor(COLORS.gold);
  doc.rect(0, 55, pageWidth, 2, 'F');

  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PALMMITRA', pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.gold.r, COLORS.gold.g, COLORS.gold.b);
  doc.text('PREMIUM DESTINY REPORT', pageWidth / 2, 32, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(COLORS.goldLight.r, COLORS.goldLight.g, COLORS.goldLight.b);
  doc.text('Om Shubh Aashirvaad', pageWidth / 2, 42, { align: 'center' });

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
  doc.text(`Prepared for: ${userName}`, margin + 8, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(COLORS.mutedText);
  doc.text(`Generated: ${formattedDate}`, margin + 8, y + 17);

  doc.setFont('helvetica', 'bold');
  setColor(COLORS.success);
  doc.text(`${reading.confidenceScore}% Confidence`, pageWidth - margin - 8, y + 13, { align: 'right' });

  y += 32;

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTINY SCORE METERS
  // ═══════════════════════════════════════════════════════════════════════════

  checkPageBreak(40);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.indigo);
  doc.text('Your Destiny Indicators', margin, y);
  y += 10;

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
  y += 20;
  drawDestinyScoreMeter(wealthScore, 'Wealth Attraction', margin, y, meterWidth - 15);
  drawDestinyScoreMeter(healthScore, 'Vitality Index', margin + meterWidth + 10, y, meterWidth - 15);
  y += 14;

  // ═══════════════════════════════════════════════════════════════════════════
  // DESTINY HIGHLIGHT BOX
  // ═══════════════════════════════════════════════════════════════════════════

  drawHighlightBox('Your Destiny Highlight', reading.headlineSummary);

  // ═══════════════════════════════════════════════════════════════════════════
  // NEXT 6 MONTHS FOCUS - EXACT DATES
  // ═══════════════════════════════════════════════════════════════════════════

  checkPageBreak(40);
  
  const next6Months = getNext6MonthsPeriod();
  drawSectionHeader('Next 6 Months Focus', `Priority guidance for ${userName} (${next6Months})`);
  
  const focusAreas = [
    {
      area: 'Primary Focus',
      guidance: `Concentrate your energy on ${reading.careerWealth.bestFields[0] || 'your core strengths'}. Your palm suggests heightened receptivity to new opportunities in this domain during this period.`,
    },
    {
      area: 'Relationship Priority',
      guidance: `${reading.loveRelationships.emotionalStyle}. This six-month window may favor ${reading.loveRelationships.commitmentTendency.toLowerCase().includes('deep') ? 'deepening existing bonds' : 'forming authentic new connections'}.`,
    },
    {
      area: 'Growth Action',
      guidance: `${reading.spiritualRemedies[0]?.remedy || 'Daily meditation'} may be particularly beneficial during this period. Starting small and staying consistent often yields the best results.`,
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

  const futurePeakPeriods = reading.careerWealth.peakPeriods.filter(p => 
    parseInt(p.year) >= CURRENT_YEAR
  );
  const nextPeakPeriod = futurePeakPeriods.find(p => p.intensity === 'peak') || futurePeakPeriods[0];

  const actionPlan = [
    {
      step: '1',
      title: 'Immediate Action (Now)',
      action: `${userName}, consider leveraging your ${reading.majorLines.headLine.strength.toLowerCase()} analytical abilities. Focusing on ${reading.careerWealth.bestFields.slice(0, 2).join(' and ') || 'your primary field'} may help your natural talents create the most impact.`,
    },
    {
      step: '2',
      title: `Growth Phase (${CURRENT_YEAR}–${CURRENT_YEAR + 1})`,
      action: `Your destiny turning point appears around age ${reading.careerWealth.turningPointAge}. Preparing now through ${reading.spiritualRemedies[0]?.remedy?.toLowerCase() || 'building daily spiritual practice'} and expanding your ${reading.careerWealth.bestFields[0] || 'professional'} network may serve you well.`,
    },
    {
      step: '3',
      title: `Opportunity Window (${nextPeakPeriod?.year || CURRENT_YEAR + 2})`,
      action: nextPeakPeriod 
        ? `${nextPeakPeriod.year} suggests ${nextPeakPeriod.intensity} energy for important decisions. Positioning yourself now for this window may enhance success potential for career moves, investments, and partnerships.`
        : `An opportunity period appears to be approaching. Staying consistent with your practices and remaining open to unexpected opportunities may serve you well.`,
    },
  ];

  actionPlan.forEach(({ step, title, action }) => {
    checkPageBreak(22);
    
    setFillColor(COLORS.gold);
    doc.circle(margin + 5, y - 2, 4, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.white);
    doc.text(step, margin + 5, y, { align: 'center' });
    
    setColor(COLORS.indigo);
    doc.text(title, margin + 14, y);
    y += 5;
    
    drawParagraph(action, { indent: 14, size: 9.5 });
    y += 2;
  });

  y += 4;
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // MAJOR PALM LINES ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Major Palm Lines Analysis', `Deep interpretation for ${userName}`);

  const linesData = [
    { name: 'Life Line', data: reading.majorLines.lifeLine, category: 'lifeLine' },
    { name: 'Heart Line', data: reading.majorLines.heartLine, category: 'heartLine' },
    { name: 'Head Line', data: reading.majorLines.headLine, category: 'headLine' },
    { name: 'Fate Line', data: reading.majorLines.fateLine, category: 'fateLine' },
    { name: 'Sun Line', data: reading.majorLines.sunLine, category: 'sunLine' },
  ];

  linesData.forEach((line) => {
    const personalizedInsight = getPersonalizedInsight(line.category, line.data.strength, userName);
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
  // PALM MOUNTS ANALYSIS - EXPANDED 2-3 LINES EACH
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
    checkPageBreak(30);
    
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
    
    // Expanded interpretation (2-3 lines with real-life impact)
    const expandedInterpretation = getMountInterpretation(mount.name, mount.data.level, userName);
    drawParagraph(expandedInterpretation, { indent: 4, size: 9.5 });
    y += 3;
  });

  y += 4;
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // CAREER TIMELINE BAR
  // ═══════════════════════════════════════════════════════════════════════════

  drawCareerTimeline();
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CAREER & WEALTH ROADMAP
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Career & Wealth Roadmap', `Personalized success path for ${userName}`);

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

  drawKeyValuePair('Career Turning Point', 
    `Around age ${reading.careerWealth.turningPointAge}. This period may mark a significant shift in your professional trajectory. Being prepared to take calculated risks during this window could be beneficial.`);

  drawKeyValuePair('Wealth Accumulation Pattern', reading.careerWealth.wealthStyle);

  if (futurePeakPeriods.length > 0) {
    y += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text('Upcoming Opportunity Periods:', margin + 4, y);
    y += 5;

    futurePeakPeriods.forEach((period) => {
      checkPageBreak(8);
      const isPeak = period.intensity === 'peak';
      
      doc.setFontSize(9);
      doc.setFont('helvetica', isPeak ? 'bold' : 'normal');
      setColor(isPeak ? COLORS.gold : COLORS.success);
      
      const intensityLabel = period.intensity.charAt(0).toUpperCase() + period.intensity.slice(1);
      const description = isPeak ? '– Heightened opportunity window' : 
        period.intensity === 'rising' ? '– Momentum building phase' :
        period.intensity === 'expanding' ? '– Growth consolidation phase' :
        period.intensity === 'sustaining' ? '– Stability and harvest phase' :
        '– Foundation building phase';
      
      doc.text(`  ${period.year}: ${intensityLabel} ${description}`, margin + 8, y);
      y += 5;
    });
  }

  y += 4;
  drawHighlightBox(
    'Best Year Ahead',
    `${userName}, ${nextPeakPeriod?.year || CURRENT_YEAR + 2} suggests strong potential for breakthrough success. Focusing on ${reading.careerWealth.bestFields[0] || 'your primary field'} and trusting your ${reading.majorLines.headLine.strength.toLowerCase()} mental clarity may guide major decisions effectively.`,
    COLORS.indigo
  );

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // LOVE & RELATIONSHIPS
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Love & Relationship Patterns', `Emotional blueprint for ${userName}`);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.indigo);
  doc.text('Your Emotional Profile:', margin + 4, y);
  y += 6;

  drawParagraph(
    `${userName}, your heart line suggests ${reading.loveRelationships.emotionalStyle.toLowerCase()}. This may indicate a natural ability to ${reading.majorLines.heartLine.strength === 'Very Strong' || reading.majorLines.heartLine.strength === 'Strong' ? 'form deep, lasting bonds' : 'approach relationships with thoughtful care'}.`,
    { indent: 4, size: 9.5 }
  );

  drawKeyValuePair('Partnership Style', reading.loveRelationships.commitmentTendency);
  
  y += 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.gold);
  doc.text('Relationship Guidance:', margin + 4, y);
  y += 5;
  drawParagraph(reading.loveRelationships.relationshipAdvice, { indent: 4, size: 9.5 });

  y += 2;
  setFillColor(COLORS.cream);
  doc.roundedRect(margin + 4, y, contentWidth - 8, 14, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  setColor(COLORS.mutedText);
  doc.text(`"${userName}, authentic connection grows when you honor both your needs and your partner's."`, margin + 8, y + 9);
  y += 20;

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFE PHASES
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Your Life Phases', `Key periods in ${userName}'s journey`);

  const phasesData = [
    { phase: 'Growth Period', data: reading.lifePhases.growth, icon: 'rise' },
    { phase: 'Challenge Period', data: reading.lifePhases.challenge, icon: 'caution' },
    { phase: 'Opportunity Period', data: reading.lifePhases.opportunity, icon: 'star' },
  ];

  phasesData.forEach(({ phase, data }) => {
    checkPageBreak(20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(phase, margin + 4, y);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.gold);
    doc.text(` (${data.period})`, margin + 4 + doc.getTextWidth(phase), y);
    y += 5;
    
    drawParagraph(data.description, { indent: 4, size: 9.5 });
  });

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONALITY TRAITS
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Personality Traits', `Core qualities revealed in ${userName}'s palm`);

  reading.personalityTraits.forEach((trait, index) => {
    checkPageBreak(15);
    
    setFillColor(COLORS.gold);
    doc.circle(margin + 4, y - 1, 2, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text(trait.trait, margin + 10, y);
    y += 5;
    
    drawParagraph(trait.description, { indent: 10, size: 9.5 });
  });

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // LUCKY ELEMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  drawLuckyElementsTable();

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // SPIRITUAL REMEDIES
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Spiritual Remedies', `Traditional practices for ${userName}'s journey`);

  const categorizedRemedies = reading.spiritualRemedies.map((remedy, index) => ({
    ...remedy,
    category: index === 0 ? 'Daily Practice' : index === 1 ? 'Weekly Ritual' : 'Monthly Observance',
  }));

  categorizedRemedies.forEach((remedy, index) => {
    checkPageBreak(25);
    
    setFillColor(COLORS.gold);
    doc.circle(margin + 5, y - 2, 4, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.white);
    doc.text(`${index + 1}`, margin + 5, y, { align: 'center' });
    
    setColor(COLORS.indigo);
    doc.setFontSize(10);
    doc.text(remedy.remedy, margin + 14, y);
    
    const remedyWidth = doc.getTextWidth(remedy.remedy);
    doc.setFontSize(7);
    setColor(COLORS.mutedText);
    doc.text(`(${remedy.category})`, margin + 18 + remedyWidth, y);
    y += 5;
    
    drawParagraph(remedy.benefit, { indent: 14, size: 9 });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    setColor(COLORS.gold);
    doc.text(`Best Time: ${remedy.timing}`, margin + 14, y);
    y += 6;
  });

  y += 4;

  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // PREMIUM INSIGHTS - COMPLETE WITH CAUTION PERIODS
  // ═══════════════════════════════════════════════════════════════════════════

  drawSectionHeader('Premium Insights', `Exclusive advanced analysis for ${userName}`);

  if (reading.premiumInsights) {
    // Marriage timing
    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.gold);
    doc.text('Marriage & Partnership Timing', margin + 4, y);
    y += 5;
    drawParagraph(
      `${reading.premiumInsights.marriageTiming}. Your heart line pattern suggests ${reading.majorLines.heartLine.strength === 'Very Strong' || reading.majorLines.heartLine.strength === 'Strong' ? 'potential for deep emotional bonds and long-term commitment' : 'a thoughtful approach to relationships with value placed on authentic connection'}.`,
      { indent: 4, size: 9.5 }
    );
    y += 2;

    // Career breakthrough
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.gold);
    doc.text('Career Breakthrough Roadmap', margin + 4, y);
    y += 5;
    drawParagraph(
      `${reading.premiumInsights.careerBreakthrough}. Focusing on ${reading.careerWealth.bestFields[0] || 'your primary field'} during your opportunity window around ${nextPeakPeriod?.year || CURRENT_YEAR + 2} may enhance results.`,
      { indent: 4, size: 9.5 }
    );
    y += 2;

    // Key months
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.gold);
    doc.text(`Key Months in ${nextPeakPeriod?.year || CURRENT_YEAR + 2}`, margin + 4, y);
    y += 5;
    drawParagraph(
      `March–April and September–October may show heightened opportunity alignment. Major decisions, launches, or commitments during these windows could carry enhanced success potential.`,
      { indent: 4, size: 9.5 }
    );
    y += 2;

    // Periods of Caution - COMPLETE with specific months, what to avoid, positive framing
    checkPageBreak(40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.warning);
    doc.text('Periods of Caution', margin + 4, y);
    y += 5;
    
    const cautionStartMonth = MONTH_NAMES[(CURRENT_MONTH + 5) % 12];
    const cautionEndMonth = MONTH_NAMES[(CURRENT_MONTH + 7) % 12];
    const cautionYear = CURRENT_MONTH + 7 >= 12 ? CURRENT_YEAR + 1 : CURRENT_YEAR;
    
    drawParagraph(
      `${cautionStartMonth}–${cautionEndMonth} ${cautionYear} may bring temporary slowdowns or the need for extra patience.`,
      { indent: 4, size: 9.5, color: COLORS.bodyText }
    );
    
    // What to approach mindfully
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.indigo);
    doc.text('Consider approaching with extra care:', margin + 8, y);
    y += 5;
    
    const cautionItems = [
      'Major financial commitments or large purchases',
      'New business partnerships or contracts', 
      'Significant career changes or job transitions',
      'Important relationship decisions'
    ];
    
    cautionItems.forEach(item => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setColor(COLORS.mutedText);
      doc.text(`• ${item}`, margin + 12, y);
      y += 4;
    });
    y += 2;
    
    // Positive framing
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.success);
    doc.text('Positive use of this period:', margin + 8, y);
    y += 5;
    
    const positiveItems = [
      'Planning and research for future initiatives',
      'Strengthening existing relationships and partnerships',
      'Self-reflection, learning, and skill development',
      'Building foundations for the next growth phase'
    ];
    
    positiveItems.forEach(item => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setColor(COLORS.bodyText);
      doc.text(`• ${item}`, margin + 12, y);
      y += 4;
    });
    y += 2;
    
    // Reassurance note
    setFillColor(COLORS.cream);
    doc.roundedRect(margin + 4, y, contentWidth - 8, 12, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    setColor(COLORS.mutedText);
    doc.text(`This is a natural cycle, not a period to fear. Navigating mindfully often leads to stronger outcomes.`, margin + 8, y + 7);
    y += 18;
  }

  y += 6;
  drawGoldDivider();

  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL DIVINE BLESSING
  // ═══════════════════════════════════════════════════════════════════════════

  checkPageBreak(55);

  const blessingY = y;
  const blessingHeight = 48;
  
  setDrawColor(COLORS.gold);
  doc.setLineWidth(1.5);
  doc.roundedRect(margin, blessingY, contentWidth, blessingHeight, 4, 4, 'S');
  
  setFillColor({ r: 255, g: 252, b: 240 });
  doc.roundedRect(margin + 2, blessingY + 2, contentWidth - 4, blessingHeight - 4, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.gold);
  doc.text('DIVINE BLESSING', pageWidth / 2, blessingY + 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  setColor(COLORS.indigo);
  const cleanedBlessing = makeTrustSafe(cleanText(reading.finalBlessing));
  const blessingLines = doc.splitTextToSize(`"${cleanedBlessing}"`, contentWidth - 25);
  let blessingTextY = blessingY + 22;
  blessingLines.slice(0, 3).forEach((line: string) => {
    doc.text(line, pageWidth / 2, blessingTextY, { align: 'center' });
    blessingTextY += 5;
  });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(COLORS.gold);
  doc.text(`– Your PalmMitra Reading for ${userName} –`, pageWidth / 2, blessingY + 43, { align: 'center' });

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

  const barWidth = 80;
  const barHeight = 6;
  const confidenceWidth = (reading.confidenceScore / 100) * barWidth;

  setFillColor({ r: 230, g: 230, b: 235 });
  doc.roundedRect(margin, y, barWidth, barHeight, 2, 2, 'F');

  const confColor = reading.confidenceScore >= 80 ? COLORS.success : 
    reading.confidenceScore >= 60 ? COLORS.gold : COLORS.warning;
  setFillColor(confColor);
  doc.roundedRect(margin, y, confidenceWidth, barHeight, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(confColor);
  doc.text(`${reading.confidenceScore}%`, margin + barWidth + 5, y + 5);

  y += 12;

  drawParagraph(
    `This premium reading was generated using advanced AI analysis of ${userName}'s palm image. The confidence score reflects image clarity and feature visibility. Higher scores generally indicate more precise readings.`,
    { size: 8, color: COLORS.mutedText }
  );

  addFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATE & DOWNLOAD
  // ═══════════════════════════════════════════════════════════════════════════

  const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `PalmMitra_Premium_Destiny_Report_${sanitizedName}.pdf`;

  doc.save(filename);
}
