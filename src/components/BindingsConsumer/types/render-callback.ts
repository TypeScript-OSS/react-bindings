import type { ReactNode } from 'react';

import type { BindingDependencies } from '../../../binding/types/binding-dependencies';
import type { InferBindingValueTypes } from '../../../binding/types/infer-binding-value-types';

/**
 * Called to render the contents of a BindingsConsumer on the initial render and when the associated bindings changes.
 *
 * @param bindingValues - The extracted values of the associated bindings.
 * @param bindings - The original dependencies.
 */
export type BindingsConsumerRenderCallback<DependenciesT extends BindingDependencies = Record<string, never>> = (
  bindingValues: InferBindingValueTypes<DependenciesT>,
  bindings: DependenciesT
) => ReactNode;
