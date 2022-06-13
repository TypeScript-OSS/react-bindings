import type { ReadonlyBinding } from './readonly-binding';

/** Infers the stored value type from a binding type */
export type InferBindingGetType<BindingT> = BindingT extends ReadonlyBinding<infer GetType> ? GetType : never;
