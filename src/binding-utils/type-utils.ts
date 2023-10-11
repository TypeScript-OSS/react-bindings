import type { ReadonlyBinding } from '../binding/types/readonly-binding';

/** Checks if the specified value is a binding */
export const isBinding = (value: any): value is ReadonlyBinding =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  value !== null && typeof value === 'object' && 'isBinding' in value && value.isBinding === true;

/** Returns a readonly binding if the specified value is a binding.  Otherwise, returns undefined */
export const ifBinding = <T>(value: any): ReadonlyBinding<T> | undefined => (isBinding(value) ? (value as ReadonlyBinding<T>) : undefined);
