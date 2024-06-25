import { jest } from '@jest/globals';

import { runInDom, sleep } from '../../../__test_dependency__/index.js';
import { useBinding } from '../../../binding/use-binding.js';
import { useDerivedBinding } from '../use-derived-binding.js';

describe('useDerivedBinding', () => {
  it('should work with undefined bindings', () =>
    runInDom(({ onMount }) => {
      const derived = useDerivedBinding(
        undefined,
        (values) => {
          expect(values).toBeUndefined();
          return 1;
        },
        { id: 'a' }
      );

      onMount(() => {
        expect(derived.get()).toBe(1);
      });
    }));

  it('initial value should work with named bindings', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });

      const bTransformer = jest.fn(({ a }: { a: number }) => a + 1);
      const b = useDerivedBinding({ a }, bTransformer, { id: 'a' });

      onMount(() => {
        expect(b.get()).toBe(1);
        expect(bTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('initial value should work with single unnamed bindings', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });

      const bTransformer = jest.fn(() => a.get() + 1);
      const b = useDerivedBinding(a, bTransformer, { id: 'a' });

      onMount(() => {
        expect(b.get()).toBe(1);
        expect(bTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('initial value should work with array of unnamed bindings', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });

      const bTransformer = jest.fn(() => a.get() + 1);
      const b = useDerivedBinding([a], bTransformer, { id: 'a' });

      onMount(() => {
        expect(b.get()).toBe(1);
        expect(bTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('updates to dependencies should be propagated asynchronously', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });

      const bTransformer = jest.fn(({ a }: { a: number }) => a + 1);
      const b = useDerivedBinding({ a }, bTransformer, { id: 'b' });

      onMount(async () => {
        a.set(1);
        expect(b.get()).toBe(1);

        await sleep(50); // giving time to propagate

        expect(b.get()).toBe(2);
        expect(bTransformer).toHaveBeenCalledTimes(2);
      });
    }));

  it('updates to dependencies should be propagated immediately when limitType=none', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });

      const bTransformer = jest.fn(({ a }: { a: number }) => a + 1);
      const b = useDerivedBinding({ a }, bTransformer, { id: 'a', limitType: 'none' });

      onMount(() => {
        a.set(1);
        expect(b.get()).toBe(2);
        expect(bTransformer).toHaveBeenCalledTimes(2);
      });
    }));
});
