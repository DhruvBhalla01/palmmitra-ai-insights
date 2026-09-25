// Long-form palmistry guides. Content is editorial (no personal data, no claims
// of medical/legal/financial advice) and each guide links into a reading flow.

export type GuideCategory =
  | 'Life Line'
  | 'Marriage & Relationships'
  | 'Wealth & Career'
  | 'Fundamentals';

export interface GuideSection {
  heading: string;
  id: string;
  paragraphs: string[];
  /** Optional highlighted takeaway rendered as a gold callout. */
  callout?: string;
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: GuideCategory;
  readTime: string;
  publishDate: string;
  /** Which reading flow this guide sends readers to. */
  cta: 'upload' | 'palmmatch';
  intro: string[];
  sections: GuideSection[];
  faqs: GuideFaq[];
}

export const GUIDE_CATEGORIES: GuideCategory[] = [
  'Fundamentals',
  'Life Line',
  'Marriage & Relationships',
  'Wealth & Career',
];

export const guides: Guide[] = [
  // ───────────────────────────────────────────────────────────── 1
  {
    slug: 'forked-life-line-meaning',
    title: 'What Does a Forked Life Line Mean? A Complete Jeevan Rekha Guide',
    metaTitle: 'Forked Life Line Meaning in Palmistry (Jeevan Rekha Guide) | PalmMitra',
    metaDescription:
      'A split or forked life line does not mean a short life. Learn what branches, forks and breaks in the Jeevan Rekha traditionally signify, and how to read your own.',
    excerpt:
      'A split life line worries more people than any other marking on the hand. Here is what the fork traditionally means, and what it does not.',
    category: 'Life Line',
    readTime: '8 min read',
    publishDate: '2026-09-25',
    cta: 'upload',
    intro: [
      'If you have just noticed that your life line splits into two near the wrist, you are in good company. The forked life line is the single most searched marking in palmistry, and almost always for the same reason: someone has read online that it means a shortened life. In traditional Hast Rekha Shastra it means nothing of the sort.',
      'The life line, or Jeevan Rekha, is the curve that begins between your thumb and index finger and arcs around the base of the thumb. Classical palmistry reads it as a map of vitality, rootedness and the physical circumstances of your life — not as a countdown. A fork in it is read as a division of energy or direction, not an ending.',
    ],
    sections: [
      {
        heading: 'Where the fork appears matters more than the fork itself',
        id: 'where-the-fork-appears',
        paragraphs: [
          'The same shape carries a different traditional meaning depending on where along the curve it appears. Palmistry divides the life line into three rough stretches: the upper third near the index finger (early life), the middle third (the productive middle years), and the lower third near the wrist (later life).',
          'A fork high on the line is usually read as an early divergence — a family move, a change of schooling, a household split between two influences. A fork in the middle is read as a working life that genuinely divides: two careers running at once, a business alongside a job, time split between two cities. A fork at the very base, near the wrist, is the most common of all and is traditionally the gentlest reading.',
        ],
        bullets: [
          'Upper fork: two formative influences early in life.',
          'Middle fork: energy divided between two commitments or places.',
          'Lower fork (near the wrist): the classical travel or relocation fork.',
        ],
      },
      {
        heading: 'The travel fork: why the wrist split is so common',
        id: 'travel-fork',
        paragraphs: [
          'When the life line divides near the wrist and one branch drifts away from the thumb toward the outer edge of the palm — toward the Mount of Luna — traditional readers call it the travel or migration fork. It is read as a life lived partly away from where it began.',
          'In Indian palmistry this branch is often called the pardes rekha, the line of foreign land. Practically, readers interpret it as long-term relocation, work abroad, or an adult life spent at a distance from family roots. It is one of the most frequently seen markings on modern hands, which tells you something about how ordinary it is.',
        ],
        callout:
          'A branch sweeping toward the outer palm is read as expansion, not loss. The energy has not been cut — it has been redirected outward.',
      },
      {
        heading: 'Forks, breaks and overlaps are three different things',
        id: 'forks-vs-breaks',
        paragraphs: [
          'Most anxiety about the life line comes from confusing these three markings. A fork is one line becoming two, both continuing forward. A break is a genuine gap, where the line stops and nothing continues for a stretch. An overlap is a break where a second line begins before the first one ends, the two crossing past each other.',
          'Classical readings treat overlaps as the most reassuring of the three: a chapter closing while the next has already begun. Clean breaks are read as abrupt change — a sudden move, an illness, a rupture in circumstances — and readers look at whether the line resumes strongly afterwards. Depth and continuation after the event matter far more than the event mark itself.',
        ],
      },
      {
        heading: 'Depth, length and the curve around the thumb',
        id: 'depth-and-curve',
        paragraphs: [
          'Before reading any fork, traditional palmists read the line as a whole. A deep, clearly etched life line is read as steady physical energy. A fine or faint line is read as a more sensitive constitution, someone who needs to guard their reserves. A line that is chained or laddered in places is read as periods of scattered energy.',
          'The width of the curve matters too. A life line that sweeps wide, well out into the palm, is traditionally read as warmth, appetite for life and physical generosity. A line that hugs the thumb tightly is read as caution, a smaller circle, a preference for the familiar.',
          'And the length: in classical palmistry a short life line is never read as a short life. It is read as a life whose defining energy comes from elsewhere on the hand — often from a strong fate line or head line carrying the weight instead.',
        ],
        callout:
          'No serious palmistry tradition reads life span from the life line. Length is read as the span of one kind of energy, not the span of a life.',
      },
      {
        heading: 'How to read your own fork in five minutes',
        id: 'read-your-own',
        paragraphs: [
          'Use your dominant hand for what your life has actually become. Sit near a window, cup your hand very slightly so the lines fill, and look at the life line from wrist to index finger rather than at the fork alone.',
          'Ask four questions in order. Does the line run deep and unbroken before the fork? Where along the line does the fork begin? Does the branch head outward toward the palm edge or inward toward the thumb? And do both branches continue with real strength, or does one fade quickly?',
        ],
        bullets: [
          'Both branches strong: two genuine directions, both supported.',
          'One branch fading: a direction considered and set aside.',
          'Branch heading outward: the classical travel and expansion reading.',
          'Branch turning inward toward the thumb: a return to roots and family.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does a forked life line mean a short life?',
        a: 'No. Classical palmistry does not read life span from the life line at all. A fork is read as a division of direction or energy — two places, two commitments, a relocation — and the traditional texts treat the travel fork near the wrist as an ordinary, favourable marking.',
      },
      {
        q: 'What does it mean if my life line splits near the wrist?',
        a: 'A split near the wrist with one branch heading toward the outer edge of the palm is the travel or migration fork, called pardes rekha in Indian palmistry. It is read as a significant part of life spent away from where it began, through work, marriage or relocation.',
      },
      {
        q: 'Which hand should I check for my life line?',
        a: 'Read your dominant hand for the life you have actively built and your non-dominant hand for inherited tendencies and starting conditions. When the two differ, palmistry reads the gap as the distance between where you started and what you made of it.',
      },
      {
        q: 'Is a faint life line a bad sign?',
        a: 'It is read as a sensitive constitution rather than a weak one — someone whose energy is real but finite and best spent deliberately. Traditional readers pay more attention to whether the line is continuous than to how deeply it is etched.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── 2
  {
    slug: 'palm-reading-marriage-timing-compatibility',
    title: 'Palm Reading for Marriage Timing and Compatibility (Vivah Rekha)',
    metaTitle: 'Marriage Line in Palmistry: Timing & Compatibility (Vivah Rekha) | PalmMitra',
    metaDescription:
      'How the marriage line, heart line and Mount of Venus are read for relationship timing and compatibility in traditional palmistry — and how to compare two palms.',
    excerpt:
      'Where the marriage line sits, what its endings mean, and how two palms are traditionally read side by side for compatibility.',
    category: 'Marriage & Relationships',
    readTime: '9 min read',
    publishDate: '2026-09-25',
    cta: 'palmmatch',
    intro: [
      'Marriage is the question palmistry gets asked most often, and the one where the folk answers are least reliable. The short lines on the side of the palm below the little finger are not a countdown to a wedding date. Traditional Hast Rekha Shastra reads them alongside the heart line, the Mount of Venus and the fate line to describe how someone attaches — and when their circumstances are ready for it.',
      'This guide covers what the vivah rekha actually is, how timing is traditionally estimated, which markings are read as friction, and how two hands are compared when readers look at compatibility rather than one person alone.',
    ],
    sections: [
      {
        heading: 'Finding the marriage line on your own hand',
        id: 'finding-the-line',
        paragraphs: [
          'Hold your hand relaxed and look at the outer edge of the palm, in the small area between the base of the little finger and the heart line. Short horizontal lines running inward from that edge are the ones traditionally called marriage or union lines.',
          'Most people have more than one. Palmistry does not read each as a separate marriage. The clearest and longest is read as the defining attachment; the shorter ones are read as significant bonds that shaped you without necessarily becoming permanent. A hand with no visible line there is read as someone whose attachments are private and slow to surface, not someone destined to be alone.',
        ],
      },
      {
        heading: 'How timing is traditionally estimated',
        id: 'timing',
        paragraphs: [
          'The classical method divides the space between the heart line and the base of the little finger into thirds. A union line sitting low, close to the heart line, is read as an early attachment. One in the middle band is read as the mid-to-late twenties and early thirties. One sitting high, close to the finger base, is read as a later and usually more deliberate union.',
          'Serious readers treat this as a band of years, never a date. They then cross-check against the fate line, because palmistry reads marriage as partly circumstantial: a fate line that steadies or changes direction in the same period is read as the life conditions being ready. When the two disagree, the fate line is usually given more weight.',
        ],
        callout:
          'Any reading that gives you an exact year for marriage is inventing precision the tradition does not claim. The honest answer is always a window.',
      },
      {
        heading: 'What the ending of the line is read as',
        id: 'endings',
        paragraphs: [
          'The end of the union line carries most of its traditional meaning. A line that runs straight and clean is read as a steady bond. A line that curves gently upward toward the little finger is read as a relationship that lifts both people. A line that droops sharply downward toward the heart line is read as a bond that carries disappointment or a partner who leans heavily on the other.',
          'A forked ending is read as separation of path rather than of feeling — long-distance years, divided priorities, two lives running in parallel. A line crossed by a fine vertical bar is read as external interference: family pressure, distance, obligation from outside the relationship.',
        ],
        bullets: [
          'Straight and clear: steady, unremarkable in the best sense.',
          'Rising at the end: a bond that raises both people.',
          'Drooping sharply: imbalance, one partner carrying more.',
          'Forked: divided paths more than divided affection.',
          'Crossed by a bar: pressure arriving from outside the pair.',
        ],
      },
      {
        heading: 'The heart line tells you how someone loves',
        id: 'heart-line',
        paragraphs: [
          'Timing is the less interesting half of the question. How a person attaches is read from the heart line — the uppermost of the major lines, running across the palm below the fingers.',
          'A heart line ending high, under the index finger, is read as idealism in love: high standards, strong loyalty, slow to forgive. Ending under the middle finger, it is read as a more physical and immediate attachment. A long line running right across the palm is read as someone who gives themselves fully; a short one as someone whose love is intense but narrowly directed. A straight heart line is read as emotional reserve and steadiness, a deeply curved one as openness and visible feeling.',
        ],
      },
      {
        heading: 'How two palms are compared for compatibility',
        id: 'comparing-two-palms',
        paragraphs: [
          'Compatibility reading in palmistry is not a matter of adding two scores together. Readers look at four relationships between the hands rather than at each hand alone.',
          'First, the heart lines: whether both partners express feeling at a similar volume, or one is open while the other is reserved. Second, the head lines: whether both make decisions the same way, or one is deliberate while the other is instinctive. Third, the Mounts of Venus, the fleshy pad at the base of the thumb, read as warmth and physical affection — a marked difference here is read as a difference in how much closeness each person needs. Fourth, the fate lines, read for whether both lives are moving through the same kind of chapter at the same time.',
          'Difference is not read as incompatibility. A reserved straight heart line paired with a deeply curved one is a classical complement, as long as both people know which they are. What traditional readers treat as genuine friction is a mismatch in pace — one life settling while the other is still expanding.',
        ],
        callout:
          'Palmistry reads compatibility as rhythm, not similarity. Two people can differ in almost everything and still be read as well matched if their timing agrees.',
      },
    ],
    faqs: [
      {
        q: 'Can palmistry tell me the exact year I will marry?',
        a: 'No. Traditional palmistry estimates a band of years from where the union line sits between the heart line and the little finger, then cross-checks it against the fate line. Any reading offering a precise date is inventing certainty the tradition never claimed.',
      },
      {
        q: 'What if I have two or three marriage lines?',
        a: 'Multiple lines are common and are not read as multiple marriages. The clearest and longest is read as the defining attachment, and the shorter ones as bonds that mattered and shaped you without becoming permanent.',
      },
      {
        q: 'Does having no marriage line mean I will never marry?',
        a: 'No. An absent or very faint union line is read as someone whose attachments are private and slow to show on the hand. Readers then look to the heart line and Mount of Venus, which usually tell the fuller story.',
      },
      {
        q: 'How does palm reading compare two people for compatibility?',
        a: 'By reading four pairings across both hands: heart lines for emotional volume, head lines for decision style, Mounts of Venus for how much closeness each person needs, and fate lines for whether both lives are in the same kind of chapter at once.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── 3
  {
    slug: 'money-triangle-wealth-signs-palmistry',
    title: 'The Money Triangle and Other Wealth Signs in Palmistry (Dhan Yog)',
    metaTitle: 'Money Triangle in Palmistry: Wealth Signs & Dhan Yog Explained | PalmMitra',
    metaDescription:
      'The money triangle, the sun line, the mystic cross and the simian line — what traditional palmistry actually reads as signs of wealth, and how to find them.',
    excerpt:
      'Which markings traditional palmistry reads as wealth signs, where to find the money triangle on your own palm, and what each one is really saying.',
    category: 'Wealth & Career',
    readTime: '8 min read',
    publishDate: '2026-09-25',
    cta: 'upload',
    intro: [
      'Every palmistry tradition has markings associated with prosperity, and Hast Rekha Shastra has more than most. The best known is the money triangle — the closed triangle formed where the life line, the head line and the fate line meet. It is genuinely part of the classical system, and it is also the marking most often oversold online.',
      'Palmistry reads wealth markings as capacity and pattern: how money is likely to arrive, whether it stays, and what the hand is built to do with it. That is a more useful reading than a promise of riches, and it is closer to what the texts actually say.',
    ],
    sections: [
      {
        heading: 'Finding the money triangle on your palm',
        id: 'finding-the-triangle',
        paragraphs: [
          'Look for three lines in the middle of your palm: the life line curving around the thumb, the head line running horizontally across the centre, and the fate line rising vertically from near the wrist toward the middle finger. Where these three cross each other they sometimes enclose a triangle. That closed shape is the money or wealth triangle, traditionally associated with the Rahu region of the palm.',
          'The reading depends almost entirely on whether the triangle is closed. A fully closed triangle is read as money that accumulates and stays. A triangle with a gap at any corner is read as earning capacity with leakage — income arriving and dispersing. A large, clearly drawn triangle is read as a bigger capacity than a small cramped one.',
        ],
        callout:
          'The money triangle is read as retention, not income. A closed triangle is about what stays, not about what arrives.',
      },
      {
        heading: 'The sun line: recognition that converts into money',
        id: 'sun-line',
        paragraphs: [
          'The sun line, or Surya Rekha, is a vertical line rising toward the ring finger, on the Mount of Apollo. Classical palmistry reads it as reputation and visible success rather than as earnings directly — recognition, standing, the kind of name that brings opportunity.',
          'A long clear sun line is read as success that others can see and credit you for. A sun line that appears only in the upper palm is read as recognition arriving later, usually after the middle years. Several fine parallel sun lines are read as talent spread across a number of fields, with the caution that scattered effort delays the payoff.',
        ],
      },
      {
        heading: 'The fate line is the real career map',
        id: 'fate-line',
        paragraphs: [
          'If you only read one line for money, traditional palmistry says read the fate line — Bhagya Rekha. Where it begins is read as how a working life starts. Rising from the base of the life line, it is read as a career built on family support or family business. Rising independently from the wrist, it is read as a self-made path. Rising from the outer edge of the palm, it is read as a career shaped by other people — clients, patrons, the public.',
          'Changes of direction along the fate line are read as turning points, and the point where the fate line crosses the head line is the classical career-decision marker: the age at which thinking and circumstance meet and a real choice is made. Breaks are read as changes of field rather than as failure, especially where the line resumes strongly afterwards.',
        ],
        bullets: [
          'Fate line from the life line: family-backed start.',
          'Fate line rising alone from the wrist: self-made path.',
          'Fate line from the outer palm: a career made through other people.',
          'Fate line crossing the head line: the defining career decision.',
        ],
      },
      {
        heading: 'The simian line and other rare markings',
        id: 'simian-line',
        paragraphs: [
          'The simian line is a single crease running straight across the palm where the heart line and head line would normally sit separately. It is a real and uncommon formation, and palmistry reads it as unusual intensity: thinking and feeling fused, so that whatever the person commits to, they commit to completely.',
          'Traditional readers associate it with single-minded pursuit rather than with money itself. Directed at a craft or a business, that intensity is read as a strong wealth indicator. Undirected, it is read as difficulty letting go. It carries no shortage of folklore, most of it unfounded — treat it as a marker of intensity and nothing more.',
          'Two other markings recur in wealth readings. The mystic cross, a small cross between the head line and heart line, is read as intuition that guides decisions well. A trident at the end of the sun line — the line splitting into three near the ring finger — is one of the most favourable classical prosperity signs, read as success arriving through more than one channel at once.',
        ],
      },
      {
        heading: 'Reading the whole hand instead of hunting for signs',
        id: 'whole-hand',
        paragraphs: [
          'The mistake most people make is hunting for one lucky marking. Classical palmistry reads wealth as a combination: a firm Mount of Jupiter under the index finger for ambition, a well-formed Mount of Mercury under the little finger for commercial instinct, a clear head line for judgement, and a fate line that holds its direction through the middle years.',
          'A closed money triangle on a hand with a weak fate line and a chained head line is read very differently from the same triangle on a firm, decisive hand. The triangle describes retention; the rest of the hand decides whether there is anything to retain.',
        ],
        callout:
          'Nothing in palmistry is read in isolation. One favourable marking on an otherwise scattered hand is read as unrealised potential.',
      },
    ],
    faqs: [
      {
        q: 'Where exactly is the money triangle on the palm?',
        a: 'In the centre of the palm, formed where the life line, head line and fate line cross one another. When those three lines enclose a closed triangle, that shape is the money or wealth triangle of traditional palmistry.',
      },
      {
        q: 'What does an open or broken money triangle mean?',
        a: 'A triangle with a gap at any corner is read as earning capacity with leakage: money arrives but disperses. It is read as a pattern to manage rather than as a verdict on how much you can earn.',
      },
      {
        q: 'Is the simian line a sign of wealth?',
        a: 'Not directly. A simian line is read as thinking and feeling fused into unusual intensity. Pointed at a craft or a business that intensity is read as favourable for wealth; left undirected it is read as difficulty letting go.',
      },
      {
        q: 'Which single line is best for reading career and money?',
        a: 'The fate line, or Bhagya Rekha. Its origin is read as how a working life begins, its changes of direction as turning points, and its crossing with the head line as the defining career decision.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── 4
  {
    slug: 'heart-line-vs-head-line',
    title: 'Heart Line vs Head Line: Reading the Balance Between Feeling and Judgement',
    metaTitle: 'Heart Line vs Head Line in Palmistry: What Each Reveals | PalmMitra',
    metaDescription:
      'The two lines that shape every palm reading. How the heart line and head line are read separately, what their spacing means, and what happens when they conflict.',
    excerpt:
      'Almost every palm reading turns on these two lines. Here is what each one says, and what the space between them is read as.',
    category: 'Fundamentals',
    readTime: '7 min read',
    publishDate: '2026-09-25',
    cta: 'upload',
    intro: [
      'Two lines cross the upper half of every palm. The higher one, nearer the fingers, is the heart line — Hridaya Rekha. The one below it is the head line — Mastishk Rekha. Traditional palmistry reads almost everything about temperament from how these two compare: how someone feels, how they decide, and which of the two usually wins.',
      'This is the pairing to learn first. Once you can read these two lines and the space between them, the rest of the hand starts making sense.',
    ],
    sections: [
      {
        heading: 'Reading the heart line',
        id: 'heart-line',
        paragraphs: [
          'Trace the heart line from the outer edge of your palm, below the little finger, inward toward the index finger. Where it ends is its most important feature.',
          'Ending under the index finger is read as idealism — high standards in love and friendship, strong loyalty, slow forgiveness. Ending between the index and middle fingers is read as the balanced position: warm but realistic. Ending under the middle finger is read as immediate and physical attachment, quick to feel and quick to move on.',
          'The shape carries the rest. A deeply curved heart line is read as visible, expressive feeling. A straight one is read as reserve — real depth held privately. A chained or islanded heart line is read as emotional turbulence in the corresponding period rather than as a flaw in character.',
        ],
      },
      {
        heading: 'Reading the head line',
        id: 'head-line',
        paragraphs: [
          'The head line begins near the start of the life line, between thumb and index finger, and runs across the palm. Its slope is read as the style of thinking.',
          'A straight head line running level across the palm is read as practical, literal, factual thinking. A head line sloping gently down toward the Mount of Luna at the outer wrist is read as imagination and intuition. A steeply plunging head line is read as a strongly creative mind that needs anchoring.',
          'Length is read as breadth of consideration rather than as intelligence. A short head line is read as decisiveness — quick conclusions, low tolerance for deliberation. A long one crossing the whole palm is read as thoroughness, with overthinking as its cost.',
        ],
        bullets: [
          'Straight and level: practical, evidence-led thinking.',
          'Gently sloping: intuitive, imaginative, good instincts.',
          'Steeply sloping: strongly creative, needs grounding.',
          'Short: decisive and fast. Long: thorough and deliberate.',
        ],
      },
      {
        heading: 'The space between them is the real reading',
        id: 'the-space-between',
        paragraphs: [
          'Now look at the gap between the two lines. Palmistry reads it as how much room a person keeps between feeling and judgement.',
          'A wide space is read as openness and independence of mind — someone who says what they think and is not easily governed by others, sometimes at the cost of tact. A narrow space is read as caution and self-containment: feelings closely governed by thought, less spontaneity, more control. A very narrow gap is read as tension between the two, an inner argument that runs constantly.',
        ],
        callout:
          'Neither a wide nor a narrow gap is better. The reading is about which faculty the person defers to under pressure.',
      },
      {
        heading: 'When head and heart join or conflict',
        id: 'joined-or-conflicting',
        paragraphs: [
          'Sometimes the two lines begin joined and separate later. This is read as a cautious start in life — a person whose early decisions were made carefully, often under family influence, and whose independence arrived later. The point of separation is read as the age at which they began deciding for themselves.',
          'Where the two lines merge entirely into a single crease, that is the simian line: thinking and feeling fused, with no gap for deliberation. It is read as total commitment to whatever the person turns to.',
          'Where a branch of the heart line dips down to touch the head line, traditional readers call it a decision made with both — a relationship or a choice where feeling and judgement genuinely agreed. It is considered a favourable marking.',
        ],
      },
      {
        heading: 'Putting the two together',
        id: 'putting-together',
        paragraphs: [
          'The combinations are where the reading becomes specific. A deeply curved heart line with a straight practical head line is read as someone warm in private and businesslike in public. A straight heart line with a steeply sloping head line is read as the reverse: reserved in expression, richly imaginative inside.',
          'A short decisive head line with a long expressive heart line is read as someone who commits quickly and feels deeply — magnificent when the choice is right, costly when it is not. A long head line with a short heart line is read as someone who analyses everything and gives their affection to very few.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Which line is the heart line and which is the head line?',
        a: 'The heart line is the upper of the two, running across the palm just below the fingers. The head line is below it, starting near the life line between thumb and index finger and running across the centre of the palm.',
      },
      {
        q: 'What does a wide space between the heart and head line mean?',
        a: 'It is read as openness and independence of mind — someone candid and not easily governed by others, sometimes lacking tact. A narrow space is read as caution and tighter self-control.',
      },
      {
        q: 'Does a long head line mean high intelligence?',
        a: 'No. Palmistry reads head line length as breadth of consideration, not intelligence. A short line is read as decisiveness and a long one as thoroughness, with overthinking as its trade-off.',
      },
      {
        q: 'What does it mean when the head and heart lines are joined?',
        a: 'Lines that start joined and separate later are read as a cautious early life with independence arriving at the point of separation. Lines fused into one crease across the palm form the simian line, read as unusual single-minded intensity.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────── 5
  {
    slug: 'left-palm-vs-right-palm',
    title: 'Left Palm or Right Palm: Which Hand Should You Read?',
    metaTitle: 'Left Hand or Right Hand Palm Reading: Which Palm to Read | PalmMitra',
    metaDescription:
      'The simple rule that settles it: read your dominant hand for the life you have built and your non-dominant hand for what you were given. Plus what differences mean.',
    excerpt:
      'The most common question in palmistry, answered properly — including what it means when your two hands disagree.',
    category: 'Fundamentals',
    readTime: '6 min read',
    publishDate: '2026-09-25',
    cta: 'upload',
    intro: [
      'Before any reading can begin, this question has to be settled, and the internet answers it badly. You will find claims that women read the left hand and men the right, or that the left hand is the past and the right the future. Neither is what traditional palmistry says.',
      'The actual rule is about dominance, not gender, and it is refreshingly simple.',
    ],
    sections: [
      {
        heading: 'The rule: dominant and non-dominant',
        id: 'the-rule',
        paragraphs: [
          'Read your dominant hand — the one you write with — for the life you have actively made. It is read as choices, current direction, career, the present shape of things. This is the hand that changes over a lifetime, and the one a reader spends most time on.',
          'Read your non-dominant hand for what you were given: inherited temperament, family influence, natural potential, the starting conditions. It changes far less, and it is read as the blueprint rather than the building.',
          'That is the whole rule. For a right-handed person the right hand is active and the left is inherited. For a left-handed person it is exactly reversed. Nothing in classical palmistry assigns hands by gender.',
        ],
        callout:
          'Dominant hand: what you have made of your life. Non-dominant hand: what you started with. Dominance, never gender.',
      },
      {
        heading: 'Why the gender myth persists',
        id: 'gender-myth',
        paragraphs: [
          'The "left for women, right for men" rule comes from a folk simplification of older texts, not from Hast Rekha Shastra or the Samudrika Shastra tradition. Those texts already distinguish the active hand from the passive one, which makes a gender rule unnecessary.',
          'It survives because it is easy to remember and easy to apply without asking which hand someone writes with. It is also why two readings of the same person sometimes contradict each other outright — each reader looked at a different hand.',
        ],
      },
      {
        heading: 'What it means when your hands differ',
        id: 'when-hands-differ',
        paragraphs: [
          'Most people find real differences between their two palms, and this is where the tradition becomes genuinely interesting. The gap between the hands is read as the distance between where you started and what you have done with it.',
          'A stronger fate line on the dominant hand than the non-dominant is read as a self-made path — a working life built beyond what the family provided. A stronger heart line on the dominant hand is read as someone who learned to express feeling rather than inheriting the ability. A head line that has changed slope between the hands is read as a mind genuinely reshaped by experience.',
          'Very similar hands are read differently again: a life running close to its inherited pattern, often a family path continued. Neither is read as better. The dominant hand always describes the present reality.',
        ],
        bullets: [
          'Dominant fate line stronger: a self-made path.',
          'Dominant heart line stronger: emotional openness learned, not inherited.',
          'Head lines differ in slope: thinking reshaped by experience.',
          'Hands nearly identical: an inherited pattern closely followed.',
        ],
      },
      {
        heading: 'Photographing the right hand for a reading',
        id: 'photographing',
        paragraphs: [
          'If you are having one hand read, photograph the dominant one. Use daylight near a window rather than direct overhead light, which flattens the lines. Rest your hand against a plain background with the fingers slightly apart and cup the palm very slightly so the lines fill and darken.',
          'Include the whole palm from wrist crease to fingertips. Most unreadable photographs fail for one of three reasons: the wrist is cut off, so the life line and fate line origins are missing; the hand is stretched flat, so the lines flatten out; or a flash has washed out the fine secondary lines.',
        ],
        bullets: [
          'Daylight, not overhead light or flash.',
          'Whole palm in frame, wrist crease to fingertips.',
          'Fingers slightly apart, palm very slightly cupped.',
          'Plain background, hand steady, camera directly above.',
        ],
      },
      {
        heading: 'Should both hands be read?',
        id: 'both-hands',
        paragraphs: [
          'A full traditional reading uses both. The non-dominant hand establishes the starting conditions, and the dominant hand shows what was done with them. The comparison is often the most revealing part of the session.',
          'For a single reading, the dominant hand alone answers the questions people actually ask — about work, relationships and the years ahead — because those belong to the life being lived rather than the one inherited.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Which hand should be read in palmistry, left or right?',
        a: 'Your dominant hand — the one you write with — for the life you have actively built, and your non-dominant hand for inherited traits and starting conditions. The rule is based on dominance, never on gender.',
      },
      {
        q: 'Is it true that women read the left hand and men the right?',
        a: 'No. That is a folk simplification with no basis in the classical texts, which already distinguish the active hand from the passive one. Using it is why two readers can give the same person contradictory readings.',
      },
      {
        q: 'What does it mean if my two palms look very different?',
        a: 'The difference is read as the distance between what you inherited and what you made of it. A stronger fate line on the dominant hand, for example, is read as a self-made path rather than a family-given one.',
      },
      {
        q: 'How should I photograph my palm for a reading?',
        a: 'Use daylight near a window, include the whole palm from wrist crease to fingertips, keep fingers slightly apart and the palm very slightly cupped, and hold the camera directly above. Avoid flash, which washes out the finer lines.',
      },
    ],
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);

export const relatedGuides = (slug: string, count = 3) =>
  guides.filter((g) => g.slug !== slug).slice(0, count);
