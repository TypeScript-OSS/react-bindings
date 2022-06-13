import type { ReadonlyBinding } from '../binding/types/readonly-binding';

/** Either an immediate value or a value that can be retrieved by calling a function */
export type TypeOrDeferredType<T> = T | (() => T);

/** Either an immediate value or a value that can be retrieved by calling a function with args */
export type TypeOrDeferredTypeWithArgs<T, ArgsT extends any[]> = T | ((...args: ArgsT) => T);

/** Either an immediate value or a binding that stores a value */
export type TypeOrBindingType<T> = T | ReadonlyBinding<T>;

/** Either an immediate value or a value that can be retrieved by calling a function or a binding that stores a value */
export type TypeOrDeferredTypeOrBindingType<T> = T | (() => T) | ReadonlyBinding<T>;
