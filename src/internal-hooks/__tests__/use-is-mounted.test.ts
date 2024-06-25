import { runInDom } from '../../__test_dependency__/index.js';
import { useIsMountedRef } from '../use-is-mounted-ref.js';

describe('useIsMounted', () => {
  it('value should change when mounted and unmounted', () =>
    runInDom(({ onMount, onUnmount }) => {
      const isMounted = useIsMountedRef();
      expect(isMounted.current).toBeFalsy();

      onMount(() => {
        expect(isMounted.current).toBeTruthy();
      });

      onUnmount(() => {
        expect(isMounted.current).toBeFalsy();
      });
    }));
});
