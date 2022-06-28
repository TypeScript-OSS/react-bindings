import { useEffect, useRef } from 'react';

import type { ExtractNamedBindingsValues } from '../binding/types/extract-named-binding-values';
import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { useBinding } from '../binding/use-binding';
import { isBinding } from '../binding-utils/type-utils';
import { useCallbackRef } from '../internal-hooks/use-callback-ref';
import { useIsMountedRef } from '../internal-hooks/use-is-mounted-ref';
import { useStableValue } from '../internal-hooks/use-stable-value';
import { getTypedKeys } from '../internal-utils/get-typed-keys';
import type { SingleOrArray } from '../types/array-like';
import type { EmptyObject } from '../types/empty';
import { useBindingEffect } from '../use-binding-effect/use-binding-effect';
import type { DerivedBindingOptions } from './derived-binding/options';

const emptyNamedBindings = Object.freeze({} as EmptyObject);
const emptyNamedBindingValues: Readonly<EmptyObject> = Object.freeze({});

/**
 * Called to extract the second-level binding on the initial render and anytime the dependencies change.
 *
 * @param bindingValues - The extracted values of the associated named bindings.  If named bindings aren't used, this will be an empty
 * object.
 * @param bindings - The original named bindings if named bindings are used or an empty object otherwise.
 *
 * @returns The second-level binding (i.e. a binding determined dynamically by executing this function)
 */
export type UseFlattenedBindingTransformer<
  GetT,
  NamedBindingsT extends Record<string, ReadonlyBinding | undefined> = Record<string, never>
> = (bindingValues: ExtractNamedBindingsValues<NamedBindingsT>, bindings: NamedBindingsT) => ReadonlyBinding<GetT>;

/** Use when a binding contains another binding, to listen to the second-level binding if either the first or second levels change */
export const useFlattenedBinding = <GetT, NamedBindingsT extends Record<string, ReadonlyBinding | undefined> = Record<string, never>>(
  bindings: SingleOrArray<ReadonlyBinding | undefined> | NamedBindingsT,
  transformer: UseFlattenedBindingTransformer<GetT, NamedBindingsT>,
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
  const namedBindings = useStableValue(isNonNamedBindings ? undefined : bindings);
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;

  const getNamedBindingValues = useCallbackRef(() => {
    if (namedBindingsKeys === undefined || namedBindings === undefined) {
      return emptyNamedBindingValues as ExtractNamedBindingsValues<NamedBindingsT>;
    }

    const namedBindingValues: Partial<ExtractNamedBindingsValues<NamedBindingsT>> = {};
    for (const key of namedBindingsKeys) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      namedBindingValues[key] = namedBindings[key]?.get();
    }

    return namedBindingValues as ExtractNamedBindingsValues<NamedBindingsT>;
  });

  const internalBinding = useBinding(
    () => transformer(getNamedBindingValues(), namedBindings ?? (emptyNamedBindingValues as NamedBindingsT)).get(),
    {
      id,
      areEqual: areOutputValuesEqual,
      detectChanges: detectOutputChanges
    }
  );

  const secondLevelBindingListenerRemover = useRef<(() => void) | undefined>(undefined);

  useBindingEffect(
    bindings,
    (namedBindingValues) => {
      secondLevelBindingListenerRemover.current?.();
      secondLevelBindingListenerRemover.current = undefined;

      const secondLevelBinding = transformer(namedBindingValues, namedBindings ?? (emptyNamedBindingValues as NamedBindingsT));
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
    const namedBindingValues = getNamedBindingValues();
    const secondLevelBinding = transformer(namedBindingValues, namedBindings ?? (emptyNamedBindings as NamedBindingsT));

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
