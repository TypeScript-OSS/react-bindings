/* istanbul ignore file */

import type { ReadonlyBinding } from '../binding/types/readonly-binding';

let globalStatsHandler: StatsHandler = {};

export interface StatsHandler {
  trackDidMakeBinding?: (args: { binding: ReadonlyBinding }) => void;
  trackBindingDidAddChangeListener?: (args: { binding: ReadonlyBinding }) => void;
  trackBindingDidRemoveChangeListener?: (args: { binding: ReadonlyBinding }) => void;
  trackBindingDidSetRaw?: (args: { binding: ReadonlyBinding; durationMSec: number; numListeners: number }) => void;
  trackDerivedBindingTransformerDidRun?: (args: { id: string; durationMSec: number }) => void;
}

/** Gets the stats handler registered using `setStatsHandler` */
export const getStatsHandler = () => globalStatsHandler;

/** Sets a stats handler that can be used for debugging or analyzing use.  Not recommended for production environments */
export const setStatsHandler = (statsHandler: StatsHandler) => {
  globalStatsHandler = statsHandler;
};
