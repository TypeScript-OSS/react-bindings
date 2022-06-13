import { RefObject, useEffect, useRef } from 'react';

/** Much lighter weight than useMountBinding  */
export const useIsMountedRef = (): RefObject<boolean> => {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  });

  return isMounted;
};
