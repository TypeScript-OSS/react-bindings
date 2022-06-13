import type { Binding } from '../binding/types/binding';
import type { ReadonlyBinding } from '../binding/types/readonly-binding';

/**
 * Checks if any of the specified bindings have been modified.
 *
 * @param bindings - The bindings to check
 *
 * @returns `true` if any of the specified bindings are modified, `false` otherwise
 */
export const areAnyBindingsModified = (bindings: Array<ReadonlyBinding | undefined>) => {
  for (const binding of bindings) {
    if (binding?.isModified()) {
      return true;
    }
  }

  return false;
};

/**
 * Marks all of the specified bindings as having been modified or not.
 *
 * @param bindings - The bindings to update
 * @param newIsModified - The desired modified state for the specified bindings
 */
export const setAllBindingsModified = (bindings: Array<Binding | undefined>, newIsModified: boolean) => {
  for (const binding of bindings) {
    binding?.setIsModified(newIsModified);
  }
};
