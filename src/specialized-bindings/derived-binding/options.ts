import type { DependencyList } from 'react';

import type { LimiterOptions } from '../../limiter/types/LimiterOptions';

export interface DerivedBindingOptions<GetT> extends LimiterOptions {
  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  id: string;

  /**
   * On a rerender, deps changes are treated like bindings changes.  That is, if they change between renders, the input change detection
   * logic is run (using the `areInputValuesEqual`, `detectInputChanges`, and `makeComparableInputValue` values) using the limiter (see
   * `LimiterOptions`).
   */
  deps?: DependencyList;

  /**
   * If specified, overrides the function used to compare input values
   *
   * @defaultValue `_.isEqual`, which can be globally overridden using `setAreEqual`
   */
  areInputValuesEqual?: (a: any, b: any) => boolean;
  /**
   * - If `true` – `areInputValuesEqual` is used to compare the old and new results of `makeComparableInputValue` when any of the input
   * bindings or `deps` are changed.  If the values are equal, the transformer won't be run.  If they're unequal, the transformer will be
   * run.
   * - If `false` – old and new values aren't compared, the transformer will always be run.
   *
   * @defaultValue `true`
   */
  detectInputChanges?: boolean;
  /**
   * By default, when `detectInputChanges` is `true`, the input is compared using all specified bindings.  This behavior can be overridden
   * by providing this function to generate a value that can be compared instead.  The generated value will be remembered until the next
   * comparison is needed.  Comparisons are performed using `areInputValuesEqual`
   *
   * @defaultValue A function that returns the values of all input bindings and the deps
   */
  makeComparableInputValue?: () => any;

  /**
   * If specified, overrides the function used to compare output values
   *
   * @defaultValue `_.isEqual`, which can be globally overridden using `setAreEqual`
   */
  areOutputValuesEqual?: (a: GetT, b: GetT) => boolean;
  /**
   * - If `true` – `areOutputValuesEqual` is used to compare the old and new results of the transformer function, each time it's run.  If the
   * values are equal, the derived binding's value won't be changed.  If they're unequal, the binding value will be changed and listeners
   * will be notified.
   * - If `false` – old and new results of the transformer function aren't compared.  The derived binding's value will always be changed each
   * time the transformer function is run.
   *
   * @defaultValue `true`
   */
  detectOutputChanges?: boolean;
}
