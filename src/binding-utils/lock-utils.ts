import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { makeValueThenDo } from './internal/make-value-then-do';

/**
 * Checks if any of the specified bindings have been locked.
 *
 * @param bindings - The bindings to check
 *
 * @returns `true` if any of the specified bindings are locked, `false` otherwise.
 */
export const areAnyBindingsLocked = (bindings: Array<ReadonlyBinding | undefined>) => {
  for (const binding of bindings) {
    if (binding?.isLocked() ?? false) {
      return true;
    }
  }

  return false;
};

/**
 * Locks all the specified bindings and returns a function for unlocking them in reverse order.
 *
 * @param bindings - The bindings to be locked
 *
 * @returns a function to unlock all of the specified bindings, in reverse order
 */
export const lockAllBindings = (bindings: Array<ReadonlyBinding | undefined>) => {
  const unlockers = bindings.map((binding) => binding?.lock()).reverse();

  return () => {
    for (const unlock of unlockers) {
      unlock?.();
    }
  };
};

/**
 * Locks the specified bindings until the functions result is resolved or rejected
 *
 * @param bindings - The bindings to be locked
 * @param func - The function to run while the bindings are locked
 *
 * @returns The result of the specified function
 */
export const lockBindingsAndDo = <T>(bindings: Array<ReadonlyBinding | undefined>, func: () => Promise<T> | T): Promise<T> | T => {
  const unlockAllBindings = lockAllBindings(bindings);

  return makeValueThenDo(func, unlockAllBindings);
};
