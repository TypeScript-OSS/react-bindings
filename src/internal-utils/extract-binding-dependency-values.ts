import type { BindingDependencies, NamedBindingDependencies } from '../binding/types/binding-dependencies';
import type { ExtractBindingValueTypes } from '../binding/types/extract-binding-value-types';
import { isBinding } from '../binding-utils/type-utils';

const emptyValues = Object.freeze({});

export const extractBindingDependencyValues = <DependenciesT extends BindingDependencies>({
  bindings,
  namedBindingsKeys
}: {
  bindings: DependenciesT | undefined;
  namedBindingsKeys: string[] | undefined;
}): ExtractBindingValueTypes<DependenciesT> => {
  const isBindingsArray = Array.isArray(bindings);
  const isNonNamedBindings = isBindingsArray || isBinding(bindings);

  if (isNonNamedBindings) {
    if (isBindingsArray) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return bindings.map((binding) => binding?.get()) as ExtractBindingValueTypes<DependenciesT>;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return bindings.get() as ExtractBindingValueTypes<DependenciesT>;
    }
  } else if (namedBindingsKeys !== undefined) {
    const namedBindingValues: Record<string, any> = {};
    for (const key of namedBindingsKeys) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      namedBindingValues[key] = (bindings as NamedBindingDependencies)[key]?.get();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return namedBindingValues as ExtractBindingValueTypes<DependenciesT>;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return emptyValues as ExtractBindingValueTypes<DependenciesT>;
  }
};
