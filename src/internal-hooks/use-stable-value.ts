import { useRef } from 'react';

import { areEqual } from '../config/are-equal';

/**
 * Remembers the specified value across renders and compares it against a stored value, which is returned.  The stored value is only updated
 * if the specified value really changes, using `areEqual` to compare.
 */
export const useStableValue = <T>(instableValue: T) => {
  const stableValue = useRef<T>(instableValue);

  if (!areEqual(instableValue, stableValue.current)) {
    stableValue.current = instableValue;
  }

  return stableValue.current;
};
