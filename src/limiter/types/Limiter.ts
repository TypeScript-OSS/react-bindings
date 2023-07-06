import type { RunQueue } from 'client-run-queue';

export interface Limiter {
  readonly queue: RunQueue;

  /** Cancels any outstanding function calls and scheduled queue entries */
  readonly cancel: () => void;
  /** Runs or schedules the specified function.  The specified function replaces any previous function used with this limiter */
  readonly limit: (run: () => void) => void;
}
