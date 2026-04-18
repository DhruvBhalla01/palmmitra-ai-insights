import jsPDF from 'jspdf';
import type { PalmReading } from '@/components/report/types';

interface UserData {
  name: string;
  readingType: 'full' | 'career' | 'love' | 'wealth';
  generatedAt: string;
}

// PalmMitra Premium Brand Colors
const C = {
  indigoDark:  { r: 20,  g: 16,  b: 58  },
  indigo:      { r: 48,  g: 38,  b: 100 },
  indigoLight: { r: 72,  g: 60,  b: 135 },
  gold:        { r: 212, g: 175, b: 55  },
  goldLight:   { r: 235, g: 214, b: 130 },
  goldDark:    { r: 170, g: 140, b: 40  },
  white:       { r: 255, g: 255, b: 255 },
  cream:       { r: 255, g: 253, b: 246 },
  creamDark:   { r: 248, g: 244, b: 232 },
  darkText:    { r: 24,  g: 24,  b: 30  },
  bodyText:    { r: 55,  g: 52,  b: 68  },
  mutedText:   { r: 118, g: 116, b: 130 },
  success:     { r: 34,  g: 120, b: 54  },
  warning:     { r: 185, g: 100, b: 30  },
  accent:      { r: 150, g: 120, b: 55  },
};

const READING_TYPE_LABELS: Record<string, string> = {
  full:    'Complete Destiny Reading',
  career:  'Career & Wealth Focus',
  love:    'Love & Relationships Focus',
  wealth:  'Wealth & Prosperity Focus',
};

const NOW          = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth();
const MONTH_NAMES  = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

const getNext6MonthsPeriod = (): string => {
  const endIdx  = (CURRENT_MONTH + 6) % 12;
  const endYear = CURRENT_MONTH + 6 >= 12 ? CURRENT_YEAR + 1 : CURRENT_YEAR;
  return `${MONTH_NAMES[CURRENT_MONTH]} ${CURRENT_YEAR} – ${MONTH_NAMES[endIdx]} ${endYear}`;
};

const capitalizeName = (name: string): string =>
  name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

const cleanText = (text: string): string =>
  text.replace(/\.{2,}/g, '.').replace(/\s{2,}/g, ' ')
      .replace(/,{2,}/g, ',').replace(/\s+\./g, '.').replace(/\s+,/g, ',').trim();

const makeTrustSafe = (text: string): string =>
  text.replace(/you will definitely/gi, 'you may')
      .replace(/you will live long/gi, 'suggests strong vitality')
      .replace(/you will succeed/gi, 'indicates potential for success')
      .replace(/you will find/gi, 'you may discover')
      .replace(/guaranteed/gi, 'potential')
      .replace(/will definitely/gi, 'may')
      .replace(/certainly will/gi, 'suggests the possibility of')
      .replace(/destined to/gi, 'shows potential to')
      .replace(/will be rich/gi, 'indicates wealth potential')
      .replace(/will get married/gi, 'suggests favorable timing for partnership');

// ─── Personalization templates ────────────────────────────────────────────────

const getPersonalizedInsight = (category: string, strength: string, userName: string): string => {
  const name = capitalizeName(userName);
  const s = strength.toLowerCase();
  const insights: Record<string, Record<string, string>> = {
    lifeLine: {
      'very strong': `${name}, your life line suggests exceptional vitality and resilience. This pattern often indicates a robust constitution and the inner strength to navigate life's challenges with grace.`,
      'strong':      `${name}, your life line reflects solid vitality that may serve you well through various life phases. This pattern suggests determination and the capacity to overcome obstacles with persistence.`,
      'moderate':    `${name}, your life line indicates balanced energy that may be channelled effectively through consistent routines. This pattern suggests steady progress and adaptability.`,
      'developing':  `${name}, your life line shows evolving potential. The coming years may reveal hidden reserves of strength as you continue to grow.`,
      'faint':       `${name}, your life line suggests untapped potential waiting to emerge. Mindful practices and self-care may help you access deeper wells of energy.`,
    },
    heartLine: {
      'very strong': `${name}, your heart line suggests deep emotional capacity and the ability to form meaningful connections. This pattern often indicates strong intuition in matters of the heart.`,
      'strong':      `${name}, your heart line reflects genuine emotional depth that may create lasting bonds with those you trust. This pattern suggests loyalty and warmth in relationships.`,
      'moderate':    `${name}, your heart line indicates a thoughtful balance between emotion and reason. This pattern may guide you toward partnerships built on mutual understanding.`,
      'developing':  `${name}, your heart line suggests your emotional depth is still revealing itself. Allowing vulnerability with trusted individuals may open unexpected blessings.`,
      'faint':       `${name}, your heart line indicates emotions yet to be fully expressed. Opening your heart gradually may bring meaningful connections.`,
    },
    headLine: {
      'very strong': `${name}, your head line suggests exceptional analytical capacity. Complex challenges that puzzle others may come naturally to you.`,
      'strong':      `${name}, your head line reflects clear mental focus that may serve you well in decision-making. This pattern suggests practical wisdom.`,
      'moderate':    `${name}, your head line indicates balanced thinking that combines logic with intuition. This grounded approach may be valuable in many situations.`,
      'developing':  `${name}, your head line suggests new perspectives are emerging. Staying curious may expand your mental horizons significantly.`,
      'faint':       `${name}, your head line indicates intuition may guide you as much as analysis. Learning to trust these inner knowings could be beneficial.`,
    },
    fateLine: {
      'very strong': `${name}, your fate line suggests a marked path toward meaningful achievement. Your career trajectory may be distinguished by purposeful work.`,
      'strong':      `${name}, your fate line reflects consistent professional momentum. Recognition for your efforts appears likely in the coming years.`,
      'moderate':    `${name}, your fate line indicates success built through steady, dedicated effort. Each step forward may compound over time.`,
      'developing':  `${name}, your fate line suggests your true calling is still crystallising. Remaining open to unexpected opportunities may reveal your path.`,
      'faint':       `${name}, your fate line indicates an unconventional path may suit you. This flexibility could allow you to pivot toward emerging opportunities.`,
    },
    sunLine: {
      'very strong': `${name}, your sun line suggests natural visibility and recognition. Your talents appear meant to be shared with a wider audience.`,
      'strong':      `${name}, your sun line reflects potential for success and appreciation. Your work may receive the recognition it deserves.`,
      'moderate':    `${name}, your sun line indicates recognition that comes through consistent excellence. Staying focused on your craft may increase visibility.`,
      'developing':  `${name}, your sun line suggests the spotlight may gradually turn your way. The coming period could bring increased visibility.`,
      'faint':       `${name}, your sun line indicates your contributions may be more behind-the-scenes. This quiet influence can create lasting impact.`,
    },
  };
  return insights[category]?.[s] ?? `${name}, your unique pattern reveals special potential in this area of life.`;
};

const getMountInterpretation = (mountName: string, level: string, userName: string): string => {
  const name = capitalizeName(userName);
  const lv = level.toLowerCase();
  const map: Record<string, Record<string, string>> = {
    venus: {
      high:   `${name}, your prominent Venus mount suggests a warm, magnetic personality that naturally draws people toward you. This often indicates strong aesthetic sensibilities and the capacity for deep, passionate connections.`,
      medium: `${name}, your Venus mount indicates a balanced approach to love and pleasure. You likely appreciate beauty and connection while maintaining healthy boundaries — the ability to form stable, nurturing relationships without losing yourself.`,
      low:    `${name}, your Venus mount suggests you may approach relationships thoughtfully rather than impulsively. This can indicate a preference for meaningful connections over superficial ones.`,
    },
    jupiter: {
      high:   `${name}, your pronounced Jupiter mount suggests natural leadership qualities and ambitious drive. People may naturally look to you for guidance and direction. This pattern often indicates success in management, entrepreneurship, or any role requiring vision.`,
      medium: `${name}, your Jupiter mount reflects balanced ambition combined with realistic expectations. You likely pursue goals steadily without overreaching — the wisdom to lead when appropriate while remaining a gracious collaborator.`,
      low:    `${name}, your Jupiter mount indicates you may prefer supporting roles or working independently. Your influence may be felt through quiet competence rather than visible leadership.`,
    },
    saturn: {
      high:   `${name}, your well-developed Saturn mount suggests strong self-discipline and a serious approach to responsibilities. You likely excel in structured environments and long-term planning — success in finance, research, or any field requiring patience.`,
      medium: `${name}, your Saturn mount reflects a practical balance between discipline and flexibility. You can commit to long-term goals while adapting to changing circumstances — reliability without rigidity.`,
      low:    `${name}, your Saturn mount indicates you may prefer spontaneity over rigid structure. This adaptability is a genuine strength, suggesting creative problem-solving and flexibility in approach.`,
    },
    apollo: {
      high:   `${name}, your prominent Apollo mount suggests artistic talent and a natural flair for self-expression. You may have gifts in creative fields or any work involving aesthetics and presentation — potential for recognition.`,
      medium: `${name}, your Apollo mount indicates appreciation for creativity balanced with practical considerations. You can express yourself artistically while remaining grounded, suited to fields that blend creativity with function.`,
      low:    `${name}, your Apollo mount suggests creativity that may be more private or analytical than flamboyant. Exploring creative outlets at your own pace may reveal hidden talents.`,
    },
    mercury: {
      high:   `${name}, your developed Mercury mount suggests excellent communication skills and quick thinking. You may excel in writing, speaking, business negotiations, or any field requiring verbal dexterity.`,
      medium: `${name}, your Mercury mount reflects solid communication abilities combined with good listening skills. You can express ideas clearly while remaining receptive — balanced communication that serves well in collaborative environments.`,
      low:    `${name}, your Mercury mount indicates you may prefer thoughtful communication over quick responses. Quality over quantity may be your communication style, often resulting in more meaningful conversations.`,
    },
  };
  const key = mountName.toLowerCase().replace('mount of ', '');
  return map[key]?.[lv] ?? `${name}, your ${mountName} reveals unique qualities that influence your approach to this area of life.`;
};

const getScoreMatchedInsight = (score: number, category: string): string => {
  if (score >= 80) return `Strong foundation with excellent potential for ${category.toLowerCase()}.`;
  if (score >= 60) return `Solid indicators with room for growth in ${category.toLowerCase()}.`;
  if (score >= 45) return `Developing potential that may strengthen with focus in ${category.toLowerCase()}.`;
  return `Emerging qualities suggesting untapped potential in ${category.toLowerCase()}.`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main PDF generator
// ─────────────────────────────────────────────────────────────────────────────

export function generateReportPDF(reading: PalmReading, userData: UserData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W  = 210;
  const H  = 297;
  const M  = 20;   // left/right margin
  const CW = W - M * 2;
  let y    = M;
  let pageNum = 1;

  const userName = capitalizeName(userData.name);

  // ─── Low-level helpers ────────────────────────────────────────────────────

  const rgb   = (c: typeof C.indigo) => doc.setTextColor(c.r, c.g, c.b);
  const fill  = (c: typeof C.indigo) => doc.setFillColor(c.r, c.g, c.b);
  const stroke = (c: typeof C.indigo) => doc.setDrawColor(c.r, c.g, c.b);

  // Times for headings (premium serif — built into jsPDF)
  const serif = (size: number, style: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'bold') => {
    doc.setFont('times', style);
    doc.setFontSize(size);
  };
  // Helvetica for body
  const sans = (size: number, style: 'normal' | 'bold' | 'italic' = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
  };

  // ─── Page setup: warm cream background ───────────────────────────────────

  const setupPage = () => {
    fill(C.cream);
    doc.rect(0, 0, W, H, 'F');
    // Top gold accent stripe
    fill(C.gold);
    doc.rect(0, 0, W, 1.8, 'F');
    y = M + 8;
  };

  // ─── Footer ───────────────────────────────────────────────────────────────

  const addFooter = () => {
    const fy = H - 12;
    stroke(C.gold);
    doc.setLineWidth(0.3);
    doc.line(M, fy - 3, W - M, fy - 3);

    sans(7.5);
    rgb(C.mutedText);
    doc.text('PalmMitra', M, fy + 1.5);

    serif(9, 'bold');
    rgb(C.gold);
    doc.text(`— ${pageNum} —`, W / 2, fy + 1.5, { align: 'center' });

    sans(6.5);
    rgb(C.mutedText);
    doc.text('Spiritual Guidance · For Entertainment Purposes Only', W - M, fy + 1.5, { align: 'right' });
  };

  // ─── Page break ───────────────────────────────────────────────────────────

  const checkBreak = (needed: number): boolean => {
    if (y + needed > H - 24) {
      addFooter();
      doc.addPage();
      pageNum++;
      setupPage();
      return true;
    }
    return false;
  };

  // ─── Ornamental divider ───────────────────────────────────────────────────

  const divider = () => {
    y += 5;
    stroke(C.gold);
    doc.setLineWidth(0.4);
    const cx = W / 2;
    doc.line(M, y, cx - 6, y);
    doc.line(cx + 6, y, W - M, y);
    // Diamond
    fill(C.gold);
    doc.lines([[4, -3], [4, 3], [-4, 3], [-4, -3]], cx - 4, y - 0.5, [1, 1], 'F');
    y += 9;
  };

  // ─── Section header ───────────────────────────────────────────────────────

  const sectionHeader = (title: string, subtitle?: string) => {
    checkBreak(30);
    y += 5;

    // Gold left accent bar
    fill(C.gold);
    doc.rect(M, y - 4, 3.5, 14, 'F');

    serif(15, 'bold');
    rgb(C.indigo);
    doc.text(title.toUpperCase(), M + 8, y + 4);

    y += 10;

    if (subtitle) {
      sans(8.5, 'italic');
      rgb(C.mutedText);
      doc.text(cleanText(subtitle), M + 8, y);
      y += 6;
    }

    // Gold underline
    stroke(C.gold);
    doc.setLineWidth(0.5);
    doc.line(M, y, W - M, y);
    y += 7;
  };

  // ─── Body paragraph ───────────────────────────────────────────────────────

  const para = (
    text: string,
    opts?: { bold?: boolean; size?: number; color?: typeof C.darkText; indent?: number; times?: boolean },
  ) => {
    const size   = opts?.size ?? 9.5;
    const color  = opts?.color ?? C.bodyText;
    const indent = opts?.indent ?? 0;
    const lh     = size * 0.45;

    if (opts?.times) {
      serif(size, opts.bold ? 'bold' : 'normal');
    } else {
      sans(size, opts?.bold ? 'bold' : 'normal');
    }
    rgb(color);

    const cleaned = makeTrustSafe(cleanText(text));
    const lines   = doc.splitTextToSize(cleaned, CW - indent);
    checkBreak(lines.length * lh + 5);
    lines.forEach((line: string) => { doc.text(line, M + indent, y); y += lh; });
    y += 3;
  };

  // ─── Key–value pair ───────────────────────────────────────────────────────

  const kv = (label: string, value: string, highlight = false) => {
    checkBreak(14);
    sans(9, 'bold');
    rgb(highlight ? C.gold : C.indigo);
    const ls = label + ': ';
    doc.text(ls, M + 5, y);
    const lw = doc.getTextWidth(ls);
    sans(9);
    rgb(C.bodyText);
    const vl = doc.splitTextToSize(makeTrustSafe(cleanText(value)), CW - lw - 12);
    doc.text(vl[0], M + 5 + lw, y);
    y += 5;
    vl.slice(1).forEach((l: string) => { doc.text(l, M + 10, y); y += 4.5; });
    y += 1;
  };

  // ─── Highlight / callout box ──────────────────────────────────────────────

  const calloutBox = (
    title: string,
    content: string,
    variant: 'gold' | 'indigo' | 'muted' = 'gold',
  ) => {
    const accent = variant === 'indigo' ? C.indigo : variant === 'muted' ? C.accent : C.gold;
    const bg     = variant === 'indigo'
      ? { r: 245, g: 244, b: 255 }
      : { r: 255, g: 252, b: 238 };

    const cleaned = makeTrustSafe(cleanText(content));
    const lines   = doc.splitTextToSize(cleaned, CW - 22);
    const boxH    = Math.max(24, lines.length * 5.2 + 16);
    checkBreak(boxH + 8);

    const bY = y;
    fill(bg);
    doc.roundedRect(M, bY, CW, boxH, 3, 3, 'F');
    fill(accent);
    doc.rect(M, bY, 3.5, boxH, 'F');

    sans(8, 'bold');
    rgb(accent);
    doc.text(title.toUpperCase(), M + 9, bY + 8);

    serif(10.5, 'italic');
    rgb(C.darkText);
    let ty = bY + 16;
    lines.forEach((line: string) => { doc.text(line, M + 9, ty); ty += 5.2; });

    y = bY + boxH + 8;
  };

  // ─── Score meter ──────────────────────────────────────────────────────────

  const scoreMeter = (
    score: number,
    label: string,
    xPos: number,
    yPos: number,
    meterW: number,
  ) => {
    const barH      = 13;
    const fillW     = (score / 100) * meterW;
    const barColor  = score >= 80 ? C.success : score >= 60 ? C.gold : C.warning;

    serif(9, 'bold');
    rgb(C.indigo);
    doc.text(label, xPos, yPos);

    sans(7);
    rgb(C.mutedText);
    const desc = getScoreMatchedInsight(score, label);
    doc.text(desc.substring(0, 46), xPos, yPos + 4.5);

    // Track
    fill(C.creamDark);
    doc.roundedRect(xPos, yPos + 7, meterW, barH, 3, 3, 'F');

    // Fill bar (simulate gradient with two overlapping rects)
    fill(barColor);
    doc.roundedRect(xPos, yPos + 7, Math.max(fillW, 4), barH, 3, 3, 'F');
    // Lighter highlight on top-third
    fill(C.goldLight);
    doc.roundedRect(xPos, yPos + 7, Math.max(fillW, 4), Math.floor(barH / 3), 3, 3, 'F');

    // Score number — large Times, right side
    serif(15, 'bold');
    rgb(barColor);
    doc.text(`${score}%`, xPos + meterW + 7, yPos + 18);
  };

  // ─── Palm line analysis ───────────────────────────────────────────────────

  const lineBlock = (
    lineName: string,
    strength: string,
    meaning: string,
    keyInsight: string,
    personalInsight: string,
  ) => {
    checkBreak(50);

    serif(11, 'bold');
    rgb(C.indigo);
    doc.text(lineName, M + 5, y);

    const nw  = doc.getTextWidth(lineName);
    sans(8);
    const sc  = strength.toLowerCase().includes('strong') ? C.success
                : strength.toLowerCase().includes('moderate') ? C.gold : C.mutedText;
    rgb(sc);
    doc.text(`[${strength}]`, M + 9 + nw, y);
    y += 6;

    const combined = cleanText(`${personalInsight} ${meaning}`);
    para(combined, { indent: 5, size: 9.5, color: C.darkText });

    sans(9, 'bold');
    rgb(C.gold);
    doc.text('Guidance: ', M + 5, y);
    const gw = doc.getTextWidth('Guidance: ');
    sans(9);
    rgb(C.bodyText);
    const gl = doc.splitTextToSize(makeTrustSafe(cleanText(keyInsight)), CW - 40);
    doc.text(gl[0], M + 5 + gw, y);
    y += 4.5;
    if (gl.length > 1) { doc.text(gl.slice(1).join(' '), M + 9, y); y += 4.5; }
    y += 6;
  };

  // ─── Career timeline ──────────────────────────────────────────────────────

  const careerTimeline = () => {
    checkBreak(52);

    serif(10, 'bold');
    rgb(C.indigo);
    doc.text('Career Success Timeline', M, y);
    y += 10;

    const tw    = CW - 8;
    const startX = M + 4;
    const barH  = 11;
    const years = [CURRENT_YEAR, CURRENT_YEAR+1, CURRENT_YEAR+2, CURRENT_YEAR+3, CURRENT_YEAR+4];
    const segW  = tw / years.length;

    fill(C.creamDark);
    doc.roundedRect(startX, y, tw, barH, 2, 2, 'F');

    years.forEach((yr, i) => {
      const xPos = startX + i * segW;
      const mp   = reading.careerWealth.peakPeriods.find(p => p.year === String(yr));
      const isPeak = mp?.intensity === 'peak';
      const intensity = mp?.intensity ?? ['building','rising','peak','sustaining','expanding'][i];

      const segColor = isPeak ? C.gold
        : ['rising','expanding'].includes(intensity) ? C.success : C.accent;

      fill(segColor);
      doc.roundedRect(xPos + 0.5, y, segW - 1, barH, 1, 1, 'F');

      if (isPeak) {
        sans(6.5, 'bold');
        rgb(C.goldDark);
        doc.text('PEAK', xPos + segW / 2, y - 2.5, { align: 'center' });
      }

      sans(7, isPeak ? 'bold' : 'normal');
      rgb(isPeak ? C.indigoDark : C.mutedText);
      doc.text(String(yr), xPos + segW / 2, y + barH + 5.5, { align: 'center' });
    });

    y += barH + 14;
  };

  // ─── Lucky elements grid ──────────────────────────────────────────────────

  const luckyGrid = () => {
    checkBreak(44);

    serif(10, 'bold');
    rgb(C.indigo);
    doc.text('Your Lucky Elements', M, y);
    y += 8;

    const els = [
      { label: 'Best Days',        value: 'Wednesday, Friday, Sunday' },
      { label: 'Lucky Colors',     value: 'Gold, Deep Blue, White' },
      { label: 'Power Numbers',    value: '3, 7, 9, 21' },
      { label: 'Focus Direction',  value: 'East & Northeast' },
    ];

    const cellW = CW / 2;
    const cellH = 15;

    els.forEach((el, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx  = M + col * cellW;
      const cy  = y + row * (cellH + 3);

      fill({ r: 255, g: 252, b: 240 });
      doc.roundedRect(cx, cy, cellW - 5, cellH, 2, 2, 'F');
      stroke(C.gold);
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, cy, cellW - 5, cellH, 2, 2, 'S');

      sans(7, 'bold');
      rgb(C.gold);
      doc.text(el.label.toUpperCase(), cx + 6, cy + 5.5);

      serif(9, 'normal');
      rgb(C.darkText);
      doc.text(el.value, cx + 6, cy + 11.5);
    });

    y += 2 * (cellH + 3) + 8;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════
  // COVER PAGE
  // ══════════════════════════════════════════════════
  // ─────────────────────────────────────────────────────────────────────────

  // Full-bleed dark indigo background
  fill(C.indigoDark);
  doc.rect(0, 0, W, H, 'F');

  // Subtle lighter panel in centre (gives depth)
  fill(C.indigo);
  doc.rect(18, 58, W - 36, 130, 'F');

  // Gold top bar
  fill(C.gold);
  doc.rect(0, 0, W, 3, 'F');

  // Gold bottom bar
  fill(C.gold);
  doc.rect(0, H - 3, W, 3, 'F');

  // Decorative concentric rings (gold outlines, no fill)
  stroke(C.gold);
  doc.setLineWidth(0.3);
  doc.circle(W / 2, 110, 92, 'S');
  stroke(C.goldLight);
  doc.setLineWidth(0.2);
  doc.circle(W / 2, 110, 78, 'S');
  stroke({ r: 212, g: 175, b: 55 });
  doc.setLineWidth(0.15);
  doc.circle(W / 2, 110, 64, 'S');

  // Sanskrit "Om" represented as text — uses the available font
  serif(48, 'bold');
  doc.setTextColor(212, 175, 55); // gold
  doc.setFont('times', 'normal'); // use times normal for the Om text
  // Note: standard jsPDF fonts don't support Devanagari; use Latin representation
  doc.setFontSize(11);
  doc.setFont('times', 'italic');
  doc.setTextColor(C.goldLight.r, C.goldLight.g, C.goldLight.b);
  doc.text('Om Shubh Aashirvaad', W / 2, 44, { align: 'center' });

  // Brand name
  serif(36, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PALMMITRA', W / 2, 76, { align: 'center' });

  // Gold rule
  fill(C.gold);
  doc.rect(W / 2 - 44, 80, 88, 1.2, 'F');

  // Report subtitle
  sans(12, 'bold');
  rgb(C.gold);
  doc.text('PREMIUM DESTINY REPORT', W / 2, 93, { align: 'center' });

  // Reading type pill badge
  const readingLabel = READING_TYPE_LABELS[userData.readingType] ?? 'Complete Reading';
  sans(8, 'bold');
  const bW = doc.getTextWidth(readingLabel) + 16;
  fill(C.gold);
  doc.roundedRect(W / 2 - bW / 2, 98, bW, 10, 5, 5, 'F');
  rgb(C.indigoDark);
  doc.text(readingLabel, W / 2, 105, { align: 'center' });

  // Thin gold horizontal rule
  stroke(C.gold);
  doc.setLineWidth(0.4);
  doc.line(M + 18, 115, W - M - 18, 115);

  // ── User card ──────────────────────────────────────────────────────────────
  const cardY = 122;
  const cardH = 58;

  fill(C.cream);
  doc.roundedRect(M, cardY, CW, cardH, 4, 4, 'F');
  stroke(C.gold);
  doc.setLineWidth(0.8);
  doc.roundedRect(M, cardY, CW, cardH, 4, 4, 'S');

  // "Prepared for" label
  sans(8);
  rgb(C.mutedText);
  doc.text('Prepared for:', M + 10, cardY + 10);

  // User name — large serif
  serif(20, 'bold');
  rgb(C.indigo);
  doc.text(userName, M + 10, cardY + 24);

  // Date
  sans(8.5);
  rgb(C.bodyText);
  const formattedDate = new Date(userData.generatedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  doc.text(`Generated: ${formattedDate}`, M + 10, cardY + 34);

  // Reading type
  sans(8, 'bold');
  rgb(C.gold);
  doc.text(readingLabel, M + 10, cardY + 43);

  // Divider within card
  stroke({ r: 210, g: 175, b: 55 });
  doc.setLineWidth(0.3);
  doc.line(M + 10, cardY + 47, W - M - 10, cardY + 47);

  // Confidence score — right side of card
  serif(22, 'bold');
  rgb(C.success);
  doc.text(`${reading.confidenceScore}%`, W - M - 12, cardY + 28, { align: 'right' });
  sans(8);
  rgb(C.mutedText);
  doc.text('Confidence Score', W - M - 12, cardY + 36, { align: 'right' });
  sans(7, 'italic');
  rgb(C.mutedText);
  doc.text('based on image clarity', W - M - 12, cardY + 43, { align: 'right' });

  // ── Destiny indicator mini-meters on cover ─────────────────────────────────
  const strengthToScore: Record<string, number> = {
    'Very Strong': 95, 'Strong': 82, 'Moderate': 68, 'Developing': 55, 'Faint': 40,
  };
  const careerScore = strengthToScore[reading.majorLines.fateLine.strength]  ?? 70;
  const loveScore   = strengthToScore[reading.majorLines.heartLine.strength] ?? 70;
  const wealthScore = Math.round((
    (strengthToScore[reading.majorLines.sunLine.strength]  ?? 70) +
    (strengthToScore[reading.majorLines.fateLine.strength] ?? 70)
  ) / 2);
  const healthScore = strengthToScore[reading.majorLines.lifeLine.strength] ?? 70;

  const coverMeterY    = cardY + cardH + 12;
  const coverMeterW    = (CW - 12) / 4;

  [
    { label: 'Career',    score: careerScore  },
    { label: 'Love',      score: loveScore    },
    { label: 'Wealth',    score: wealthScore  },
    { label: 'Vitality',  score: healthScore  },
  ].forEach(({ label, score }, i) => {
    const mx = M + i * (coverMeterW + 4);
    const mc = score >= 80 ? C.success : score >= 60 ? C.gold : C.warning;

    sans(7, 'bold');
    rgb(C.goldLight);
    doc.text(label, mx + coverMeterW / 2, coverMeterY, { align: 'center' });

    // Small bar
    fill({ r: 48, g: 38, b: 100 }); // slightly lighter indigo for track
    doc.roundedRect(mx, coverMeterY + 3, coverMeterW, 6, 2, 2, 'F');
    fill(mc);
    doc.roundedRect(mx, coverMeterY + 3, Math.max((score / 100) * coverMeterW, 2), 6, 2, 2, 'F');

    sans(8, 'bold');
    rgb(mc);
    doc.text(`${score}%`, mx + coverMeterW / 2, coverMeterY + 16, { align: 'center' });
  });

  // Cover bottom tagline
  sans(8, 'italic');
  rgb(C.goldLight);
  doc.text('· Ancient Wisdom of Hast Rekha Shastra · Powered by Modern AI ·', W / 2, H - 16, { align: 'center' });

  // ─────────────────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════
  // CONTENT PAGES
  // ══════════════════════════════════════════════════
  // ─────────────────────────────────────────────────────────────────────────

  doc.addPage();
  pageNum++;
  setupPage();

  // ── Destiny Score Meters ──────────────────────────────────────────────────

  sectionHeader('Your Destiny Indicators');

  const mW = (CW - 24) / 2;
  scoreMeter(careerScore, 'Career Potential',    M,          y, mW);
  scoreMeter(loveScore,   'Love Compatibility',  M + mW + 14, y, mW);
  y += 28;
  scoreMeter(wealthScore, 'Wealth Attraction',   M,          y, mW);
  scoreMeter(healthScore, 'Vitality Index',      M + mW + 14, y, mW);
  y += 26;

  divider();

  // ── Destiny Highlight ─────────────────────────────────────────────────────

  calloutBox('Your Destiny Highlight', reading.headlineSummary, 'gold');

  // ── Next 6 Months Focus ───────────────────────────────────────────────────

  const next6 = getNext6MonthsPeriod();
  sectionHeader('Next 6 Months Focus', `Priority guidance for ${userName} (${next6})`);

  const focusAreas = [
    {
      area: 'Primary Focus',
      guidance: `Concentrate your energy on ${reading.careerWealth.bestFields[0] ?? 'your core strengths'}. Your palm suggests heightened receptivity to new opportunities in this domain during this period.`,
    },
    {
      area: 'Relationship Priority',
      guidance: `${reading.loveRelationships.emotionalStyle}. This six-month window may favour ${reading.loveRelationships.commitmentTendency.toLowerCase().includes('deep') ? 'deepening existing bonds' : 'forming authentic new connections'}.`,
    },
    {
      area: 'Growth Action',
      guidance: `${reading.spiritualRemedies[0]?.remedy ?? 'Daily meditation'} may be particularly beneficial during this period. Starting small and staying consistent often yields the best results.`,
    },
  ];

  focusAreas.forEach(({ area, guidance }) => {
    checkBreak(18);
    sans(10, 'bold');
    rgb(C.gold);
    doc.text(area + ':', M + 5, y);
    y += 5.5;
    para(guidance, { indent: 5, size: 9.5 });
  });

  y += 2;
  divider();

  // ── 3-Step Action Plan ────────────────────────────────────────────────────

  sectionHeader('Your 3-Step Action Plan', `Personalized roadmap based on your unique palm analysis`);

  const futurePeaks  = reading.careerWealth.peakPeriods.filter(p => parseInt(p.year) >= CURRENT_YEAR);
  const nextPeak     = futurePeaks.find(p => p.intensity === 'peak') ?? futurePeaks[0];

  const actionPlan = [
    {
      step: '1',
      title: 'Immediate Action (Now)',
      body: `${userName}, consider leveraging your ${reading.majorLines.headLine.strength.toLowerCase()} analytical abilities. Focusing on ${reading.careerWealth.bestFields.slice(0, 2).join(' and ') ?? 'your primary field'} may help your natural talents create the most impact.`,
    },
    {
      step: '2',
      title: `Growth Phase (${CURRENT_YEAR}–${CURRENT_YEAR + 1})`,
      body: `Your destiny turning point appears around age ${reading.careerWealth.turningPointAge}. Preparing now through ${reading.spiritualRemedies[0]?.remedy?.toLowerCase() ?? 'daily spiritual practice'} and expanding your ${reading.careerWealth.bestFields[0] ?? 'professional'} network may serve you well.`,
    },
    {
      step: '3',
      title: `Opportunity Window (${nextPeak?.year ?? CURRENT_YEAR + 2})`,
      body: nextPeak
        ? `${nextPeak.year} suggests ${nextPeak.intensity} energy for important decisions. Positioning yourself now for this window may enhance success potential for career moves, investments, and partnerships.`
        : `An opportunity period appears to be approaching. Staying consistent with your practices and remaining open to unexpected opportunities may serve you well.`,
    },
  ];

  actionPlan.forEach(({ step, title, body: stepBody }) => {
    checkBreak(24);

    // Gold circle step number
    fill(C.gold);
    doc.circle(M + 6, y - 1.5, 4.5, 'F');
    sans(9, 'bold');
    rgb(C.indigoDark);
    doc.text(step, M + 6, y, { align: 'center' });

    serif(10, 'bold');
    rgb(C.indigo);
    doc.text(title, M + 16, y);
    y += 5.5;

    para(stepBody, { indent: 16, size: 9.5 });
    y += 1;
  });

  y += 2;
  divider();

  // ── Major Palm Lines ──────────────────────────────────────────────────────

  sectionHeader('Major Palm Lines Analysis', `Deep interpretation for ${userName}`);

  const linesData = [
    { name: 'Life Line',  data: reading.majorLines.lifeLine,  cat: 'lifeLine'  },
    { name: 'Heart Line', data: reading.majorLines.heartLine, cat: 'heartLine' },
    { name: 'Head Line',  data: reading.majorLines.headLine,  cat: 'headLine'  },
    { name: 'Fate Line',  data: reading.majorLines.fateLine,  cat: 'fateLine'  },
    { name: 'Sun Line',   data: reading.majorLines.sunLine,   cat: 'sunLine'   },
  ];

  linesData.forEach(line => {
    const personalInsight = getPersonalizedInsight(line.cat, line.data.strength, userName);
    lineBlock(line.name, line.data.strength, line.data.meaning, line.data.keyInsight, personalInsight);
  });

  divider();

  // ── Palm Mounts ───────────────────────────────────────────────────────────

  sectionHeader('Palm Mounts Analysis', 'The five mounts reveal your core personality forces');

  const mountsData = [
    { name: 'Mount of Venus',   data: reading.mounts.venus,   domain: 'Love, Passion & Vitality'      },
    { name: 'Mount of Jupiter', data: reading.mounts.jupiter, domain: 'Ambition & Leadership'         },
    { name: 'Mount of Saturn',  data: reading.mounts.saturn,  domain: 'Wisdom & Discipline'           },
    { name: 'Mount of Apollo',  data: reading.mounts.apollo,  domain: 'Creativity & Recognition'      },
    { name: 'Mount of Mercury', data: reading.mounts.mercury, domain: 'Communication & Commerce'      },
  ];

  mountsData.forEach(mount => {
    checkBreak(32);

    serif(10, 'bold');
    rgb(C.indigo);
    doc.text(mount.name, M + 5, y);

    const nw  = doc.getTextWidth(mount.name);
    sans(8);
    const lc  = mount.data.level === 'High' ? C.success
                : mount.data.level === 'Medium' ? C.gold : C.mutedText;
    rgb(lc);
    doc.text(`[${mount.data.level}]`, M + 9 + nw, y);

    sans(8, 'italic');
    rgb(C.mutedText);
    doc.text(mount.domain, M + 5, y + 4.5);
    y += 9;

    const interpretation = getMountInterpretation(mount.name, mount.data.level, userName);
    para(interpretation, { indent: 5, size: 9.5 });
    y += 2;
  });

  y += 2;
  divider();

  // ── Career Timeline + Roadmap ─────────────────────────────────────────────

  careerTimeline();

  sectionHeader('Career & Wealth Roadmap', `Personalized success path for ${userName}`);

  sans(9, 'bold');
  rgb(C.gold);
  doc.text('Recommended Industries:', M + 5, y);
  y += 6;

  reading.careerWealth.bestFields.forEach((field, i) => {
    checkBreak(8);
    sans(9);
    rgb(C.bodyText);
    doc.text(`${i + 1}.  ${field}`, M + 9, y);
    y += 5;
  });
  y += 3;

  kv('Career Turning Point',
    `Around age ${reading.careerWealth.turningPointAge}. This period may mark a significant shift in your professional trajectory. Prepared effort during this window could be highly beneficial.`);

  kv('Wealth Pattern', reading.careerWealth.wealthStyle);

  if (futurePeaks.length > 0) {
    y += 3;
    sans(9, 'bold');
    rgb(C.indigo);
    doc.text('Upcoming Opportunity Periods:', M + 5, y);
    y += 6;

    futurePeaks.forEach(period => {
      checkBreak(8);
      const isPeak = period.intensity === 'peak';
      sans(9, isPeak ? 'bold' : 'normal');
      rgb(isPeak ? C.gold : C.success);
      const desc = isPeak ? '— Heightened opportunity window'
        : period.intensity === 'rising'     ? '— Momentum building phase'
        : period.intensity === 'expanding'  ? '— Growth consolidation phase'
        : period.intensity === 'sustaining' ? '— Stability and harvest phase'
        : '— Foundation building phase';
      doc.text(`  ${period.year}: ${period.intensity.charAt(0).toUpperCase() + period.intensity.slice(1)} ${desc}`, M + 9, y);
      y += 5;
    });
  }

  y += 4;
  calloutBox(
    'Best Year Ahead',
    `${userName}, ${nextPeak?.year ?? CURRENT_YEAR + 2} suggests strong potential for breakthrough success. Focusing on ${reading.careerWealth.bestFields[0] ?? 'your primary field'} and trusting your ${reading.majorLines.headLine.strength.toLowerCase()} mental clarity may guide major decisions effectively.`,
    'indigo',
  );

  divider();

  // ── Love & Relationships ──────────────────────────────────────────────────

  sectionHeader('Love & Relationship Patterns', `Emotional blueprint for ${userName}`);

  serif(10, 'bold');
  rgb(C.indigo);
  doc.text('Your Emotional Profile:', M + 5, y);
  y += 6;

  para(
    `${userName}, your heart line suggests ${reading.loveRelationships.emotionalStyle.toLowerCase()}. This may indicate a natural ability to ${reading.majorLines.heartLine.strength === 'Very Strong' || reading.majorLines.heartLine.strength === 'Strong' ? 'form deep, lasting bonds' : 'approach relationships with thoughtful care'}.`,
    { indent: 5, size: 9.5 },
  );

  kv('Partnership Style', reading.loveRelationships.commitmentTendency);

  y += 2;
  sans(9, 'bold');
  rgb(C.gold);
  doc.text('Relationship Guidance:', M + 5, y);
  y += 5;
  para(reading.loveRelationships.relationshipAdvice, { indent: 5, size: 9.5 });

  y += 2;
  // Quote box for relationship
  fill({ r: 255, g: 248, b: 248 });
  doc.roundedRect(M + 4, y, CW - 8, 16, 2, 2, 'F');
  serif(9.5, 'italic');
  rgb(C.indigo);
  doc.text(
    `"${userName}, authentic connection grows when you honour both your needs and your partner's."`,
    W / 2, y + 9,
    { align: 'center', maxWidth: CW - 16 },
  );
  y += 22;

  divider();

  // ── Life Phases ───────────────────────────────────────────────────────────

  sectionHeader('Your Life Phases', `Key periods in ${userName}'s journey`);

  const phases = [
    { phase: 'Growth Period',      data: reading.lifePhases.growth      },
    { phase: 'Challenge Period',   data: reading.lifePhases.challenge   },
    { phase: 'Opportunity Period', data: reading.lifePhases.opportunity },
  ];

  phases.forEach(({ phase, data }) => {
    checkBreak(22);
    serif(10, 'bold');
    rgb(C.indigo);
    doc.text(phase, M + 5, y);
    sans(8);
    rgb(C.gold);
    doc.text(` (${data.period})`, M + 5 + doc.getTextWidth(phase), y);
    y += 5.5;
    para(data.description, { indent: 5, size: 9.5 });
  });

  divider();

  // ── Personality Traits ────────────────────────────────────────────────────

  sectionHeader('Personality Traits', `Core qualities revealed in ${userName}'s palm`);

  reading.personalityTraits.forEach(trait => {
    checkBreak(16);
    fill(C.gold);
    doc.circle(M + 5, y - 1, 2.5, 'F');
    serif(10, 'bold');
    rgb(C.indigo);
    doc.text(trait.trait, M + 12, y);
    y += 5.5;
    para(trait.description, { indent: 12, size: 9.5 });
  });

  divider();

  // ── Lucky Elements ────────────────────────────────────────────────────────

  luckyGrid();

  divider();

  // ── Spiritual Remedies ────────────────────────────────────────────────────

  sectionHeader('Spiritual Remedies', `Traditional practices for ${userName}'s journey`);

  const categorized = reading.spiritualRemedies.map((r, i) => ({
    ...r,
    category: i === 0 ? 'Daily Practice' : i === 1 ? 'Weekly Ritual' : 'Monthly Observance',
  }));

  categorized.forEach((remedy, i) => {
    checkBreak(28);

    fill(C.gold);
    doc.circle(M + 6, y - 1.5, 4.5, 'F');
    sans(9, 'bold');
    rgb(C.indigoDark);
    doc.text(String(i + 1), M + 6, y, { align: 'center' });

    serif(10, 'bold');
    rgb(C.indigo);
    doc.text(remedy.remedy, M + 15, y);

    sans(7.5);
    const rw = doc.getTextWidth(remedy.remedy);
    rgb(C.mutedText);
    doc.text(`(${remedy.category})`, M + 19 + rw, y);
    y += 5.5;

    para(remedy.benefit, { indent: 15, size: 9 });

    sans(8, 'italic');
    rgb(C.gold);
    doc.text(`Best Time: ${remedy.timing}`, M + 15, y);
    y += 7;
  });

  y += 2;
  divider();

  // ── Premium Insights ──────────────────────────────────────────────────────

  if (reading.premiumInsights) {
    sectionHeader('Premium Insights', `Exclusive advanced analysis for ${userName}`);

    checkBreak(20);
    sans(10, 'bold');
    rgb(C.gold);
    doc.text('Marriage & Partnership Timing', M + 5, y);
    y += 5.5;
    para(
      `${reading.premiumInsights.marriageTiming}. Your heart line pattern suggests ${reading.majorLines.heartLine.strength === 'Very Strong' || reading.majorLines.heartLine.strength === 'Strong' ? 'potential for deep emotional bonds and long-term commitment' : 'a thoughtful approach to relationships with value placed on authentic connection'}.`,
      { indent: 5, size: 9.5 },
    );
    y += 2;

    sans(10, 'bold');
    rgb(C.gold);
    doc.text('Career Breakthrough Roadmap', M + 5, y);
    y += 5.5;
    para(
      `${reading.premiumInsights.careerBreakthrough}. Focusing on ${reading.careerWealth.bestFields[0] ?? 'your primary field'} during your opportunity window around ${nextPeak?.year ?? CURRENT_YEAR + 2} may enhance results.`,
      { indent: 5, size: 9.5 },
    );
    y += 2;

    sans(10, 'bold');
    rgb(C.gold);
    doc.text(`Key Months in ${nextPeak?.year ?? CURRENT_YEAR + 2}`, M + 5, y);
    y += 5.5;
    para(
      `March–April and September–October may show heightened opportunity alignment. Major decisions, launches, or commitments during these windows could carry enhanced success potential.`,
      { indent: 5, size: 9.5 },
    );
    y += 2;

    // Caution periods
    checkBreak(50);
    sans(10, 'bold');
    rgb(C.warning);
    doc.text('Periods of Caution', M + 5, y);
    y += 5.5;

    const cautionStart = MONTH_NAMES[(CURRENT_MONTH + 5) % 12];
    const cautionEnd   = MONTH_NAMES[(CURRENT_MONTH + 7) % 12];
    const cautionYear  = CURRENT_MONTH + 7 >= 12 ? CURRENT_YEAR + 1 : CURRENT_YEAR;

    para(`${cautionStart}–${cautionEnd} ${cautionYear} may bring temporary slowdowns or the need for extra patience.`,
      { indent: 5, size: 9.5 });

    sans(9, 'bold');
    rgb(C.indigo);
    doc.text('Consider approaching with extra care:', M + 9, y);
    y += 5.5;
    ['Major financial commitments or large purchases',
     'New business partnerships or contracts',
     'Significant career changes or job transitions',
     'Important relationship decisions'].forEach(item => {
      checkBreak(6);
      sans(8);
      rgb(C.mutedText);
      doc.text(`•  ${item}`, M + 13, y);
      y += 4.5;
    });
    y += 2;

    sans(9, 'bold');
    rgb(C.success);
    doc.text('Positive use of this period:', M + 9, y);
    y += 5.5;
    ['Planning and research for future initiatives',
     'Strengthening existing relationships and partnerships',
     'Self-reflection, learning, and skill development',
     'Building foundations for the next growth phase'].forEach(item => {
      checkBreak(6);
      sans(8);
      rgb(C.bodyText);
      doc.text(`•  ${item}`, M + 13, y);
      y += 4.5;
    });
    y += 4;

    fill(C.creamDark);
    doc.roundedRect(M + 5, y, CW - 10, 14, 2, 2, 'F');
    sans(8, 'italic');
    rgb(C.mutedText);
    doc.text(
      `This is a natural cycle, not a period to fear. Navigating mindfully often leads to stronger outcomes.`,
      W / 2, y + 8,
      { align: 'center', maxWidth: CW - 18 },
    );
    y += 20;
  }

  y += 4;
  divider();

  // ─────────────────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════
  // DIVINE BLESSING PAGE
  // ══════════════════════════════════════════════════
  // ─────────────────────────────────────────────────────────────────────────

  // Ensure we have room; if not, new page
  if (y + 70 > H - 30) {
    addFooter();
    doc.addPage();
    pageNum++;
    setupPage();
  }

  checkBreak(70);

  // Blessing box — full-width premium styled
  const bY  = y;
  const bClean = makeTrustSafe(cleanText(reading.finalBlessing));
  const bLines = doc.splitTextToSize(
    `"${bClean}"`,
    CW - 30,
  );
  // Use Times size 10.5 line height ~5.5
  const bTextH = bLines.length * 5.5;
  const bH     = Math.max(56, bTextH + 36);

  // Outer border
  stroke(C.gold);
  doc.setLineWidth(1.5);
  doc.roundedRect(M, bY, CW, bH, 5, 5, 'S');

  // Inner fill
  fill({ r: 255, g: 252, b: 240 });
  doc.roundedRect(M + 1.5, bY + 1.5, CW - 3, bH - 3, 4, 4, 'F');

  // Title
  serif(12, 'bold');
  rgb(C.gold);
  doc.text('DIVINE BLESSING', W / 2, bY + 13, { align: 'center' });

  // Gold rule
  stroke(C.gold);
  doc.setLineWidth(0.4);
  doc.line(W / 2 - 30, bY + 17, W / 2 + 30, bY + 17);

  // Blessing text
  serif(10.5, 'italic');
  rgb(C.indigo);
  let bTy = bY + 26;
  bLines.forEach((line: string) => {
    doc.text(line, W / 2, bTy, { align: 'center' });
    bTy += 5.5;
  });

  // Attribution
  sans(8.5);
  rgb(C.gold);
  doc.text(`— Your PalmMitra Reading for ${userName} —`, W / 2, bY + bH - 9, { align: 'center' });

  y = bY + bH + 10;

  // Confidence bar
  checkBreak(30);

  serif(9, 'bold');
  rgb(C.indigo);
  doc.text('Palm Scan Confidence', M, y);
  y += 5;

  const confBarW   = 90;
  const confFillW  = (reading.confidenceScore / 100) * confBarW;
  const confColor  = reading.confidenceScore >= 80 ? C.success
                    : reading.confidenceScore >= 60 ? C.gold : C.warning;

  fill(C.creamDark);
  doc.roundedRect(M, y, confBarW, 10, 3, 3, 'F');
  fill(confColor);
  doc.roundedRect(M, y, confFillW, 10, 3, 3, 'F');

  serif(12, 'bold');
  rgb(confColor);
  doc.text(`${reading.confidenceScore}%`, M + confBarW + 6, y + 8);

  y += 16;

  para(
    `This premium reading was generated using advanced AI analysis of ${userName}'s palm image. The confidence score reflects image clarity and feature visibility. Higher scores generally indicate more precise readings.`,
    { size: 8, color: C.mutedText },
  );

  addFooter();

  // ─────────────────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════
  // CLOSING CTA PAGE
  // ══════════════════════════════════════════════════
  // ─────────────────────────────────────────────────────────────────────────

  doc.addPage();
  pageNum++;

  // Full-bleed dark background (same as cover)
  fill(C.indigoDark);
  doc.rect(0, 0, W, H, 'F');
  fill(C.indigo);
  doc.rect(18, 50, W - 36, 200, 'F');

  // Gold top + bottom bars
  fill(C.gold);
  doc.rect(0, 0, W, 3, 'F');
  doc.rect(0, H - 3, W, 3, 'F');

  // Decorative ring
  stroke(C.gold);
  doc.setLineWidth(0.3);
  doc.circle(W / 2, H / 2, 88, 'S');
  stroke(C.goldLight);
  doc.setLineWidth(0.2);
  doc.circle(W / 2, H / 2, 72, 'S');

  // Headline
  serif(22, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Your Destiny Journey', W / 2, 80, { align: 'center' });
  serif(22, 'italic');
  rgb(C.gold);
  doc.text('Continues.', W / 2, 96, { align: 'center' });

  // Gold rule
  fill(C.gold);
  doc.rect(W / 2 - 36, 103, 72, 1, 'F');

  // Sub-message
  sans(10, 'italic');
  rgb(C.goldLight);
  doc.text(
    `${userName}, your reading is a living guide — revisit it anytime.`,
    W / 2, 115,
    { align: 'center', maxWidth: CW - 20 },
  );

  // ── Monthly Plan Upsell ────────────────────────────────────────────────────
  const upsellY = 132;
  const upsellH = 50;

  fill({ r: 255, g: 252, b: 240 });
  doc.roundedRect(M + 8, upsellY, CW - 16, upsellH, 4, 4, 'F');
  stroke(C.gold);
  doc.setLineWidth(0.8);
  doc.roundedRect(M + 8, upsellY, CW - 16, upsellH, 4, 4, 'S');

  // Badge
  fill(C.gold);
  const badgeTxt = 'Monthly Plan — ₹299/mo';
  sans(8, 'bold');
  const badgeW2 = doc.getTextWidth(badgeTxt) + 16;
  doc.roundedRect(W / 2 - badgeW2 / 2, upsellY - 5, badgeW2, 10, 5, 5, 'F');
  rgb(C.indigoDark);
  doc.text(badgeTxt, W / 2, upsellY + 2, { align: 'center' });

  serif(11, 'bold');
  rgb(C.indigo);
  doc.text('Unlock Unlimited Readings for Your Whole Family', W / 2, upsellY + 16, { align: 'center' });

  sans(9);
  rgb(C.bodyText);
  doc.text('Read your spouse, parents & children · Priority AI · All future features',
    W / 2, upsellY + 26, { align: 'center', maxWidth: CW - 30 });

  sans(10, 'bold');
  rgb(C.gold);
  doc.text('palmmitra.com/upgrade', W / 2, upsellY + 40, { align: 'center' });

  // ── Share CTA ──────────────────────────────────────────────────────────────
  const shareY = upsellY + upsellH + 18;

  sans(9, 'italic');
  rgb(C.goldLight);
  doc.text('"The most meaningful gifts are ones that reveal who we truly are."', W / 2, shareY, { align: 'center' });

  sans(9, 'bold');
  rgb(C.white);
  doc.text('Share your reading link with someone who matters:', W / 2, shareY + 10, { align: 'center' });

  sans(10, 'bold');
  rgb(C.gold);
  doc.text('palmmitra.com', W / 2, shareY + 22, { align: 'center' });

  // Gold rule
  stroke(C.gold);
  doc.setLineWidth(0.3);
  doc.line(W / 2 - 30, shareY + 29, W / 2 + 30, shareY + 29);

  // ── Revisit section ────────────────────────────────────────────────────────
  const revisitY = shareY + 40;

  sans(9);
  rgb(C.goldLight);
  doc.text('Your reading is stored permanently at:', W / 2, revisitY, { align: 'center' });
  sans(10, 'bold');
  rgb(C.gold);
  doc.text('palmmitra.com/report', W / 2, revisitY + 10, { align: 'center' });

  // Footer on CTA page
  sans(7.5);
  rgb(C.goldLight);
  doc.text('PalmMitra  ·  AI Spiritual Guidance  ·  For Entertainment Purposes Only', W / 2, H - 14, { align: 'center' });
  fill(C.gold);
  doc.rect(W / 2 - 20, H - 18, 40, 0.5, 'F');

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE
  // ─────────────────────────────────────────────────────────────────────────

  const safeName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`PalmMitra_Premium_Destiny_Report_${safeName}.pdf`);
}
