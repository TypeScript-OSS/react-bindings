import type { BindingArrayDependencies, BindingDependencies, NamedBindingDependencies } from '../binding/types/binding-dependencies';
import type { InferBindingValueTypes } from '../binding/types/infer-binding-value-types';
import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { isBinding } from '../binding-utils/type-utils.js';
import { normalizeAsArray } from '../internal-utils/array-like.js';
import { extractBindingDependencyValues } from '../internal-utils/extract-binding-dependency-values.js';
import { getTypedKeys } from '../internal-utils/get-typed-keys.js';
import type { EmptyObject } from '../types/empty';

const emptyDependencies = Object.freeze({} as EmptyObject);
const noOp = () => {};

/** `true` is an alias for `'satisfied'`; `false` is an alias for `'continue'` */
export type ConditionCheckResult = 'satisfied' | 'stop' | 'continue' | boolean;

export type ConditionWaitResult = 'satisfied' | 'stopped' | 'timeout';

export type ConditionChecker<DependenciesT extends BindingDependencies> = (
  bindingValues: InferBindingValueTypes<DependenciesT>,
  bindings: DependenciesT
) => ConditionCheckResult;

/** Waits for the specified condition to be satisfied (or for the checker to be stopped or to timeout) */
export const waitForCondition = <DependenciesT extends BindingDependencies>(
  bindings: DependenciesT | undefined,
  {
    checkCondition,
    timeoutMSec
  }: {
    checkCondition: ConditionChecker<DependenciesT>;
    timeoutMSec?: number;
  }
) => {
  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const nonNamedBindings = isNonNamedBindings ? (bindings as ReadonlyBinding | BindingArrayDependencies) : undefined;
  const namedBindings = isNonNamedBindings ? undefined : (bindings as NamedBindingDependencies);
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;
  const allBindings = isNonNamedBindings ? normalizeAsArray(nonNamedBindings) : Object.values(namedBindings ?? emptyDependencies);

  // Doesn't need to be stable since always used in a callback ref
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const getDependencyValues = () => extractBindingDependencyValues<DependenciesT>({ bindings, namedBindingsKeys });

  return new Promise<ConditionWaitResult>((resolve) => {
    let lastTimeout: ReturnType<typeof setTimeout> | undefined;
    const removers: Array<() => void> = [];
    const clearRemoversAndTimeout = () => {
      for (const remover of removers) {
        remover();
      }
      removers.length = 0;

      if (lastTimeout !== undefined) {
        clearTimeout(lastTimeout);
        lastTimeout = undefined;
      }
    };

    const onDependenciesChanged = () => {
      const check = checkCondition(getDependencyValues(), bindings ?? (emptyDependencies as DependenciesT));
      switch (check) {
        case 'satisfied':
        case true:
          return resolve('satisfied');
        case 'stop':
          return resolve('stopped');
        case 'continue':
        case false:
        // Nothing to do here
      }
    };

    removers.push(...allBindings.map((binding) => binding?.addChangeListener(onDependenciesChanged) ?? noOp));

    if (timeoutMSec !== undefined) {
      lastTimeout = setTimeout(() => {
        clearRemoversAndTimeout();
        resolve('timeout');
      }, timeoutMSec);
    }

    onDependenciesChanged();
  });
};
