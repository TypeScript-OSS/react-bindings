import { useEffect, useRef } from 'react';

import type { InferBindingGetType } from '../binding/types/inference';
import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { useBinding } from '../binding/use-binding';
import { isBinding } from '../binding-utils/type-utils';
import { useIsMountedRef } from '../internal-hooks/use-is-mounted-ref';
import { getTypedKeys } from '../internal-utils/get-typed-keys';
import type { SingleOrArray } from '../types/array-like';
import type { EmptyObject } from '../types/empty';
import { useBindingEffect } from '../use-binding-effect/use-binding-effect';
import type { DerivedBindingOptions } from './derived-binding/options';

const defaultNamedBindingValues: Readonly<EmptyObject> = Object.freeze({});

/** Extracts the value types from bindings */
type ExtractNamedBindingsValues<NamedBindingsT extends Record<string, ReadonlyBinding | undefined>> = {
  [KeyT in keyof NamedBindingsT]: NamedBindingsT[KeyT] extends ReadonlyBinding
    ? InferBindingGetType<NamedBindingsT[KeyT]>
    : NamedBindingsT[KeyT] extends ReadonlyBinding | undefined
    ? InferBindingGetType<NamedBindingsT[KeyT]> | undefined
    : NamedBindingsT[KeyT];
};

/** Use when a binding contains another binding, to listen to the second-level binding if either the first or second levels change */
export const useFlattenedBinding = <GetT, NamedBindingsT extends Record<string, ReadonlyBinding | undefined> = Record<string, never>>(
  bindings: SingleOrArray<ReadonlyBinding | undefined> | NamedBindingsT,
  transformer: (bindingValues: ExtractNamedBindingsValues<NamedBindingsT>) => ReadonlyBinding<GetT>,
  {
    id,
    deps = [],
    areInputValuesEqual,
    detectInputChanges = true,
    makeComparableInputValue,
    areOutputValuesEqual,
    detectOutputChanges = true,
    // LimiterProps
    limitMode,
    limitMSec,
    limitType,
    priority,
    queue
  }: DerivedBindingOptions<GetT>
): ReadonlyBinding<GetT> => {
  const limiterProps = { limitMode, limitMSec, limitType, priority, queue };

  const isMounted = useIsMountedRef();

  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const namedBindings = isNonNamedBindings ? undefined : bindings;
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;

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

  const internalBinding = useBinding(() => transformer(getNamedBindingValues()).get(), {
    id,
    areEqual: areOutputValuesEqual,
    detectChanges: detectOutputChanges
  });

  const secondLevelBindingListenerRemover = useRef<(() => void) | undefined>(undefined);

  useBindingEffect(
    bindings,
    (namedBindingValues) => {
      secondLevelBindingListenerRemover.current?.();
      secondLevelBindingListenerRemover.current = undefined;

      const secondLevelBinding = transformer(namedBindingValues);
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
      ...limiterProps
    }
  );

  useEffect(() => {
    const namedBindingValues = getNamedBindingValues();
    const secondLevelBinding = transformer(namedBindingValues);

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
