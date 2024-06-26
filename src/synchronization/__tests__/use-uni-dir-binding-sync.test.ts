import { waitFor } from '@testing-library/react';

import { runInDom } from '../../__test_dependency__/run-in-dom.js';
import { useBinding } from '../../binding/use-binding.js';
import { useUniDirBindingSync } from '../use-uni-dir-binding-sync.js';

describe('useUniDirBindingSync', () => {
  it('should work', () =>
    runInDom(({ onMount }) => {
      const dest = useBinding(() => 0, { id: 'dest', detectChanges: true });
      const source = useBinding(() => 1, { id: 'source', detectChanges: true });

      useUniDirBindingSync(source, dest);

      onMount(async () => {
        await waitFor(() => expect(dest.get()).toBe(1));

        source.set(2);

        await waitFor(() => expect(dest.get()).toBe(2));
      });
    }));
});
