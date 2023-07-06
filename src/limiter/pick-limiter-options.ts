import type { LimiterOptions } from './types/LimiterOptions';

export const pickLimiterOptions = <T extends LimiterOptions>(value: T): LimiterOptions => ({
  limitMode: value.limitMode,
  limitMSec: value.limitMSec,
  limitType: value.limitType,
  priority: value.priority,
  queue: value.queue
});
