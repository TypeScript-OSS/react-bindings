import { UI_PRIORITY } from 'client-run-queue';
import React, { ReactNode, useRef } from 'react';

import type { ReadonlyBinding } from '../../binding/types/readonly-binding';
import { isBinding } from '../../binding-utils/type-utils';
import { normalizeAsArray } from '../../internal-utils/array-like';
import { getTypedKeys } from '../../internal-utils/get-typed-keys';
import type { LimiterOptions } from '../../limiter/options';
import type { SingleOrArray } from '../../types/array-like';
import { EmptyObject } from '../../types/empty';
import { useBindingEffect } from '../../use-binding-effect/use-binding-effect';
import { Refreshable } from './internal/Refreshable';
import type { ExtractNamedBindingsValues } from './internal/types';

const defaultNamedBindings = Object.freeze({} as EmptyObject);
const defaultNamedBindingValues: Readonly<EmptyObject> = Object.freeze({});

export type BindingsConsumerProps<NamedBindingsT extends Record<string, ReadonlyBinding | undefined> = Record<string, never>> =
  LimiterOptions & {
    /** Bindings that cause the consumer to rerender.  Undefined values are ignored */
    bindings?: SingleOrArray<ReadonlyBinding | undefined> | NamedBindingsT;

    /**
     * If specified, overrides the function used to compare input values
     *
     * @defaultValue `_.isEqual`, which can be globally overridden using `setAreEqual`
     */
    areInputValuesEqual?: (a: any, b: any) => boolean;
    /**
     * - If `true` – `areInputValuesEqual` is used to compare the old and new results of `makeComparableInputValue` when any of the input
     * bindings are changed.  If the values are equal, the transformer won't be run.  If they're unequal, the transformer will be run.
     * - If `false` – old and new values aren't compared and the transformer will always be run any time the bindings change.
     *
     * @defaultValue `true`
     */
    detectInputChanges?: boolean;
    /**
     * By default, when `detectInputChanges` is `true`, the input is compared using all specified bindings.  This behavior can be overridden
     * by providing this function to generate a value that can be compared instead.  The generated value will be remembered until the next
     * comparison is needed.  Comparisons are performed using `areInputValuesEqual`
     *
     * @defaultValue A function that returns the values of all input bindings
     */
    makeComparableInputValue?: () => any;
  };

/**
 * A component that is rerendered based on input binding changes.
 *
 * A BindingsConsumer must have exactly one function child.
 *
 * The general usage pattern is something like:
 *
 * ```
 * <BindingsConsumer bindings={{someBinding, anotherBinding}}>
 *   {({someBinding, anotherBinding}) => <Typography>{someBinding} - {anotherBinding}</Typography>}
 * <BindingsConsumer>
 * ```
 */
export const BindingsConsumer = <NamedBindingsT extends Record<string, ReadonlyBinding | undefined> = Record<string, never>>({
  children,
  // BindingsConsumerProps
  bindings,
  areInputValuesEqual,
  detectInputChanges = false,
  makeComparableInputValue,
  // LimiterProps
  limitMode,
  limitMSec,
  limitType,
  priority = UI_PRIORITY,
  queue
}: BindingsConsumerProps<NamedBindingsT> & {
  children: (bindingValues: ExtractNamedBindingsValues<NamedBindingsT>) => ReactNode;
}) => {
  const limiterProps: LimiterOptions = { limitMode, limitMSec, limitType, priority, queue };

  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const nonNamedBindings = isNonNamedBindings ? bindings : undefined;
  const namedBindings = isNonNamedBindings ? undefined : bindings;
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;
  const allBindings = isNonNamedBindings ? normalizeAsArray(nonNamedBindings) : Object.values(namedBindings ?? defaultNamedBindings);

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

  const refreshControls = useRef<{ refresh?: () => void }>({});

  const cancelLastPendingRefresh = useBindingEffect(allBindings, () => refreshControls.current.refresh?.(), {
    areInputValuesEqual,
    detectInputChanges,
    makeComparableInputValue,
    ...limiterProps
  });

  return (
    <Refreshable
      cancelLastPendingRefresh={cancelLastPendingRefresh}
      getNamedBindingValues={getNamedBindingValues}
      refreshControls={refreshControls}
      render={children}
    />
  );
};
