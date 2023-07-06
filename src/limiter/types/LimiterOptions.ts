import type { RunQueue } from 'client-run-queue';

import type { LimitMode } from './LimitMode';
import type { LimitType } from './LimitType';

export interface LimiterOptions {
  /**
   * The limiter mode
   *
   * @defaultValue `'trailing'`
   */
  limitMode?: LimitMode;
  /**
   * The duration to debounce/throttle for
   *
   * @defaultValue `0`
   */
  limitMSec?: number;
  /**
   * The type of limiter
   *
   * @defaultValue `'debounce'`
   */
  limitType?: LimitType;

  /**
   * The priority
   *
   * @defaultValue `DEFAULT_PRIORITY` (`0`)
   */
  priority?: number;
  /**
   * The queue
   *
   * @defaultValue result of `useDefaultQueue()`
   */
  queue?: RunQueue;
}
