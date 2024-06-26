import { useEffect, useRef } from 'react';

import type { BindingDependencies, NamedBindingDependencies } from '../binding/types/binding-dependencies';
import type { InferBindingValueTypes } from '../binding/types/infer-binding-value-types';
import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { useBinding } from '../binding/use-binding.js';
import { isBinding } from '../binding-utils/type-utils.js';
import { useIsMountedRef } from '../internal-hooks/use-is-mounted-ref.js';
import { extractBindingDependencyValues } from '../internal-utils/extract-binding-dependency-values.js';
import { getTypedKeys } from '../internal-utils/get-typed-keys.js';
import { pickLimiterOptions } from '../limiter/pick-limiter-options.js';
import { useBindingEffect } from '../use-binding-effect/use-binding-effect.js';
import { useStableValue } from '../utility-hooks/use-stable-value.js';
import type { DerivedBindingOptions } from './derived-binding/options';

/**
 * Called to extract the second-level binding on the initial render and anytime the dependencies change.
 *
 * @param bindingValues - The extracted values of bindings.
 * @param bindings - The original bindings.
 *
 * @returns The second-level binding (i.e. a binding determined dynamically by executing this function)
 */
export type UseFlattenedBindingTransformer<GetT, DependenciesT extends BindingDependencies> = (
  bindingValues: InferBindingValueTypes<DependenciesT>,
  bindings: DependenciesT
) => ReadonlyBinding<GetT>;

/** Use when a binding contains another binding, to listen to the second-level binding if either the first or second levels change */
export const useFlattenedBinding = <GetT, DependenciesT extends BindingDependencies>(
  bindings: DependenciesT | undefined,
  transformer: UseFlattenedBindingTransformer<GetT, DependenciesT>,
  options: DerivedBindingOptions<GetT>
): ReadonlyBinding<GetT> => {
  const {
    id,
    deps = [],
    areInputValuesEqual,
    detectInputChanges = true,
    makeComparableInputValue,
    areOutputValuesEqual,
    detectOutputChanges = true
  } = options;

  const limiterOptions = pickLimiterOptions(options);

  const isMounted = useIsMountedRef();

  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const namedBindings = useStableValue(isNonNamedBindings ? undefined : (bindings as NamedBindingDependencies));
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;

  // Doesn't need to be stable since Refreshable will always get rendered with the latest anyway
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const getDependencyValues = () => extractBindingDependencyValues<DependenciesT>({ bindings, namedBindingsKeys });

  const internalBinding = useBinding(() => transformer(getDependencyValues(), bindings ?? (undefined as any as DependenciesT)).get(), {
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

      const secondLevelBinding = transformer(dependencyValues, bindings ?? (undefined as any as DependenciesT));
      internalBinding.set(secondLevelBinding.get());

      if (isMounted.current ?? false) {
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
    const secondLevelBinding = transformer(getDependencyValues(), bindings ?? (undefined as any as DependenciesT));

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
