import type { BindingArrayDependencies, BindingDependencies, NamedBindingDependencies } from './binding-dependencies';
import type { ExtractBindingsArrayValues } from './extract-bindings-array-values';
import type { ExtractNamedBindingsValues } from './extract-named-binding-values';
import type { InferBindingGetType } from './inference';
import type { ReadonlyBinding } from './readonly-binding';

/** Infers the values of either a single binding, bindings in an array or tuple, or a record with binding values */
export type InferBindingValueTypes<DependenciesT extends BindingDependencies> = DependenciesT extends ReadonlyBinding
  ? InferBindingGetType<DependenciesT>
  : DependenciesT extends NamedBindingDependencies
  ? ExtractNamedBindingsValues<DependenciesT>
  : DependenciesT extends BindingArrayDependencies
  ? ExtractBindingsArrayValues<DependenciesT>
  : Record<string, never>;
