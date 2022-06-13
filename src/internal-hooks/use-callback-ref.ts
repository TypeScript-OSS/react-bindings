import React, { DependencyList, useRef } from 'react';

const noDeps: DependencyList = Object.freeze([]);

/** Creates a wrapper function that can be updated on each render without updating the resulting function */
export const useCallbackRef = <ArgsT extends any[], ReturnT>(func: (...args: ArgsT) => ReturnT) => {
  const latest = useRef<(...args: ArgsT) => ReturnT>(func);
  latest.current = func;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const caller = React.useCallback((...args: ArgsT): ReturnT => latest.current(...args), noDeps);

  return caller;
};
