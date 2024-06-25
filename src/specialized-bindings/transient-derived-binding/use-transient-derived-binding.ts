import type { DependencyList } from 'react';
import { useMemo } from 'react';

import type { BindingDependencies } from '../../binding/types/binding-dependencies';
import type { ReadonlyBinding } from '../../binding/types/readonly-binding';
import type { UseDerivedBindingTransformer } from '../derived-binding/use-derived-binding';
import { makeTransientDerivedBinding } from './make-transient-derived-binding.js';
import type { UseTransientDerivedBindingArgs } from './types/transient-derived-binding-args';

const emptyDeps: DependencyList = Object.freeze([]);

/**
 * Similar to `useDerivedBinding` except that this binding doesn't persist any values internally.  The derivative is computed each time the
 * getter is accessed and listeners are immediately triggered any time any of the dependencies change.
 *
 * This is most useful for cases where bindings need to have up to date values even when unmounted (though this still wont be proactively
 * triggered when unmounted).
 */
export const useTransientDerivedBinding = <GetT, DependenciesT extends BindingDependencies>(
  bindings: DependenciesT | undefined,
  transformer: UseDerivedBindingTransformer<GetT, DependenciesT>,
  args: UseTransientDerivedBindingArgs = {}
): ReadonlyBinding<GetT> =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => makeTransientDerivedBinding<GetT, DependenciesT>(bindings, transformer, args), args.deps ?? emptyDeps);
