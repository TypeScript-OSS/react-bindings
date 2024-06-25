import { jest } from '@jest/globals';

import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import { sleep } from '../../../__test_dependency__/sleep.js';
import { useBinding } from '../../../binding/use-binding.js';
import { useDerivedBinding } from '../use-derived-binding.js';

describe('useDerivedBinding', () => {
  it('initial value should work with derivations of derivations', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = useDerivedBinding({ a }, ({ a }) => a + 1, { id: 'b' });
      const c = useDerivedBinding({ b }, ({ b }) => b + 1, { id: 'c' });

      const dTransformer = jest.fn(({ c }: { c: number }) => c + 1);
      const d = useDerivedBinding({ c }, dTransformer, { id: 'd' });

      onMount(() => {
        expect(d.get()).toBe(3);
        expect(dTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('updates to deepest dependency should be propagated asynchronously', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = useDerivedBinding({ a }, ({ a }) => a + 1, { id: 'b' });
      const c = useDerivedBinding({ b }, ({ b }) => b + 1, { id: 'c' });

      const dTransformer = jest.fn(({ c }: { c: number }) => c + 1);
      const d = useDerivedBinding({ c }, dTransformer, { id: 'd' });

      onMount(async () => {
        a.set(1);
        expect(b.get()).toBe(1);
        expect(c.get()).toBe(2);
        expect(d.get()).toBe(3);

        await sleep(50); // giving time to propagate

        expect(b.get()).toBe(2);
        expect(c.get()).toBe(3);
        expect(d.get()).toBe(4);
        expect(dTransformer).toHaveBeenCalledTimes(2);
      });
    }));

  it('multiple quick updates to deepest dependency should be propagated asynchronously, but only running the transformer once', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = useDerivedBinding({ a }, ({ a }) => a + 1, { id: 'b' });
      const c = useDerivedBinding({ b }, ({ b }) => b + 1, { id: 'c' });

      const dTransformer = jest.fn(({ c }: { c: number }) => c + 1);
      const d = useDerivedBinding({ c }, dTransformer, { id: 'd' });

      onMount(async () => {
        a.set(1);
        a.set(2);
        expect(b.get()).toBe(1);
        expect(c.get()).toBe(2);
        expect(d.get()).toBe(3);

        await sleep(50); // giving time to propagate

        expect(b.get()).toBe(3);
        expect(c.get()).toBe(4);
        expect(d.get()).toBe(5);
        expect(dTransformer).toHaveBeenCalledTimes(2);
      });
    }));
});
