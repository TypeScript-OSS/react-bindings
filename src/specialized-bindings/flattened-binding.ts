import { useEffect, useRef } from 'react';

import type { BindingDependencies, NamedBindingDependencies } from '../binding/types/binding-dependencies';
import type { InferBindingValueTypes } from '../binding/types/infer-binding-value-types';
import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { useBinding } from '../binding/use-binding';
import { isBinding } from '../binding-utils/type-utils';
import { useIsMountedRef } from '../internal-hooks/use-is-mounted-ref';
import { useStableValue } from '../internal-hooks/use-stable-value';
import { extractBindingDependencyValues } from '../internal-utils/extract-binding-dependency-values';
import { getTypedKeys } from '../internal-utils/get-typed-keys';
import { useBindingEffect } from '../use-binding-effect/use-binding-effect';
import type { DerivedBindingOptions } from './derived-binding/options';

const emptyDependencies = Object.freeze({});

/**
 * Called to extract the second-level binding on the initial render and anytime the dependencies change.
 *
 * @param bindingValues - The extracted values of bindings.
 * @param bindings - The original bindings.
 *
 * @returns The second-level binding (i.e. a binding determined dynamically by executing this function)
 */
export type UseFlattenedBindingTransformer<GetT, DependenciesT extends BindingDependencies = Record<string, never>> = (
  bindingValues: InferBindingValueTypes<DependenciesT>,
  bindings: DependenciesT
) => ReadonlyBinding<GetT>;

/** Use when a binding contains another binding, to listen to the second-level binding if either the first or second levels change */
export const useFlattenedBinding = <GetT, DependenciesT extends BindingDependencies = Record<string, never>>(
  bindings: DependenciesT | undefined,
  transformer: UseFlattenedBindingTransformer<GetT, DependenciesT>,
  {
    id,
    deps = [],
    areInputValuesEqual,
    detectInputChanges = true,
    makeComparableInputValue,
    areOutputValuesEqual,
    detectOutputChanges = true,
    // LimiterOptions
    limitMode,
    limitMSec,
    limitType,
    priority,
    queue
  }: DerivedBindingOptions<GetT>
): ReadonlyBinding<GetT> => {
  const limiterOptions = { limitMode, limitMSec, limitType, priority, queue };

  const isMounted = useIsMountedRef();

  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const namedBindings = useStableValue(isNonNamedBindings ? undefined : (bindings as NamedBindingDependencies));
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;

  // Doesn't need to be stable since Refreshable will always get rendered with the latest anyway
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const getDependencyValues = () => extractBindingDependencyValues<DependenciesT>({ bindings, namedBindingsKeys });

  const internalBinding = useBinding(() => transformer(getDependencyValues(), bindings ?? (emptyDependencies as DependenciesT)).get(), {
    id,
    areEqual: areOutputValuesEqual,
    detectChanges: detectOutputChanges
  });

  const secondLevelBindingListenerRemover = useRef<(() => void) | undefined>(undefined);

  useBindingEffect(
    bindings,
    (dependencyValues) => {
      secondLevelBindingListenerRemover.current?.();
      secondLevelBindingListenerRemover.current = undefined;

      const secondLevelBinding = transformer(dependencyValues, bindings ?? (emptyDependencies as DependenciesT));
      internalBinding.set(secondLevelBinding.get());

      if (isMounted.current) {
        secondLevelBindingListenerRemover.current = secondLevelBinding.addChangeListener(() => {
          internalBinding.set(secondLevelBinding.get());
        });
      }
    },
    {
      deps,
      areInputValuesEqual,
      detectInputChanges,
      makeComparableInputValue,
      triggerOnMount: true,
      ...limiterOptions
    }
  );

  useEffect(() => {
    const secondLevelBinding = transformer(getDependencyValues(), bindings ?? (emptyDependencies as DependenciesT));

    secondLevelBindingListenerRemover.current = secondLevelBinding.addChangeListener(() => {
      internalBinding.set(secondLevelBinding.get());
    });

    return () => {
      secondLevelBindingListenerRemover.current?.();
      secondLevelBindingListenerRemover.current = undefined;
    };
  });

  return internalBinding;
};
