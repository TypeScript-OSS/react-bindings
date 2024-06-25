import type { BindingDependencies, NamedBindingDependencies } from '../binding/types/binding-dependencies';
import type { InferBindingValueTypes } from '../binding/types/infer-binding-value-types';
import { isBinding } from '../binding-utils/type-utils.js';

export const extractBindingDependencyValues = <DependenciesT extends BindingDependencies>({
  bindings,
  namedBindingsKeys
}: {
  bindings: DependenciesT | undefined;
  namedBindingsKeys: string[] | undefined;
}): InferBindingValueTypes<DependenciesT> => {
  const isBindingsArray = Array.isArray(bindings);
  const isNonNamedBindings = isBindingsArray || isBinding(bindings);

  if (isNonNamedBindings) {
    if (isBindingsArray) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return bindings.map((binding) => binding?.get()) as InferBindingValueTypes<DependenciesT>;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return bindings.get() as InferBindingValueTypes<DependenciesT>;
    }
  } else if (namedBindingsKeys !== undefined) {
    const namedBindingValues: Record<string, any> = {};
    for (const key of namedBindingsKeys) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      namedBindingValues[key] = (bindings as NamedBindingDependencies)[key]?.get();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return namedBindingValues as InferBindingValueTypes<DependenciesT>;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return undefined as InferBindingValueTypes<DependenciesT>;
  }
};
