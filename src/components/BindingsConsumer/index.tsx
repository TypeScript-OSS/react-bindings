import { UI_PRIORITY } from 'client-run-queue';
import React, { useRef } from 'react';

import type { ExtractNamedBindingsValues } from '../../binding/types/extract-named-binding-values';
import type { ReadonlyBinding } from '../../binding/types/readonly-binding';
import { isBinding } from '../../binding-utils/type-utils';
import { normalizeAsArray } from '../../internal-utils/array-like';
import { getTypedKeys } from '../../internal-utils/get-typed-keys';
import type { LimiterOptions } from '../../limiter/options';
import type { EmptyObject } from '../../types/empty';
import { useBindingEffect } from '../../use-binding-effect/use-binding-effect';
import { Refreshable } from './internal/Refreshable';
import type { BindingsConsumerProps } from './types/props';
import type { BindingsConsumerRenderCallback } from './types/render-callback';

export * from './types/exports';

const emptyNamedBindings = Object.freeze({} as EmptyObject);
const emptyNamedBindingValues: Readonly<EmptyObject> = Object.freeze({});

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
  // LimiterOptions
  limitMode,
  limitMSec,
  limitType,
  priority = UI_PRIORITY,
  queue
}: BindingsConsumerProps<NamedBindingsT> & {
  children: BindingsConsumerRenderCallback<NamedBindingsT>;
}) => {
  const limiterOptions: LimiterOptions = { limitMode, limitMSec, limitType, priority, queue };

  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const nonNamedBindings = isNonNamedBindings ? bindings : undefined;
  const namedBindings = isNonNamedBindings ? undefined : bindings;
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;
  const allBindings = isNonNamedBindings ? normalizeAsArray(nonNamedBindings) : Object.values(namedBindings ?? emptyNamedBindings);

  // Doesn't need to be stable since Refreshable will always get rendered with the latest anyway
  const getNamedBindings = () => namedBindings ?? (emptyNamedBindings as NamedBindingsT);

  // Doesn't need to be stable since Refreshable will always get rendered with the latest anyway
  const getNamedBindingValues = () => {
    if (namedBindingsKeys === undefined || namedBindings === undefined) {
      return emptyNamedBindingValues as ExtractNamedBindingsValues<NamedBindingsT>;
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
    ...limiterOptions
  });

  return (
    <Refreshable
      cancelLastPendingRefresh={cancelLastPendingRefresh}
      getNamedBindings={getNamedBindings}
      getNamedBindingValues={getNamedBindingValues}
      refreshControls={refreshControls}
      render={children}
    />
  );
};
