import type { RunQueue, RunQueueEntry } from 'client-run-queue';
import { DEFAULT_PRIORITY } from 'client-run-queue';
import type { DebouncedFunc } from 'lodash';
import _ from 'lodash';

import type { LimiterOptions, LimitMode } from './options';

const noOp = () => {};

const leadingEdgeModes = new Set<LimitMode>(['leading', 'leading-and-trailing']);
const trailingEdgeModes = new Set<LimitMode>(['trailing', 'leading-and-trailing']);

export interface MakeLimiterArgs extends Omit<LimiterOptions, 'queue'> {
  id: string;
  queue: RunQueue;
}

export const makeLimiter = ({
  id,
  limitType = 'debounce',
  limitMSec = 0,
  limitMode = 'trailing',
  priority = DEFAULT_PRIORITY,
  queue
}: MakeLimiterArgs) => {
  let queueEntry: RunQueueEntry<void> | undefined;
  let lodashLimiter: DebouncedFunc<() => void> | undefined;

  let runner = noOp;

  return {
    cancel: () => {
      queueEntry?.cancel();
      queueEntry = undefined;

      // Not actually canceling the lodashLimiter because we don't want the limiting state to reset, but changing the runner to a noOp so it
      // won't do anything
      runner = noOp;
    },
    limit: (run: () => void) => {
      if (limitType === 'none') {
        run();
        return;
      }

      runner = run;

      if (lodashLimiter === undefined) {
        lodashLimiter = _[limitType](
          () => {
            queueEntry?.cancel();
            queueEntry = queue!.schedule(priority, id, () => runner());
          },
          limitMSec,
          {
            leading: leadingEdgeModes.has(limitMode),
            trailing: trailingEdgeModes.has(limitMode)
          }
        );
      }

      lodashLimiter();
    }
  };
};
