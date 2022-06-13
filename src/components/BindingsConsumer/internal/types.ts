import type { InferBindingGetType } from '../../../binding/types/inference';
import type { ReadonlyBinding } from '../../../binding/types/readonly-binding';

/** Extracts the value types from named bindings */
export type ExtractNamedBindingsValues<NamedBindingsT extends Record<string, ReadonlyBinding | undefined>> = {
  [KeyT in keyof NamedBindingsT]: NamedBindingsT[KeyT] extends ReadonlyBinding
    ? InferBindingGetType<NamedBindingsT[KeyT]>
    : NamedBindingsT[KeyT] extends ReadonlyBinding | undefined
    ? InferBindingGetType<NamedBindingsT[KeyT]> | undefined
    : NamedBindingsT[KeyT];
};
