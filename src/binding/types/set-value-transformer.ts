import type { ReadonlyBinding } from './readonly-binding';

/**
 * A transformer function called prior to storing the value when using the `set` method
 *
 * @param newValue - The proposed new value
 * @param thisBinding - The binding being updated
 *
 * @returns The transformed value to set the binding to
 */
export type SetValueTransformer<GetType> = (newValue: GetType, thisBinding: ReadonlyBinding<GetType>) => GetType;
