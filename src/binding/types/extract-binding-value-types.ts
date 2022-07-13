import type { BindingDependencies, BindingsArrayDependencies, NamedBindingDependencies } from './binding-dependencies';
import type { ExtractBindingsArrayValues } from './extract-bindings-array-values';
import type { ExtractNamedBindingsValues } from './extract-named-binding-values';
import type { InferBindingGetType } from './inference';
import type { ReadonlyBinding } from './readonly-binding';

/** Extracts the values of either a single binding, bindings in an array or tuple, or a record with binding values */
export type ExtractBindingValueTypes<DependenciesT extends BindingDependencies> = DependenciesT extends ReadonlyBinding
  ? InferBindingGetType<DependenciesT>
  : DependenciesT extends NamedBindingDependencies
  ? ExtractNamedBindingsValues<DependenciesT>
  : DependenciesT extends BindingsArrayDependencies
  ? ExtractBindingsArrayValues<DependenciesT>
  : void;
