import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { describeWidgetState } from "./describeState";
import { canCheck, correctAnswerText, evaluate, learnerAnswerText } from "./evaluate";
import {
  WidgetSpec,
  geometricConstraintAnswerStageKeys,
  geometricConstraintChoiceCorrect,
  geometricConstraintExplorationKeys,
  geometricConstraintTruth,
  widgetIntegrityErrors,
  type TGeometricConstraintLab,
} from "./schema";

type Use = { lesson:string; step:string; spec:TGeometricConstraintLab };

function authoredUses():Use[]{
  const coursesRoot=join(process.cwd(),"content","courses");
  const paths=readdirSync(coursesRoot,{withFileTypes:true})
    .filter(entry=>entry.isDirectory())
    .flatMap(course=>{
      const lessonsRoot=join(coursesRoot,course.name,"lessons");
      if(!existsSync(lessonsRoot))return[];
      return readdirSync(lessonsRoot,{withFileTypes:true})
        .filter(entry=>entry.isFile()&&entry.name.endsWith(".json"))
        .map(entry=>join(lessonsRoot,entry.name));
    }).sort();
  return paths.flatMap(path=>{
    const lesson=JSON.parse(readFileSync(path,"utf8")) as {id:string;steps:Array<{id:string;widget?:unknown}>;remedials?:Array<{check:{id:string;widget?:unknown}}>};
    const surfaces=[...lesson.steps,...(lesson.remedials??[]).map(remedial=>remedial.check)];
    return surfaces.flatMap(step=>{
      if(!step.widget||(step.widget as {type?:unknown}).type!=="geometricConstraintLab")return[];
      const parsed=WidgetSpec.parse(step.widget);
      if(parsed.type!=="geometricConstraintLab")throw new Error(`${lesson.id}/${step.id}: wrong widget type`);
      return[{lesson:lesson.id,step:step.id,spec:parsed}];
    });
  });
}

function correctValue(spec:TGeometricConstraintLab){
  const revealed=geometricConstraintExplorationKeys(spec);
  const truth=geometricConstraintTruth(spec);
  if(spec.answerMode==="numeric")return{revealed,numeric:truth.answerNumber};
  if(spec.answerMode==="choice")return{revealed,choiceId:spec.choices.find(choice=>geometricConstraintChoiceCorrect(spec,choice))!.id};
  return{revealed};
}

describe("S244 geometricConstraintLab answer-signalling contract",()=>{
  it("discovers all 66 authored uses, including remedial checks, across every domain and answer mode",()=>{
    const uses=authoredUses();
    expect(uses).toHaveLength(66);
    expect(Object.fromEntries([...new Set(uses.map(use=>use.spec.task))].sort().map(task=>[task,uses.filter(use=>use.spec.task===task).length]))).toEqual({
      aaSimilarity:7,angleCrossing:7,coordinateArea:11,coordinateProof:13,perimeterMissing:7,pythagoreanArea:14,scaledArea:7,
    });
    expect(Object.fromEntries(["choice","explore","numeric"].map(mode=>[mode,uses.filter(use=>use.spec.answerMode===mode).length]))).toEqual({choice:17,explore:5,numeric:44});
  });

  it("keeps schema, exploration, grading, feedback, reveal text, and learner echo on one truth",()=>{
    for(const {lesson,step,spec} of authoredUses()){
      const label=`${lesson}/${step}`;
      const keys=geometricConstraintExplorationKeys(spec);
      const held=geometricConstraintAnswerStageKeys(spec);
      expect(widgetIntegrityErrors(spec),label).toEqual([]);
      expect(held.every(key=>keys.includes(key)),label).toBe(true);
      const value=correctValue(spec);
      expect(canCheck(spec,value),label).toBe(true);
      expect(evaluate(spec,value),label).toEqual({correct:true,feedback:spec.successFeedback});
      if(spec.answerMode==="numeric"){
        const answer=geometricConstraintTruth(spec).answerNumber!;
        expect(correctAnswerText(spec),label).toBe(`${answer}${spec.answerUnit?` ${spec.answerUnit}`:""}`);
        expect(learnerAnswerText(spec,value),label).toBe(`${answer}${spec.answerUnit?` ${spec.answerUnit}`:""}`);
      }else if(spec.answerMode==="choice"){
        const correct=spec.choices.filter(choice=>geometricConstraintChoiceCorrect(spec,choice));
        const wrong=spec.choices.find(choice=>!geometricConstraintChoiceCorrect(spec,choice));
        expect(correct,label).toHaveLength(1);
        expect(wrong,label).toBeTruthy();
        expect(evaluate(spec,{revealed:keys,choiceId:wrong!.id}),label).toEqual({correct:false,feedback:wrong!.feedback});
        expect(correctAnswerText(spec),label).toBe(correct[0]!.label);
        expect(learnerAnswerText(spec,{revealed:keys,choiceId:wrong!.id}),label).toBe(wrong!.label);
      }
    }
  });

  it("classifies semantic conclusions that numeric/claim string matching misses",()=>{
    const uses=authoredUses(),by=(lesson:string)=>uses.find(use=>use.lesson===lesson)!.spec;
    expect(geometricConstraintAnswerStageKeys(by("cx-02-01"))).toEqual(["proof:partition-ratio"]);
    expect(geometricConstraintAnswerStageKeys(by("cx-02-03"))).toEqual(["proof:rotate","proof:dot"]);
    expect(geometricConstraintAnswerStageKeys(by("cx-03-01"))).toEqual(["proof:converse","proof:slope-option"]);
    expect(geometricConstraintAnswerStageKeys(by("cx-03-03"))).toEqual(["proof:symmetry-axis","proof:equal-slants"]);
    expect(geometricConstraintAnswerStageKeys(by("cx-04-01"))).toEqual(["proof:radical-combine"]);
    expect(geometricConstraintAnswerStageKeys(by("cx-04-02"))).toEqual(["proof:corner-legs"]);
    expect(geometricConstraintAnswerStageKeys(by("g7-01-03"))).toEqual(["scale:real-area"]);
    expect(geometricConstraintAnswerStageKeys(uses.find(use=>use.lesson==="g7-01-03"&&use.step==="k3")!.spec)).toEqual(["scale:area-factor","scale:real-area"]);
  });

  it("withholds opened answer stages and correctness judgments until info tone",()=>{
    for(const {lesson,step,spec} of authoredUses()){
      if(spec.answerMode==="explore")continue;
      const held=geometricConstraintAnswerStageKeys(spec);
      const keys=geometricConstraintExplorationKeys(spec);
      const selected=spec.answerMode==="choice"?spec.choices.find(choice=>geometricConstraintChoiceCorrect(spec,choice))?.id:undefined;
      const value={revealed:keys,...(spec.answerMode==="numeric"?{numeric:geometricConstraintTruth(spec).answerNumber}:{choiceId:selected})};
      const before=describeWidgetState(spec,value,"neutral")!;
      const after=describeWidgetState(spec,value,"info")!;
      if(held.length){
        expect(before,`${lesson}/${step}`).toContain("finish this conclusion yourself");
        expect(after,`${lesson}/${step}`).not.toContain("finish this conclusion yourself");
        for(const key of held){
          const stage=geometricConstraintTruth(spec).stages.find(candidate=>candidate.key===key)!;
          expect(after,`${lesson}/${step}/${key}`).toContain(stage.value);
        }
      }
      expect(before,`${lesson}/${step}`).not.toContain("matching the geometry");
      expect(before,`${lesson}/${step}`).not.toContain("not matching the geometry");
      expect(before,`${lesson}/${step}`).not.toContain("Revealed correct");
      expect(after,`${lesson}/${step}`).toContain("Revealed correct");
    }
  });

  it("treats an opened explore stage as the learner's explicit reveal action",()=>{
    for(const {lesson,step,spec} of authoredUses().filter(use=>use.spec.answerMode==="explore")){
      const truth=geometricConstraintTruth(spec),value={revealed:geometricConstraintExplorationKeys(spec)};
      const description=describeWidgetState(spec,value,"success")!;
      expect(description,`${lesson}/${step}`).not.toContain("finish this conclusion yourself");
      expect(description,`${lesson}/${step}`).not.toContain("yours to work out");
      for(const stage of truth.stages)expect(description,`${lesson}/${step}/${stage.key}`).toContain(stage.value);
      expect(canCheck(spec,value),`${lesson}/${step}`).toBe(true);
      expect(evaluate(spec,value),`${lesson}/${step}`).toEqual({correct:true,feedback:spec.successFeedback});
    }
  });

  it("rejects fabricated choice IDs and non-finite numeric answers",()=>{
    const choice=authoredUses().find(use=>use.spec.answerMode==="choice")!.spec;
    const numeric=authoredUses().find(use=>use.spec.answerMode==="numeric")!.spec;
    expect(canCheck(choice,{revealed:geometricConstraintExplorationKeys(choice),choiceId:"fabricated"})).toBe(false);
    expect(canCheck(numeric,{revealed:geometricConstraintExplorationKeys(numeric),numeric:Number.POSITIVE_INFINITY})).toBe(false);
    expect(evaluate(numeric,{revealed:geometricConstraintExplorationKeys(numeric),numeric:Number.POSITIVE_INFINITY})).toEqual({correct:false,feedback:numeric.fallbackFeedback});
    expect(learnerAnswerText(numeric,{numeric:Number.POSITIVE_INFINITY})).toBeNull();
  });
});
