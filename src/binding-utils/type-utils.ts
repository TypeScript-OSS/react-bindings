import type { ReadonlyBinding } from '../binding/types/readonly-binding';

/** Checks if the specified value is a binding */
export const isBinding = (value: any): value is ReadonlyBinding =>
  value !== null && typeof value === 'object' && 'isBinding' in value && (value as { isBinding: unknown }).isBinding === true;

/** Returns a readonly binding if the specified value is a binding.  Otherwise, returns undefined */
export const ifBinding = <T>(value: any): ReadonlyBinding<T> | undefined => (isBinding(value) ? (value as ReadonlyBinding<T>) : undefined);
