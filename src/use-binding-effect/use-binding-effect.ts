import _ from 'lodash';
import { useEffect, useRef } from 'react';

import type { BindingArrayDependencies, BindingDependencies, NamedBindingDependencies } from '../binding/types/binding-dependencies';
import type { ChangeListenerRemover } from '../binding/types/change-listener';
import type { InferBindingValueTypes } from '../binding/types/infer-binding-value-types';
import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { isBinding } from '../binding-utils/type-utils';
import { areEqual } from '../config/are-equal';
import { useCallbackRef } from '../internal-hooks/use-callback-ref';
import { useIsMountedRef } from '../internal-hooks/use-is-mounted-ref';
import { useStableValue } from '../internal-hooks/use-stable-value';
import { normalizeAsArray } from '../internal-utils/array-like';
import { extractBindingDependencyValues } from '../internal-utils/extract-binding-dependency-values';
import { getTypedKeys } from '../internal-utils/get-typed-keys';
import { useLimiter } from '../limiter/use-limiter';
import type { EmptyObject } from '../types/empty';
import type { UseBindingEffectOptions } from './types/options';

const emptyDependencies = Object.freeze({} as EmptyObject);

/**
 * Called when the associated bindings change, depending on the options provided to `useBindingEffect`.
 *
 * @param bindingValues - The extracted values of the associated named bindings.  If named bindings aren't used, this will be an empty
 * object.
 * @param bindings - The original named bindings if named bindings are used or an empty object otherwise.
 */
export type UseBindingEffectCallback<DependenciesT extends BindingDependencies = Record<string, never>> = (
  bindingValues: InferBindingValueTypes<DependenciesT>,
  bindings: DependenciesT
) => void;

/**
 * Calls the specified callback function any time any of the specified bindings are changed.
 *
 * Most of the time you should use this hook rather than addChangeListener.
 *
 * @returns a function that can be called anytime to cancel the most recent limited callback.  This is useful, for example, if the the
 * callback would have triggered a re-render that we, by other means, know to be unnecessary.
 */
export const useBindingEffect = <DependenciesT extends BindingDependencies = Record<string, never>>(
  bindings: DependenciesT | undefined,
  callback: UseBindingEffectCallback<DependenciesT>,
  {
    id,
    deps,
    areInputValuesEqual = areEqual,
    detectInputChanges = false,
    makeComparableInputValue,
    triggerOnMount = 'if-input-changed',
    // LimiterOptions
    limitMode,
    limitMSec,
    limitType,
    priority,
    queue
  }: UseBindingEffectOptions = {}
): (() => void) => {
  const limiterOptions = { limitMode, limitMSec, limitType, priority, queue };

  const isMounted = useIsMountedRef();

  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const nonNamedBindings = isNonNamedBindings ? (bindings as ReadonlyBinding | BindingArrayDependencies) : undefined;
  const namedBindings = isNonNamedBindings ? undefined : (bindings as NamedBindingDependencies);
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;
  const stableAllBindings = useStableValue(
    isNonNamedBindings ? normalizeAsArray(nonNamedBindings) : Object.values(namedBindings ?? emptyDependencies)
  );

  // Doesn't need to be stable since always used in a callback ref
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const getDependencyValues = () => extractBindingDependencyValues<DependenciesT>({ bindings, namedBindingsKeys });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  makeComparableInputValue = makeComparableInputValue ?? getDependencyValues;
  const lastComparableInputValue = useRef(
    detectInputChanges && (triggerOnMount === false || triggerOnMount === 'if-input-changed') ? makeComparableInputValue() : undefined
  );

  /** Only used when `detectInputChanges` is `false` and `triggerOnMount` is `'if-input-changed'` */
  const lastChangeUids = useRef<string | undefined>();

  const limiter = useLimiter({
    id: id ?? 'use-binding-effect',
    cancelOnUnmount: true,
    ...limiterOptions
  });

  const checkAndUpdateIfInputChanged = useCallbackRef(() => {
    if (detectInputChanges) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nextComparableInputValue = makeComparableInputValue!();
      if (areInputValuesEqual(lastComparableInputValue.current, nextComparableInputValue)) {
        return false;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      lastComparableInputValue.current = nextComparableInputValue;
      return true;
    } else if (triggerOnMount === 'if-input-changed') {
      const newChangeUids = makeChangeUidsString(stableAllBindings);
      if (newChangeUids === lastChangeUids.current) {
        return false;
      }

      lastChangeUids.current = newChangeUids;
      return true;
    } else {
      return true;
    }
  });

  const triggerCallback = useCallbackRef((needsInputChangeTrackingUpdate: boolean) => {
    if (needsInputChangeTrackingUpdate) {
      // We don't care about the result here -- just want to update the tracking
      checkAndUpdateIfInputChanged();
    }

    callback(getDependencyValues(), bindings ?? (emptyDependencies as DependenciesT));
  });

  const performChecksAndTriggerCallbackIfNeeded = useCallbackRef(() => {
    const didChange = checkAndUpdateIfInputChanged();
    if (detectInputChanges && !didChange) {
      return; // No change
    }

    triggerCallback(false);
  });

  const isFirstRender = useRef(true);
  if (isFirstRender.current) {
    isFirstRender.current = false;

    if (!detectInputChanges && triggerOnMount === 'if-input-changed') {
      lastChangeUids.current = makeChangeUidsString(stableAllBindings);
    }
  }

  useEffect(() => {
    const addedBindingUids = new Set<string>();
    const removers: ChangeListenerRemover[] = [];
    for (const b of stableAllBindings) {
      if (b !== undefined && !addedBindingUids.has(b.uid)) {
        // Making sure we only listen for changes once per binding, even if the same binding is listed multiple times
        addedBindingUids.add(b.uid);

        removers.push(b.addChangeListener(() => limiter.limit(performChecksAndTriggerCallbackIfNeeded)));
      }
    }

    return () => {
      for (const remover of removers) {
        remover();
      }
      removers.length = 0;
    };
  }, [limiter, performChecksAndTriggerCallbackIfNeeded, stableAllBindings]);

  const isFirstMount = useRef(true);
  const triggerOnNextMount = useRef(false);
  useEffect(() => {
    if (
      triggerOnMount === true ||
      triggerOnNextMount.current ||
      (isFirstMount.current && triggerOnMount === 'first') ||
      (triggerOnMount === 'if-input-changed' && checkAndUpdateIfInputChanged())
    ) {
      triggerOnNextMount.current = false;

      limiter.cancel();
      triggerCallback(true);
    }
    isFirstMount.current = false;
  });

  // If the deps changed,
  const lastDepsValue = useRef(deps);
  if (!areEqual(lastDepsValue.current, deps)) {
    lastDepsValue.current = deps;

    if (isMounted.current) {
      limiter.cancel();
      triggerCallback(true);
    } else {
      triggerOnNextMount.current = true;
    }
  }

  // If the upcoming callback is canceled, it's because we have already dealt with the input in a different way, so we need to update the
  // tracking info to make sure we don't reprocess the same thing later
  return () => {
    limiter.cancel();
    // We don't care about the result here -- just want to update the tracking
    checkAndUpdateIfInputChanged();
  };
};

// Helpers

const makeChangeUidsString = (bindings: Array<ReadonlyBinding | undefined>) => {
  const array: string[] = [];
  for (const b of bindings) {
    array.push(b?.getChangeUid() ?? '');
  }
  return array.join(',');
};
