import type { RunQueue } from 'client-run-queue';
import { DEFAULT_PRIORITY } from 'client-run-queue';

import { LimiterImpl } from './internal/LimiterImpl.js';
import type { Limiter } from './types/Limiter';
import type { LimiterOptions } from './types/LimiterOptions';

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
}: MakeLimiterArgs): Limiter => new LimiterImpl(id, { limitMode, limitMSec, limitType, priority, queue });
