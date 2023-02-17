import type { DependencyList } from 'react';

import type { LimiterOptions } from '../../limiter/options';

export interface UseBindingSyncOptions extends LimiterOptions {
  /** A technical but human-readable ID */
  id?: string;

  /**
   * On a rerender, deps changes are treated like bindings changes.  That is, if they change between renders, the input change detection
   * logic is run (using the `areInputValuesEqual`, `detectInputChanges`, and `makeComparableInputValue` values) using the limiter (see
   * `LimiterOptions`).
   */
  deps?: DependencyList;
}
