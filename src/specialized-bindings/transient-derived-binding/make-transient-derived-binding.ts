import type { DoubleLinkedListNode } from 'doublell';
import { DoubleLinkedList } from 'doublell';

import type { BindingArrayDependencies, BindingDependencies, NamedBindingDependencies } from '../../binding/types/binding-dependencies';
import type { ChangeListener } from '../../binding/types/change-listener';
import type { ReadonlyBinding } from '../../binding/types/readonly-binding';
import { isBinding } from '../../binding-utils/type-utils.js';
import { getLogger } from '../../config/logging.js';
import { normalizeAsArray } from '../../internal-utils/array-like.js';
import { extractBindingDependencyValues } from '../../internal-utils/extract-binding-dependency-values.js';
import { getTypedKeys } from '../../internal-utils/get-typed-keys.js';
import { makeUID } from '../../internal-utils/uid.js';
import type { EmptyObject } from '../../types/empty';
import type { UseDerivedBindingTransformer } from '../derived-binding/use-derived-binding';
import type { MakeTransientDerivedBindingArgs } from './types/transient-derived-binding-args';

const emptyNamedBindings = Object.freeze({} as EmptyObject);

/**
 * Similar to `useDerivedBinding` except that this binding doesn't persist any values internally.  The derivative is computed each time the
 * getter is accessed and listeners are immediately triggered any time any of the dependencies change.
 *
 * This is most useful for inline declarations of derivatives that would feel too-heavy to declare elsewhere.
 */
export const makeTransientDerivedBinding = <GetT, DependenciesT extends BindingDependencies>(
  bindings: DependenciesT | undefined,
  transformer: UseDerivedBindingTransformer<GetT, DependenciesT>,
  { id }: MakeTransientDerivedBindingArgs = {}
): ReadonlyBinding<GetT> => {
  const isNonNamedBindings = Array.isArray(bindings) || isBinding(bindings);
  const nonNamedBindings = isNonNamedBindings ? (bindings as ReadonlyBinding | BindingArrayDependencies) : undefined;
  const namedBindings = isNonNamedBindings ? undefined : (bindings as NamedBindingDependencies);
  const namedBindingsKeys = namedBindings !== undefined ? getTypedKeys(namedBindings) : undefined;
  const allBindings = isNonNamedBindings ? normalizeAsArray(nonNamedBindings) : Object.values(namedBindings ?? emptyNamedBindings);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const getDependencyValues = () => extractBindingDependencyValues<DependenciesT>({ bindings, namedBindingsKeys });

  const uid = makeUID();

  /** Registered change listeners */
  let onChangeListeners: DoubleLinkedList<ChangeListener> | undefined;

  return {
    isBinding: true,
    id: id ?? uid,
    uid,
    addChangeListener: (listener) => {
      if (onChangeListeners === undefined) {
        onChangeListeners = new DoubleLinkedList<ChangeListener>();
      }
      let newNode: Readonly<DoubleLinkedListNode<ChangeListener>> | undefined = onChangeListeners.append(listener);

      const removers = allBindings.map((b) => b?.addChangeListener(listener));

      return () => {
        if (newNode === undefined) {
          getLogger().debug?.(`A change listener for binding ${id ?? uid} was removed more than once`);
          return;
        }

        for (const remover of removers) {
          return remover?.();
        }

        onChangeListeners!.remove(newNode);
        newNode = undefined;
      };
    },
    get: () => transformer(getDependencyValues(), bindings ?? (undefined as any as DependenciesT)),
    getChangeUid: () => allBindings.map((b) => b?.getChangeUid() ?? '').join('+'),
    isModified: () => false,
    isLocked: () => true,
    lock: () => () => {},
    triggerChangeListeners: () => {
      if (onChangeListeners === undefined) {
        return 0;
      }

      const listeners = onChangeListeners.toArray();
      for (const listener of listeners) {
        listener();
      }

      return listeners?.length;
    }
  };
};
