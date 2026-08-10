import type { ProcessEvent } from './contracts';

export type AdaptiveRung =
  | 'none'
  | 'cue'
  | 'structural-lock'
  | 'contrast'
  | 'scaffold'
  | 'remediation';

export interface AdaptiveDecision {
  readonly rung: AdaptiveRung;
  readonly reason: string;
  readonly misconception?: string;
  readonly strategy?: string;
}

export interface AdaptivePolicyOptions {
  readonly repeatedErrorThreshold?: number;
  readonly unproductiveActionThreshold?: number;
  readonly inefficientStrategyThreshold?: number;
}

function trailingCount<T>(items: readonly T[], predicate: (item: T) => boolean): number {
  let count = 0;
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!predicate(items[index]!)) break;
    count += 1;
  }
  return count;
}

export function decideAdaptiveRung<State, Action>(
  history: readonly ProcessEvent<State, Action>[],
  options: AdaptivePolicyOptions = {},
): AdaptiveDecision {
  const repeatedErrorThreshold = options.repeatedErrorThreshold ?? 2;
  const unproductiveActionThreshold = options.unproductiveActionThreshold ?? 4;
  const inefficientStrategyThreshold = options.inefficientStrategyThreshold ?? 3;

  if (history.length === 0) {
    return { rung: 'none', reason: 'No learner action has been observed.' };
  }

  const latest = history.at(-1)!;
  const misconception = latest.misconceptionTags[0];
  const repeatedSameMisconception = misconception
    ? trailingCount(history, (event) => event.misconceptionTags.includes(misconception))
    : 0;

  if (repeatedSameMisconception >= repeatedErrorThreshold + 2) {
    return {
      rung: 'remediation',
      reason: 'The same structural misconception persists after contrast and scaffold.',
      misconception: misconception!,
    };
  }

  if (repeatedSameMisconception >= repeatedErrorThreshold + 1) {
    return {
      rung: 'scaffold',
      reason: 'The learner needs a partial construction or worked-step fade.',
      misconception: misconception!,
    };
  }

  if (repeatedSameMisconception >= repeatedErrorThreshold) {
    return {
      rung: 'contrast',
      reason: 'Show a valid case beside the learner state and expose the invariant.',
      misconception: misconception!,
    };
  }

  if (latest.direction === 'invalid' || latest.constraint?.valid === false) {
    return {
      rung: 'structural-lock',
      reason: latest.constraint?.message ?? 'Temporarily constrain illegal actions.',
    };
  }

  const unproductive = trailingCount(
    history,
    (event) => event.direction === 'neutral' && event.strategyTags.length === 0,
  );
  if (unproductive >= unproductiveActionThreshold) {
    return {
      rung: 'cue',
      reason: 'The learner is acting without changing the target structure.',
    };
  }

  const latestStrategy = latest.strategyTags[0];
  if (latestStrategy) {
    const repeatedStrategy = trailingCount(history, (event) =>
      event.strategyTags.includes(latestStrategy),
    );
    if (repeatedStrategy >= inefficientStrategyThreshold && latestStrategy.startsWith('inefficient:')) {
      return {
        rung: 'cue',
        reason: 'The answer path works but does not yet demonstrate the intended structure.',
        strategy: latestStrategy,
      };
    }
  }

  return { rung: 'none', reason: 'The learner is progressing productively.' };
}
