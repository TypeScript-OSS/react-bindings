import type { RunQueue, RunQueueEntry } from 'client-run-queue';
import type { DebouncedFunc } from 'lodash-es';
import { debounce, throttle } from 'lodash-es';

import type { Limiter } from '../types/Limiter';
import type { LimiterOptions } from '../types/LimiterOptions';
import type { LimitMode } from '../types/LimitMode';

const noOp = () => {};

const leadingEdgeModes = new Set<LimitMode>(['leading', 'leading-and-trailing']);
const trailingEdgeModes = new Set<LimitMode>(['trailing', 'leading-and-trailing']);

export class LimiterImpl implements Limiter {
  // Limiter Fields

  public readonly queue: RunQueue;

  // Private Fields

  private queueEntry_: RunQueueEntry<void> | undefined;
  private lodashLimiter_: DebouncedFunc<() => void> | undefined;

  private readonly id_: string;
  private readonly options_: Required<LimiterOptions>;
  private runner_ = noOp;

  // Initialization

  constructor(id: string, options: Required<LimiterOptions>) {
    this.id_ = id;
    this.queue = options.queue;
    this.options_ = options;
  }

  // Limiter Methods

  public cancel() {
    this.queueEntry_?.cancel();
    this.queueEntry_ = undefined;

    // Not actually canceling the lodashLimiter because we don't want the limiting state to reset, but changing the runner to a noOp so it
    // won't do anything
    this.runner_ = noOp;
  }

  public limit(run: () => void) {
    const { limitMode, limitMSec, limitType, priority } = this.options_;

    if (limitType === 'none') {
      run();
      return;
    }

    this.runner_ = run;

    if (this.lodashLimiter_ === undefined) {
      const func = () => {
        this.queueEntry_?.cancel();
        this.queueEntry_ = this.queue!.schedule(priority, this.id_, () => this.runner_());
      };
      const options = {
        leading: leadingEdgeModes.has(limitMode),
        trailing: trailingEdgeModes.has(limitMode)
      };

      switch (limitType) {
        case 'debounce':
          this.lodashLimiter_ = debounce(func, limitMSec, options);
          break;
        case 'throttle':
          this.lodashLimiter_ = throttle(func, limitMSec, options);
          break;
      }
    }

    this.lodashLimiter_();
  }
}
