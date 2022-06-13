import { isBinding } from '../binding-utils/type-utils';
import type { TypeOrBindingType, TypeOrDeferredType, TypeOrDeferredTypeOrBindingType, TypeOrDeferredTypeWithArgs } from './types';

/** Resolves the value out of a TypeOrBindingType */
export const resolveTypeOrBindingType = <T>(value: TypeOrBindingType<T>) => (isBinding(value) ? value.get() : value);

/** Resolves the value out of a TypeOrDeferredType */
export const resolveTypeOrDeferredType = <T>(value: TypeOrDeferredType<T>): T =>
  typeof value === 'function' ? (value as () => T)() : (value as T);

/** Resolves the value out of a TypeOrDeferredTypeOrBindingType */
export const resolveTypeOrDeferredTypeOrBindingType = <T>(value: TypeOrDeferredTypeOrBindingType<T>) =>
  isBinding(value) ? value.get() : typeof value === 'function' ? (value as () => T)() : (value as T);

/** Resolves the value out of a TypeOrDeferredType */
export const resolveTypeOrDeferredTypeWithArgs = <T, ArgsT extends any[]>(value: TypeOrDeferredTypeWithArgs<T, ArgsT>, args: ArgsT): T =>
  typeof value === 'function' ? (value as (...args: ArgsT) => T)(...args) : (value as T);
