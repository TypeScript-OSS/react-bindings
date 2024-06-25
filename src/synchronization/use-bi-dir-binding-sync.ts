import type { Binding } from '../binding/types/binding';
import { useBindingEffect } from '../use-binding-effect/use-binding-effect.js';
import type { UseBindingSyncOptions } from './types/options';

/**
 * Synchronizes two bindings bidirectionally so that any change in one will also affect the other.
 *
 * It's the responsibility of the bindings themselves to make sure this doesn't result in an infinite update.  For example, the bindings
 * could be configured to use `detectChanges: true`, so that trivial changes doesn't result in triggers.
 */
export const useBiDirBindingSync = <T>(a: Binding<T>, b: Binding<T>, options?: UseBindingSyncOptions) => {
  useBindingEffect(a, (a) => b.set(a), { ...options, triggerOnMount: true });
  useBindingEffect(b, (b) => a.set(b), { ...options, triggerOnMount: true });
};
