import type { DependencyList } from 'react';

import type { EmptyObject } from '../../types/empty';
import type { Binding } from './binding';
import type { SetValueTransformer } from './set-value-transformer';

/** Post-initializer arguments used to configure bindings */
export interface BindingConstructorArgs<GetType = any> {
  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  id: string;

  /**
   * A transformer function called prior to storing the value when using the `set` method
   *
   * @param newValue - The proposed new value
   * @param thisBinding - The binding being updated
   *
   * @returns The transformed value to set the binding to
   */
  setValueTransformer?: SetValueTransformer<GetType>;

  /**
   * If specified, overrides the function used to compare values
   *
   * @defaultValue `_.isEqual`, which can be globally overridden using `setAreEqual`
   */
  areEqual?: (a: GetType, b: GetType) => boolean;
  /**
   * - If `true` – `areEqual` is used to compare the old and new values when `set`/`setRaw` are called.  If the values are equal, the
   * binding value won't be changed.  If they're unequal, the binding value will be changed and listeners will be notified.
   * - If `false` – old and new values aren't compared when `set`/`setRaw` are called.  The binding will always be changed and listeners
   * will always be notified.
   *
   * @defaultValue `false`
   */
  detectChanges?: boolean;
}

/** The post-initializer arguments that are passed to `makeBinding` */
export interface MakeBindingArgs<GetType = any, ExtraFieldsT = EmptyObject> extends BindingConstructorArgs<GetType> {
  /** Use to support injecting additional fields into bindings */
  addFields?: (thisBinding: Binding<GetType>) => ExtraFieldsT;
}

/** The post-initializer arguments that are passed to `useBinding` */
export interface UseBindingArgs<GetType = any, ExtraFieldsT = EmptyObject> extends MakeBindingArgs<GetType, ExtraFieldsT> {
  /** Hook dependencies */
  deps?: DependencyList;
}
