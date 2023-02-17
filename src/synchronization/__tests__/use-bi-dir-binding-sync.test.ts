import { waitFor } from '@testing-library/react';

import { runInDom } from '../../__test_dependency__';
import { useBinding } from '../../binding/use-binding';
import { useBiDirBindingSync } from '../use-bi-dir-binding-sync';

describe('useBiDirBindingSync', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a', detectChanges: true });
      const b = useBinding(() => 1, { id: 'b', detectChanges: true });

      useBiDirBindingSync(a, b);

      onMount(async () => {
        await waitFor(() => expect(b.get()).toBe(0));

        b.set(2);

        await waitFor(() => expect(a.get()).toBe(2));

        a.set(3);

        await waitFor(() => expect(b.get()).toBe(3));
      });
    }));
});
