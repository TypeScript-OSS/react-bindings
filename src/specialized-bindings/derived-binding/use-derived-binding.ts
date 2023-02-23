import type { BindingDependencies, NamedBindingDependencies } from '../../binding/types/binding-dependencies';
import type { InferBindingValueTypes } from '../../binding/types/infer-binding-value-types';
import type { ReadonlyBinding } from '../../binding/types/readonly-binding';
import { useBinding } from '../../binding/use-binding';
import { isBinding } from '../../binding-utils/type-utils';
import { getStatsHandler } from '../../config/stats-handler';
import { extractBindingDependencyValues } from '../../internal-utils/extract-binding-dependency-values';
import { getTypedKeys } from '../../internal-utils/get-typed-keys';
import type { LimiterOptions } from '../../limiter/options';
import { useBindingEffect } from '../../use-binding-effect/use-binding-effect';
import { useCallbackRef } from '../../utility-hooks/use-callback-ref';
import type { DerivedBindingOptions } from './options';

/**
 * Called to compute the derived value on the initial render and anytime the dependencies change.
 *
 * @param bindingValues - The extracted values of the bindings.
 * @param bindings - The original bindings
 *
 * @returns The derived value
 */
export type UseDerivedBindingTransformer<GetT, DependenciesT extends BindingDependencies> = (
  bindingValues: InferBindingValueTypes<DependenciesT>,
  bindings: DependenciesT
) => GetT;

/** A derived binding is a binding derived from zero or more other bindings */
export const useDerivedBinding = <GetT, DependenciesT extends BindingDependencies>(
  bindings: DependenciesT | undefined,
  transformer: UseDerivedBindingTransformer<GetT, DependenciesT>,
  {
    id,
    deps,
    areInputValuesEqual,
    detectInputChanges = true,
    makeComparableInputValue,
    areOutputValuesEqual,
    detectOutputChanges = true,
    limitMode,
    limitMSec,
    limitType,
    priority,
    queue
  }: DerivedBindingOptions<GetT>
): ReadonlyBinding<GetT> => {
  const limiterOptions: LimiterOptions = { limitMode, limitMSec, limitType, priority, queue };

  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const namedBindings = isNonNamedBindings ? undefined : (bindings as NamedBindingDependencies);
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;

  // Doesn't need to be stable since Refreshable will always get rendered with the latest anyway
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const getDependencyValues = () => extractBindingDependencyValues<DependenciesT>({ bindings, namedBindingsKeys });

  const measuredTransformer = useCallbackRef((dependencyValues: InferBindingValueTypes<DependenciesT> = getDependencyValues()) => {
    const startMSec = performance.now();
    try {
      return transformer(dependencyValues, bindings ?? (undefined as any as DependenciesT));
    } finally {
      getStatsHandler().trackDerivedBindingTransformerDidRun?.({ id, durationMSec: performance.now() - startMSec });
    }
  });

  const internalBinding = useBinding(() => measuredTransformer(), {
    id,
    areEqual: areOutputValuesEqual,
    detectChanges: detectOutputChanges
  });

  useBindingEffect(bindings, (namedBindingValues) => internalBinding.set(measuredTransformer(namedBindingValues)), {
    deps,
    areInputValuesEqual,
    detectInputChanges,
    makeComparableInputValue,
    ...limiterOptions
  });

  return internalBinding;
};
