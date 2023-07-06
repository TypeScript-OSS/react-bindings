import type { BindingDependencies } from '../../../binding/types/binding-dependencies';
import type { LimiterOptions } from '../../../limiter/types/LimiterOptions';

export type BindingsConsumerProps<DependenciesT extends BindingDependencies> = LimiterOptions & {
  /** Bindings that cause the consumer to rerender.  Undefined values are ignored */
  bindings?: DependenciesT;

  /**
   * If specified, overrides the function used to compare input values
   *
   * @defaultValue `_.isEqual`, which can be globally overridden using `setAreEqual`
   */
  areInputValuesEqual?: (a: any, b: any) => boolean;
  /**
   * - If `true` – `areInputValuesEqual` is used to compare the old and new results of `makeComparableInputValue` when any of the input
   * bindings are changed.  If the values are equal, the transformer won't be run.  If they're unequal, the transformer will be run.
   * - If `false` – old and new values aren't compared and the transformer will always be run any time the bindings change.
   *
   * @defaultValue `false`
   */
  detectInputChanges?: boolean;
  /**
   * By default, when `detectInputChanges` is `true`, the input is compared using all specified bindings.  This behavior can be overridden
   * by providing this function to generate a value that can be compared instead.  The generated value will be remembered until the next
   * comparison is needed.  Comparisons are performed using `areInputValuesEqual`
   *
   * @defaultValue A function that returns the values of all input bindings
   */
  makeComparableInputValue?: () => any;
};
