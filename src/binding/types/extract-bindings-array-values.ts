import type { BindingsArrayDependencies } from './binding-dependencies';
import type { InferBindingGetType } from './inference';
import type { ReadonlyBinding } from './readonly-binding';

/** Extracts the value types from bindings arrays */
export type ExtractBindingsArrayValues<BindingsArrayT extends BindingsArrayDependencies> = {
  [KeyT in keyof BindingsArrayT]: BindingsArrayT[KeyT] extends ReadonlyBinding
    ? InferBindingGetType<BindingsArrayT[KeyT]>
    : BindingsArrayT[KeyT] extends ReadonlyBinding | undefined
    ? InferBindingGetType<BindingsArrayT[KeyT]> | undefined
    : BindingsArrayT[KeyT];
};
