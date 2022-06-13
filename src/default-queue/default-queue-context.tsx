import { RunQueue, RunQueueOptions } from 'client-run-queue';
import React, { PropsWithChildren, useContext, useEffect, useMemo } from 'react';

import { useStableValue } from '../internal-hooks/use-stable-value';

const DefaultQueueContext = React.createContext<RunQueue>(new RunQueue('default'));

export const useDefaultQueue = () => useContext(DefaultQueueContext);

export interface DefaultQueueProviderProps extends RunQueueOptions {
  /** A technical, but human-readable ID prefix, which isn't guaranteed to be unique.  This will be suffixed by `':default'` */
  idPrefix: string;
}

/** Provides a new default queue, which can be used in children using `useDefaultQueue` */
export const DefaultQueueProvider = ({ children, idPrefix, ...options }: PropsWithChildren<DefaultQueueProviderProps>) => {
  const stableOptions = useStableValue(options);
  const queue = useMemo(() => new RunQueue(`${idPrefix}:default`, stableOptions), [idPrefix, stableOptions]);

  useEffect(() => () => queue.cancelAll(), [queue]);

  return <DefaultQueueContext.Provider value={queue}>{children}</DefaultQueueContext.Provider>;
};
