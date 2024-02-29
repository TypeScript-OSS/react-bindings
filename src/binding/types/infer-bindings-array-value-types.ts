/* eslint-disable prettier/prettier */
import type { BindingArrayDependencies } from './binding-dependencies';
import type { InferBindingGetType } from './inference';
import type { ReadonlyBinding } from './readonly-binding';

/** Infers the value types from bindings arrays */
export type InferBindingsArrayValueTypes<BindingsArrayT extends BindingArrayDependencies> = {
  [KeyT in keyof BindingsArrayT]: BindingsArrayT[KeyT] extends ReadonlyBinding
    ? InferBindingGetType<BindingsArrayT[KeyT]>
    : BindingsArrayT[KeyT] extends ReadonlyBinding | undefined
    ? InferBindingGetType<BindingsArrayT[KeyT]> | undefined
    : BindingsArrayT[KeyT];
};
