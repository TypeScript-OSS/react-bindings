import { RunQueue, RunQueueOptions } from 'client-run-queue';
import React, { PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react';

import { useStableValue } from '../internal-hooks/use-stable-value';

const DefaultQueueContext = React.createContext<RunQueue>(new RunQueue('default'));

export const useDefaultQueue = () => useContext(DefaultQueueContext);

export interface DefaultQueueProviderProps extends RunQueueOptions {
  /** A technical, but human-readable ID prefix, which isn't guaranteed to be unique.  This will be suffixed by `':default'` */
  idPrefix: string;

  /**
   * If `true`, `cancelAll` is called on the associated queue whenever this component is unmounted or whenever the idPrefix or other
   * options change.
   *
   * @defaultValue `false`
   */
  cancelAllOnUnmount?: boolean;
}

/** Provides a new default queue, which can be used in children using `useDefaultQueue` */
export const DefaultQueueProvider = ({
  children,
  idPrefix,
  cancelAllOnUnmount = false,
  ...options
}: PropsWithChildren<DefaultQueueProviderProps>) => {
  const stableOptions = useStableValue(options);
  const queue = useMemo(() => new RunQueue(`${idPrefix}:default`, stableOptions), [idPrefix, stableOptions]);
  const previousQueue = useRef<RunQueue>(queue);

  useEffect(() => {
    if (previousQueue.current !== queue) {
      if (cancelAllOnUnmount) {
        previousQueue.current?.cancelAll();
      }
      previousQueue.current = queue;
    }

    return cancelAllOnUnmount ? queue.cancelAll : undefined;
  }, [cancelAllOnUnmount, queue]);

  return <DefaultQueueContext.Provider value={queue}>{children}</DefaultQueueContext.Provider>;
};
