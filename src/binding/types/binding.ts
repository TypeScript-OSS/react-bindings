import type { ReadonlyBinding } from './readonly-binding';
import type { SetValueTransformer } from './set-value-transformer';

/**
 * A binding is a stored piece of data that notifies registered listeners when changed.
 *
 * @see `useBinding`
 */
export interface Binding<GetType = any> extends ReadonlyBinding<GetType> {
  /** Resets the binding back to its initial value and marks the binding as non-modified. */
  readonly reset: () => void;
  /** Sets the value, using the result of `setValueTransformer` if set, and then marks the binding as modified. */
  readonly set: (newValue: GetType) => void;
  /** Sets the internal value without transforming or marking as changed.  Don't normally use this! */
  readonly setRaw: (newValue: GetType) => void;

  /** Sets the binding as having been modified or not */
  readonly setIsModified: (isModified: boolean) => void;

  /** If set, a function to transform the value before it's stored */
  readonly setValueTransformer?: SetValueTransformer<GetType>;

  /** Forcibly triggers the change listeners.  Don't normally use this! */
  readonly triggerChangeListeners: () => void;
}
