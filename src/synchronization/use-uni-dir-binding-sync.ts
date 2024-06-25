import type { Binding } from '../binding/types/binding';
import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { useBindingEffect } from '../use-binding-effect/use-binding-effect.js';
import type { UseBindingSyncOptions } from './types/options';

/** Synchronizes a source binding into a destination binding */
export const useUniDirBindingSync = <T>(source: ReadonlyBinding<T>, dest: Binding<T>, options?: UseBindingSyncOptions) => {
  useBindingEffect(source, (source) => dest.set(source), { ...options, triggerOnMount: true });
};
