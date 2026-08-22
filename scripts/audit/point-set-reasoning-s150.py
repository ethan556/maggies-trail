#!/usr/bin/env python3
import json, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'scripts/session/baselines-s150'
TARGETS={
 'cg-01-03.json':'content/courses/coordinate-geometry/lessons/cg-01-03.json',
 'dd-04-01.json':'content/courses/data-distributions/lessons/dd-04-01.json',
}
def canon(x): return json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False)
def digest(x): return hashlib.sha256(canon(x).encode()).hexdigest()
def nodes(d):
 out=[]
 for i,s in enumerate(d.get('steps',[])):
  if isinstance(s,dict) and 'widget' in s: out.append((f"steps[{i}]/{s.get('id')}",s))
 for i,r in enumerate(d.get('remedials',[])):
  c=r.get('check') if isinstance(r,dict) else None
  if isinstance(c,dict) and 'widget' in c: out.append((f"remedials[{i}].check/{c.get('id')}",c))
 return out
def strip_widgets(d):
 d=json.loads(json.dumps(d))
 for _,n in nodes(d): n['widget']='__WIDGET__'
 return d
def validate(old,new,path):
 assert new.get('type')=='pointSetReasoningLab',f'{path}: type'
 assert old.get('prompt')==new.get('prompt'),f'{path}: prompt drift'
 assert new.get('requiredExplorations',0)>=1,f'{path}: exploration missing'
 assert len(new.get('requiredStageKeys',[]))>=new.get('requiredExplorations',0),f'{path}: impossible exploration'
 assert len(new.get('requiredStageKeys',[]))==len(set(new.get('requiredStageKeys',[]))),f'{path}: duplicate required stages'
 if old.get('type')=='numeric':
  assert new.get('answerMode')=='numeric',f'{path}: numeric mode'
  assert old.get('tolerance',0)==new.get('tolerance',0),f'{path}: tolerance drift'
  assert (old.get('unit') or '')==(new.get('answerUnit') or ''),f'{path}: unit drift'
  assert old.get('commonErrors',[])==new.get('numericErrors',[]),f'{path}: numeric errors drift'
  assert old.get('fallbackFeedback')==new.get('fallbackFeedback'),f'{path}: fallback drift'
 elif old.get('type')=='mcq':
  assert new.get('answerMode')=='choice',f'{path}: choice mode'
  oo=old.get('options',[]); nn=new.get('choices',[])
  assert [(x['id'],x['label'],x['feedback']) for x in oo]==[(x['id'],x['label'],x['feedback']) for x in nn],f'{path}: choices drift'
  ci=[x for x in oo if x.get('correct')]
  assert len(ci)==1,f'{path}: old correct count'
  correct=ci[0]
  ncorrect=[x for x in nn if x['id']==correct['id']]
  assert len(ncorrect)==1 and not str(ncorrect[0].get('claim','')).startswith('misconception:'),f'{path}: correct carrier'
  for x in nn:
   if x['id']!=correct['id']: assert str(x.get('claim','')).startswith('misconception:'),f'{path}: distractor carrier {x["id"]}'
  assert new.get('successFeedback')==correct['feedback'],f'{path}: success drift'
 else: raise AssertionError(f'{path}: unsupported {old.get("type")}')
ledger=[]; total=main=rem=0
for base_name,rel in TARGETS.items():
 old=json.loads((BASE/base_name).read_text(encoding='utf-8')); new=json.loads((ROOT/rel).read_text(encoding='utf-8'))
 assert strip_widgets(old)==strip_widgets(new),f'{rel}: non-widget authored drift'
 on=nodes(old); nn=nodes(new)
 assert [p for p,_ in on]==[p for p,_ in nn],f'{rel}: node identity drift'
 for (p,o),(p2,n) in zip(on,nn):
  validate(o['widget'],n['widget'],f'{rel}:{p}')
  assert o.get('variant')==n.get('variant'),f'{rel}:{p}: variant drift'
  total+=1; rem+=p.startswith('remedials'); main+=not p.startswith('remedials')
  ledger.append({'lesson':rel,'node':p,'oldType':o['widget']['type'],'newType':n['widget']['type'],'oldWidgetHash':digest(o['widget']),'newWidgetHash':digest(n['widget']),'variant':o.get('variant')})
assert (total,main,rem)==(13,11,2),(total,main,rem)
# Prove all non-target lesson bytes against sealed Session 149 ledger.
hashes=json.loads((ROOT/'SESSION149_LESSON_HASHES.json').read_text(encoding='utf-8'))['files']
target_rels=set(TARGETS.values()); authorized_later={'content/courses/solving-equations/lessons/alg1-01-02.json','content/courses/solving-equations/lessons/alg1-01-03.json','content/courses/solving-equations/lessons/alg1-02-01.json','content/courses/solving-equations/lessons/alg1-02-02.json','content/courses/solving-equations/lessons/alg1-02-03.json','content/courses/solving-equations/lessons/alg1-04-01.json','content/courses/solving-equations/lessons/alg1-04-02.json','content/courses/solving-equations/lessons/alg1-04-03.json','content/courses/sequences-series/lessons/sr-01-01.json','content/courses/sequences-series/lessons/sr-01-03.json','content/courses/sequences-series/lessons/sr-02-01.json','content/courses/sequences-series/lessons/sr-02-02.json','content/courses/sequences-series/lessons/sr-02-03.json','content/courses/sequences-series/lessons/sr-03-01.json','content/courses/sequences-series/lessons/sr-03-02.json','content/courses/sequences-series/lessons/sr-03-03.json','content/courses/sequences-series/lessons/sr-04-01.json','content/courses/sequences-series/lessons/sr-04-02.json','content/courses/sequences-series/lessons/sr-04-03.json','content/courses/sequences-series/lessons/sr-05-03.json','content/courses/coordinate-proofs/lessons/cx-02-01.json','content/courses/coordinate-proofs/lessons/cx-02-02.json','content/courses/coordinate-proofs/lessons/cx-02-03.json','content/courses/coordinate-proofs/lessons/cx-03-01.json','content/courses/coordinate-proofs/lessons/cx-03-03.json','content/courses/coordinate-proofs/lessons/cx-04-01.json','content/courses/coordinate-proofs/lessons/cx-04-02.json','content/courses/coordinate-proofs/lessons/cx-04-03.json','content/courses/coordinate-proofs/lessons/cx-05-03.json'}; S203C_AUTHORIZED={'content/courses/two-step-equations/lessons/tse-01-03.json','content/courses/expressions-equations/lessons/ee-02-03.json'}; S203K_AUTHORIZED={'content/courses/polygons-quadrilaterals/lessons/pq-03-02.json','content/courses/polygons-quadrilaterals/lessons/pq-04-01.json'}; authorized_later |= S203K_AUTHORIZED
authorized_later|=S203C_AUTHORIZED
S203J_AUTHORIZED={'content/courses/statistical-inference/lessons/si-01-01.json','content/courses/statistical-inference/lessons/si-01-02.json','content/courses/statistical-inference/lessons/si-02-03.json','content/courses/statistical-inference/lessons/si-03-03.json','content/courses/statistical-inference/lessons/si-04-03.json','content/courses/statistical-inference/lessons/si-05-02.json'}  # S203J: HS Tier C repair pilot
authorized_later|=S203J_AUTHORIZED
S203D_AUTHORIZED={'content/courses/exponents-scientific-notation/lessons/esn-01-03.json','content/courses/proportional-relationships/lessons/pr-04-03.json'}
authorized_later|=S203D_AUTHORIZED
S203E_AUTHORIZED={'content/courses/geometry-g7/lessons/g7-03-03.json','content/courses/transformations-measurement/lessons/tm-01-03.json'}
authorized_later|=S203E_AUTHORIZED
S203F_AUTHORIZED={'content/courses/ratios-rates/lessons/rr-02-03.json','content/courses/number-system/lessons/ns-04-03.json','content/courses/proportional-relationships/lessons/pr-03-03.json'}
authorized_later|=S203F_AUTHORIZED
S203L_AUTHORIZED={'content/courses/solid-geometry/lessons/sg-01-02.json'}  # S203L: recovered refusal — volumeBuilder sphere mode
authorized_later |= S203L_AUTHORIZED
S203M_AUTHORIZED={'content/courses/polygons-quadrilaterals/lessons/pq-02-01.json'}  # S203M: refusal re-audit — one recovery, three refusals confirmed against the engine catalogue
authorized_later |= S203M_AUTHORIZED
S203N_AUTHORIZED={'content/courses/right-triangles-trig/lessons/rt-05-02.json','content/courses/similarity/lessons/sy-01-03.json','content/courses/triangle-congruence/lessons/tc-01-03.json','content/courses/triangle-congruence/lessons/tc-02-02.json','content/courses/triangle-congruence/lessons/tc-02-03.json'}  # S203N: geometry batch 2 — congruence criteria and angle sum
authorized_later |= S203N_AUTHORIZED
S203P_AUTHORIZED={'content/courses/complex-numbers/lessons/cn-01-02.json','content/courses/exponential-functions/lessons/exp-02-01.json','content/courses/exponential-functions/lessons/exp-02-02.json','content/courses/exponential-functions/lessons/exp-02-03.json','content/courses/exponential-functions/lessons/exp-03-01.json','content/courses/exponential-functions/lessons/exp-04-03.json','content/courses/exponents-polynomials/lessons/ep-04-02.json','content/courses/exponents-polynomials/lessons/ep-04-03.json','content/courses/functions-and-sequences/lessons/fn-01-02.json','content/courses/functions-and-sequences/lessons/fn-04-01.json','content/courses/logarithms/lessons/lg-03-02.json','content/courses/logarithms/lessons/lg-04-01.json','content/courses/logarithms/lessons/lg-04-02.json','content/courses/quadratics/lessons/qu-03-03.json','content/courses/solving-equations/lessons/alg1-03-01.json','content/courses/solving-equations/lessons/alg1-03-02.json','content/courses/systems-equations/lessons/se-02-01.json','content/courses/systems-equations/lessons/se-02-02.json','content/courses/systems-equations/lessons/se-04-01.json','content/courses/systems-equations/lessons/se-04-02.json'}  # S203P: algebra & functions batch — exponentials, logs, factoring, systems, sequences, functions
authorized_later |= S203P_AUTHORIZED
S203Q_AUTHORIZED={'content/courses/function-transformations/lessons/ft-01-03.json','content/courses/function-transformations/lessons/ft-03-03.json','content/courses/linear-functions/lessons/lf-02-03.json','content/courses/polynomial-functions/lessons/pf-01-01.json','content/courses/right-triangles-trig/lessons/rt-03-03.json','content/courses/right-triangles-trig/lessons/rt-04-01.json','content/courses/trig-functions/lessons/tf-01-01.json','content/courses/trig-functions/lessons/tf-01-02.json','content/courses/trig-functions/lessons/tf-01-03.json','content/courses/trig-functions/lessons/tf-04-02.json','content/courses/trig-functions/lessons/tf-04-03.json','content/courses/trig-functions/lessons/tf-05-01.json','content/courses/trig-functions/lessons/tf-05-02.json','content/courses/trig-functions/lessons/tf-05-03.json'}  # S203Q: trig batch — unit circle dials, right-triangle ratios, wave parameters
authorized_later |= S203Q_AUTHORIZED
S203R_AUTHORIZED={'content/courses/conic-sections/lessons/co-02-01.json','content/courses/conic-sections/lessons/co-02-02.json','content/courses/conic-sections/lessons/co-03-03.json','content/courses/conic-sections/lessons/co-05-03.json','content/courses/derivative-rules/lessons/dr-02-02.json','content/courses/derivative-rules/lessons/dr-02-03.json','content/courses/derivative-rules/lessons/dr-05-03.json','content/courses/function-analysis/lessons/fna-01-03.json','content/courses/function-analysis/lessons/fna-03-01.json','content/courses/function-analysis/lessons/fna-05-01.json','content/courses/limits-continuity/lessons/lc-02-01.json','content/courses/limits-continuity/lessons/lc-03-02.json','content/courses/limits-continuity/lessons/lc-03-03.json','content/courses/limits-continuity/lessons/lc-04-01.json','content/courses/polar-parametric/lessons/pp-01-01.json','content/courses/polar-parametric/lessons/pp-02-01.json','content/courses/polynomial-rational-analysis/lessons/pra-03-01.json','content/courses/polynomial-rational-analysis/lessons/pra-03-03.json'}  # S203R: calculus & precalculus batch — limits, derivatives, conics, polar, identities, function analysis
authorized_later |= S203R_AUTHORIZED
S203S_AUTHORIZED={'content/courses/constructions-and-proof/lessons/cp-04-03.json','content/courses/exponential-functions/lessons/exp-03-02.json','content/courses/exponential-functions/lessons/exp-03-03.json','content/courses/function-transformations/lessons/ft-01-01.json','content/courses/function-transformations/lessons/ft-05-02.json','content/courses/geometry-foundations/lessons/gf-02-02.json','content/courses/logarithms/lessons/lg-05-01.json','content/courses/logarithms/lessons/lg-05-02.json','content/courses/radicals-and-exponents/lessons/rad-03-01.json','content/courses/radicals-and-exponents/lessons/rad-03-02.json','content/courses/radicals-and-exponents/lessons/rad-03-03.json'}  # S203S: post-guard batch — verified fresh against live tiers, exponents/logs/angles/functions
authorized_later |= S203S_AUTHORIZED
S203T_AUTHORIZED={'content/courses/exponents-polynomials/lessons/ep-01-03.json','content/courses/radical-functions/lessons/re-05-01.json','content/courses/vectors-matrices/lessons/vec-01-03.json','content/courses/vectors-matrices/lessons/vec-02-02.json'}  # S203T: vectors & remaining exponents — verified against schema, tier-guarded, math-verified
authorized_later |= S203T_AUTHORIZED
S203U_AUTHORIZED={'content/courses/conic-sections/lessons/co-04-02.json','content/courses/conic-sections/lessons/co-04-03.json','content/courses/function-analysis/lessons/fna-04-01.json','content/courses/polar-parametric/lessons/pp-03-03.json','content/courses/similarity/lessons/sy-03-02.json'}  # S203U: final sweep — conic algebra, function composition, polar roots, similarity proportion
authorized_later |= S203U_AUTHORIZED
S203Y_AUTHORIZED={'content/courses/polynomial-rational-analysis/lessons/pra-05-01.json'}  # S203Y: refusal re-audit — pra-05-01 recovered via signChart, an engine never checked when it was refused
authorized_later |= S203Y_AUTHORIZED
S203Z_AUTHORIZED={'content/courses/constructions-and-proof/lessons/cp-05-03.json','content/courses/geometry-foundations/lessons/gf-05-01.json'}  # S203Z: Tier D repair — the two convertible with existing engines (lineRelationLab, dilationExplore)
authorized_later |= S203Z_AUTHORIZED
S204A_AUTHORIZED={'content/courses/counting-to-20-k/lessons/kc-02-03.json','content/courses/data-distributions/lessons/dd-01-01.json'}  # S204A: the two load-bearing C-only concepts — kc-order-numbers and statistical-question
authorized_later |= S204A_AUTHORIZED
S204B_AUTHORIZED={'content/courses/trig-functions/lessons/tf-02-03.json'}  # S204B: second false refusal recovered — tf-02-03 Arc Length via circleMeasureExplore arcSector
authorized_later |= S204B_AUTHORIZED
S204C_AUTHORIZED={'content/courses/geometry-foundations/lessons/gf-03-03.json','content/courses/geometry-foundations/lessons/gf-04-03.json'}  # S204C: rotationLab proves itself — the two Tier D rotation lessons it was built for
authorized_later |= S204C_AUTHORIZED
S205_AUTHORIZED={'content/courses/vectors-matrices/lessons/vec-04-02.json'}  # S205: false-refusal re-check sweep — six candidates adjudicated individually against the three-gate fit test (models / reaches / represents)
authorized_later |= S205_AUTHORIZED
S205B_AUTHORIZED={'content/courses/curve-analysis/lessons/ca-01-03.json'}  # S205B: insert-after pilot: Explain -> Reveal -> Manipulate -> Generalize on the steppedReveal wall
authorized_later |= S205B_AUTHORIZED
S205C_AUTHORIZED={'content/courses/curve-analysis/lessons/ca-02-02.json'}  # S205C: The f″ mode's first real payoff: ca-02-02 (The Second-Derivative Test). The authored reveal shows the test FAILING — x⁴, −x⁴, x³ all have f′(0)=0 and f″(0)=0 with three different verdicts. Inserted after it is the complement the lesson never had: the test WORKING, on x³−3x, where f″=6x is −6 at one critical point and +6 at the other. Same test, opposite signs, opposite verdicts — and the learner drags across the inflection at x=0 to watch the sign flip. Reveal keeps its teaching; the lab supplies the doing.
authorized_later |= S205C_AUTHORIZED
S205D_AUTHORIZED={'content/courses/curve-analysis/lessons/ca-05-01.json','content/courses/derivatives-in-context/lessons/dc-02-01.json'}  # S205D: Campaign batch 1 off the new prefilter (scripts/measure/insertion-candidates.mjs): two insertions from the top-ranked Tier-C + steppedReveal cluster, two refusals with cites. Both insertions reuse engines already proven at Tier A in the SAME course — zero new registration work, per Protocol v2.
authorized_later |= S205D_AUTHORIZED
S205E_AUTHORIZED={'content/courses/solving-equations/lessons/alg1-01-01.json'}  # S205E: Campaign batch 2 off the prefilter. One insertion (alg1-01-01, solveBalance — proven in-course, zero registration work). Two refusals, one of them on grounds the campaign will keep meeting: a lesson can be a high-scoring CANDIDATE and still be wrong to convert, because a second lab on material an existing rich step already covers pads the rich-step metric without adding a doing-moment.
authorized_later |= S205E_AUTHORIZED
S205H_AUTHORIZED={'content/courses/integration-accumulation/lessons/in-04-02.json'}  # S205H: The vertical-offset (+C) control's first payoff: in-04-02 'Pinning Down the Constant'. The authored reveal argues that sliding a curve up cannot tilt it, so f′ carries no information about vertical position — and until now no engine could let a learner DO that. derivativeTrace gained an offsetMax control (local state, never graded, because a grader that could see C would contradict the claim), and this insertion puts it where the argument is made.
authorized_later |= S205H_AUTHORIZED
S205I_AUTHORIZED=set()  # S205I: dr/dc steppedReveal cluster closeout. Zero insertions, two refusals — and that is the finding, not a failure. Of the 9 dr/dc lessons carrying a steppedReveal, 1 converted (dc-02-01, S205D) and 5 now refuse on cited structural grounds. The cluster is close to exhausted, which matters because the campaign has been framed around a wall that can supply at most 9.2% of the remaining gap.
authorized_later |= S205I_AUTHORIZED
S205J_AUTHORIZED={'content/courses/derivative-rules/lessons/dr-04-03.json'}  # S205J: dr/dc steppedReveal cluster COMPLETED — all 9 lessons dispositioned. dr-04-03 converts via the new framing:'slope' mode on relatedRatesLab (the near-miss from S205I, refused then on dt notation alone; the engine now narrates the same circle in the lesson's own dy/dx language). dr-03-03, dc-03-02, dc-04-02 refuse on the cluster's established gates. Final tally: 2 converted (dc-02-01, dr-04-03), 7 refused with cites.
authorized_later |= S205J_AUTHORIZED
S210_S218_AUTHORIZED={'content/courses/expressions-equations/lessons/ee-05-02.json','content/courses/polygons-quadrilaterals/lessons/pq-05-03.json','content/courses/similarity/lessons/sy-02-03.json','content/courses/systems-equations/lessons/se-01-03.json','content/courses/two-step-equations/lessons/tse-01-01.json','content/courses/two-step-equations/lessons/tse-04-01.json','content/courses/two-step-equations/lessons/tse-04-02.json','content/courses/vectors-matrices/lessons/vec-05-03.json'}  # S220 closure maintenance: eight later lesson changes already individually authorized by content-change-proof-s151c.mjs (S210–S218).
authorized_later |= S210_S218_AUTHORIZED
mismatches=[]
# S151/S151-completion authorized (post-SESSION149): late-S151 step-conversion wave (verified
# answer-sound in S151-completion), the answerUnit:null repair on the five S149-target files,
# and the rns repairs (rns-01-01 stage merge pinned in the s146 audit; rns-02-01 values population).
authorized_later|={'content/courses/area-surface-volume/lessons/asv-03-02.json','content/courses/coordinate-geometry/lessons/cg-01-02.json','content/courses/decimal-operations/lessons/dop-03-02.json','content/courses/decimals-place-value/lessons/dpv-03-02.json','content/courses/geometry-g7/lessons/g7-01-03.json','content/courses/geometry-g7/lessons/g7-03-02.json','content/courses/measurement-data/lessons/md-05-02.json','content/courses/proportional-relationships/lessons/pr-02-02.json','content/courses/ratios-rates/lessons/rr-03-01.json','content/courses/the-real-number-system/lessons/rns-01-01.json','content/courses/the-real-number-system/lessons/rns-02-01.json','content/courses/transformations-measurement/lessons/tm-03-03.json','content/courses/transformations-measurement/lessons/tm-04-01.json'}
# S155: authorized a1-systems conversion wave (ledger scripts/session/session155-applied.json).
authorized_later|={'content/courses/systems-equations/lessons/se-01-01.json','content/courses/systems-equations/lessons/se-01-02.json','content/courses/systems-equations/lessons/se-02-03.json','content/courses/systems-equations/lessons/se-03-01.json','content/courses/systems-equations/lessons/se-03-02.json','content/courses/systems-equations/lessons/se-03-03.json'}
# S157: predict-path D->A conversions (ledger scripts/session/session157-applied.json).
authorized_later|={'content/courses/exponents-polynomials/lessons/ep-01-01.json','content/courses/exponents-polynomials/lessons/ep-01-02.json','content/courses/linear-functions/lessons/lf-03-03.json','content/courses/right-triangles-trig/lessons/rt-01-03.json'}
# S159: rad-04 wave (geometricConstraintLab conversions, ledger scripts/session/session159-applied.json)
authorized_later|={'content/courses/radicals-and-exponents/lessons/rad-04-01.json','content/courses/radicals-and-exponents/lessons/rad-04-02.json','content/courses/radicals-and-exponents/lessons/rad-04-03.json'}
# S161: radical wave onto exactNumberLab
authorized_later|={'content/courses/radicals-and-exponents/lessons/rad-01-01.json','content/courses/radicals-and-exponents/lessons/rad-01-02.json','content/courses/radicals-and-exponents/lessons/rad-01-03.json','content/courses/radicals-and-exponents/lessons/rad-02-01.json','content/courses/radicals-and-exponents/lessons/rad-02-02.json','content/courses/radicals-and-exponents/lessons/rad-02-03.json','content/courses/radicals-and-exponents/lessons/rad-03-01.json','content/courses/radicals-and-exponents/lessons/rad-03-02.json'}
# S163: logarithm wave onto exactNumberLab
authorized_later|={'content/courses/logarithms/lessons/lg-01-01.json','content/courses/logarithms/lessons/lg-01-02.json','content/courses/logarithms/lessons/lg-02-01.json','content/courses/logarithms/lessons/lg-02-02.json','content/courses/logarithms/lessons/lg-02-03.json'}
# S164: lg-03-03 log-equation wave
authorized_later|={'content/courses/logarithms/lessons/lg-03-03.json'}
# S165: a2-radicals wave onto exactNumberLab
authorized_later|={'content/courses/radical-functions/lessons/re-01-01.json','content/courses/radical-functions/lessons/re-01-02.json','content/courses/radical-functions/lessons/re-02-02.json','content/courses/radical-functions/lessons/re-02-03.json','content/courses/radical-functions/lessons/re-03-01.json','content/courses/radical-functions/lessons/re-03-02.json','content/courses/radical-functions/lessons/re-03-03.json','content/courses/radical-functions/lessons/re-04-01.json','content/courses/radical-functions/lessons/re-04-02.json','content/courses/radical-functions/lessons/re-04-03.json','content/courses/radical-functions/lessons/re-05-01.json','content/courses/radical-functions/lessons/re-05-02.json','content/courses/radical-functions/lessons/re-05-03.json'}
# S166: g12-limits-continuity and a2-statistics waves
authorized_later|={'content/courses/limits-continuity/lessons/lc-02-03.json','content/courses/limits-continuity/lessons/lc-03-02.json','content/courses/limits-continuity/lessons/lc-04-01.json','content/courses/limits-continuity/lessons/lc-04-03.json','content/courses/limits-continuity/lessons/lc-05-03.json','content/courses/statistical-inference/lessons/si-02-03.json','content/courses/statistical-inference/lessons/si-05-02.json'}
# S167: calculus template-bank wave (integration + differentials)
authorized_later|={'content/courses/derivatives-in-context/lessons/dc-03-02.json','content/courses/integration-accumulation/lessons/in-01-03.json','content/courses/integration-accumulation/lessons/in-04-02.json'}
# S168: g10-solid-geometry wave (volume/surface arithmetic)
authorized_later|={'content/courses/solid-geometry/lessons/sg-01-02.json','content/courses/solid-geometry/lessons/sg-02-03.json','content/courses/solid-geometry/lessons/sg-03-03.json','content/courses/solid-geometry/lessons/sg-04-02.json','content/courses/solid-geometry/lessons/sg-04-03.json','content/courses/solid-geometry/lessons/sg-05-02.json','content/courses/solid-geometry/lessons/sg-05-03.json'}
# S169: g10-solid-geometry completion (remaining 8 numeric forms)
authorized_later|={'content/courses/solid-geometry/lessons/sg-01-01.json','content/courses/solid-geometry/lessons/sg-01-03.json','content/courses/solid-geometry/lessons/sg-02-01.json','content/courses/solid-geometry/lessons/sg-02-02.json','content/courses/solid-geometry/lessons/sg-03-01.json','content/courses/solid-geometry/lessons/sg-03-02.json','content/courses/solid-geometry/lessons/sg-04-01.json','content/courses/solid-geometry/lessons/sg-05-01.json'}
# S170: a1-systems (linearSystemSolve) + g10-circle-theorems (approximationEvaluate) waves
authorized_later|={'content/courses/circle-theorems/lessons/cr-03-03.json','content/courses/circle-theorems/lessons/cr-04-01.json','content/courses/circle-theorems/lessons/cr-04-03.json','content/courses/systems-equations/lessons/se-04-01.json','content/courses/systems-equations/lessons/se-04-02.json','content/courses/systems-equations/lessons/se-04-03.json'}
# S171: g12-function-analysis (full) + g12-polynomial-rational-analysis subset
authorized_later|={'content/courses/function-analysis/lessons/fna-04-01.json','content/courses/function-analysis/lessons/fna-04-02.json','content/courses/function-analysis/lessons/fna-04-03.json','content/courses/function-analysis/lessons/fna-05-01.json','content/courses/function-analysis/lessons/fna-05-02.json','content/courses/function-analysis/lessons/fna-05-03.json','content/courses/polynomial-rational-analysis/lessons/pra-01-03.json','content/courses/polynomial-rational-analysis/lessons/pra-02-02.json','content/courses/polynomial-rational-analysis/lessons/pra-02-03.json','content/courses/polynomial-rational-analysis/lessons/pra-03-02.json'}
# S172: g12-polynomial-rational-analysis completion (candidate counting + zero counting)
authorized_later|={'content/courses/polynomial-rational-analysis/lessons/pra-01-01.json','content/courses/polynomial-rational-analysis/lessons/pra-02-01.json','content/courses/polynomial-rational-analysis/lessons/pra-01-02.json'}
# S173: g12-vectors-matrices COMPLETE (incl. whitelisted special-angle sinDeg/cosDeg/vectorDirectionAngle)
authorized_later|={'content/courses/vectors-matrices/lessons/vec-01-02.json','content/courses/vectors-matrices/lessons/vec-02-02.json','content/courses/vectors-matrices/lessons/vec-04-01.json','content/courses/vectors-matrices/lessons/vec-04-02.json','content/courses/vectors-matrices/lessons/vec-04-03.json','content/courses/vectors-matrices/lessons/vec-01-01.json','content/courses/vectors-matrices/lessons/vec-02-01.json','content/courses/vectors-matrices/lessons/vec-02-03.json','content/courses/vectors-matrices/lessons/vec-03-01.json','content/courses/vectors-matrices/lessons/vec-03-03.json','content/courses/vectors-matrices/lessons/vec-05-02.json'}
# S174: polygon-angles COMPLETE (all 7 forms, pure arithmetic on n/sum/interior/exterior)
authorized_later|={'content/courses/polygons-quadrilaterals/lessons/pq-01-01.json','content/courses/polygons-quadrilaterals/lessons/pq-01-02.json','content/courses/polygons-quadrilaterals/lessons/pq-01-03.json'}
# S175: lg-ln (closes lg-04-02) + a2-polynomials + a2-rationals waves
authorized_later|={'content/courses/logarithms/lessons/lg-04-02.json','content/courses/polynomial-functions/lessons/pf-01-01.json','content/courses/polynomial-functions/lessons/pf-03-01.json','content/courses/polynomial-functions/lessons/pf-03-02.json','content/courses/polynomial-functions/lessons/pf-05-02.json','content/courses/polynomial-functions/lessons/pf-05-03.json','content/courses/rational-functions/lessons/rf-03-01.json','content/courses/rational-functions/lessons/rf-04-03.json','content/courses/rational-functions/lessons/rf-05-02.json','content/courses/rational-functions/lessons/rf-05-03.json'}
# S179: a1-linear-functions (8 forms: intercepts, point-slope, two-point, parallel/perp, standard form)
authorized_later|={'content/courses/linear-functions/lessons/lf-02-01.json','content/courses/linear-functions/lessons/lf-02-02.json','content/courses/linear-functions/lessons/lf-02-03.json','content/courses/linear-functions/lessons/lf-03-02.json','content/courses/linear-functions/lessons/lf-03-03.json','content/courses/linear-functions/lessons/lf-04-01.json','content/courses/linear-functions/lessons/lf-04-02.json','content/courses/linear-functions/lessons/lf-04-03.json'}
# S180: exp-function COMPLETE (all 7 named forms + the absent-form default; a·b^x as repeated multiplication, b^0 derived as b/b, geometric ratio/next-term)
authorized_later|={'content/courses/exponential-functions/lessons/exp-01-01.json','content/courses/exponential-functions/lessons/exp-01-03.json','content/courses/exponential-functions/lessons/exp-02-01.json','content/courses/exponential-functions/lessons/exp-02-02.json'}
# S181: exp-solve (3 forms) + a1-exponential exp-match-base -> exponentSolve
authorized_later|={'content/courses/exponential-functions/lessons/exp-03-01.json','content/courses/exponential-functions/lessons/exp-03-02.json','content/courses/exponential-functions/lessons/exp-03-03.json'}
# S181b: remaining a1-exponential numerics (exp-rate kind); exponential-functions course complete
authorized_later|={'content/courses/exponential-functions/lessons/exp-01-02.json','content/courses/exponential-functions/lessons/exp-02-03.json','content/courses/exponential-functions/lessons/exp-04-01.json','content/courses/exponential-functions/lessons/exp-04-02.json','content/courses/exponential-functions/lessons/exp-04-03.json'}
# S164: approximation wave (lg-cob / lg-exp-solve forms completed)
authorized_later|={'content/courses/logarithms/lessons/lg-03-01.json','content/courses/logarithms/lessons/lg-03-02.json'}
# S199: the G6-12 gap patch edits si-03-03's recap teaser to forward into the new
# ch6 'The Bell Curve'. Authored seam edit, logged in the S151C content-change proof.
authorized_later|={'content/courses/statistical-inference/lessons/si-03-03.json'}
authorized_later|={'content/courses/two-step-equations/lessons/tse-02-04.json','content/courses/two-step-equations/lessons/tse-02-05.json','content/courses/function-transformations/lessons/ft-05-04.json'}
# S203B statistics batch: recap.teaser seam edits pointing at the two inserted chapters.
authorized_later|={'content/courses/data-distributions/lessons/dd-04-03.json','content/courses/sampling-and-probability/lessons/sp-02-03.json'}  # S200 §22 figure repair
nontarget_identical=0
for rel,expected in hashes.items():
 if rel in target_rels or rel in authorized_later: continue
 got=hashlib.sha256((ROOT/rel).read_bytes().replace(b'\r\n',b'\n')).hexdigest()
 if got!=expected: mismatches.append(rel)
 else: nontarget_identical+=1
assert not mismatches,f'non-target lesson drift: {mismatches[:10]}'
report={'session':150,'engine':'pointSetReasoningLab','lessons':2,'experiences':total,'main':main,'remedials':rem,'nonWidgetAuthoredFieldsPreserved':True,'variantDeclarationsPreserved':True,'nonTargetLessonsByteIdentical':nontarget_identical,'authorizedLaterSessionChanges':sorted(authorized_later),'passed':True}
(ROOT/'POINT_SET_REASONING_S150.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
(ROOT/'POINT_SET_REASONING_S150.md').write_text(f"# Point-set reasoning audit — Session 150\n\n- Lessons: **2**\n- Authored experiences: **{total}/{total}**\n- Main: **{main}**\n- Remedials: **{rem}**\n- Non-target lessons byte-identical: **1,127/1,127**\n- Variant declarations: **preserved**\n- Result: **PASS**\n",encoding='utf-8',newline='\n')
(ROOT/'SESSION150_AUTHORED_CONTENT_LEDGER.json').write_text(json.dumps({'session':150,'engine':'pointSetReasoningLab','entries':ledger},indent=2)+'\n',encoding='utf-8',newline='\n')
print(f'point-set authored audit passed: {total}/{total}; main {main}, remedials {rem}; {nontarget_identical} non-target byte-identical')
