import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Lesson, type TLesson, type TStep, type TWidget } from './schema';
import { variantForStep } from './variants';
import { hashSeed } from './prng';

type Cell = {
  id: string;
  title: string;
  courseId: string;
  gradeLevel: number;
  directManipulation: { coverage: 'exact' | 'family' | 'none'; sourceTag?: string; lessonId?: string; stepId?: string; engine?: string };
  representations: string[];
  lessonIds: string[];
};

type SourceStep = { lesson: TLesson; step: TStep };
type PracticeState = { source: SourceStep; widget: TWidget; key: string; certified?: boolean; certification?: { difficulty: string; representation: string; context: string; transferDistance: string } };

type CertifiedPracticeState = {
  stateId: string; difficulty: string; representation: string; context: string; transferDistance: string; widget: TWidget; stateHash: string;
};

type Index = {
  cells: Map<string, Cell>;
  stepsByTag: Map<string, SourceStep[]>;
  stepsByCourse: Map<string, SourceStep[]>;
  byLessonStep: Map<string, SourceStep>;
  certifiedByObjective: Map<string, CertifiedPracticeState[]>;
};

let cache: Promise<Index> | null = null;

async function loadIndex(): Promise<Index> {
  if (cache) return cache;
  cache = (async () => {
    const root = process.cwd();
    const [cellsText, certificationText] = await Promise.all([
      fs.readFile(path.join(root, 'content/mastery/mastery-cells.json'), 'utf8'),
      fs.readFile(path.join(root, 'content/mastery/exact-practice-certification.json'), 'utf8')
    ]);
    const cellsRaw = JSON.parse(cellsText) as { cells: Cell[] };
    const certificationRaw = JSON.parse(certificationText) as { objectives: Array<{ objectiveId: string; states: CertifiedPracticeState[] }> };
    const certifiedByObjective = new Map(certificationRaw.objectives.map((row) => [row.objectiveId, row.states]));
    const cells = new Map(cellsRaw.cells.map((cell) => [cell.id, cell]));
    const stepsByTag = new Map<string, SourceStep[]>();
    const stepsByCourse = new Map<string, SourceStep[]>();
    const byLessonStep = new Map<string, SourceStep>();
    const courseRoot = path.join(root, 'content/courses');
    for (const dir of await fs.readdir(courseRoot)) {
      const lessonDir = path.join(courseRoot, dir, 'lessons');
      try {
        for (const file of (await fs.readdir(lessonDir)).filter((name) => name.endsWith('.json'))) {
          const lesson = Lesson.parse(JSON.parse(await fs.readFile(path.join(lessonDir, file), 'utf8')));
          for (const step of lesson.steps) {
            const row = { lesson, step };
            byLessonStep.set(`${lesson.id}:${step.id}`, row);
            const courseRows = stepsByCourse.get(lesson.courseId) ?? [];
            courseRows.push(row);
            stepsByCourse.set(lesson.courseId, courseRows);
            if (step.conceptTag) {
              const tagRows = stepsByTag.get(step.conceptTag) ?? [];
              tagRows.push(row);
              stepsByTag.set(step.conceptTag, tagRows);
            }
          }
        }
      } catch {
        // A course without a lessons directory is ignored. Current production content has none.
      }
    }
    return { cells, stepsByTag, stepsByCourse, byLessonStep, certifiedByObjective };
  })();
  return cache;
}

const STATIC_RESPONSE = new Set(['mcq', 'numeric', 'fractionEntry', 'pointEntry', 'buildExpression', 'placeCompare', 'rationalCompare']);
const DIRECT = new Set([
  'slider','lineExplore','fractionBar','quadraticExplore','unitCircleExplore','systemsExplore','numberLinePlace','functionMachine','probabilityArea','hundredthsGrid',
  'transformExplore','angleMeasure','dilationExplore','barBuilder','dotPlot','boxPlot','areaModel','placeValue','doubleNumberLine','scatterFit','fractionOfSet',
  'percentBar','integerChips','volumeBuilder','netFold','ratioTable','elapsedTime','treeDiagram','spinnerSim','circleAngleExplore','expLogExplore','secantSlope',
  'argandExplore','matrixTransform','vectorExplore','circleMeasureExplore','polarTrace','signChart','sequenceBuild','triangleSolve','compassConstruct',
  'derivativeTrace','riemannSum','accumulateArea','sliceSum','slopeField','taylorApprox','triangleConstraintLab','coordinateProofLab','solidSliceLab',
  'pointSetReasoningLab','geometricConstraintLab','exactNumberLab','affineRelationshipLab','lineRelationLab','triangleAngleLab','verticalLineScanner','covariationScrubber','samplingBiasLab','shapeFamilyBuilder','unitRuler','quotientReasoningLab','proportionalReasoningLab','placeValueTransformLab','graphStoryLab','conditionalTableLab',
  'conicLocusLab','derivativeRuleLab','relatedRatesLab','quadDrag','sampleSim','ciCapture','shuffleTest','distanceGrid','algebraTiles','clockSet','balanceScale',
  'inversePipeline','solveBalance','tenFrame','numberLineHop','baseTenCompose','lengthCompare','moneyBoard','fractionGrid','oddEvenPairs','mixedRegroup','columnCalc','evalOrder','extraneousRootLab','binomialAreaLab'
]);

function withId(step: TStep, id: string, conceptTag?: string): TStep {
  return { ...step, id, ...(conceptTag ? { conceptTag } : {}) };
}

function missionPrediction(invariant: string) {
  return {
    prompt: 'As you change the model, what should remain mathematically dependable?',
    options: [
      { id: 'relationship', label: 'The governing relationship or invariant' },
      { id: 'numbers', label: 'Every visible number and position' },
      { id: 'appearance', label: 'Only the colors and labels' }
    ],
    outcomeId: 'relationship',
    reveal: `The reliable feature is the relationship: ${invariant}. The surface may change while the mathematics stays connected.`
  };
}

function missionCml(step: TStep, targetTitle: string): TStep['cml'] {
  const prior = step.cml;
  const invariant = prior?.invariants?.[0] ?? `the quantities must continue to represent ${targetTitle.toLowerCase()}`;
  return {
    stage: 'construct',
    flagship: true,
    kernel: prior?.kernel ?? 'equivalence-transformation',
    actionGoal: prior?.actionGoal ?? `Change the model and track what stays true about ${targetTitle.toLowerCase()}.`,
    invariants: prior?.invariants?.length ? prior.invariants : [invariant],
    misconceptions: prior?.misconceptions?.length ? prior.misconceptions : ['Changing a surface feature without preserving the governing relationship'],
    representations: prior?.representations?.length ? prior.representations : ['diagram','symbolic'],
    translationFrom: prior?.translationFrom ?? 'diagram',
    translationTo: prior?.translationTo ?? 'symbolic',
    fadeLevel: Math.max(1, prior?.fadeLevel ?? 0),
    transferFamily: prior?.transferFamily ?? `mastery-family:${step.conceptTag ?? 'mathematics'}`,
    delayed: true,
    counterfactualPrompt: prior?.counterfactualPrompt ?? 'What single change would break the relationship you are using?',
    explanation: prior?.explanation ?? {
      prompt: `Which statement best explains why the construction represents ${targetTitle.toLowerCase()}?`,
      options: [
        { id:'invariant', label:'The linked quantities preserve the governing relationship.', correct:true, feedback:'Yes. The invariant—not the picture alone—is the mathematical reason.' },
        { id:'looks', label:'It looks similar to the example.', correct:false, feedback:'Visual resemblance is not sufficient; identify the relationship that remains true.' },
        { id:'answer', label:'The displayed answer is large enough.', correct:false, feedback:'Magnitude alone does not establish the concept. Track how the quantities are connected.' }
      ]
    }
  };
}

function practiceStep(state: PracticeState, tag: string, index: number, challenge = false): TStep {
  const { source, widget } = state;
  const kind = challenge ? 'challenge' : 'check';
  const certifiedRepresentation = state.certification?.representation === 'verbal'
    ? 'language'
    : state.certification?.representation;
  const representations = certifiedRepresentation
    ? [certifiedRepresentation, ...(certifiedRepresentation === 'symbolic' ? [] : ['symbolic'])]
    : STATIC_RESPONSE.has(widget.type) ? ['symbolic'] : ['diagram','symbolic'];
  return {
    id: `mission-${challenge ? 'transfer' : 'practice'}-${index}`,
    kind,
    body: challenge
      ? 'Choose the method yourself. This item deliberately withholds the lesson label so you must recognize the structure.'
      : state.certified
        ? `Certified exact practice · ${state.certification?.difficulty ?? 'core'} · ${state.certification?.representation ?? 'symbolic'} · ${state.certification?.context ?? 'non-contextual'}. Work independently and justify the governing relationship.`
        : 'Work independently. Use the relationship, not the surface pattern from the previous example.',
    widget,
    conceptTag: source.step.conceptTag ?? tag,
    ...(!state.certified && source.step.variant ? { variant: source.step.variant } : {}),
    cml: {
      stage: challenge ? 'generalize' : 'retrieve',
      flagship: false,
      invariants: source.step.cml?.invariants ?? [],
      misconceptions: source.step.cml?.misconceptions ?? [],
      representations: representations as Array<'diagram'|'symbolic'|'language'|'table'>,
      fadeLevel: challenge ? 3 : 2,
      transferFamily: source.step.cml?.transferFamily ?? `mastery-family:${tag}`,
      delayed: true
    },
    ...(challenge ? {
      hints: [
        'Name the quantities and the relationship before calculating.',
        'Choose a representation that makes the invariant visible.',
        'Check the sign, units, and size of your result against the situation.'
      ],
      explanationVariants: [
        'A correct solution preserves the governing relationship across every representation used.',
        'The result is justified by the invariant, then checked against the context or graph.'
      ] as [string,string]
    } : source.step.explanationVariants ? { explanationVariants: source.step.explanationVariants } : {})
  };
}

function certifiedPracticeBank(states: CertifiedPracticeState[], source: SourceStep | undefined, tag: string): PracticeState[] {
  if (!source) return [];
  return states.map((state) => ({
    source: { lesson: source.lesson, step: { ...source.step, conceptTag: tag } },
    widget: state.widget,
    key: `certified:${state.stateHash}`,
    certified: true,
    certification: { difficulty: state.difficulty, representation: state.representation, context: state.context, transferDistance: state.transferDistance }
  }));
}

function widgetKey(widget: TWidget | undefined): string {
  return widget ? JSON.stringify(widget) : '';
}

function selectPracticeBank(rows: SourceStep[], tag: string, seed: string, count = 32): PracticeState[] {
  const eligible = rows.filter(({ step }) => step.widget && ['check','challenge'].includes(step.kind));
  const exact = eligible.filter(({ step }) => step.conceptTag === tag);
  const ordered = [...exact, ...eligible.filter(({ step }) => step.conceptTag !== tag)];
  if (!ordered.length) return [];
  const expanded: PracticeState[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < count * 8 && expanded.length < count; i++) {
    const source = ordered[i % ordered.length];
    const generated = source.step.widget ? variantForStep(source.step, `${seed}:bank:${i}`) : null;
    const widget = generated?.widget ?? source.step.widget;
    if (!widget) continue;
    const key = `${source.step.conceptTag}:${widgetKey(widget)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    expanded.push({ source, widget, key });
  }
  // Some bespoke surfaces are intentionally static. Preserve authored breadth without pretending
  // that cosmetic seeds create new mathematics.
  if (expanded.length < Math.min(8, count)) {
    for (const source of ordered) {
      if (!source.step.widget) continue;
      const key = `${source.lesson.id}:${source.step.id}:${widgetKey(source.step.widget)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      expanded.push({ source, widget: source.step.widget, key });
      if (expanded.length >= count) break;
    }
  }
  return expanded;
}

/**
 * S237. Does a Mastery Studio mission exist for this tag?
 *
 * The lesson-complete screen offered "Open Mastery Studio" whenever the lesson had a primary
 * concept tag — but /mastery/[conceptTag] calls notFound() when buildMasteryMission returns null,
 * and it returns null for any tag the mastery index has no cell or no tagged steps for. Measured
 * across the corpus: 571 of 1,701 lessons offered that link and 404'd on it. One completion in
 * three ended at a dead end, at the most rewarding moment in the product.
 *
 * The two guards below are buildMasteryMission's ONLY null paths, deliberately checked here rather
 * than duplicated: a caller can ask whether the destination exists without paying to construct a
 * whole 32-state mission just to throw it away. If a third null path is ever added to the builder
 * it must be added here too — masteryMission.links.s237.test.ts pins the two functions in
 * agreement across every authored tag, so the divergence fails loudly rather than silently
 * restoring the 404.
 */
export async function masteryMissionExists(conceptTag: string): Promise<boolean> {
  const index = await loadIndex();
  if (!index.cells.get(conceptTag)) return false;
  return (index.stepsByTag.get(conceptTag) ?? []).length > 0;
}

export async function buildMasteryMission(conceptTag: string, round = 1): Promise<TLesson | null> {
  const index = await loadIndex();
  const cell = index.cells.get(conceptTag);
  if (!cell) return null;
  const tagRows = index.stepsByTag.get(conceptTag) ?? [];
  const courseRows = index.stepsByCourse.get(cell.courseId) ?? [];
  if (!tagRows.length) return null;
  const seed = `${conceptTag}:round:${Math.max(1, Math.floor(round))}`;

  const directSource = cell.directManipulation.lessonId && cell.directManipulation.stepId
    ? index.byLessonStep.get(`${cell.directManipulation.lessonId}:${cell.directManipulation.stepId}`)
    : undefined;
  const exactDirect = tagRows.find(({ step }) => step.widget && DIRECT.has(step.widget.type));
  const constructionSource = exactDirect ?? directSource ?? courseRows.find(({ step }) => step.widget && DIRECT.has(step.widget.type));

  const certifiedStates = index.certifiedByObjective.get(conceptTag) ?? [];
  const certifiedSource = tagRows.find(({ step }) => Boolean(step.widget)) ?? tagRows[0];
  const certifiedBank = certifiedPracticeBank(certifiedStates, certifiedSource, conceptTag);
  const generatedBank = selectPracticeBank([...tagRows, ...courseRows], conceptTag, seed, 32);
  const rotatePick = (rows: PracticeState[], count: number, salt: string): PracticeState[] => {
    if (!rows.length || count <= 0) return [];
    const start = hashSeed(`${seed}:${salt}`) % rows.length;
    return Array.from({ length: Math.min(count, rows.length) }, (_, i) => rows[(start + i * 5) % rows.length]);
  };
  const picked = certifiedBank.length
    ? [
        ...rotatePick(certifiedBank.filter((row) => row.certification?.transferDistance !== 'far' && row.certification?.difficulty !== 'stretch'), 3, 'exact'),
        ...rotatePick(generatedBank, 2, 'interleave'),
        ...rotatePick(certifiedBank.filter((row) => row.certification?.transferDistance === 'far' || row.certification?.difficulty === 'stretch'), 2, 'transfer')
      ].filter((row, idx, all) => all.findIndex((candidate) => candidate.key === row.key) === idx)
    : (() => {
        const bank = generatedBank.slice(0, 32);
        const start = hashSeed(seed) % Math.max(1, bank.length);
        return Array.from({ length: Math.min(7, bank.length) }, (_, i) => bank[(start + i * 5) % bank.length]);
      })();
  const steps: TStep[] = [
    {
      id:'mission-launch', kind:'concept',
      body:`Mastery mission: build ${cell.title.toLowerCase()}, explain why it works, distinguish a near miss, then solve mixed and transfer cases without being told the method.`,
      conceptTag
    }
  ];

  if (constructionSource?.step.widget) {
    const invariant = constructionSource.step.cml?.invariants?.[0] ?? `the model must continue to represent ${cell.title.toLowerCase()}`;
    const construct = withId(constructionSource.step, 'mission-construct', constructionSource.step.conceptTag ?? conceptTag);
    steps.push({
      ...construct,
      kind:'interactive',
      body: constructionSource.step.conceptTag === conceptTag
        ? 'Construct the idea before calculating. Move the mathematical object and watch the linked representation respond.'
        : `Use this ${cell.courseId.replaceAll('-',' ')} family laboratory to expose the relationship that supports today’s target.`,
      predict: construct.predict ?? missionPrediction(invariant),
      cml: missionCml(construct, cell.title)
    });
  }

  for (let i = 0; i < picked.length; i++) steps.push(practiceStep(picked[i], conceptTag, i + 1, i >= picked.length - 2));

  while (steps.length < 8) {
    const source = tagRows.find(({ step }) => step.widget) ?? tagRows[0];
    if (!source?.step.widget) break;
    steps.push(practiceStep({ source, widget: source.step.widget, key: `${source.lesson.id}:${source.step.id}` }, conceptTag, steps.length, steps.length >= 6));
  }

  steps.push({
    id:'mission-recap', kind:'recap', body:'', conceptTag,
    takeaways:[
      `The governing relationship for ${cell.title.toLowerCase()} matters more than the surface form.`,
      'A near miss changes or ignores an invariant; checking representations exposes it.',
      'Transfer means recognizing the structure when the problem no longer announces the method.'
    ],
    teaser:'Return after a delay for a fresh 32-state bank and mixed cumulative retrieval.'
  });

  const mission: TLesson = {
    id:`mastery-${conceptTag}-${Math.max(1, Math.floor(round))}`,
    slug:`mastery-${conceptTag}-${Math.max(1, Math.floor(round))}`,
    title:`Mastery Studio: ${cell.title}`,
    courseId:cell.courseId,
    chapterId:'mastery-studio',
    minutes:14,
    readingProfile:cell.gradeLevel <= 2 ? 'early' : 'standard',
    steps:steps.slice(0,15),
    remedials:[]
  };
  return Lesson.parse(mission);
}

export async function primaryConceptTag(lesson: TLesson): Promise<string | null> {
  const counts = new Map<string, number>();
  for (const step of lesson.steps) if (step.conceptTag) counts.set(step.conceptTag, (counts.get(step.conceptTag) ?? 0) + 1);
  return [...counts].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null;
}
