import { DEFAULT_PRIORITY } from 'client-run-queue';
import { useEffect, useMemo, useRef } from 'react';

import { useDefaultQueue } from '../default-queue/default-queue-context';
import { LimiterImpl } from './internal/LimiterImpl';
import type { Limiter } from './types/Limiter';
import type { LimiterOptions } from './types/LimiterOptions';

const noOp = () => {};

/** Creates a limiter which can be used to debounce or throttle a function call. */
export const useLimiter = ({
  id,
  cancelOnUnmount = false,
  limitType = 'debounce',
  limitMode = 'trailing',
  limitMSec = 0,
  priority = DEFAULT_PRIORITY,
  queue
}: LimiterOptions & {
  /** A technical, but human-readable ID, which isn't guaranteed to be unique */
  id: string;
  /**
   * If `true`, any previously scheduled functions are automatically canceled on unmount
   *
   * @defaultValue `false`
   */
  cancelOnUnmount?: boolean;
}) => {
  const defaultQueue = useDefaultQueue();

  queue = queue ?? defaultQueue;

  const previousLimiter = useRef<Limiter | undefined>();
  const limiter = useMemo<Limiter>(
    () => new LimiterImpl(id, { limitMSec, limitMode, limitType, priority, queue: queue! }),
    [id, limitMSec, limitMode, limitType, priority, queue]
  );

  // If the limiter changed, cancel the previous one since it's no longer managed by this hook
  if (previousLimiter.current !== undefined && previousLimiter.current !== limiter) {
    previousLimiter.current.cancel();
  }
  previousLimiter.current = limiter;

  const unmountCleanup = useRef(noOp);
  unmountCleanup.current = cancelOnUnmount ? () => limiter.cancel() : noOp;

  useEffect(() => (cancelOnUnmount ? () => unmountCleanup.current() : undefined));

  return limiter;
};
