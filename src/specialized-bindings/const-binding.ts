import { makeBinding } from '../binding/make-binding';
import type { ReadonlyBinding } from '../binding/types/readonly-binding';
import { useBinding } from '../binding/use-binding';

export interface ConstBindingArgs {
  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  id: string;
}

/** Makes a const binding without using any React contexts. */
export const makeConstBinding = <GetT>(value: GetT, { id }: ConstBindingArgs): ReadonlyBinding<GetT> => makeBinding(() => value, { id });

/** Use for cases where a binding is required in an interface but the underlying value is constant with respect to a single render */
export const useConstBinding = <GetT>(value: GetT, { id }: ConstBindingArgs): ReadonlyBinding<GetT> => {
  const internalBinding = useBinding(() => value, { id, detectChanges: true });
  internalBinding.setRaw(value);

  return internalBinding;
};
