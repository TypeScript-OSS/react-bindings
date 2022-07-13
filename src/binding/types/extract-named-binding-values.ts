import type { NamedBindingDependencies } from './binding-dependencies';
import type { InferBindingGetType } from './inference';
import type { ReadonlyBinding } from './readonly-binding';

/** Extracts the value types from named bindings */
export type ExtractNamedBindingsValues<NamedBindingsT extends NamedBindingDependencies> = {
  [KeyT in keyof NamedBindingsT]: NamedBindingsT[KeyT] extends ReadonlyBinding
    ? InferBindingGetType<NamedBindingsT[KeyT]>
    : NamedBindingsT[KeyT] extends ReadonlyBinding | undefined
    ? InferBindingGetType<NamedBindingsT[KeyT]> | undefined
    : NamedBindingsT[KeyT];
};
