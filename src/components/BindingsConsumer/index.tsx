import { UI_PRIORITY } from 'client-run-queue';
import React, { useRef } from 'react';

import type { BindingDependencies, BindingsArrayDependencies, NamedBindingDependencies } from '../../binding/types/binding-dependencies';
import type { ReadonlyBinding } from '../../binding/types/readonly-binding';
import { isBinding } from '../../binding-utils/type-utils';
import { normalizeAsArray } from '../../internal-utils/array-like';
import { extractBindingDependencyValues } from '../../internal-utils/extract-binding-dependency-values';
import { getTypedKeys } from '../../internal-utils/get-typed-keys';
import type { LimiterOptions } from '../../limiter/options';
import type { EmptyObject } from '../../types/empty';
import { useBindingEffect } from '../../use-binding-effect/use-binding-effect';
import { Refreshable } from './internal/Refreshable';
import type { BindingsConsumerProps } from './types/props';
import type { BindingsConsumerRenderCallback } from './types/render-callback';

export * from './types/exports';

const emptyNamedBindings = Object.freeze({} as EmptyObject);

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
export const BindingsConsumer = <DependenciesT extends BindingDependencies = Record<string, never>>({
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
}: BindingsConsumerProps<DependenciesT> & {
  children: BindingsConsumerRenderCallback<DependenciesT>;
}) => {
  const limiterOptions: LimiterOptions = { limitMode, limitMSec, limitType, priority, queue };

  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const nonNamedBindings = isNonNamedBindings ? (bindings as ReadonlyBinding | BindingsArrayDependencies) : undefined;
  const namedBindings = isNonNamedBindings ? undefined : (bindings as NamedBindingDependencies);
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;
  const allBindings = isNonNamedBindings ? normalizeAsArray(nonNamedBindings) : Object.values(namedBindings ?? emptyNamedBindings);

  // Doesn't need to be stable since Refreshable will always get rendered with the latest anyway
  const getDependencies = () => bindings as DependenciesT;

  // Doesn't need to be stable since Refreshable will always get rendered with the latest anyway
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const getDependencyValues = () => extractBindingDependencyValues<DependenciesT>({ bindings, namedBindingsKeys });

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
      getDependencies={getDependencies}
      getDependencyValues={getDependencyValues}
      refreshControls={refreshControls}
      render={children}
    />
  );
};
