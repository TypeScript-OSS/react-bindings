import { DEFAULT_PRIORITY, RunQueue, RunQueueEntry } from 'client-run-queue';
import _, { DebouncedFunc } from 'lodash';

import { LimiterOptions, LimitMode } from './options';

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

      lodashLimiter?.cancel();
      lodashLimiter = undefined;

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
