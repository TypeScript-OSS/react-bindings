import type { DependencyList } from 'react';

import type { LimiterOptions } from '../../limiter/options';

export interface UseBindingEffectOptions extends LimiterOptions {
  /** A technical but human-readable ID */
  id?: string;

  /**
   * On a rerender, deps changes are treated like bindings changes.  That is, if they change between renders, the input change detection
   * logic is run (using the `areInputValuesEqual`, `detectInputChanges`, and `makeComparableInputValue` values) using the limiter (see
   * `LimiterProps`).
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
   * By default, when `detectInputChanges` is true, the input is compared using all specified bindings.  This behavior can be overridden by
   * providing this function to generate a value that can be compared instead.  This value will be remembered until the next comparison is
   * needed.  Comparisons are performed using `areInputValuesEqual`
   *
   * @defaultValue A function that returns the values of all input bindings (including any additional bindings) and the deps
   */
  makeComparableInputValue?: () => any;

  /**
   * - If `true`, the callback is triggered every time this is mounted in addition to whenever the input bindings change.
   * - If `false`, the callback is only triggered when the input bindings change.
   * - If `'first'`, the callback is triggered on the first mount and whenever the input bindings change
   * - If `'if-input-changed'`, the callback is triggered on mount if the bindings have changed since the last evaluation of the
   * transformer
   *
   * @defaultValue `'if-input-changed'`
   */
  triggerOnMount?: boolean | 'first' | 'if-input-changed';
}
