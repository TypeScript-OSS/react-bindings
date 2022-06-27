import _ from 'lodash';
import { useEffect, useRef } from 'react';

import type { ChangeListenerRemover } from '../binding/types/change-listener';
import type { InferBindingGetType } from '../binding/types/inference';
import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { isBinding } from '../binding-utils/type-utils';
import { areEqual } from '../config/are-equal';
import { useCallbackRef } from '../internal-hooks/use-callback-ref';
import { useStableValue } from '../internal-hooks/use-stable-value';
import { normalizeAsArray } from '../internal-utils/array-like';
import { getTypedKeys } from '../internal-utils/get-typed-keys';
import { useLimiter } from '../limiter/use-limiter';
import type { SingleOrArray } from '../types/array-like';
import type { EmptyObject } from '../types/empty';
import type { UseBindingEffectOptions } from './types/options';

const defaultNamedBindings = Object.freeze({} as EmptyObject);
const defaultNamedBindingValues: Readonly<EmptyObject> = Object.freeze({});

/** Extracts the value types from bindings */
type ExtractNamedBindingsValues<NamedBindingsT extends Record<string, ReadonlyBinding | undefined>> = {
  [KeyT in keyof NamedBindingsT]: NamedBindingsT[KeyT] extends ReadonlyBinding
    ? InferBindingGetType<NamedBindingsT[KeyT]>
    : NamedBindingsT[KeyT] extends ReadonlyBinding | undefined
    ? InferBindingGetType<NamedBindingsT[KeyT]> | undefined
    : NamedBindingsT[KeyT];
};

/**
 * Calls the specified callback function any time any of the specified bindings are changed.
 *
 * Most of the time you should use this hook rather than addChangeListener.
 *
 * @returns a function that can be called anytime to cancel the most recent limited callback.  This is useful, for example, if the the
 * callback would have triggered a re-render that we, by other means, know to be unnecessary.
 */
export const useBindingEffect = <NamedBindingsT extends Record<string, ReadonlyBinding | undefined> = Record<string, never>>(
  bindings: SingleOrArray<ReadonlyBinding | undefined> | NamedBindingsT,
  callback: (bindingValues: ExtractNamedBindingsValues<NamedBindingsT>) => void,
  {
    id,
    deps,
    areInputValuesEqual = areEqual,
    detectInputChanges = false,
    makeComparableInputValue,
    triggerOnMount = 'if-input-changed',
    // LimiterProps
    limitMode,
    limitMSec,
    limitType,
    priority,
    queue
  }: UseBindingEffectOptions = {}
): (() => void) => {
  const limiterProps = { limitMode, limitMSec, limitType, priority, queue };

  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const nonNamedBindings = isNonNamedBindings ? bindings : undefined;
  const namedBindings = isNonNamedBindings ? undefined : bindings;
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;
  const stableAllBindings = useStableValue(
    isNonNamedBindings ? normalizeAsArray(nonNamedBindings) : Object.values(namedBindings ?? defaultNamedBindings)
  );

  // Doesn't need to be stable since Refreshable will always get rendered with the latest anyway
  const getNamedBindingValues = () => {
    if (namedBindingsKeys === undefined || namedBindings === undefined) {
      return defaultNamedBindingValues as ExtractNamedBindingsValues<NamedBindingsT>;
    }

    const namedBindingValues: Partial<ExtractNamedBindingsValues<NamedBindingsT>> = {};
    for (const key of namedBindingsKeys) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      namedBindingValues[key] = namedBindings[key]?.get();
    }

    return namedBindingValues as ExtractNamedBindingsValues<NamedBindingsT>;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  makeComparableInputValue = makeComparableInputValue ?? (() => [getAllBindingValues(stableAllBindings), deps]);
  const lastComparableInputValue = useRef(
    detectInputChanges && (triggerOnMount === false || triggerOnMount === 'if-input-changed') ? makeComparableInputValue() : undefined
  );

  /** Only used when `detectInputChanges` is `false` and `triggerOnMount` is `'if-input-changed'` */
  const lastChangeUids = useRef<string | undefined>();

  const limiter = useLimiter({
    id: id ?? 'use-binding-effect',
    cancelOnUnmount: true,
    ...limiterProps
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

    callback(getNamedBindingValues());
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
    const removers: ChangeListenerRemover[] = [];
    for (const b of stableAllBindings) {
      if (b !== undefined) {
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
  useEffect(() => {
    if (
      triggerOnMount === true ||
      (isFirstMount.current && triggerOnMount === 'first') ||
      (triggerOnMount === 'if-input-changed' && checkAndUpdateIfInputChanged())
    ) {
      limiter.cancel();
      triggerCallback(true);
    }
    isFirstMount.current = false;
  });

  // If the upcoming callback is canceled, it's because we have already dealt with the input in a different way, so we need to update the
  // tracking info to make sure we don't reprocess the same thing later
  return () => {
    limiter.cancel();
    // We don't care about the result here -- just want to update the tracking
    checkAndUpdateIfInputChanged();
  };
};

// Helpers

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const getAllBindingValues = (bindings: Array<ReadonlyBinding | undefined>): any[] => {
  const output: any[] = [];
  for (const b of bindings) {
    output.push(b?.get());
  }
  return output;
};

const makeChangeUidsString = (bindings: Array<ReadonlyBinding | undefined>) => {
  const array: string[] = [];
  for (const b of bindings) {
    array.push(b?.getChangeUid() ?? '');
  }
  return array.join(',');
};
