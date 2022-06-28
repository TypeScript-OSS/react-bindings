import type { ExtractNamedBindingsValues } from '../../binding/types/extract-named-binding-values';
import type { ReadonlyBinding } from '../../binding/types/readonly-binding';
import { useBinding } from '../../binding/use-binding';
import { isBinding } from '../../binding-utils/type-utils';
import { getStatsHandler } from '../../config/stats-handler';
import { useCallbackRef } from '../../internal-hooks/use-callback-ref';
import { getTypedKeys } from '../../internal-utils/get-typed-keys';
import type { LimiterOptions } from '../../limiter/options';
import type { SingleOrArray } from '../../types/array-like';
import type { EmptyObject } from '../../types/empty';
import { useBindingEffect } from '../../use-binding-effect/use-binding-effect';
import type { DerivedBindingOptions } from './options';

const emptyNamedBindings = Object.freeze({} as EmptyObject);
const emptyNamedBindingValues: Readonly<EmptyObject> = Object.freeze({});

/**
 * Called to compute the derived value on the initial render and anytime the dependencies change.
 *
 * @param bindingValues - The extracted values of the associated named bindings.  If named bindings aren't used, this will be an empty
 * object.
 * @param bindings - The original named bindings if named bindings are used or an empty object otherwise.
 *
 * @returns The derived value
 */
export type UseDerivedBindingTransformer<
  GetT,
  NamedBindingsT extends Record<string, ReadonlyBinding | undefined> = Record<string, never>
> = (bindingValues: ExtractNamedBindingsValues<NamedBindingsT>, bindings: NamedBindingsT) => GetT;

/** A derived binding is a binding derived from zero or more other bindings */
export const useDerivedBinding = <GetT, NamedBindingsT extends Record<string, ReadonlyBinding | undefined> = Record<string, never>>(
  bindings: SingleOrArray<ReadonlyBinding | undefined> | NamedBindingsT,
  transformer: UseDerivedBindingTransformer<GetT, NamedBindingsT>,
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
  const namedBindings = isNonNamedBindings ? undefined : bindings;
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;

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

  const measuredTransformer = useCallbackRef((namedBindingValues: ExtractNamedBindingsValues<NamedBindingsT> = getNamedBindingValues()) => {
    const startMSec = performance.now();
    try {
      return transformer(namedBindingValues, namedBindings ?? (emptyNamedBindings as NamedBindingsT));
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
