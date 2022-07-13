import type { BindingArrayDependencies, BindingDependencies, NamedBindingDependencies } from './binding-dependencies';
import type { InferBindingsArrayValueTypes } from './infer-bindings-array-value-types';
import type { InferNamedBindingsValueTypes } from './infer-named-binding-value-types';
import type { InferBindingGetType } from './inference';
import type { ReadonlyBinding } from './readonly-binding';

/** Infers the values of either a single binding, bindings in an array or tuple, or a record with binding values */
export type InferBindingValueTypes<DependenciesT extends BindingDependencies> = DependenciesT extends ReadonlyBinding
  ? InferBindingGetType<DependenciesT>
  : DependenciesT extends NamedBindingDependencies
  ? InferNamedBindingsValueTypes<DependenciesT>
  : DependenciesT extends BindingArrayDependencies
  ? InferBindingsArrayValueTypes<DependenciesT>
  : Record<string, never>;
