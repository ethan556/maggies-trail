/** Gallery + gate corpus.
 *
 * The FIRST sample of a given type is that type's CANONICAL sample: reveal-ghost tests resolve a
 * type with `.find()`, so the canonical one is what they get. A type may carry further samples
 * when it has genuinely distinct MODES that render and grade differently — those exist so the
 * modes are visible in /dev/widgets and, more importantly, so the keyboard gate and the a11y
 * audit (both of which sweep every entry here) actually exercise them. Adding a mode without
 * adding its sample means the mode is never keyboard-tested. */
export const SAMPLES: unknown[] = [
  {
    type: "mcq",
    prompt: "Which one shows 2 groups of 5?",
    options: [
      { id: "a", label: "2 boxes with 5 pencils in each", correct: true, feedback: "Yes — 2 equal groups of 5." },
      { id: "b", label: "2 pencils and 5 pencils", feedback: "That mixes two different amounts. Equal groups hold the same amount each." },
      { id: "c", label: "5 boxes with 2 pencils in each", feedback: "That's 5 groups of 2 — same total, but the groups are flipped. Read it as groups first." }
    ]
  },
  {
    type: "numeric",
    prompt: "3 shelves hold 4 books each. How many books?",
    answer: 12,
    tolerance: 0,
    commonErrors: [{ value: 7, feedback: "7 comes from 3 + 4. You have 3 groups of 4 — count 4 three times." }],
    fallbackFeedback: "Picture the shelves: 4 books, 4 more, 4 more. Count them all."
  },
  {
    // Fraction-form entry: graded on the exact rational value with per-VALUE traps;
    // this one demands the MIXED form, so the right amount in improper form (3/2)
    // routes to formFeedback instead of success.
    type: "fractionEntry",
    prompt: "The temperature fell from 1/2 °C to −1 °C. Enter the CHANGE as a mixed number.",
    allowWhole: true,
    allowNegative: true,
    form: "mixed",
    answerSign: -1,
    answerWhole: 1,
    answerNum: 1,
    answerDen: 2,
    unit: "°C",
    formFeedback: "That's the right amount — now write it as a mixed number: whole degrees, plus the fraction left over.",
    commonEntries: [
      { sign: 1, whole: 1, num: 1, den: 2, feedback: "Right size, wrong direction — the temperature FELL, so the change is negative." },
      { sign: -1, whole: 0, num: 1, den: 2, feedback: "1/2 is only the drop to 0. It keeps falling another whole degree: −1 1/2 °C." }
    ],
    fallbackFeedback: "From 1/2 down to −1 is 1/2 to zero plus 1 more below: a change of −1 1/2 °C.",
    successFeedback: "Yes — a fall of 1 1/2 degrees is a change of −1 1/2 °C."
  },
  {
    // Place-aligned comparison: the model IS the place chart; a wrong symbol
    // lights the deciding place (error-driven teaching an option list can't do).
    type: "placeCompare",
    prompt: "Compare: 63 __ 38",
    left: "63",
    right: "38",
    answer: "gt",
    ltFeedback: "Check the tens: 6 tens is more than 3 tens, so 63 > 38.",
    eqFeedback: "They aren't equal: 63 has 6 tens and 38 has 3 tens, so 63 > 38.",
    successFeedback: "Yes — 6 tens is more than 3 tens, so 63 > 38."
  },
  {
    // placeCompare's sibling beyond the digit domain: signed values, fractions,
    // decimals, mixed-form pairs. Structural cards + relation slot; deliberately
    // no proportional bars (sized bars would print the answer by sight).
    type: "rationalCompare",
    prompt: "Compare: 3/4 __ 0.5",
    left: { num: 3, den: 4 },
    right: { value: "0.5" },
    answer: "gt",
    ltFeedback: "0.5 is one half — and 3/4 is three quarters, a quarter MORE than a half. Rewrite 0.5 as a fraction and compare.",
    eqFeedback: "Close, but not equal: 0.5 = 2/4, and 3/4 has one more quarter than that.",
    successFeedback: "Yes — 0.5 = 2/4, and 3/4 > 2/4."
  },
  {
    // Distance-from-zero made visible: each signed operand is a point on the line
    // with a bracket showing |value| as a length. Tap the one FARTHER from zero.
    type: "absValueLine",
    prompt: "Which is farther from zero: -4 or 3?",
    items: [
      { id: "a", value: -4, label: "-4" },
      { id: "b", value: 3, label: "3", feedback: "3 is the GREATER number, but distance ignores sign: |-4| = 4 > |3| = 3, so -4 is farther." }
    ],
    answerId: "a",
    equalLabel: "Same distance",
    equalFeedback: "|-4| = 4 and |3| = 3 differ. -4 is farther from zero.",
    missFeedback: "Distance from zero is the length of the bracket — compare the two brackets and tap the longer one.",
    successFeedback: "Right — |-4| = 4 beats |3| = 3, so -4 is farther from zero, even though -4 < 3 in value."
  },
  {
    type: "moneyBoard",
    prompt: "Build exactly 47¢.",
    targetCents: 47,
    tray: [
      { cents: 25, label: "quarter", max: 2 },
      { cents: 10, label: "dime", max: 4 },
      { cents: 5, label: "nickel", max: 4 },
      { cents: 1, label: "penny", max: 4 }
    ],
    showDollars: true,
    commonTotals: [{ cents: 4, feedback: "Four coins placed — but coins carry VALUES. A quarter alone is already 25¢." }],
    countFeedback: "That's 47 coins, not 47 cents — count the values, not the pieces.",
    lowFeedback: "Not there yet — add value.",
    highFeedback: "Over the mark — swap something big for something smaller.",
    successFeedback: "47¢ exactly: 25 + 10 + 10 + 1 + 1 — values, not coin counts."
  },
  {
    type: "moneyBoard",
    mode: "count",
    prompt: "How many cents is this collection?",
    show: [
      { cents: 25, label: "quarter", count: 2 },
      { cents: 10, label: "dime", count: 1 },
      { cents: 1, label: "penny", count: 3 }
    ],
    answerCents: 63,
    commonEntries: [
      { cents: 6, feedback: "That counts the COINS (2 + 1 + 3), not their values. 50 + 10 + 3 = 63." },
      { cents: 60, feedback: "Don't forget the pennies: 50 + 10 + 3 = 63." }
    ],
    fallbackFeedback: "Biggest coins first: 25 → 50 → 60 → 61 → 62 → 63.",
    successFeedback: "63¢ — quarters first, then down the line."
  },
  {
    type: "moneyBoard",
    mode: "change",
    prompt: "You buy a sticker for 65¢ and pay with a dollar. Build the change.",
    priceCents: 65,
    paidCents: 100,
    tray: [
      { cents: 25, label: "quarter", max: 3 },
      { cents: 10, label: "dime", max: 5 },
      { cents: 5, label: "nickel", max: 5 }
    ],
    commonTotals: [
      { cents: 65, feedback: "That's the PRICE rebuilt. The change is what's left of the dollar: 100 − 65 = 35¢." }
    ],
    lowFeedback: "Not enough change yet — the dollar hasn't been used up.",
    highFeedback: "Too much change — the store would lose money.",
    successFeedback: "35¢ back: 100 − 65, built as a quarter and a dime."
  },
  {
    type: "fractionGrid",
    prompt: "Build 2/3 × 4/5 on the unit square: rows make thirds, columns make fifths.",
    num1: 2,
    den1: 3,
    num2: 4,
    den2: 5,
    rowFeedback: "Rows carry the FIRST factor: partition into 3 rows and shade 2 of them.",
    colFeedback: "Rows are right — now the columns carry 4/5: partition into 5, shade 4.",
    commonBuilds: [
      { rows: 8, cols: 8, shadeR: 6, shadeC: 6, feedback: "You added the denominators. The square is cut BOTH ways — 3 rows AND 5 columns." }
    ],
    successFeedback: "The overlap covers 8 of 15 cells — the numerators multiplied AND the denominators multiplied, by construction."
  },
  {
    type: "fractionCompare",
    prompt: "Same-size bars. Tap the one showing more.",
    left: { num: 2, den: 3 },
    right: { num: 2, den: 8 },
    answer: "left",
    benchmark: 0.5,
    rightFeedback: "The big-number reflex — 8 means an 8-way cut, so each piece shrinks.",
    equalFeedback: "Only the COUNTS match. Two big pieces beat two slivers.",
    successFeedback: "Two third-pieces out-fill two eighth-pieces — piece size beats piece count."
  },
  {
    type: "mixedRegroup",
    prompt: "Convert 22/7 to a mixed number \u2014 make wholes until the leftover is smaller than one whole.",
    mode: "convert",
    den: 7,
    aWhole: 0,
    aNum: 22,
    targetForm: "mixed",
    commonResults: [
      { whole: 2, num: 8, feedback: "8/7 still has a whole hiding inside it \u2014 7 of those 8 parts make one more whole." },
      { whole: 0, num: 22, feedback: "22/7 is the value you started with \u2014 nothing has been exchanged yet. Every 7 parts make one whole." }
    ],
    fallbackFeedback: "Keep making wholes while 7 or more parts are left; stop when fewer than 7 remain.",
    successFeedback: "22/7 = 3 1/7 \u2014 three groups of 7 parts became 3 wholes, with 1 part left over."
  },
  {
    type: "columnCalc",
    prompt: "Work out 35 \u00d7 4, column by column. Tap each column to work it out; tap a carry to include it.",
    op: "multiply",
    a: 35,
    b: 4,
    commonResults: [
      { value: 120, feedback: "120 is what happens when the waiting carry never joins the tens \u2014 5\u00d74 makes 20, and that 2 belongs in the tens column." }
    ],
    fallbackFeedback: "Follow each column\u2019s work \u2014 the ones make 20, so a 2 waits for the tens.",
    successFeedback: "35 \u00d7 4 = 140: the ones make 20, write 0 carry 2, and the tens make 12 + 2 = 14."
  },
  {
    type: "slopeTriangle",
    prompt: "Build the slope triangle so the line through A also passes through B.",
    ax: 2,
    ay: 1,
    bx: 6,
    by: 9,
    runStart: 1,
    riseStart: 0,
    gridMax: 10,
    legMax: 8,
    commonPairs: [
      { run: 2, rise: 1, feedback: "A run of 2 and a rise of 1 is slope 1/2 \u2014 the legs are the right sizes but the wrong way round. Slope counts the VERTICAL change first." }
    ],
    fallbackFeedback: "From A to B the line travels 4 across and 8 up, so every triangle on it has rise \u00f7 run = 8 \u00f7 4 = 2.",
    successFeedback: "The line passes through B \u2014 and any triangle with the same ratio (1 and 2, 2 and 4, 4 and 8) sits on the very same line. That constant ratio IS the slope."
  },
  {
    type: "graphRead",
    mode: "picture",
    prompt: "The picture graph shows Monday's votes. How many is that?",
    drawn: 4,
    unitValue: 1,
    categoryLabel: "Monday",
    unitNoun: "vote",
    unitNounPlural: "votes",
    scaleMax: 12,
    icon: "\ud83c\udf4e",
    commonResults: [],
    fallbackFeedback: "Count the pictures one at a time: 4 pictures, each worth 1 vote, is 4 votes.",
    successFeedback: "4 votes \u2014 one picture, one vote, counted straight across."
  },
  {
    type: "graphRead",
    mode: "bar",
    prompt: "The bar reaches up the scale. How many is that?",
    drawn: 6,
    unitValue: 1,
    categoryLabel: "Blue",
    unitNoun: "cookie",
    unitNounPlural: "cookies",
    scaleMax: 10,
    commonResults: [],
    fallbackFeedback: "Follow the top of the bar across to the scale: it lands on 6.",
    successFeedback: "6 \u2014 read straight across from the top of the bar to the number beside it."
  },
  {
    type: "unitChain",
    prompt: "3 km = ? m. Cross the chain — the bar never changes, only how it is counted.",
    startValue: 3,
    startUnit: "km",
    targetUnit: "m",
    hops: [{ from: "km", to: "m", bigger: "from", factor: 1000 }],
    commonResults: [],
    fallbackFeedback: "A kilometer holds 1000 meters, so counting the same bar in meters needs MORE of them: 3 × 1000 = 3000 m.",
    successFeedback: "3000 m — the bar never moved. A smaller counting unit needs a bigger number for the same quantity."
  },
  {
    type: "unitChain",
    prompt: "3 yd = ? in — two crossings through feet.",
    startValue: 3,
    startUnit: "yd",
    targetUnit: "in",
    hops: [
      { from: "yd", to: "ft", bigger: "from", factor: 3 },
      { from: "ft", to: "in", bigger: "from", factor: 12 }
    ],
    commonResults: [],
    fallbackFeedback: "Chain both rungs: 3 × 3 = 9 ft, then 9 × 12 = 108 in.",
    successFeedback: "108 in — chained factors multiply: 3 × 12 = 36 inches in every yard."
  },
  {
    type: "evalOrder",
    prompt: "Work out 2 + 3 × 4 — tap one operator at a time.",
    tokens: ["2", "+", "3", "×", "4"],
    target: 14,
    commonResults: [
      { value: 20, feedback: "20 collapses left to right (2 + 3 first). × binds tighter than +, so 3 × 4 goes first: 2 + 12 = 14." }
    ],
    fallbackFeedback: "Multiplication and division go before addition and subtraction: 3 × 4 = 12, then 2 + 12 = 14.",
    successFeedback: "Right — × went first, so 2 + 3 × 4 = 2 + 12 = 14."
  },
  {
    type: "oddEvenPairs",
    prompt: "Pair up 7 chips. Odd or even?",
    n: 7,
    mode: "pair",
    answer: "odd",
    evenFeedback: "One chip has no partner — that leftover is exactly what odd means.",
    successFeedback: "Three pairs and one left over: 7 is odd."
  },
  {
    type: "pointEntry",
    prompt: "Where does the point land? Enter (x, y).",
    answer: [-2, 3],
    delimiter: "paren",
    commonEntries: [
      { values: [3, -2], feedback: "The coordinates are swapped — x comes first, then y." },
      { values: [2, 3], feedback: "Check the x-sign: it moved LEFT, so x is negative." }
    ],
    fallbackFeedback: "Read the x-move (left/right) and the y-move (up/down) separately.",
    successFeedback: "Yes — x left to −2, y up to 3."
  },
  {
    type: "slider",
    prompt: "Make 12 wheels using cars (4 wheels each).",
    min: 1,
    max: 6,
    start: 1,
    target: 3,
    visual: "groups",
    groupSize: 4,
    itemEmoji: "⚙️",
    unitLabel: "wheels in all",
    lowFeedback: "Each new car brings 4 more wheels — slide up.",
    highFeedback: "Over 12 now — each car you remove takes 4 wheels away.",
    successFeedback: "3 cars × 4 wheels = 12. Multiplied!"
  },
  {
    type: "lineExplore",
    prompt: "Drag the two sliders to build the line y = 2x − 1.",
    targetSlope: 2,
    targetIntercept: -1,
    slopeMin: -4,
    slopeMax: 4,
    interceptMin: -5,
    interceptMax: 5,
    slopeStart: 0,
    interceptStart: 0,
    gridMax: 6,
    successFeedback: "That's it — slope 2 means up 2 for every 1 across, and the line crosses the y-axis at −1.",
    slopeFeedback: "Watch the steepness: slope is how far the line rises for each step right. The rise/run triangle should read 2 over 1.",
    interceptFeedback: "Slope is right — now slide b until the line crosses the y-axis at the target height."
  },
  {
    type: "fractionBar",
    prompt: "Slide numerator and denominator to build a fraction equal to 1/2.",
    targetNum: 1,
    targetDen: 2,
    numMin: 1,
    numMax: 12,
    denMin: 1,
    denMax: 12,
    numStart: 1,
    denStart: 1,
    successFeedback: "Equal! The numbers differ but the shaded length matches 1/2 exactly — that's an equivalent fraction.",
    lowFeedback: "Your bar is shorter than half. Shade more of it — raise the numerator, or use fewer parts.",
    highFeedback: "Your bar is longer than half. Shade less — lower the numerator, or split into more parts."
  },
  {
    // Per-value traps + part-language: a Grade-1 partition item — numerator pinned
    // (numMin === numMax hides its slider), the target bar hidden (the prompt names
    // it), the readout speaking "1 of 2 equal parts" instead of notation.
    type: "fractionBar",
    notation: "words",
    showTarget: false,
    prompt: "Split the bar into equal parts so each part is a half.",
    targetNum: 1,
    targetDen: 2,
    numMin: 1,
    numMax: 1,
    denMin: 1,
    denMax: 6,
    numStart: 1,
    denStart: 1,
    commonFractions: [
      { num: 1, den: 4, feedback: "Splitting into 4 equal parts makes fourths, not halves — a half needs exactly 2 equal parts." },
      { num: 1, den: 1, feedback: "One part is the WHOLE bar, not a half — split it into 2 equal parts." }
    ],
    successFeedback: "Yes — 2 equal parts, and each one is a half.",
    lowFeedback: "Each of your parts is smaller than a half — you split the bar into too many pieces.",
    highFeedback: "Each of your parts is bigger than a half — split the bar into more pieces."
  },
  {
    type: "quadraticExplore",
    prompt: "Drag a, h, and k to match y = 2(x − 1)² − 2.",
    targetA: 2,
    targetH: 1,
    targetK: -2,
    aMin: -3,
    aMax: 3,
    hMin: -5,
    hMax: 5,
    kMin: -5,
    kMax: 5,
    aStart: 1,
    hStart: 0,
    kStart: 0,
    gridMax: 7,
    successFeedback: "Matched — a = 2 narrows the U and keeps it opening up, and the vertex sits at (1, −2).",
    shapeFeedback: "Watch the width and direction: a controls how narrow the U is and whether it opens up or down. Set a first.",
    vertexFeedback: "The shape is right — now move the vertex. h slides it left/right and k up/down, to reach (1, −2)."
  },
  {
    type: "unitCircleExplore",
    prompt: "Drag the angle to 60° and read the coordinates.",
    targetAngle: 60,
    angleStart: 0,
    angleStep: 15,
    successFeedback: "There it is — at 60° the point is (cos 60°, sin 60°) ≈ (0.5, 0.866). The legs of the triangle ARE the coordinates.",
    lowFeedback: "Not far enough — keep rotating counterclockwise toward 60°. Watch cos shrink and sin grow as you climb.",
    highFeedback: "You've swung past 60° — rotate back clockwise. Notice how both coordinates change with the angle."
  },
  {
    type: "systemsExplore",
    prompt: "Place the point where both lines cross — that's the solution.",
    m1: 1,
    b1: 1,
    m2: -1,
    b2: 5,
    xMin: 0,
    xMax: 6,
    yMin: 0,
    yMax: 7,
    xStart: 0,
    yStart: 0,
    successFeedback: "That's the solution — (2, 3) is the one point sitting on BOTH lines, so it satisfies both equations at once.",
    offLine1Feedback: "Your point isn't on the blue line yet (y = x + 1). A solution has to lie on both lines.",
    offLine2Feedback: "On the blue line, but not the orange one (y = −x + 5). The solution is the single point on both."
  },
  {
    type: "numberLinePlace",
    prompt: "Slide the marker to −3 on the number line.",
    min: -10,
    max: 10,
    step: 1,
    tickStep: 1,
    target: -3,
    start: 0,
    successFeedback: "That's −3 — three steps to the LEFT of zero, the opposite of +3.",
    lowFeedback: "You're to the left of −3 (too far down). Slide right, back toward zero.",
    highFeedback: "You're to the right of −3. Slide left, further from zero into the negatives."
  },
  {
    // Fraction line: jump units 0..4 rendered as 0..1, interior ticks unlabeled,
    // positional readout ("mark 1 of 4"), per-value landings diagnosed first.
    type: "numberLinePlace",
    prompt: "The line from 0 to 1 is split into 4 equal jumps. Place the marker at 1/4.",
    min: 0,
    max: 4,
    step: 1,
    tickStep: 1,
    fractionDen: 4,
    target: 1,
    start: 0,
    commonPlacements: [
      { value: 4, feedback: "That's the fourth mark — 4 of 4 jumps is the WHOLE line, which is 1, not 1/4." },
      { value: 3, feedback: "Three jumps of the four is 3/4. One-fourth is just ONE jump from 0." }
    ],
    successFeedback: "Yes — one jump of the four equal jumps lands on 1/4.",
    lowFeedback: "You're at 0 — take one jump to the right to reach 1/4.",
    highFeedback: "Too many jumps — 1/4 is only ONE of the four equal jumps from 0."
  },
  {
    type: "functionMachine",
    prompt: "Feed the machine an input that makes the output 13.",
    a: 2,
    b: 1,
    inputMin: 0,
    inputMax: 10,
    inputStep: 1,
    inputStart: 0,
    targetOutput: 13,
    successFeedback: "Input 6 → 2 × 6 + 1 = 13. One input, one output — that's a function.",
    lowFeedback: "The output is below 13 — the machine needs a larger input to reach it.",
    highFeedback: "The output overshoots 13 — try a smaller input."
  },
  {
    type: "graphRead",
    prompt: "Read the tally chart: how many votes did Monday get?",
    mode: "tally",
    drawn: 12,
    unitValue: 1,
    categoryLabel: "Monday",
    unitNoun: "vote",
    unitNounPlural: "votes",
    scaleMax: 15,
    icon: "●",
    commonResults: [
      { value: 10, feedback: "That counts only the two five-groups. Two extra single marks follow them — count on: 5, 10, 11, 12." },
      { value: 3, feedback: "That counts the visual clusters, not the marks. Each crossed group holds FIVE marks; then add the singles." }
    ],
    fallbackFeedback: "Count the crossed five-groups by fives, then count on by ones for the single marks.",
    successFeedback: "Two five-groups and two singles: 5, 10, 11, 12 votes."
  },
  {
    type: "probabilityArea",
    prompt: "Shade the grid so it shows a probability of 1/2.",
    rows: 2,
    cols: 3,
    targetNum: 1,
    targetDen: 2,
    start: 0,
    successFeedback: "Half the grid is shaded — 3 of 6 cells, an area that means a probability of 1/2.",
    lowFeedback: "Too little shaded — that area is smaller than half. Shade more cells.",
    highFeedback: "Too much shaded — that area is more than half. Shade fewer cells."
  },
  {
    type: "hundredthsGrid",
    prompt: "Shade the grid to show 0.37.",
    mode: "hundredths",
    target: 37,
    prefilled: 0,
    showDecimal: true,
    commonCounts: [
      { count: 3, feedback: "That shades 3 hundredths — 0.03. In 0.37, the 3 sits in the tenths place, so it is worth 3 whole columns of the grid." },
      { count: 73, feedback: "That shades 73 hundredths — 0.73, the digits swapped. Read 0.37 place by place: 3 tenths first, then 7 hundredths." }
    ],
    successFeedback: "Exactly 37 of the 100 cells — three full columns and seven more, which is 3 tenths and 7 hundredths: 0.37.",
    lowFeedback: "That count is smaller than 0.37 of the square. Fill whole columns for the tenths digit first, then single cells for the hundredths.",
    highFeedback: "That count is larger than 0.37 of the square. Each full column is one tenth; 0.37 needs three columns plus seven single cells."
  },
  {
    type: "transformExplore",
    prompt: "Flip and slide the red shape onto the dashed target.",
    shape: [
      [1, 1],
      [3, 1],
      [1, 3]
    ],
    target: [
      [-1, 3],
      [-3, 3],
      [-1, 5]
    ],
    gridMin: -6,
    gridMax: 6,
    dxMin: -6,
    dxMax: 6,
    dyMin: -6,
    dyMax: 6,
    allowReflect: true,
    successFeedback: "Reflected over the y-axis and slid up 2 — the image lands exactly on the target.",
    offsetFeedback: "The flip is right, but it's not in the right spot yet. Adjust the slide (dx, dy).",
    reflectFeedback: "The orientation is off — this target is a mirror image. Try a reflection first, then slide."
  },
  {
    type: "angleMeasure",
    prompt: "Open the two rays to make a 60° angle.",
    targetAngle: 60,
    angleStart: 0,
    angleStep: 5,
    successFeedback: "60° — an acute angle, a third of the way to a straight line.",
    lowFeedback: "The opening is still narrower than 60°. Swing the ray up to widen it.",
    highFeedback: "You've opened past 60°. Bring the ray back down to narrow it."
  },
  {
    type: "rotationLab",
    mode: "coordinateRule",
    prompt: "Turn the point a half turn about the origin and read its image.",
    point: [3, 5] as [number, number],
    centre: [0, 0] as [number, number],
    targetAngle: 180,
    angleStart: 0,
    angleStep: 90,
    gridMax: 8,
    commonTurns: [{ angle: 90, feedback: "A quarter turn sends (3, 5) to (-5, 3) — both coordinates moved, but this is not yet the half turn." }],
    successFeedback: "A half turn sends (3, 5) to (-3, -5): both coordinates flip sign, which is the 180 degree rule read off the picture.",
    lowFeedback: "Not far enough round — keep turning counterclockwise.",
    highFeedback: "Past the half turn — ease back to 180 degrees."
  },
  {
    type: "rotationLab",
    mode: "symmetryOrder",
    prompt: "Find the smallest turn that lands the square back on itself.",
    shape: [[2, 2], [-2, 2], [-2, -2], [2, -2]] as Array<[number, number]>,
    centre: [0, 0] as [number, number],
    targetAngle: 90,
    angleStart: 0,
    angleStep: 15,
    gridMax: 6,
    commonTurns: [{ angle: 180, feedback: "A half turn does land the square on itself, but it is not the SMALLEST such turn." }],
    successFeedback: "90 degrees, so the order is 360 / 90 = 4. Order and angle are one fact read two ways.",
    lowFeedback: "Not yet on itself — the corners have not reached the next corner's place.",
    highFeedback: "Past the smallest matching turn — a smaller one already works."
  },
  {
    type: "dilationExplore",
    prompt: "Dilate the triangle by a scale factor of 2 from the origin.",
    shape: [
      [1, 1],
      [2, 1],
      [1, 3]
    ],
    center: [0, 0],
    targetK: 2,
    kMin: 0.5,
    kMax: 3,
    kStep: 0.5,
    kStart: 1,
    gridMin: 0,
    gridMax: 7,
    successFeedback: "k = 2 doubles every distance from the center — the image is twice as large, same shape.",
    lowFeedback: "The image is smaller than the target. A larger k pushes each point further from the center.",
    highFeedback: "The image is bigger than the target. A smaller k pulls each point back toward the center."
  },
  {
    type: "barBuilder",
    prompt: "Build the bar graph so it matches the data: Mon 15, Tue 25, Wed 10.",
    categories: ["Mon", "Tue", "Wed"],
    target: [15, 25, 10],
    maxVal: 30,
    step: 5,
    successFeedback: "Every bar matches the data — heights of 15, 25, and 10 on a scale that counts by 5.",
    partialFeedback: "Some bars don't match the data yet. Read each value off the by-5 scale and adjust."
  },
  {
    type: "dotPlot",
    prompt: "Build the dot plot: 2 students have 1 pet, 4 have 2, 3 have 3, 1 has 4.",
    values: [1, 2, 3, 4],
    target: [2, 4, 3, 1],
    maxPerValue: 6,
    successFeedback: "Every stack matches — the tallest column at 2 pets shows that's the most common answer.",
    partialFeedback: "Some stacks are the wrong height. Each dot is one student — count them off the data."
  },
  {
    type: "dotPlot",
    prompt: "How many ribbons measured 1/2 foot? Tap each X you count.",
    values: [1, 2, 3, 4],
    denominator: 4,
    given: [2, 3, 1, 2],
    target: [2, 3, 1, 2],
    askIndex: 1,
    maxPerValue: 6,
    successFeedback: "3 — you counted every X above 1/2 and nothing else.",
    partialFeedback: "Count only the stack above 1/2 — every X in it, and no X outside it."
  },
  {
    type: "barBuilder",
    prompt: "Build the histogram of minutes read: 0–9 has 2, 10–19 has 5, 20–29 has 6, 30–39 has 3.",
    categories: ["0–9", "10–19", "20–29", "30–39"],
    target: [2, 5, 6, 3],
    maxVal: 8,
    step: 1,
    histogram: true,
    axisLabel: "minutes read",
    successFeedback: "That's the histogram — bars touch because the bins are continuous ranges, not separate categories.",
    partialFeedback: "Some bins are the wrong height. Each bar counts how many readers fall inside that range."
  },
  {
    type: "barBuilder",
    prompt: "Make a tally mark for each vote: Cats 7, Dogs 4, Fish 2.",
    categories: ["Cats", "Dogs", "Fish"],
    target: [7, 4, 2],
    maxVal: 10,
    step: 1,
    histogram: false,
    display: "tally",
    icon: "●",
    successFeedback: "Every category matches its count — one five-group and two singles for Cats, four singles for Dogs, two for Fish.",
    partialFeedback: "Compare each row's marks against its vote count — a five-group counts five at once."
  },
  {
    type: "doubleNumberLine",
    prompt: "3 apples cost $2. Set the price at 6 apples.",
    topLabel: "dollars",
    bottomLabel: "apples",
    topPerStep: 2,
    bottomPerStep: 3,
    steps: 4,
    askAtStep: 2,
    targetTop: 4,
    topMax: 10,
    topStep: 1,
    successFeedback: "6 apples cost $4 — doubling the apples doubles the price, because the two lines move in step.",
    lowFeedback: "Too low. Both lines scale together: if apples double from 3 to 6, the dollars double too.",
    highFeedback: "Too high. Compare with the tick before it — each step adds the same amount to both lines."
  },
  {
    type: "doubleNumberLine",
    denom: 4,
    prompt: "The bottom line is in quarter-hours. Set the top line's value at a full hour.",
    topLabel: "miles",
    bottomLabel: "hours",
    topPerStep: 2,
    bottomPerStep: 1,
    steps: 5,
    askAtStep: 4,
    targetTop: 8,
    topMax: 16,
    topStep: 1,
    successFeedback: "8 miles at 1 hour \u2014 the quarter-hour ticks read 1/4, 1/2, 3/4, 1, exactly, never as decimals.",
    lowFeedback: "Too low \u2014 a full hour is four quarter-hours further along.",
    highFeedback: "Too high \u2014 compare with the 3/4-hour tick before it."
  },
  {
    type: "scatterFit",
    prompt: "Drag the line until it follows the points' trend.",
    points: [
      [1, 3],
      [2, 4],
      [3, 6],
      [4, 7],
      [5, 9],
      [6, 10]
    ],
    xMin: 0,
    xMax: 7,
    yMin: 0,
    yMax: 12,
    mMin: -2,
    mMax: 3,
    mStep: 0.5,
    bMin: 0,
    bMax: 8,
    bStep: 1,
    mStart: 0,
    bStart: 6,
    tolerance: 0.35,
    successFeedback: "That line follows the trend — the red gaps (the residuals) are as small as they get.",
    slopeFeedback: "The tilt is off. No matter how you raise or lower this line, it can't hug the points — change the slope first.",
    offsetFeedback: "The tilt looks right, but the line sits too high or too low. Adjust the intercept to slide it onto the points."
  },
  {
    type: "fractionOfSet",
    prompt: "Choose 3/4 of the 12 counters.",
    setSize: 12,
    num: 3,
    den: 4,
    groupsHint: true,
    successFeedback: "9 counters — split 12 into 4 equal groups of 3, then take 3 of those groups.",
    lowFeedback: "Not enough yet. Split the 12 into 4 equal groups, then take three of them.",
    highFeedback: "That's too many. Each of the 4 equal groups holds 3 counters — you need three groups, not more."
  },
  {
    type: "percentBar",
    prompt: "Fill the bar to 25% and read the amount.",
    whole: 80,
    targetPercent: 25,
    percentStep: 5,
    startPercent: 0,
    unit: "points",
    successFeedback: "25% of 80 is 20 — a quarter of the bar, a quarter of the whole.",
    lowFeedback: "Not filled far enough. A quarter of the bar is the first of the four marked sections.",
    highFeedback: "Filled too far — that's past a quarter of the bar."
  },
  {
    type: "integerChips",
    prompt: "Build a sum of −3 using chips.",
    target: -3,
    maxPos: 10,
    maxNeg: 10,
    posStart: 0,
    negStart: 0,
    successFeedback: "That makes −3 — every + and − pair cancels to zero, and the leftover negatives are the answer.",
    lowFeedback: "Your total is below −3. Remove some negatives, or add positives to cancel them.",
    highFeedback: "Your total is above −3. Add more negatives, or remove some positives."
  },
  {
    type: "volumeBuilder",
    prompt: "Stack cubes to build a volume of 24 cubic units.",
    targetVolume: 24,
    lMax: 6,
    wMax: 6,
    hMax: 6,
    lStart: 1,
    wStart: 1,
    hStart: 1,
    successFeedback: "24 cubes — length × width × height counts every cube in the box.",
    lowFeedback: "Fewer than 24 cubes. Stretch a dimension to add more layers or rows.",
    highFeedback: "More than 24 cubes. Shrink a dimension to remove some."
  },
  {
    type: "netFold",
    prompt: "Set the prism so its net's total area is 52 square units.",
    targetSurfaceArea: 52,
    lMax: 6,
    wMax: 6,
    hMax: 6,
    lStart: 1,
    wStart: 1,
    hStart: 1,
    successFeedback: "52 square units — the net lays all six faces flat, and their areas add to the surface area.",
    lowFeedback: "The faces don't add to 52 yet — the net is too small. Enlarge a dimension.",
    highFeedback: "The faces add to more than 52. Shrink a dimension."
  },
  {
    type: "ratioTable",
    prompt: "3 cups serve 2 people. Fill in the people for 12 cups.",
    colA: "cups",
    colB: "people",
    rows: [
      [3, 2],
      [6, 4]
    ],
    askA: 12,
    targetB: 8,
    bMax: 16,
    bStep: 1,
    bStart: 0,
    successFeedback: "12 cups serve 8 people — 12 is 4 times 3, so the people multiply by 4 as well.",
    lowFeedback: "Too few. Whatever you multiply the cups by, multiply the people by the same amount.",
    highFeedback: "Too many. 12 cups is 4 times the 3-cup row, so scale the people by 4, not more."
  },
  {
    type: "ratioTable",
    denom: 4,
    prompt: "Each row is a quarter-hour further on. Fill in the distance at a full hour, keeping the ratio.",
    colA: "time (hours)",
    colB: "distance (miles)",
    rows: [
      [1, 2],
      [2, 4]
    ],
    askA: 4,
    targetB: 8,
    bMax: 16,
    bStep: 1,
    bStart: 0,
    successFeedback: "2 miles per hour \u2014 1/4 \u2192 1/2, 1/2 \u2192 1, and a full hour \u2192 2. Fourths stayed exact the whole way.",
    lowFeedback: "Too short. A whole hour is four quarter-hours.",
    highFeedback: "Too far \u2014 compare against the 1/2 \u2192 1 row above."
  },
  {
    type: "elapsedTime",
    prompt: "The film starts at 2:15. Set how long it runs to reach a 3:00 finish.",
    startHour: 2,
    startMinute: 15,
    targetMinutes: 45,
    minuteStep: 5,
    maxMinutes: 120,
    startElapsed: 0,
    successFeedback: "45 minutes — from 2:15, three quarter-hours brings the clock to 3:00.",
    lowFeedback: "Not enough time has passed — the finish clock hasn't reached 3:00 yet.",
    highFeedback: "Too much time — the finish clock has run past 3:00."
  },
  {
    type: "distanceGrid",
    prompt: "Move the point to (6, 6) and read the distance from (2, 3).",
    anchor: [2, 3],
    targetPoint: [6, 6],
    gridMin: 0,
    gridMax: 8,
    startX: 2,
    startY: 3,
    successFeedback: "Across 4, up 3, so the distance is √(4² + 3²) = √25 = 5 — the hypotenuse of a right triangle.",
    wrongPointFeedback: "Not at (6, 6) yet. Watch the two legs: the across-gap and the up-gap are what get squared."
  },
  {
    type: "treeDiagram",
    prompt: "3 shirts and 4 hats. Set the branches to show every outfit.",
    stage1Label: "shirts",
    stage2Label: "hats",
    targetA: 3,
    targetB: 4,
    maxA: 6,
    maxB: 6,
    aStart: 1,
    bStart: 1,
    successFeedback: "12 endings — every shirt branch splits into 4 hats, so the totals multiply: 3 × 4 = 12.",
    lowFeedback: "Fewer endings than there are outfits. Add branches until each shirt fans into every hat.",
    highFeedback: "More endings than there are outfits — that's more branches than the problem describes."
  },
  {
    type: "sampleSim",
    prompt: "60% of the town really does support the plan. Poll a random handful and see what your poll says. Find the sample size that pins the answer down.",
    populationP: 0.6,
    sizes: [10, 40, 100],
    targetSize: 100,
    requiredDraws: 20,
    seed: 7,
    successFeedback: "At n = 100 nearly every poll lands within a few points of 60% — the pile is narrow. The truth never moved; only the wobble of your estimate did.",
    wrongSizeFeedback: "Look at the width of the pile at this size: polls scatter a long way from 60%. Try the largest sample and watch the pile tighten.",
    moreDrawsFeedback: "A handful of polls cannot show you the shape. Run more of them — the pile only becomes a distribution once it has a crowd in it."
  },
  {
    type: "ciCapture",
    prompt: "Each bar is one poll's interval. The dashed line is the truth. Find the width at which about 19 bars in 20 reach across it.",
    populationP: 0.6,
    sampleSize: 50,
    levels: [80, 95, 99],
    targetLevel: 95,
    requiredIntervals: 20,
    seed: 11,
    successFeedback: "At 95%, about 19 in 20 bars reach the truth. That is what the number counts: the long-run hit rate of the METHOD, not the chance that any one bar is lucky.",
    wrongLevelFeedback: "Count the misses at this width. Narrow bars miss too often; very wide bars almost never miss but say almost nothing. The 95% setting is the one that misses about 1 time in 20.",
    moreIntervalsFeedback: "A few bars cannot show a hit rate. Add more — a 95% claim is a statement about many intervals, so you need many to see it."
  },
  {
    type: "shuffleTest",
    prompt: "The new method scored higher. Relabel the same scores at random, over and over, to see what gaps pure chance produces — then judge the real one.",
    groupALabel: "new method",
    groupBLabel: "old method",
    groupA: [7, 8, 9, 9, 10, 11],
    groupB: [3, 4, 4, 5, 6, 6],
    requiredShuffles: 20,
    targetVerdict: "real",
    seed: 5,
    successFeedback: "Chance almost never manufactures a gap that big out of these same scores, so the gap is evidence of a real difference rather than a fluke of who landed in which group.",
    moreShufflesFeedback: "One or two relabellings prove nothing. Build the pile first — you cannot say a gap is unusual until you have seen what usual looks like.",
    wrongVerdictFeedback: "Compare the observed line with the pile: hardly any random relabelling reaches it. A gap that chance almost never produces is exactly what 'more than chance' means."
  },
  {
    type: "slopeField",
    prompt: "dy/dx = 1.8y(1 − y/4) — a population with a ceiling. Drag the starting value to the one place where the curve NEVER MOVES.",
    equation: "logistic",
    targetY0: 4,
    startY0: 1,
    successFeedback: "y = 4 — and look at the field: every segment along that line is FLAT. This is not a curve that happens to be constant; it is the one curve the instructions forbid from going anywhere. It is an equilibrium, and it is the carrying capacity. Now drag away from it and watch: whether you start below or above, the curve runs straight back to 4.",
    lowFeedback: "Below the flat line. Your curve is climbing — the field is pushing it upward, toward something.",
    highFeedback: "Above the flat line. Your curve is falling — the field is pushing it back DOWN toward the same place."
  },
  {
    type: "taylorApprox",
    prompt: "eˣ against its Taylor polynomial. Add terms until the polynomial is within 0.01 of e at x = 1 — and use the FEWEST terms that will do it.",
    fn: "exp",
    mode: "terms",
    atX: 1,
    tolerance: 0.01,
    targetN: 4,
    nStart: 0,
    targetXTenths: 10,
    xStart: 3,
    successFeedback: "Four terms after the constant — 1 + x + x²/2 + x³/6 + x⁴/24 — and the error is under 0.01. Watch what happened as you added them: the polynomial HUGS the curve outward from the centre, matching further and further from 0 with every term. For eˣ it never gives up, at any x.",
    lowFeedback: "Not enough terms — the polynomial is still more than 0.01 away from e at x = 1. Add another.",
    highFeedback: "That works, but you have used more terms than you need. Come back down to the SMALLEST number that gets inside the tolerance."
  },
  {
    type: "sliceSum",
    prompt: "The region between y = x and y = x² on [0, 1]. Inspect a slice, then raise the slice count until the sum lands within 0.005 of the exact area (1/6 ≈ 0.1667).",
    mode: "areaBetween",
    tolerance: 0.005,
    nStart: 2,
    ruleStart: "left",
    successFeedback: "Every slice measures TOP MINUS BOTTOM — that height is the whole idea, and the integral just adds the heights. Notice the height is largest in the middle and vanishes at both ends, where the two curves meet.",
    lowFeedback: "The sum is under 1/6. The left rule undershoots here — raise the slice count, or switch rule.",
    highFeedback: "The sum is over 1/6. The right rule overshoots — raise the slice count to squeeze it down."
  },
  {
    type: "riemannSum",
    prompt: "Estimate the area under y = x² from 0 to 2 (the truth is 8/3 ≈ 2.667). Get within 0.1 of it.",
    fn: "square",
    a: 0,
    b: 2,
    tolerance: 0.1,
    nStart: 2,
    ruleStart: "left",
    successFeedback: "Close enough to be honest. But look at the line underneath: the LEFT sum is always short and the RIGHT sum is always over — the true area is TRAPPED between them, and raising n squeezes the trap shut. The definite integral is not a formula; it is the number the trap closes on.",
    lowFeedback: "Your estimate is UNDER the true area. On a rising curve the left rule always undershoots, because each strip is only as tall as its left edge. Raise n, or switch rule.",
    highFeedback: "Your estimate is OVER. On a rising curve the right rule always overshoots — each strip is as tall as its right edge, which is the tallest point in the strip."
  },
  {
    type: "accumulateArea",
    prompt: "f(x) = 2x. Drag x until the area you have swept out reaches exactly 4 — and watch the second curve you are drawing.",
    fn: "line",
    mode: "area",
    targetArea: 4,
    targetX: 0,
    start: 0,
    successFeedback: "x = 2, area 4. Now look at what you drew underneath: A(x) = x². Its slope at x = 2 is 4 — and the HEIGHT of f at x = 2 is also 4. That is not a coincidence and it is not an approximation. The slope of the accumulation IS the height of the function: A′ = f. You have just discovered the Fundamental Theorem of Calculus by dragging a slider.",
    lowFeedback: "You have not swept out enough area yet — keep dragging right, and watch the accumulation curve climb.",
    highFeedback: "You have swept past 4. Come back left — and notice the accumulation curve is climbing FASTEST where f is tallest."
  },
  {
    type: "derivativeTrace",
    prompt: "f(x) = x². Drag x until the tangent has slope 6 — and watch f′ draw itself underneath as you go.",
    fn: "square",
    mode: "slope",
    targetSlope: 6,
    targetX: 0,
    start: -3,
    successFeedback: "x = 3, where the tangent has slope 6. Now look at what you drew underneath: f′ came out a straight line through the origin — f′(x) = 2x. The derivative is not a number you compute at a point; it is a FUNCTION, and you have just traced it out.",
    lowFeedback: "The tangent is shallower than 6 (or tipping downhill). Slide right: on x² the slope climbs steadily as x does.",
    highFeedback: "The tangent is steeper than 6. Slide back left — on x² the slope IS 2x, so it passes 6 exactly once."
  },
  {
    type: "derivativeTrace",
    prompt: "f(x) = x³ − 3x. The tangent goes flat at x = −1 — but drag to x = 0 and watch the f″ pane: THAT is where the bending flips.",
    fn: "cubicMix",
    mode: "point",
    targetX: 0,
    targetSlope: 0,
    start: -2,
    showSecond: true, offsetMax: 0,
    successFeedback: "x = 0: f″ crosses zero and the bend flips from downward to upward — an inflection point. Notice f′ is NOT zero here (it is −3): flat and bending-change are different events, at different places, and the f″ pane is how you tell them apart.",
    lowFeedback: "Watch the bottom pane as you drag — f″ is still negative here, so the curve is bending downward. Keep going toward where f″ crosses its axis.",
    highFeedback: "You passed the crossing — f″ is positive now and the curve bends upward. Back up to where the f″ trace meets zero."
  },
  {
    type: "compassConstruct",
    prompt: "A and B are 8 apart. Open the compass until the two arcs actually meet — find the smallest whole radius that works.",
    mode: "perpBisector",
    span: 8,
    target: 5,
    start: 2,
    successFeedback: "Radius 5 — the first whole opening that clears half of AB. Now drag it wider and watch: the crossings move up and down, but the LINE through them never shifts. It cannot: both crossings are the same distance from A and from B by construction, so they are on the perpendicular bisector no matter what radius you chose. That invariance is the proof.",
    lowFeedback: "The arcs cannot reach each other. Each one only extends this far from its own end, so together they must span more than the 8 between A and B — meaning the radius must clear 4.",
    highFeedback: "The arcs do meet, but you were asked for the SMALLEST whole radius that reaches. Come back down until they are just about to separate."
  },
  {
    type: "quadDrag",
    prompt: "Three corners are pinned at (0,0), (6,0) and (6,4). Place the fourth so the shape is a rectangle.",
    fixed: [
      [0, 0],
      [6, 0],
      [6, 4]
    ],
    targetX: 0,
    targetY: 4,
    startX: 3,
    startY: 6,
    gridMax: 8,
    targetName: "a rectangle",
    successFeedback: "(0, 4). Sides 6, 4, 6, 4 and the two diagonals equal at 7.21 — that equality of diagonals is what makes it a rectangle rather than merely a parallelogram. Drag the corner around and watch the NAME change underneath: the shape tells you what it is, and you never had to memorise the list.",
    sideFeedback: "Your corner is not above A, so the side from C to it cannot match AB. Watch the four side lengths in the readout: opposite sides of a rectangle must pair up, 6 with 6 and 4 with 4.",
    angleFeedback: "Your corner is above A, so that pair of sides now matches — but the height is wrong, so the last side does not match CB and the two diagonals come out unequal. The name underneath still is not the one you want."
  },
  {
    type: "radicalCheck",
    prompt: "√(x + 2) = x. Squaring gives x² = x + 2, whose roots are 2 and −1. Drag through the candidates and find the one that actually solves the ORIGINAL.",
    inside: 2,
    target: 2,
    extraneous: -1,
    start: -2,
    successFeedback: "x = 2: √4 = 2 ✓. Both boxes are green, which is the only thing that counts. The other root, −1, satisfies the squared equation and fails the original — squaring INVENTED it, because squaring destroys the sign and a square root is never negative. That is why the check at the end is not optional.",
    extraneousFeedback: "Look at the two boxes: x = −1 passes the SQUARED equation (1 = 1) and fails the ORIGINAL (√1 = 1, not −1). Squaring created this root out of nothing, because it forgot that a square root cannot be negative. It is extraneous.",
    missFeedback: "That candidate fails the squared equation as well, so it was never a root of anything. The only two candidates are 2 and −1."
  },
  {
    type: "sequenceBuild",
    prompt: "4 + 4r + 4r² + … Set the ratio so the forever-sum settles on exactly 8.",
    mode: "geometric",
    first: 4,
    targetRTenths: 5,
    targetSum: 8,
    start: 9,
    successFeedback: "r = 0.5, and the sums pile up against the ceiling at 8 without ever passing it. An infinite sum is not 'adding forever' — it is the height the partial sums close in on, and a ratio under 1 is what makes that height finite.",
    lowFeedback: "The ceiling is below 8 — the terms are shrinking too fast, so the pile stops short.",
    highFeedback: "The ceiling is above 8 — the terms shrink too slowly and the pile climbs too high. As r nears 1 the ceiling runs away entirely."
  },
  {
    type: "triangleSolve",
    prompt: "Two sides of 5 and 8. Open the angle between them until the third side measures exactly 7.",
    mode: "sas",
    a: 5,
    b: 8,
    target: 7,
    start: 30,
    successFeedback: "60°, and the third side is 7 exactly: 25 + 64 − 2(5)(8)cos 60° = 89 − 40 = 49. Notice what you could NOT do: once the two sides and the angle between them are set, nothing else about the triangle is free. That is why SAS is a congruence criterion — the three parts fix the whole figure.",
    lowFeedback: "The third side is shorter than 7 — the angle is too narrow, so the two ends sit closer together.",
    highFeedback: "The third side is longer than 7 — the angle is too wide, prising the ends apart."
  },
  {
    type: "signChart",
    prompt: "p(x) = (x + 2)(x − 1)²(x − 3). Set the sign of p on each interval — and watch the sketch follow your claim.",
    roots: [
      { x: -2, mult: 1 },
      { x: 1, mult: 2 },
      { x: 3, mult: 1 }
    ],
    leadingPositive: true,
    successFeedback: "+ − − +. The sign flips at −2 and at 3, but NOT at 1: the double root touches zero and comes straight back the way it came. That is what multiplicity means — odd crosses, even bounces — and you have just produced it rather than recited it.",
    crossFeedback: "A single root is a crossing: the curve passes through zero and comes out the other side, so the sign must flip there. Check the intervals either side of −2 and of 3.",
    bounceFeedback: "You flipped the sign across x = 1 — but that root is DOUBLE. The curve reaches zero and turns back, so it leaves on the same side it arrived. An even root never changes the sign."
  },
  {
    type: "polarTrace",
    prompt: "r = cos(nθ). Dial n until the rose has exactly 4 petals — and watch what the even values do.",
    mode: "rose",
    targetPetals: 4,
    targetA: 2,
    start: 1,
    successFeedback: "n = 2 gives FOUR petals, not two. The even case sweeps out its petals and then retraces the gaps on the way round, doubling the count; the odd case comes back onto its own path instead. That is the whole petal rule, and it is impossible to believe until you have watched it happen.",
    lowFeedback: "Fewer than 4 petals. Try a larger n — but note the count does not simply climb with n.",
    highFeedback: "More than 4 petals. Come back down — and notice that n = 3 gives only 3, fewer than n = 2 gives."
  },
  {
    type: "circleMeasureExplore",
    prompt: "The circle has radius 5. Slide the chord until it measures 8, and watch the two halves as you go.",
    mode: "chordDistance",
    radius: 5,
    targetLength: 8,
    start: 0,
    successFeedback: "A chord of 8 sits 3 from the centre — and the right triangle 3-4-5 is staring at you: half the chord is 4, the distance is 3, the radius is 5. The perpendicular from the centre always bisects the chord, which is why the two halves never stop being equal.",
    lowFeedback: "The chord is shorter than 8 — it has drifted too far from the centre. Chords shrink as they move outward.",
    highFeedback: "The chord is longer than 8 — it is too close to the centre. The longest chord of all is the diameter, right through it."
  },
  {
    type: "vectorExplore",
    prompt: "u = (3, 4). Steer v until the dot product reads 0, then look at the angle between the arrows.",
    mode: "dot",
    ux: 3,
    uy: 4,
    targetDot: 0,
    vxStart: 3,
    vyStart: 0,
    gridMax: 6,
    successFeedback: "Dot product 0, and the angle reads 90°. That is the whole point of the dot product: it is a single number that goes to zero exactly when two arrows are perpendicular. Many different v work — (4, −3), (−4, 3), (8, −6) — because there is a whole line of perpendicular directions.",
    lowFeedback: "The dot product is negative, so the arrows are leaning AWAY from each other — more than a right angle apart. Swing v back toward u.",
    highFeedback: "The dot product is positive, so the arrows still lean the same way — less than a right angle apart. Swing v further from u."
  },
  {
    type: "matrixTransform",
    prompt:
      "Build the matrix for a 90° counter-clockwise rotation. Step the entries until the blue square lands exactly on the dashed green target — and watch where î and ĵ go.",
    ta: 0,
    tb: -1,
    tc: 1,
    td: 0,
    sa: 1,
    sb: 0,
    sc: 0,
    sd: 1,
    targetName: "a 90° counter-clockwise rotation",
    successFeedback:
      "That's the rotation: î ↦ (0, 1) and ĵ ↦ (−1, 0) — each column is where a basis vector LANDS. The determinant is 0·0 − (−1)·1 = 1: area unchanged, orientation preserved. Every rotation has determinant 1.",
    swappedFeedback:
      "You've built the transpose — you put î's landing spot in the second column and ĵ's in the first. Columns are destinations: column 1 is where î goes, column 2 is where ĵ goes. Your matrix rotates 90° the OTHER way.",
    signFeedback:
      "That's the rotation taken the other way round — 90° clockwise. Watch î: counter-clockwise sends it UP to (0, 1), so the 1 belongs in the bottom-left entry, not the top-right.",
    fallbackFeedback:
      "Follow one basis vector at a time. A 90° counter-clockwise turn sends î from (1, 0) straight up to (0, 1) — that's column 1. It sends ĵ from (0, 1) left to (−1, 0) — that's column 2."
  },
  {
    type: "argandExplore",
    prompt: "w = i. Find the z whose product z × i lands on the ring at −2. Watch what multiplying by i does to the arrow.",
    mode: "multiply",
    mulRe: 0,
    mulIm: 1,
    targetRe: -2,
    targetIm: 0,
    reStart: 1,
    imStart: 0,
    gridMax: 5,
    successFeedback: "z = 2i. Multiplying by i turned the arrow a quarter turn — and 2i was already a quarter turn from 2, so the product has been turned a HALF turn onto the negative real axis. That is the only honest reason i² = −1: two quarter turns face you backwards.",
    realFeedback: "The product is landing at the wrong place along the real axis. Remember the arrow gets turned 90° anticlockwise, so a z on the imaginary axis is what lands on the real one.",
    imagFeedback: "The product's real part is right, but it is still off the real axis. The target sits at −2 exactly, with no imaginary part left over."
  },
  {
    type: "secantSlope",
    prompt: "A sits at x = 3 on y = x². Squeeze the gap to 0.1 or smaller and watch the secant fall onto the tangent.",
    curve: "square",
    mode: "limit",
    a: 3,
    targetH: 0.1,
    startH: 1.5,
    successFeedback: "The secant has all but merged with the tangent, and the slope readout is a whisker from 6. Now try dragging the gap to exactly 0: the quotient becomes 0/0 and dies — yet the tangent is still sitting right there. The derivative is the limit of the slope, not the slope at the gap of nothing.",
    lowFeedback: "At a gap of exactly 0 the quotient is 0/0 — there is no line through one point. Come back a hair: the limit lives arbitrarily close to 0, never at it.",
    highFeedback: "The gap is still wide, so the secant is cutting across the curve rather than grazing it. Squeeze it to 0.1 or less."
  },
  {
    type: "expLogExplore",
    prompt: "Slide the base until 2 raised to that base's power lands on the ring — you need b^3 = 8. Watch the mirror curve move with it.",
    mode: "exponential",
    x: 3,
    targetBase: 2,
    startBase: 3,
    showMirror: true,
    successFeedback: "Base 2: 2³ = 8. Look at the green curve — it is the same curve reflected across y = x. log₂(8) = 3 says exactly what 2³ = 8 says, read backwards.",
    lowFeedback: "b³ is still under 8, so the base is too small. Raise it.",
    highFeedback: "b³ has overshot 8 — the base is too large. Bring it down."
  },
  {
    type: "graphZoom",
    prompt: "f(x) = (x² − 4)/(x − 2) is undefined at x = 2. Magnify the graph there and decide whether the limit exists.",
    behaviour: "removable",
    a: 2,
    leftValue: 4,
    rightValue: 4,
    fAtA: null,
    targetVerdict: "limit-exists",
    requiredZoom: 3,
    successFeedback: "The hole never fills — no magnification will ever put a point at x = 2. And yet both sides march to 4 and stay there. That is exactly what a limit is: a claim about the approach, not about the value at the point.",
    moreZoomFeedback: "Magnify further before deciding. A limit is a claim about arbitrarily small neighbourhoods, so one glance from far out cannot settle it.",
    wrongVerdictFeedback: "Look at the two readouts, not the hole. From the left y → 4 and from the right y → 4, and they stay there however far you zoom. The limit is 4 even though f(2) does not exist."
  },
  {
    type: "circleAngleExplore",
    prompt: "Make the angle at P measure 40°. Then slide P right around the circle and watch what the angle does.",
    mode: "inscribed",
    targetAngle: 40,
    startArc: 100,
    successFeedback: "An arc of 80° gives an angle of 40° at P — half of it. Now slide P: the angle does not budge. Every point on that far arc sees AB at exactly the same angle.",
    lowFeedback: "The angle at P is still under 40°. It is always half the arc, so open the arc wider.",
    highFeedback: "The angle at P has gone past 40°. It is half the arc, so an arc above 80° overshoots."
  },
  {
    type: "trialProbabilityLab",
    prompt: "A spinner landed on red 18 times in 30 spins. Which fraction is the relative frequency of red?",
    mode: "experimental",
    favourable: 18,
    total: 30,
    successLabel: "red spins",
    totalLabel: "spins",
    outcomes: [],
    choices: [
      { id: "correct", label: "3/5", num: 3, den: 5, feedback: "That matches 18 out of 30." },
      { id: "success-over-failure", label: "18/12", num: 18, den: 12, feedback: "That compares red with non-red, not with all spins." },
      { id: "complement", label: "2/5", num: 2, den: 5, feedback: "That counts the non-red spins." }
    ],
    fallbackFeedback: "Compare favourable outcomes with all trials.",
    successFeedback: "Yes — 18 out of 30 is 3/5."
  },
  {
    type: "scaledCircleLab",
    prompt: "A plan radius of 3 cm uses 1 cm = 2 m. Which is the real radius?",
    drawingRadius: 3, scale: 2, realRadius: 6, ask: "realRadius",
    choices: [
      { id: "correct", label: "6 m", value: 6, feedback: "Yes — 3 × 2 = 6." },
      { id: "drawing", label: "3 m", value: 3, feedback: "That keeps the drawing radius instead of scaling it." },
      { id: "diameter", label: "12 m", value: 12, feedback: "That doubles again into a diameter." }
    ],
    fallbackFeedback: "Use the plan scale once.", successFeedback: "Yes — the real radius is 6 m."
  },
  {
    type: "percentChangeLab",
    prompt: "A $40 backpack is marked down 25%. Which is the sale price?",
    base: 40,
    percent: 25,
    direction: "markdown",
    currency: "$",
    choices: [
      { id: "correct", label: "$30.00", value: 30, feedback: "Yes — $40 − $10 = $30." },
      { id: "change", label: "$10.00", value: 10, feedback: "That is the discount amount, not the final price." },
      { id: "decimal", label: "$39.75", value: 39.75, feedback: "25% means $10 here, not $0.25." }
    ],
    fallbackFeedback: "Find 25% of $40, then subtract it.",
    successFeedback: "Yes — 25% of $40 is $10, and $40 − $10 = $30."
  },
  {
    type: "equationOutcomeLab",
    prompt: "How many solutions does 4x + 1 = 4x + 9 have?",
    leftDisplay: "4x + 1", rightDisplay: "4x + 9", leftCoeff: 4, leftConstant: 1, rightCoeff: 4, rightConstant: 9,
    choices: [
      { id: "correct", label: "No solution", outcome: "none", feedback: "Yes — the x-terms cancel and leave 1 = 9, a false residue." },
      { id: "one", label: "One solution", outcome: "one", feedback: "No variable remains after cancellation." },
      { id: "many", label: "Infinitely many", outcome: "infinite", feedback: "Infinitely many needs a true residue." }
    ],
    fallbackFeedback: "Collect like terms and inspect the residue.",
    successFeedback: "Yes — a false residue means no solution."
  },
  {
    type: "signedFractionLab",
    prompt: "−3/4 ÷ 1/2 = ?",
    operation: "divide",
    left: { sign: -1, num: 3, den: 4 },
    right: { sign: 1, num: 1, den: 2 },
    form: "any",
    choices: [
      { id: "correct", label: "−3/2", sign: -1, num: 3, den: 2, path: "correct", feedback: "Yes — different signs and flip-and-multiply give −3/2." },
      { id: "sign", label: "3/2", sign: 1, num: 3, den: 2, path: "wrongSign", feedback: "Different signs make the quotient negative." },
      { id: "kept", label: "−3/8", sign: -1, num: 3, den: 8, path: "keptDivisor", feedback: "That multiplies without flipping the divisor." }
    ],
    fallbackFeedback: "Check the sign, then flip the divisor and multiply.",
    successFeedback: "Yes — −3/4 × 2 = −3/2."
  },
  {
    type: "triangleClosureLab",
    prompt: "Will beams 7, 8, and 12 close into a triangle?",
    sides: [7, 8, 12], angleStart: 30, angleStep: 5, requiredMoves: 2,
    choices: [
      { id: "correct", label: "Yes — 7 + 8 > 12", verdict: "forms", feedback: "Yes — the shorter pair out-reaches the longest." },
      { id: "largest", label: "No — 12 is too long", verdict: "does-not-form", feedback: "The longest side is allowed when the other two sum to more." },
      { id: "different", label: "No — all sides differ", verdict: "does-not-form", feedback: "Scalene triangles are valid." }
    ],
    fallbackFeedback: "Compare the shorter-side sum with the longest side.", successFeedback: "Yes — the frame closes."
  },
  {
    type: "compoundEventLab",
    prompt: "Flip a coin and roll a die. What is the probability of heads and an even number?",
    mode: "probability",
    stages: [
      { label: "Coin", outcomes: ["H", "T"], favourable: [0] },
      { label: "Die", outcomes: ["1", "2", "3", "4", "5", "6"], favourable: [1, 3, 5] }
    ],
    choices: [
      { id: "correct", label: "1/4", num: 1, den: 4, feedback: "Yes — 3 winning pairs out of 12." },
      { id: "one-event", label: "1/2", num: 1, den: 2, feedback: "That counts only one stage." },
      { id: "one-pair", label: "1/12", num: 1, den: 12, feedback: "That counts one pair, not all three winning pairs." }
    ],
    fallbackFeedback: "Count favourable ordered pairs over all ordered pairs.",
    successFeedback: "Yes — 3/12 = 1/4."
  },
  {
    type: "spinnerSim",
    prompt: "Shade the wheel so the chance of winning is 3/8.",
    sectors: 8,
    targetFavourable: 3,
    favourableStart: 0,
    successFeedback: "3 of 8 equal parts — the winning area is 3/8 of the wheel, so that's the probability.",
    lowFeedback: "Too little of the wheel is shaded for a 3/8 chance.",
    highFeedback: "Too much of the wheel is shaded — that's a bigger chance than 3/8."
  },
  {
    type: "algebraTiles",
    prompt: "Build −3x + 5x with tiles, then read the simplified expression.",
    targetX: 2,
    targetConst: 0,
    maxTiles: 8,
    xStart: 0,
    constStart: 0,
    successFeedback: "2x — three negative x-tiles cancel three of the positives, leaving 2 positive x-tiles.",
    xFeedback: "The x-tiles don't match yet. −3x and +5x cancel in pairs, leaving 2x.",
    constFeedback: "The x-tiles are right, but the unit tiles aren't — this expression has no constant term."
  },
  // S212 — the AREA workspace, a second mode behind the same type. Added after the classic sample,
  // so `byType` (the keyboard gate) still resolves the classic one; the operability sweep renders
  // every sample and therefore renders this one too.
  {
    type: "algebraTiles",
    prompt: "Open the rectangle 3(x + 2) and read the sum its tiles make.",
    targetX: 3,
    targetConst: 6,
    maxTiles: 12,
    xStart: 0,
    constStart: 0,
    area: { width: [0, 3], height: [1, 2], mode: "distribute" },
    successFeedback: "3x + 6 — the 3 reached the x AND the 2, so three x-tiles and six units came out.",
    xFeedback: "Count the long tiles: three rows of one x is 3x.",
    constFeedback: "Count the small tiles: three rows of two units is 6, not one copy of the 2.",
    partialProductFeedback: "The 3 reached the x but stopped: only one copy of the 2 came out. The rectangle held three of them."
  },
  {
    type: "boxPlot",
    prompt: "Set the five-number summary: min 2, Q1 4, median 6, Q3 9, max 12.",
    axisMin: 0,
    axisMax: 14,
    targetMin: 2,
    targetQ1: 4,
    targetMed: 6,
    targetQ3: 9,
    targetMax: 12,
    startMin: 0,
    startQ1: 3,
    startMed: 7,
    startQ3: 10,
    startMax: 14,
    successFeedback: "That's the box plot — the box spans Q1 to Q3 (the middle half), split at the median, with whiskers to the extremes.",
    orderFeedback: "Keep them in order: min ≤ Q1 ≤ median ≤ Q3 ≤ max. Right now one value sits out of sequence.",
    valueFeedback: "They're in order, but not the target summary yet. Line each handle up with its value."
  },
  {
    type: "compositeAreaLab",
    prompt: "A floor plan has a 6×4 room, a triangular bay with base 4 and height 3, and a 2×2 notch cut away. What is the total area?",
    scene: "piece-ledger",
    pieces: [
      { id: "room", label: "main room", shape: "rectangle", operation: "add", width: 6, height: 4 },
      { id: "bay", label: "triangular bay", shape: "triangle", operation: "add", base: 4, height: 3 },
      { id: "notch", label: "cut-away notch", shape: "rectangle", operation: "subtract", width: 2, height: 2 }
    ],
    target: { kind: "total" },
    choices: [
      { id: "a", label: "26 square units", value: 26, feedback: "Yes — 24 + 6 − 4 = 26." },
      { id: "b", label: "34 square units", value: 34, feedback: "That adds the cut-away notch instead of subtracting it." },
      { id: "c", label: "30 square units", value: 30, feedback: "That combines the added pieces but forgets to remove the notch." }
    ],
    fallbackFeedback: "Add attached pieces and subtract cut-away pieces.",
    successFeedback: "Exactly — 24 + 6 − 4 = 26 square units."
  },
  {
    type: "distributionCompareLab",
    prompt: "Group A has mean 20, Group B mean 8, and one variability-width is 4. How many variability-units apart are the means?",
    mode: "measure",
    meanA: 20,
    meanB: 8,
    variability: 4,
    answer: 3,
    tolerance: 0,
    measureChoices: [
      { value: 12, feedback: "That is the raw gap; compare it with one variability-width." },
      { value: 3, feedback: "That choice makes the tape exactly match the mean gap." },
      { value: 4, feedback: "That is the variability measure itself." }
    ],
    fallbackFeedback: "Divide the raw gap by one variability-width.",
    successFeedback: "Exactly — the 12-point gap contains three 4-point variability-widths."
  },
  {
    type: "areaModel",
    prompt: "Build a rectangle with an area of 24 square units.",
    targetArea: 24,
    wMax: 8,
    hMax: 8,
    wStart: 1,
    hStart: 1,
    successFeedback: "That's 24 square units — width × height is the area, and this is one of its factor pairs.",
    lowFeedback: "The area is under 24. Stretch the rectangle wider or taller to cover more squares.",
    highFeedback: "The area is over 24. Shrink a side to cover fewer squares."
  },
  {
    type: "areaModel",
    prompt: "A rectangle has 3 rows and 4 columns of unit squares. How many are there?",
    targetArea: 12,
    wMax: 4,
    hMax: 3,
    wStart: 4,
    hStart: 3,
    countGrid: true,
    commonCounts: [
      { count: 7, feedback: "That adds 3 + 4 instead of counting every square." },
      { count: 4, feedback: "That counts just one row instead of all 3 rows." }
    ],
    successFeedback: "Correct — all 12 unit squares are counted.",
    lowFeedback: "Keep marking every square in every row.",
    highFeedback: "The fixed grid contains only the squares shown."
  },
  {
    type: "placeValue",
    prompt: "Build the number 234 with base-ten blocks.",
    target: 234,
    maxHundreds: 4,
    maxTens: 12,
    maxOnes: 15,
    hStart: 0,
    tStart: 0,
    oStart: 0,
    successFeedback: "234 — 2 hundreds, 3 tens, and 4 ones. The blocks show exactly what each digit is worth.",
    lowFeedback: "Your blocks add up to less than 234. Add more hundreds, tens, or ones.",
    highFeedback: "Your blocks add up to more than 234. Take some away."
  },
  {
    type: "clockSet",
    prompt: "Set the clock to 3:15.",
    targetHour: 3,
    targetMinute: 15,
    minuteStep: 5,
    successFeedback: "3:15 — the hour hand just past 3, the minute hand a quarter turn round to the 3 (15 minutes).",
    hourFeedback: "Check the hour hand — it should point just past the 3.",
    minuteFeedback: "Check the minute hand. Each number on the clock face is 5 minutes, so 15 minutes lands on the 3."
  },
  {
    type: "balanceScale",
    prompt: "Slide x until the scale balances: 2x + 3 = 11.",
    a: 2,
    b: 3,
    c: 11,
    xMin: 0,
    xMax: 10,
    xStart: 0,
    successFeedback: "x = 4 balances it: 2(4) + 3 = 11. Both pans hold the same amount.",
    lowFeedback: "The left pan is too light — it's lifting. A bigger x adds weight to that side.",
    highFeedback: "The left pan is too heavy — it's sinking. A smaller x takes weight off that side."
  },
  {
    type: "slider",
    prompt: "Slide the focal length p until the parabola's focus reaches height 3.",
    min: 1,
    max: 6,
    start: 1,
    target: 3,
    visual: "conic",
    conicKind: "parabola",
    unitLabel: "focal length p",
    lowFeedback: "The focus is still low — a larger p lifts the focus and pushes the directrix down.",
    highFeedback: "Past 3 now — a smaller p brings the focus back down toward the vertex.",
    successFeedback: "p = 3 puts the focus at (0, 3) and the directrix at y = −3 — every point on the curve stays equidistant from both."
  },
  {
    type: "slider",
    prompt: "Slide the shorter axis b until the ellipse becomes a circle (eccentricity 0).",
    min: 1,
    max: 5,
    start: 1,
    target: 5,
    visual: "conic",
    conicKind: "ellipse",
    unitLabel: "semi-axis b",
    lowFeedback: "Still stretched — as b grows toward 5, the two foci slide together.",
    highFeedback: "b can't exceed the fixed semi-axis 5 on this slider.",
    successFeedback: "At b = 5 the foci merge at the center: eccentricity 0, a perfect circle. Shrinking b pulls the foci apart and raises the eccentricity."
  },
  {
    type: "tapDiagram",
    prompt: "Tap every basket holding exactly 2 balls.",
    mode: "selectAll",
    canvas: { w: 4, h: 2 },
    hotspots: [
      { id: "h1", x: 20, y: 50, label: "Basket with 2 balls", icon: "⚽", count: 2, correct: true },
      { id: "h2", x: 50, y: 50, label: "Basket with 3 balls", icon: "⚽", count: 3, feedback: "That basket has 3 — one too many." },
      { id: "h3", x: 80, y: 50, label: "Basket with 2 balls", icon: "⚽", count: 2, correct: true }
    ],
    missFeedback: "Count each basket, then tap every one holding exactly 2 — and only those.",
    successFeedback: "Both 2-ball baskets found."
  },
  {
    type: "solveBalance",
    prompt: "Solve 3x + 4 = 19 on the balance. Take tiles away and split until one x stands alone.",
    a: 3,
    b: 4,
    c: 19,
    successFeedback:
      "x = 5. Four units came off BOTH pans (3x = 15), then both sides split into 3 equal groups.",
    unbalancedFeedback:
      "The beam has tipped \u2014 tiles came off one side only. Whatever leaves the left pan has to leave the right pan too, or the two sides stop being equal.",
    notIsolatedFeedback:
      "Still perfectly balanced \u2014 every move so far was fair. But x is not alone yet: keep clearing units from both sides, then split into equal groups.",
    missFeedback:
      "The x-tiles are what you are solving FOR \u2014 keep them. Clear the unit tiles from both sides, then split both sides into equal groups.",
  },
  {
    type: "inversePipeline",
    prompt: "f(x) = 3x + 4, then halved. Build f\u207b\u00b9 by undoing it \u2014 last step first.",
    forward: [
      { id: "f1", op: "mul", n: 3 },
      { id: "f2", op: "add", n: 4 },
      { id: "f3", op: "div", n: 2 },
    ],
    tray: [
      { id: "t-mul2", op: "mul", n: 2 },
      { id: "t-sub4", op: "sub", n: 4 },
      { id: "t-div3", op: "div", n: 3 },
      { id: "t-add4", op: "add", n: 4 },
      { id: "t-mul3", op: "mul", n: 3 },
    ],
    answer: ["t-mul2", "t-sub4", "t-div3"],
    sampleInput: 4,
    successFeedback:
      "That is f\u207b\u00b9. The halving happened last, so it is undone first \u2014 double, then take off the 4, then divide by 3.",
    forwardOrderFeedback:
      "Those are the right three steps, but in the order f applied them. An inverse runs the chain BACKWARDS: whatever happened last has to be undone first.",
    unflippedFeedback:
      "The order is right, but a step was copied instead of undone. Each card has to be the opposite of the one it reverses \u2014 \u00d7 becomes \u00f7, + becomes \u2212.",
    missFeedback:
      "Read f from left to right, then build the track from right to left, flipping each step as you go.",
  },
  {
    type: "dragOrder",
    prompt: "Put these skip-counts by 5 in order, smallest first.",
    items: [
      { id: "n15", label: "15" },
      { id: "n5", label: "5" },
      { id: "n20", label: "20" },
      { id: "n10", label: "10" }
    ],
    correctOrder: ["n5", "n10", "n15", "n20"],
    misorderFeedback: [
      {
        first: "n20",
        second: "n5",
        feedback: "20 landed before 5 — smallest first means the list starts tiny and grows by 5 each hop."
      }
    ],
    missFeedback: "Start at the smallest and add 5 each step: 5, 10, 15, 20.",
    successFeedback: "5 → 10 → 15 → 20. Each hop adds exactly 5."
  },
  {
    type: "dragBucket",
    prompt: "Sort each story into the operation that solves it.",
    buckets: [
      { id: "mul", label: "Multiply", icon: "✖️" },
      { id: "add", label: "Add", icon: "➕" }
    ],
    items: [
      {
        id: "s1",
        label: "4 boxes with 6 crayons in each box",
        bucketId: "mul",
        feedback: "Every box holds the same 6 — equal groups call for multiplying, not adding two numbers."
      },
      {
        id: "s2",
        label: "6 crayons in one hand, 4 in the other",
        bucketId: "add",
        feedback: "Those are two different amounts joined once — that's adding. Multiplying needs equal groups."
      },
      {
        id: "s3",
        label: "3 shelves with 5 books on each shelf",
        bucketId: "mul",
        feedback: "Same 5 on every shelf — equal groups again, so multiply."
      }
    ],
    missFeedback: "Ask each story: are the groups all the same size? Same-size groups multiply; different amounts add.",
    successFeedback: "Sorted! Equal groups multiply; one-time joins add."
  },
  {
    type: "matchPairs",
    prompt: "Match each picture story to its multiplication.",
    left: [
      { id: "l1", label: "2 nests, 3 eggs each" },
      { id: "l2", label: "3 nests, 2 eggs each" },
      { id: "l3", label: "4 nests, 2 eggs each" }
    ],
    right: [
      { id: "r1", label: "3 × 2" },
      { id: "r2", label: "4 × 2" },
      { id: "r3", label: "2 × 3" }
    ],
    pairs: { l1: "r3", l2: "r1", l3: "r2" },
    pairErrors: [
      {
        left: "l1",
        right: "r1",
        feedback: "2 nests of 3 reads groups-first: 2 × 3. 3 × 2 would mean 3 nests with 2 eggs each."
      }
    ],
    missFeedback: "Read each story groups-first: number of nests × eggs in each nest.",
    successFeedback: "Every story matched to its groups-first sentence."
  },
  {
    type: "buildExpression",
    prompt: "Build the multiplication for: 5 plates with 3 dumplings on each plate.",
    tokens: [
      { id: "t5", label: "5" },
      { id: "t3", label: "3" },
      { id: "t8", label: "8" },
      { id: "tx", label: "×" },
      { id: "tp", label: "+" }
    ],
    correct: ["t5", "tx", "t3"],
    acceptAlso: [["t3", "tx", "t5"]],
    commonBuilds: [
      {
        sequence: ["t5", "tp", "t3"],
        feedback: "5 + 3 joins two amounts once. But there are 5 whole plates of 3 — equal groups need ×."
      }
    ],
    reusable: false,
    missFeedback: "Count the groups (5 plates), the size of each (3), and join them with ×.",
    successFeedback: "5 × 3 — five groups of three dumplings."
  },
  {
    type: "plotPoint",
    prompt: "The pet club made a dot chart. Mark 3 dots in the CAT column to show 3 cat owners.",
    cols: 3,
    rows: 4,
    xLabels: ["Cat", "Dog", "Fish"],
    targets: [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 }
    ],
    pointErrors: [
      {
        x: 2,
        y: 1,
        feedback: "That dot sits in the Dog column. Cat owners get marked in the first column."
      }
    ],
    missFeedback: "Stack 3 dots from the bottom of the Cat column — one dot per cat owner.",
    successFeedback: "3 dots in the Cat column — the chart now says 3 at a glance.",
  },
  {
    type: "toggleExplore",
    prompt: "The clubhouse fan runs only when BOTH switches are on. Make it run.",
    toggles: [
      { id: "sw1", label: "Switch 1" },
      { id: "sw2", label: "Switch 2" }
    ],
    rule: { op: "and", args: ["sw1", "sw2"] },
    ruleText: "Rule: the lamp lights when Switch 1 AND Switch 2 are both on.",
    solutionText: "Turn both switches on — with an AND rule, one alone is never enough.",
    commonStates: [
      {
        states: { sw1: true, sw2: false },
        feedback: "Switch 1 alone isn't enough — the rule says BOTH. What's Switch 2 doing?"
      }
    ],
    missFeedback: "Try the switches and watch the lamp — it only lights when both are on together.",
    successFeedback: "Both on → the fan runs. That's what AND means."
  },
  {
    type: "steppedReveal",
    prompt: "Why does 4 × 0 equal 0? Reveal each step of the why.",
    panels: [
      { title: "Groups of nothing", body: "4 × 0 means 4 groups with 0 things in each group." },
      { title: "Count them", body: "0 + 0 + 0 + 0 — adding nothing four times is still nothing." },
      { title: "The rule", body: "Any number of empty groups holds 0. That's why anything × 0 = 0." }
    ],
    continueFeedback: "Keep revealing — the why builds one step at a time.",
    successFeedback: "That's the whole why: empty groups stay empty, no matter how many."
  },
  {
    type: "estimateSlider",
    prompt: "About how many small candies fill a big 1-liter jar? Slide to your estimate.",
    min: 10,
    max: 10000,
    start: 10,
    target: 1000,
    acceptFactor: 2,
    unitLabel: "candies",
    ticks: [10, 100, 1000, 10000],
    lowFeedback: "Way more than that — a single handful already holds dozens. Slide up, the scale stretches fast.",
    highFeedback: "That many candies wouldn't fit — you're past what a jar can hold. Ease back down.",
    successFeedback: "Around a thousand is right — good order-of-magnitude sense!"
  },
  {
    type: "estimateSlider",
    prompt: "A book is about 9 inches long. Which estimate is closest?",
    min: 0,
    max: 20,
    target: 9,
    unitLabel: "inches",
    choices: [
      { value: 8, label: "8 inches", correct: true, feedback: "8 is only 1 inch from 9." },
      { value: 20, label: "20 inches", feedback: "20 is 11 inches from 9 — much too long." },
      { value: 1, label: "1 inch", feedback: "1 is 8 inches from 9 — much too short." }
    ],
    lowFeedback: "That estimate is too short.",
    highFeedback: "That estimate is too long.",
    successFeedback: "Yes — 8 is only 1 inch from the stated 9-inch length."
  },
  {
    type: "tenFrame",
    prompt: "7 dots are here. Tap to add dots and make 10.",
    target: 10,
    preFilled: 7,
    addColor: "tangerine",
    commonCounts: [
      { count: 8, feedback: "That's 8. One tap isn't enough — count the empty cells: three are still open." }
    ],
    missFeedback: "Fill every empty cell so the whole frame of 10 is full.",
    successFeedback: "7 and 3 more makes a full ten!"
  },
  {
    type: "numberLineHop",
    prompt: "Start at 5. Hop forward 3. Tap where you land.",
    min: 0,
    max: 10,
    start: 5,
    hop: 1,
    hops: 3,
    direction: "forward",
    commonLandings: [
      { value: 3, feedback: "You hopped backward — 'forward 3' moves right, toward the bigger numbers. Try 5 → 6 → 7 → 8." },
      { value: 7, feedback: "That's only 2 hops (5 → 6 → 7). Count one more: 5, 6, 7, 8." }
    ],
    missFeedback: "Count each hop out loud: 6, 7, 8. Land on the last one.",
    successFeedback: "5 and 3 hops lands on 8 — counting on works!"
  },
  {
    type: "baseTenCompose",
    prompt: "Build the number 24 with tens rods and ones.",
    target: 24,
    requireStandard: true,
    maxTens: 9,
    maxOnes: 20,
    commonBuilds: [
      { tens: 4, ones: 2, feedback: "You flipped the digits — 4 tens and 2 ones is 42. 24 has 2 tens and 4 ones." },
      { tens: 2, ones: 0, feedback: "2 tens is 20 — four ones short. Add the 4 ones that come after the tens." }
    ],
    missFeedback: "24 means 2 groups of ten and 4 leftover ones.",
    successFeedback: "2 tens and 4 ones — that's 24!"
  },
  {
    type: "lengthCompare",
    prompt: "Which is longer? Tap it.",
    unitLabel: "paperclips",
    items: [
      { id: "pencil", label: "pencil", length: 5 },
      {
        id: "eraser",
        label: "eraser",
        length: 3,
        feedback: "The eraser is only 3 paperclips long. The pencil, at 5, is longer."
      }
    ],
    answerId: "pencil",
    missFeedback: "Count the stripes on each bar — more stripes means longer.",
    successFeedback: "Yes — 5 paperclips is more than 3, so the pencil is longer."
  },
  {
    // v2 align mode: the fair-comparison PROCEDURE — drag the head-start bar's
    // starting end to the dashed line (or slide the paired range input), THEN tap.
    type: "lengthCompare",
    mode: "align",
    prompt: "One ribbon starts ahead. Line up the starting ends, then tap the longer ribbon.",
    items: [
      {
        id: "top",
        label: "top ribbon",
        length: 5,
        startOffset: 3,
        feedback: "That end only sticks out because it started ahead — slide its starting end to the line first."
      },
      { id: "bottom", label: "bottom ribbon", length: 7 }
    ],
    answerId: "bottom",
    unalignedFeedback: "You cannot tell yet — the starting ends are not lined up. Slide the top ribbon to the start line first.",
    missFeedback: "Now the starts match, so compare the far ends — the bottom ribbon reaches farther.",
    successFeedback: "Yes — with the starting ends lined up, the bottom ribbon clearly reaches farther."
  },
  {
    type: "subitizeFlash",
    prompt: "Flash the dots, then pick how many you saw — no counting one-by-one!",
    count: 5,
    arrangement: "dice",
    flashMs: 1000,
    options: [4, 5, 6],
    commonPicks: [
      { value: 4, feedback: "So close — the dice-5 pattern has four corners AND a middle dot. That center one makes 5." },
      { value: 6, feedback: "One too many — picture the 5 on a die: four corners and one center, not two rows of three." }
    ],
    missFeedback: "Look for the shape, not the individual dots. The dice-5 is four corners plus a center.",
    successFeedback: "Five — you saw the pattern instantly!"
  },
  { type:"triangleConstraintLab", prompt:"Choose givens that lock one triangle, then test the angle.", targetCriterion:"SAS", startCriterion:"SSA", sideA:5, sideB:8, targetAngle:60, angleStart:35, requiredMoves:3, successFeedback:"SAS fixes one triangle.", criterionFeedback:"Use the included-angle criterion.", angleFeedback:"Set the included angle to 60 degrees.", evidenceFeedback:"Try several criteria and reveal whether a second triangle exists." },
  { type:"coordinateProofLab", prompt:"Position D and prove ABCD is a parallelogram.", fixed:[[1,1],[6,1],[8,5]], target:[3,5], start:[8,8], targetClaim:"parallelogram", gridMin:0, gridMax:10, requiredEvidence:["slopes","midpoints"], requiredMoves:3, successFeedback:"Both slope pairs match and the diagonals share a midpoint.", positionFeedback:"Move D until the opposite-side and diagonal evidence agrees.", evidenceFeedback:"Inspect both slopes and diagonal midpoints before concluding." },
  { type:"solidSliceLab", prompt:"Move a slice through the cylinder and compare it with an equal-base-area prism.", solid:"cylinder", radius:4, height:8, targetFraction:0.5, startFraction:0.1, comparisonRequired:true, requiredMoves:4, successFeedback:"Equal sections at every height justify equal volume.", positionFeedback:"Move the plane to the marked middle section.", comparisonFeedback:"Add the comparison solid to test Cavalieri directly.", invariantFeedback:"Move the plane through several heights and watch the section area." },
  { type:"lineRelationLab", prompt:"Construct perpendicular lines.", targetRelation:"perpendicular", baseAngle:0, angleStart:35, offsetStart:2, requiredMoves:2, successFeedback:"Exactly 90° — perpendicular.", angleFeedback:"Rotate until the intersection angle is 90°.", distanceFeedback:"Move both controls so you can separate rotation from translation." },
  { type:"triangleAngleLab", prompt:"Deform the triangle until angle A is about 45°.", fixedA:[1,1], fixedB:[7,1], startC:[4,6], targetAngleA:45, tolerance:3, requiredMoves:3, successFeedback:"You changed the triangle while preserving the 180° sum.", targetFeedback:"Keep deforming until angle A is near 45°.", invariantFeedback:"Move the vertex several times and watch the sum remain 180°." },
  { type:"verticalLineScanner", prompt:"Sweep the scanner and decide whether this circle is a function.", relation:"circle", targetVerdict:"not-function", xMin:-5, xMax:5, scanStart:-5, scanStep:0.5, requiredSweeps:5, successFeedback:"A vertical line hits twice, so it is not a function.", moreSweepFeedback:"Sweep farther and record the greatest intersection count.", verdictFeedback:"The one-output rule fails wherever the scanner hits twice." },
  { type:"covariationScrubber", prompt:"Move time until the distance is 24 miles.", a:4, b:0, inputMin:0, inputMax:10, inputStart:1, targetInput:6, inputLabel:"hours", outputLabel:"miles", contextTemplate:"In {x} hours, the rider travels {y} miles.", successFeedback:"6 hours and 24 miles stay linked by the unit rate 4.", lowFeedback:"The input is too small; increase it and watch every representation move together.", highFeedback:"The input is too large; decrease it while preserving the rate." },
  { type:"samplingBiasLab", prompt:"Design a representative school survey.", populationLabel:"whole school", targetMethod:"stratified", targetSize:100, sizeMin:10, sizeMax:200, sizeStep:10, sizeStart:20, requiredDraws:5, successFeedback:"Stratified selection covers the groups, and the larger sample reduces random variability.", methodFeedback:"A convenient group can stay biased no matter how large it is.", sizeFeedback:"Use a larger sample to reduce random variability.", drawsFeedback:"Run several samples so you can see variability rather than trusting one draw." },
  { type:"shapeFamilyBuilder", prompt:"Build a rectangle from attributes.", targetName:"rectangle", targetSides:4, targetRightAngles:4, targetEqualSides:0, targetParallelPairs:2, startSides:3, successFeedback:"Four sides, four right angles, and two parallel pairs define a rectangle.", sidesFeedback:"A rectangle belongs to the four-sided family.", attributesFeedback:"Use the defining attributes, not a familiar-looking picture." },
  { type:"shapeHierarchyLab", prompt:"A square is a rhombus. Always, sometimes, or never?", mode:"verdict", nodes:[{id:"rhombus",label:"rhombus",attributes:["4 equal sides"]},{id:"square",label:"square",attributes:["rhombus + 4 right angles"]}], edges:[["rhombus","square"]], relation:"subset", subjectLabel:"square", predicateLabel:"rhombus", witness:"Every square has four equal sides.", choices:[{id:"a",label:"Always",claim:"always",feedback:"Every square passes the rhombus test.",evidenceKind:"path",evidenceText:"The square node sits inside the rhombus family.",highlightNodeIds:["rhombus","square"]},{id:"b",label:"Sometimes",claim:"sometimes",feedback:"No square counterexample exists.",evidenceKind:"counterexample",evidenceText:"Every square keeps four equal sides.",highlightNodeIds:[]},{id:"c",label:"Never",claim:"never",feedback:"Squares are rhombuses every time.",evidenceKind:"path",evidenceText:"The family path proves the opposite.",highlightNodeIds:[]}], fallbackFeedback:"Use the family path and look for a counterexample.", successFeedback:"Always — every square has four equal sides." },
  { type:"unitRuler", prompt:"Measure the object by aligning zero and iterating equal units.", objectStart:3, objectEnd:9, allowedUnitSizes:[0.5,1,2], targetUnitSize:1, startUnitSize:2, requiredPlacements:6, commonPlacements:[{ placements: 7, feedback: "Seven counts one unit past the object\u2019s end \u2014 the last unit must stop where the object stops." }], successFeedback:"Six equal one-unit lengths cover the object exactly with no gaps or overlaps.", alignFeedback:"Align zero with the object's starting end before counting units.", gapOverlapFeedback:"Every unit must touch the next one with no gaps or overlaps.", unitFeedback:"Choose the one-unit measure so the count is expressed in the requested unit." },
  { type:"proportionalReasoningLab", task:"bestRate", answerMode:"choice", prompt:"Which deal has the lower cost per notebook?", xLabel:"notebooks", yLabel:"dollars", series:[{id:"a",label:"Deal A",pairs:[[4,6]]},{id:"b",label:"Deal B",pairs:[[6,8.4]]}], optimize:"min", choices:[{id:"a",label:"Deal A",claim:"series:a",feedback:"Deal A costs 1.50 dollars per notebook, which is greater."},{id:"b",label:"Deal B",claim:"series:b",feedback:"Deal B costs 1.40 dollars per notebook, the lower unit price."}], requiredExplorations:2, successFeedback:"Deal B has the lower normalized cost.", explorationFeedback:"Normalize both deals before choosing.", fallbackFeedback:"Compare dollars per one notebook, not the sticker totals." },
  { type:"placeValueTransformLab", task:"round", answerMode:"numeric", prompt:"Round 12.86 to the nearest tenth.", values:[12.86], targetExponent:-1, choices:[], numericErrors:[{value:12.8,feedback:"The hundredths digit is 6, so the tenths place rounds up."}], requiredExplorations:2, successFeedback:"The hundredths digit rounds the tenths up to 12.9.", explorationFeedback:"Inspect the target place and deciding digit before checking.", fallbackFeedback:"Use the digit immediately to the right of the target place.", tolerance:0 },
  { type:"pointSetReasoningLab", task:"rangeValue", answerMode:"numeric", prompt:"Find the range of 2, 5, 10.", xLabel:"value", sets:[{id:"data",label:"data",points:[{id:"a",label:"2",x:2},{id:"b",label:"5",x:5},{id:"c",label:"10",x:10}]}], targetSetId:"data", choices:[], numericErrors:[{value:10,feedback:"That is the maximum, not the range."}], authoredStages:[], requiredStageKeys:["range:min","range:max","range:span"], requiredExplorations:3, successFeedback:"The range is 8.", explorationFeedback:"Inspect the endpoints and their difference.", fallbackFeedback:"Subtract minimum from maximum.", tolerance:0 },
  { type:"geometricConstraintLab", task:"perimeterMissing", answerMode:"numeric", prompt:"A rectangle has perimeter 26, length 8, and width w. Find w.", perimeter:{shape:"rectangle",perimeter:26,knownSides:[8,8],unknownMultiplicity:2}, choices:[], numericErrors:[{value:10,feedback:"That is the combined missing length, not one width."}], authoredStages:[], requiredStageKeys:["perimeter:total","perimeter:known","perimeter:remaining","perimeter:split"], requiredExplorations:4, successFeedback:"Each missing width is 5.", explorationFeedback:"Inspect the total, known sides, remaining length, and equal split.", fallbackFeedback:"Subtract known sides, then divide the remaining perimeter equally.", tolerance:0 },
  { type:"exactNumberLab", task:"fractionCompare", answerMode:"relation", prompt:"Which is bigger: 7/15 or 9/16?", values:[{id:"left",label:"7/15",kind:"rational",num:7,den:15},{id:"right",label:"9/16",kind:"rational",num:9,den:16}], choices:[], numericErrors:[], authoredStages:[], requiredStageKeys:["benchmark:left","benchmark:right","compare:exact"], requiredExplorations:3, successFeedback:"9/16 is greater than 7/15.", explorationFeedback:"Inspect both benchmark states and the exact comparison.", fallbackFeedback:"Compare the exact values.", tolerance:0 },
  { type:"affineRelationshipLab", task:"compareRateAndStart", answerMode:"choice", prompt:"Compare Function A and Function B.", lines:[{id:"a",label:"Function A",m:2,b:10,sourceKind:"equation",sourceText:"y = 2x + 10",tablePoints:[]},{id:"b",label:"Function B",m:4,b:3,sourceKind:"table",sourceText:"(0, 3), (1, 7), (2, 11)",tablePoints:[[0,3],[1,7],[2,11]]}], rateGoal:"greater", choices:[{id:"a",label:"A starts higher, but B grows faster",claim:"compare:rate:b:start:a",feedback:"This matches both comparisons."},{id:"b",label:"A starts higher and grows faster",claim:"misconception:b",feedback:"A starts higher, but its rate is smaller."}], numericErrors:[], pointErrors:[], authoredStages:[], requiredStageKeys:["line:a:slope","line:a:intercept","line:b:slope","line:b:intercept","compare:rates","compare:starts"], requiredExplorations:6, successFeedback:"A starts higher, but B grows faster.", explorationFeedback:"Inspect both rates and both initial values before choosing.", fallbackFeedback:"Compare rate and initial value separately.", tolerance:0 },
  { type:"quotientReasoningLab", task:"remainderContext", answerMode:"numeric", prompt:"100 riders use buses that hold 15. How many buses are needed?", dividend:{num:100,den:1}, divisor:{num:15,den:1}, candidates:[], contextPolicy:"roundUp", choices:[], numericErrors:[{value:6,feedback:"Six buses leave ten riders without a seat."}], fractionErrors:[], authoredStages:[], requiredExplorations:4, successFeedback:"The remainder requires one more bus, so 7.", explorationFeedback:"Inspect the quotient, product, remainder, and context policy.", fallbackFeedback:"Interpret the remainder in the story context.", tolerance:0 },
  { type:"graphStoryLab", mode:"build", prompt:"Build the graph story: travel steadily, stop, then travel faster.", axisContext:"distanceFromOrigin", distanceRule:"awayOnly", xAxisLabel:"time", yAxisLabel:"distance", segments:[{id:"s1",label:"Travel steadily",kind:"riseSteady",meaning:"Distance increases at a constant rate."},{id:"s2",label:"Stop",kind:"flat",meaning:"Distance stays unchanged."},{id:"s3",label:"Travel faster",kind:"riseSteep",meaning:"Distance increases at a faster constant rate."}], bank:[{id:"b1",label:"Steady rise",kind:"riseSteady",meaning:"Constant positive rate."},{id:"b2",label:"Flat",kind:"flat",meaning:"No change."},{id:"b3",label:"Steep rise",kind:"riseSteep",meaning:"Faster positive rate."},{id:"b4",label:"Fall",kind:"fallSteady",meaning:"The quantity decreases."}], wrongSequences:[{label:"Reverse speeds",kinds:["riseSteep","flat","riseSteady"],feedback:"That reverses the two travel speeds."}], answerLabel:"Steady rise, then flat, then steeper rise", successFeedback:"The ordered segments preserve steady travel, the stop, and faster travel.", explorationFeedback:"Add each labelled stage in story order and inspect the graph after every choice.", fallbackFeedback:"Match each story stage to its direction and rate, then preserve the order." },
  { type:"conditionalTableLab", prompt:"Compare P(sport | bus) with the reversed conditional.", rowLabels:["Bus","Walk"], colLabels:["Sport","No sport"], counts:[40,60,70,30], targetCondition:"row0", targetCell:"r0c0", startCondition:"col0", requiredSwitches:2, successFeedback:"The bus row is the denominator and the bus-and-sport cell is the numerator.", explorationFeedback:"Compare at least two possible conditions before settling on the denominator.", conditionFeedback:"Choose the group named after the conditioning bar: given bus means the bus row.", cellFeedback:"The numerator must be the intersection of bus and sport." },
  { type:"conicLocusLab", prompt:"Vary eccentricity until the focus-directrix ratio produces a parabola.", targetEccentricityTenths:10, startEccentricityTenths:4, focusDistance:2, requiredSamples:4, successFeedback:"At e = 1 the locus is exactly a parabola.", explorationFeedback:"Sample several ratios before classifying the boundary case.", lowFeedback:"This ratio is below 1, so the locus is still bounded.", highFeedback:"This ratio is above 1, so the locus has separated branches." },
  { type:"derivativeRuleLab", prompt:"Shrink h until the product-rule corner term vanishes.", mode:"product", targetH:0.1, startH:1, requiredMoves:4, successFeedback:"The second-order corner disappears in the limit, leaving the two first-order strips.", explorationFeedback:"Change h several times and compare every region.", mechanismFeedback:"Keep shrinking h so the divided corner term approaches zero." },
  { type:"derivativeRuleLab", prompt:"Coordinate the inner and outer rates in a nested function.", mode:"chain", targetInnerRate:3, targetOuterRate:4, startInnerRate:1, startOuterRate:1, requiredMoves:4, successFeedback:"The total derivative is the product of the two local rates.", explorationFeedback:"Change both rates and watch how the total responds.", mechanismFeedback:"Match both local rates; the total rate is their product." },
  { type:"relatedRatesLab", prompt:"Slide the foot of a fixed ladder and match the target position.", ladderLength:10, horizontalRate:2, targetX:6, startX:2, requiredMoves:4, successFeedback:"At x = 6 the invariant determines both height and vertical rate.", explorationFeedback:"Move through several positions to see why the rate is not constant.", positionFeedback:"Move the ladder foot to x = 6 while the length stays fixed." },

  /* ---- S114–S116 mode samples: one per distinct mode added by the conversion blocks. The
     canonical sample for each of these types appears earlier in this file. ---- */

  // solveBalance (f) — bracketed groups that must be distributed before the tiles can move
  {
    type: "solveBalance",
    prompt: "3(x + 2) = 18. Give the ×3 to everything inside the bracket, then clear.",
    a: 3,
    // b is the constant AFTER distribution: 3(x + 2) expands to 3x + 6, so b = 3 × 2 = 6.
    // It read 2 (the unbracketed constant) until S116, which made (c − b) = 16 indivisible by
    // a = 3 and contradicted the sample's own "x = 4". Caught by widgetIntegrityErrors once the
    // gallery sweep started checking integrity and not just parse.
    b: 6,
    c: 18,
    groups: { count: 3, x: 1, unit: 2 },
    successFeedback: "x = 4. The ×3 reached the x AND the 2 — three groups of (x + 2) is 3x + 6.",
    partialDistributeFeedback: "The pans tipped: the ×3 reached the x but not the 2. A multiplier outside a bracket touches everything inside it.",
    unexpandedFeedback: "The groups are still bracketed. Expand them before removing tiles.",
    wrongFeedback: "Not balanced yet — check what is left on each pan.",
    unbalancedFeedback: "That move changed one pan only. Whatever you do to one side must happen to the other.",
    notIsolatedFeedback: "The pans balance, but x is not standing alone yet — keep clearing.",
    missFeedback: "That is not a move the balance allows from here."
  },
  // solveBalance (g) — signed tiles, where ×(−1) is the beam-reversing move
  {
    type: "solveBalance",
    prompt: "−2x + 5 = −7. Finish with x alone and positive.",
    a: -2,
    b: 5,
    c: -7,
    successFeedback: "x = 6. Multiplying both pans by −1 flipped every tile at once and left x standing positive.",
    wrongFeedback: "Not there yet — read what is on each pan.",
    unbalancedFeedback: "That move changed one pan only.",
    notIsolatedFeedback: "Balanced, but x is not alone yet — and while it reads −x you have a true statement, not an answer.",
    missFeedback: "That is not a move the balance allows from here."
  },
  // solveBalance (h) — an inequality, weighed at a witness from the solution set
  {
    type: "solveBalance",
    prompt: "3x + 2 > 14. Isolate x and keep the comparator honest.",
    a: 3,
    b: 2,
    c: 14,
    relation: "gt",
    successFeedback: "x > 4. Same-operation moves kept the tilt; only multiplying by a negative would have reversed it.",
    notFlippedFeedback: "x is isolated but the comparator still points the old way — after multiplying both pans by a negative the beam reversed.",
    wrongFeedback: "Not isolated yet.",
    unbalancedFeedback: "That move changed one pan only.",
    notIsolatedFeedback: "The tilt is honest, but x is not standing alone yet.",
    missFeedback: "That is not a move the balance allows from here."
  },

  // unitCircleExplore wave — feature hunt
  {
    type: "unitCircleExplore",
    prompt: "The circle starts 90° behind and traces y = sin(x − 90°). Land the trace on its first peak.",
    targetAngle: 180,
    angleStart: 0,
    angleStep: 5,
    trace: "sin",
    phaseDeg: -90,
    targetFeature: { kind: "peak", x: 180, tol: 5 },
    successFeedback: "Peak at 180° — the wave slid exactly as far as the start was delayed.",
    lowFeedback: "Not there yet — 90° is where PLAIN sin x peaks; this pointer started 90° behind.",
    highFeedback: "Past the peak — the trace is already on its way down."
  },
  // unitCircleExplore wave — dials
  {
    type: "unitCircleExplore",
    prompt: "Set the dials until your wave sits on the dashed target.",
    targetAngle: 0,
    angleStart: 90,
    angleStep: 5,
    trace: "sin",
    dials: [
      { param: "amplitude", min: 1, max: 5, step: 1, start: 1, target: 3, feedback: "The swing is wrong — amplitude is the distance from the midline to the crest." },
      { param: "midline", min: -2, max: 3, step: 1, start: 0, target: 1, feedback: "The centre line is wrong — the + 1 lifts crest, trough and axis together." }
    ],
    successFeedback: "Both dials placed — each moved one feature and left the others alone.",
    lowFeedback: "Keep adjusting — compare against the dashed target one feature at a time.",
    highFeedback: "Keep adjusting — compare against the dashed target one feature at a time."
  },
  // unitCircleExplore ghost — an identity is a coincidence that survives dragging
  {
    type: "unitCircleExplore",
    prompt: "Pick the formula whose point never leaves the direct point, then drag θ to 45°.",
    targetAngle: 45,
    angleStart: 0,
    angleStep: 5,
    ghost: "cofunction",
    showGhostCoords: true,
    ghostChoices: [
      { id: "exact", label: "(sin θ, cos θ) — swap the coordinates" },
      { id: "signError", label: "(sin θ, −cos θ) — swap and flip", feedback: "Swapping is right; the flip is the slip. Cofunctions trade places without changing sign." }
    ],
    successFeedback: "Glued at every θ — at 45° the swap changes nothing, because the point is its own mirror there.",
    lowFeedback: "The formula holds — now finish the drag to 45°.",
    highFeedback: "Past 45° — back up to the diagonal."
  },
  // unitCircleExplore branch — the restriction you bump into
  {
    type: "unitCircleExplore",
    prompt: "Only [−90°, 90°] is open. Find the one angle in this branch whose sine is 1/2.",
    targetAngle: 30,
    angleStart: 0,
    angleStep: 5,
    branch: [-90, 90],
    successFeedback: "30° — inside the branch sine never repeats a value, so arcsin can answer with a single angle.",
    lowFeedback: "The sine here is below 1/2 — climb counterclockwise.",
    highFeedback: "The sine here is above 1/2 — ease back down."
  },

  // triangleSolve (c) ratios — two dials, only one of which moves the ratio
  {
    type: "triangleSolve",
    prompt: "Find the angle where opp/hyp reads 0.500 — then resize the triangle and watch it hold.",
    mode: "ratios",
    a: 6,
    b: 6,
    target: 30,
    start: 55,
    ratio: "opp/hyp",
    requiredScaleMoves: 2,
    scaleFeedback: "Resize the triangle first. Until you have, you have not seen whether the ratio follows the lengths.",
    successFeedback: "30° — and every resize left the ratio exactly where it was. The ratio depends on the angle alone.",
    lowFeedback: "opp/hyp is still under 0.500 — open the angle further.",
    highFeedback: "opp/hyp has gone past 0.500 — close the angle a little."
  },
  // compassConstruct (d) — one of the five classical modes
  {
    type: "compassConstruct",
    prompt: "Open the compass until the two arcs cross, then read what the crossings guarantee.",
    mode: "angleBisector",
    span: 6,
    target: 5,
    start: 2,
    successFeedback: "The crossings are the same distance from each arm, so the ray through them splits the angle exactly in half.",
    lowFeedback: "Too narrow — the arcs cannot reach each other yet.",
    highFeedback: "Wider than it needs to be — the crossings have drifted off the useful part of the arms."
  },
  // dilationExplore (b) — k, k², k³ under one drag
  {
    type: "dilationExplore",
    prompt: "Set k = 2 and watch the three readouts move at three different speeds.",
    shape: [[1, 1], [4, 1], [4, 3]],
    center: [0, 0],
    targetK: 2,
    kMin: 0.5,
    kMax: 3,
    kStep: 0.5,
    kStart: 1,
    gridMin: 0,
    gridMax: 8,
    showRatios: ["length", "area", "volume"],
    successFeedback: "k = 2: lengths doubled, area quadrupled, volume ×8. One drag, three exponents.",
    lowFeedback: "Smaller than 2 — watch how much faster the area readout moves than the length one.",
    highFeedback: "Bigger than 2 — ease back and watch the three readouts separate."
  },
  // dilationExplore (b) segments — the side-splitter
  {
    type: "dilationExplore",
    prompt: "Slide the parallel cut and watch whether the two ratios can ever disagree.",
    shape: [[1, 7], [1, 1], [7, 1]],
    center: [0, 0],
    targetK: 0.5,
    kMin: 0.25,
    kMax: 0.75,
    kStep: 0.25,
    kStart: 0.25,
    gridMin: 0,
    gridMax: 8,
    showRatios: ["segments"],
    successFeedback: "At the midpoint both ratios read 1 — the cut is the midsegment, the special case of a rule that held everywhere.",
    lowFeedback: "Higher up the triangle than the midpoint — keep sliding and watch the two ratios stay equal.",
    highFeedback: "Below the midpoint now — the ratios still agree, but the cut you want is halfway."
  },
  // triangleConstraintLab (a) — a lock the learner can break
  {
    type: "triangleConstraintLab",
    prompt: "The legs are locked equal. Drag the apex — can you make the base angles disagree?",
    targetCriterion: "SAS",
    startCriterion: "SAS",
    sideA: 6,
    sideB: 6,
    targetAngle: 60,
    angleStart: 40,
    angleStep: 5,
    requiredMoves: 3,
    constraint: "isoscelesLegs",
    constraintFeedback: "You are reading a triangle whose legs are no longer equal — lock them again before claiming the base angles match.",
    successFeedback: "They never came apart. Equal legs force equal base angles, and no drag you can make will separate them.",
    criterionFeedback: "Those givens are not the ones this claim rests on.",
    angleFeedback: "Bring the apex angle to 60° and read the base angles there.",
    evidenceFeedback: "Try more apex positions first — one drag is not evidence that something cannot happen."
  },
  // quadDrag (e) — the midsegment as a number that will not move
  {
    type: "quadDrag",
    prompt: "Place the fourth corner to make a parallelogram, and watch the midsegment readout.",
    fixed: [[0, 0], [6, 0], [8, 3]],
    targetX: 2,
    targetY: 3,
    startX: 0,
    startY: 0,
    gridMax: 8,
    targetName: "a parallelogram",
    showMidsegment: true,
    successFeedback: "A parallelogram — and the midsegment reads exactly the average of the two parallel sides.",
    sideFeedback: "The opposite sides do not pair up yet — move the corner across.",
    angleFeedback: "The across value is right; the up value still leaves the last side and the diagonals wrong."
  },

  // dilationExplore (S120) — the altitude stage: three geometric means that refuse to break
  {
    type: "dilationExplore",
    prompt: "Drag the foot of the altitude along the hypotenuse and watch h against p·q.",
    shape: [[0, 0], [20, 0], [4, 8]],
    center: [0, 0],
    targetK: 0.2,
    kMin: 0.05,
    kMax: 0.95,
    kStep: 0.05,
    kStart: 0.5,
    gridMin: 0,
    gridMax: 21,
    showRatios: ["altitude"],
    successFeedback: "p = 4 and q = 16, so h = 8 — and 8² is 64, which is 4 × 16 exactly.",
    lowFeedback: "The foot is still left of the target; p is too small.",
    highFeedback: "The foot has gone past the target; p is too large."
  },

  // S116: areaModel with requireFactors — the area alone no longer settles it.
  {
    type: "areaModel",
    prompt: "Build a rectangle of area 20 whose width is the GCF of 8 and 12.",
    targetArea: 20,
    wMax: 10,
    hMax: 10,
    wStart: 1,
    hStart: 1,
    requireFactors: { w: 4, h: 5 },
    factorFeedback: "Area 20 exactly — but that is not the greatest common factor out front; the leftover sum still shares a factor.",
    lowFeedback: "Under 20.",
    highFeedback: "Over 20.",
    successFeedback: "4 x 5 = 4 x (2 + 3): the GCF out front, and a leftover sum sharing nothing."
  },

  // S116 (d): the four remaining classical modes. These shipped with no lesson calling them (the
  // cp- construction lessons teach via authored steppedReveal prose that must not be deleted), so
  // WITHOUT these samples they would sit outside the keyboard gate and the a11y audit entirely —
  // the two gates that caught three real defects in this engine earlier in the session. A mode
  // with no lesson is acceptable; a mode with no coverage is not.
  {
    type: "compassConstruct",
    prompt: "P sits ON the line. Open the compass until the arcs from the two marks cross above and below P.",
    mode: "perpAtPoint",
    span: 6,
    target: 5,
    start: 2,
    successFeedback: "The crossings are equidistant from both marks, and P is the midpoint between them — so the line through the crossings stands square at P.",
    lowFeedback: "Too narrow — the arcs from the two marks do not yet cross.",
    highFeedback: "Wider than needed — the crossings have drifted far from P, though the perpendicular still holds."
  },
  {
    type: "compassConstruct",
    prompt: "P sits OFF the line. Open the compass until the arc from P cuts the line in two places.",
    mode: "perpFromPoint",
    span: 6,
    target: 5,
    start: 2,
    successFeedback: "Both cuts are one arc from P, so P is equidistant from them — which puts P on their perpendicular bisector, and that bisector is the drop.",
    lowFeedback: "Too narrow — the arc from P has not reached the line in two places yet.",
    highFeedback: "Wider than needed — the two cuts are far apart, though the foot still lands square."
  },
  {
    type: "compassConstruct",
    prompt: "Open the compass until the angle at the line can be copied up to the point.",
    mode: "parallelThroughPoint",
    span: 6,
    target: 5,
    start: 2,
    successFeedback: "The copied angle is equal, and equal corresponding angles force the two lines never to meet — parallelism proved, not eyeballed.",
    lowFeedback: "Too narrow — the copied arc is too small to mark the matching angle.",
    highFeedback: "Wider than needed — the angle still copies exactly, but the arcs run off the useful part of the rays."
  },
  // S116 enhancement (i): the distance readout only earns its place on a line that reaches below
  // zero, where position and distance can differ. Integrity refuses it anywhere else.
  {
    type: "numberLinePlace",
    prompt: "Place the marker at \u22124 and read the distance underneath.",
    min: -8,
    max: 8,
    step: 1,
    tickStep: 1,
    target: -4,
    start: 0,
    showDistanceFromZero: true,
    commonPlacements: [
      { value: 4, feedback: "That is +4 — the right distance from zero, on the wrong side." }
    ],
    successFeedback: "Position −4, distance 4. Two different numbers about the same marker: absolute value reports distance, which has no direction.",
    lowFeedback: "Left of −4 — come back toward zero.",
    highFeedback: "Right of −4 — keep moving left, past zero."
  },
  {
    type: "compassConstruct",
    prompt: "Open the compass until the same arc cuts a readable chord on both angles.",
    mode: "copyAngle",
    span: 6,
    target: 5,
    start: 2,
    successFeedback: "The same two radii cut the same chord on both angles, and equal chords on equal circles subtend equal angles — the copy is exact.",
    lowFeedback: "Too narrow — the chord is not yet wide enough to carry across.",
    highFeedback: "Wider than needed — the chord still transfers, but the arcs overshoot the arms."
  },

  // S116: columnCalc with a decimal point — the places are renamed, the arithmetic is identical.
  {
    type: "columnCalc",
    op: "add",
    a: 860,
    b: 75,
    decimals: 2,
    prompt: "Add 8.60 + 0.75 column by column.",
    commonResults: [
      { value: 835, feedback: "8.35 — the tenths made 13, but the extra whole never moved into the ones." }
    ],
    fallbackFeedback: "Start at the hundredths and work left, carrying when a column passes 9.",
    successFeedback: "9.35 — the columns carried exactly as whole numbers do."
  },

  // S116 (k): the rational-function mode — a pole (dashed asymptote, sign flips across it with no
  // crossing) and a hole (punched-out point that splits nothing). Sampled so the mode is visible in
  // /dev/widgets and parsed by the gallery sweep, which is where three defects surfaced this session.
  {
    type: "signChart",
    prompt: "Build the sign chart for f(x) = (x + 7)/(x − 4), then say what happens at x = 4.",
    roots: [{ x: -7, mult: 1 }],
    poles: [{ x: 4, mult: 1 }],
    holes: [1],
    leadingPositive: true,
    successFeedback: "The sign flips at x = 4 without the curve ever touching the axis there — that is a pole, not a root. The hole at x = 1 changes nothing at all.",
    crossFeedback: "The sign has to change across the root at −7 and across the pole at 4 — both are odd, so both flip.",
    bounceFeedback: "That flip belongs to an even cut. Here both cuts are odd, so the sign genuinely changes at each."
  },

  // S116 (j): the probe mode — drag along the axis and watch P(x) collapse to zero at each root.
  // Sampled so the mode is visible in /dev/widgets and swept by the gallery integrity check.
  {
    type: "signChart",
    prompt: "Build the sign chart for f(x) = x³ − 7x + 6, then probe it to find where f is zero.",
    roots: [{ x: -3, mult: 1 }, { x: 1, mult: 1 }, { x: 2, mult: 1 }],
    leadingPositive: true,
    probeX: true,
    successFeedback: "f collapses to exactly 0 at −3, 1 and 2 — the three places a factor vanishes.",
    crossFeedback: "Every factor appears once, so the curve crosses at each root and the sign changes each time.",
    bounceFeedback: "A sign that stays the same across a root belongs to an even multiplicity; all three here are single."
  },

  // S116 Block 6: the phantom root, with its cause on screen. sqrt(x + 6) = x meets at x = 3;
  // squaring reflects the part of the line below the axis upward, and the reflection lands on the
  // parabola at x = -2 — a candidate that was never a solution.
  {
    type: "extraneousRootLab",
    prompt: "\u221a(x + 6) = x. Square both sides, then find the candidate that squaring invented.",
    radical: { c: 6, scale: 1 },
    line: { m: 1, b: 0 },
    probeStart: -2,
    targetPhase: "identifyPhantom",
    trueRoot: 3,
    phantomRoot: -2,
    requiredMoves: 2,
    successFeedback: "x = \u22122 is the phantom. Squaring reflected the negative part of the line upward, and the reflection crossed the curve there \u2014 at a point where the two sides were never equal.",
    phantomPickedFeedback: "x = 3 genuinely solves it: \u221a9 = 3. The question asks for the candidate that does NOT.",
    notSquaredFeedback: "Square both sides first \u2014 the phantom does not exist until you do, and that is the point.",
    signRegionFeedback: "Here the line sits BELOW the axis, so it can never equal a square root. Squaring hides that by flipping it up.",
    domainConfusionFeedback: "That is neither candidate. The two crossings after squaring are the only values to judge."
  },
  {
    type: "volumeBuilder",
    solid: "cylinder",
    prompt: "Set the radius and height until the cylinder's volume reads 36\u03c0.",
    targetVolume: 36,
    rMax: 6,
    rStart: 1,
    hMax: 6,
    hStart: 1,
    successFeedback: "36\u03c0 \u2014 \u03c0r\u00b2h with r = 3 and h = 4. The base circle is 9\u03c0 and four of them stack up.",
    lowFeedback: "Still under 36\u03c0 \u2014 widen the radius or raise the height.",
    highFeedback: "Over 36\u03c0 \u2014 the radius counts twice over, so easing it back moves the volume fastest."
  },
  {
    type: "circleMeasureExplore",
    mode: "radiusScale",
    prompt: "Drag the radius until the circumference reads 10\u03c0.",
    radius: 5,
    targetRadius: 5,
    radiusMax: 10,
    askQuantity: "circumference",
    successFeedback:
      "Radius 5: circumference 10\u03c0, area 25\u03c0. The circumference doubled the radius; the area squared it \u2014 which is why they are never interchangeable.",
    lowFeedback: "Too small \u2014 the circumference is still under 10\u03c0. Pull the radius outward.",
    highFeedback: "Too big \u2014 the circumference has passed 10\u03c0. Ease the radius back in."
  },
  {
    type: "quadraticExplore",
    form: "roots",
    prompt: "Drag the two crossings until the curve is (x \u2212 3)(x + 2).",
    targetA: 1, targetH: 0, targetK: 0,
    targetR1: 3, targetR2: -2,
    rMin: -9, rMax: 9, aMin: -3, aMax: 3,
    aStart: 1, r1Start: 0, r2Start: 0, gridMax: 9,
    successFeedback: "Roots 3 and \u22122 \u2014 a product is zero exactly where a factor is.",
    shapeFeedback: "The opening is wrong \u2014 leave a at 1.",
    vertexFeedback: "(x \u2212 3) is zero at 3, and (x + 2) is zero at \u22122."
  },
  {
    type: "functionMachine",
    prompt: "The input goes through g (double it), then into f (add 3). Find the input that comes out as 11.",
    a: 2, b: 0, square: false,
    stage2: { a: 1, b: 3, square: false },
    join: "compose",
    inputMin: 0, inputMax: 10, inputStep: 1, inputStart: 0,
    targetOutput: 11,
    successFeedback: "4 \u2192 8 \u2192 11 \u2014 g runs first and hands its output to f.",
    lowFeedback: "Under 11 \u2014 raise the input.",
    highFeedback: "Over 11 \u2014 ease the input back."
  },
  {
    type: "functionMachine",
    prompt: "Both machines take the same input: f squares it, g doubles and adds 1. Find where the outputs add to 16.",
    a: 1, b: 0, square: true,
    stage2: { a: 2, b: 1, square: false },
    join: "add",
    inputMin: 0, inputMax: 8, inputStep: 1, inputStart: 0,
    targetOutput: 16,
    successFeedback: "At x = 3: 9 and 7, which add to 16.",
    lowFeedback: "Their sum is still under 16.",
    highFeedback: "Past 16 \u2014 ease the input back."
  },
  {
    type: "sequenceBuild",
    mode: "geometricTerm",
    prompt: "Drag the ratio until term 2 matches the sequence's own second term, 6.",
    first: 2,
    atPosition: 2,
    targetTerm: 6,
    rMax: 9,
    start: 2,
    successFeedback: "r = 3.",
    lowFeedback: "Term 2 is still under 6.",
    highFeedback: "Term 2 has passed 6."
  },
  {
    type: "volumeBuilder",
    prompt: "Set the length in half-units, then the width and height, until the box holds 3 cubes.",
    denomL: 2,
    targetVolume: 3,
    lMax: 6, wMax: 6, hMax: 6,
    successFeedback: "3! 1/2 \u00d7 2 \u00d7 3 = 3.",
    lowFeedback: "Not enough yet.",
    highFeedback: "Past 3 now.",
    wholeUnitFeedback: "That reads as if the tick were a whole unit. Check the length label."
  },
  {
    type: "shapeParts",
    prompt: "Tap each side of the hexagon to count it.",
    shape: "polygon",
    sides: 6,
    part: "sides",
    successFeedback: "Six sides! You touched every one exactly once.",
    missedFeedback: "Some sides are still uncounted \u2014 keep going round the shape.",
    doubleCountFeedback: "One side got counted twice. Tap it again to release it, then go round in order."
  },
  {
    type: "shapeParts",
    prompt: "Tap each vertex of the cube to count it. The dashed lines show the corners round the back.",
    shape: "cube",
    part: "vertices",
    successFeedback: "Eight vertices \u2014 four in front and four behind, including the ones you cannot see directly.",
    missedFeedback: "Not all of them yet. The dashed lines lead to corners at the back.",
    doubleCountFeedback: "That corner is already counted. Tap it again to release it."
  },
  {
    type: "lengthCompare",
    mode: "difference",
    prompt: "The bars start in the same place. Count the paperclips the pencil sticks out past the eraser.",
    unitLabel: "paperclips",
    orientation: "h",
    items: [
      { id: "pencil", label: "pencil", length: 5 },
      { id: "eraser", label: "eraser", length: 3 }
    ],
    answerId: "pencil",
    targetDifference: 2,
    diffMax: 5,
    successFeedback: "2 more paperclips \u2014 the shaded stretch past the eraser's end.",
    countsWholeFeedback: "5 is the WHOLE pencil. Count only the part past the eraser.",
    missFeedback: "Count the shaded paperclips, starting where the eraser ends."
  },
  {
    type: "numberLineHop",
    prompt:
      "Hop from 0 with a stride you choose. Find the LARGEST stride that still lands on both 8 and 12.",
    min: 0,
    max: 16,
    start: 0,
    hop: 1,
    hops: 4,
    direction: "forward",
    hopSizeTargets: [8, 12],
    hopSizeMin: 1,
    hopSizeMax: 12,
    commonLandings: [],
    successFeedback:
      "A stride of 4 hits both marks, and nothing bigger does \u2014 that is the greatest common factor.",
    notLargestFeedback: "It lands on both, so it IS common \u2014 but something bigger also does. Stretch it further.",
    missesTargetFeedback: "Watch the marks: this stride steps over one of them, so it is not a factor of both.",
    missFeedback: "Adjust the stride and watch which marks it lands on."
  },
  {
    type: "binomialAreaLab",
    prompt:
      "Lay out (x + 2)(x + 3) as a rectangle: drag each partition until the sides read x + 2 across and x + 3 down.",
    pX: 1,
    qX: 1,
    targetA: 2,
    targetB: 3,
    startA: 0,
    startB: 0,
    asks: "middle",
    requiredMoves: 3,
    successFeedback:
      "x\u00b2 + 5x + 6. The 5 is not 2 \u00d7 3 \u2014 it is 2 + 3, because the two strips each have one side of length x and they lie alongside each other. The 6 is the corner, where the two constants genuinely do multiply.",
    productMiddleFeedback:
      "That layout makes the middle coefficient 6, which is 2 \u00d7 3 \u2014 the corner's area, not the strips'. Watch the two strip readouts: they ADD.",
    partialFeedback:
      "One side is right and the other is not. Move the remaining partition and watch only its own strip change \u2014 the other one holds still.",
    signFeedback:
      "Right sizes, wrong direction. A negative partition is drawn outside the block, as area taken AWAY, and it flips that strip's sign."
  },
  {
    type: "binomialAreaLab",
    prompt:
      "A difference of squares: drag the partitions to (x + 6) across and (x \u2212 6) down, and watch the middle term disappear.",
    pX: 1,
    qX: 1,
    targetA: 6,
    targetB: -6,
    startA: 1,
    startB: 1,
    asks: "constant",
    requiredMoves: 3,
    successFeedback:
      "x\u00b2 \u2212 36, with no x term at all. The two strips are +6x and \u22126x \u2014 the same size, opposite directions \u2014 so they cancel exactly. That cancellation IS the special product; it is not a rule to memorise.",
    productMiddleFeedback:
      "That layout puts a middle term back. The strips only cancel when the two constants are equal and opposite.",
    partialFeedback:
      "One partition is placed. Move the other to the SAME size in the opposite direction and watch the two strips annihilate.",
    signFeedback:
      "Both partitions are pointing the same way, so the strips add instead of cancelling. One has to be taken away."
  },
  {
    /* numberLineRay (S215, MMIP engine gap G). The learner drags the endpoint, opens or closes the
       dot, and turns the ray round \u2014 and the two both-sides buttons are the reversal lesson:
       \u00d7 (\u22121) turns the ray round on its own endpoint (so the sign must be turned round to
       get the same numbers back), while \u00d7 2 never does. The prompt states the GOAL in words;
       the symbolic form the learner must produce is never printed. */
    type: "numberLineRay",
    prompt:
      "Make the number line show every number that is 2 or smaller. Two of the buttons act on both sides at once \u2014 press them first and watch which way the ray ends up pointing.",
    variable: "x",
    start: { coeff: { n: -1, d: 1 }, constant: { n: 5, d: 1 }, relation: "lt", inclusive: false },
    window: { min: { n: -6, d: 1 }, max: { n: 6, d: 1 }, tickStep: { n: 1, d: 1 } },
    step: { n: 1, d: 1 },
    outOfRange: "clamp",
    offLattice: "snap",
    transforms: [
      { id: "neg", factor: { n: -1, d: 1 }, label: "\u00d7 (\u22121) both sides" },
      { id: "double", factor: { n: 2, d: 1 }, label: "\u00d7 2 both sides" }
    ],
    target: { coeff: { n: 1, d: 1 }, constant: { n: 2, d: 1 }, relation: "lt", inclusive: true },
    successFeedback:
      "The endpoint sits at 2, the dot is filled, and the ray runs down the line \u2014 so 2 itself counts and everything below it counts with it.",
    fallbackFeedback:
      "Three things decide this set: where the endpoint sits, whether the dot is filled, and which way the ray runs. Test a value on each side of the endpoint and see which of the three is not yet right."
  }
];
