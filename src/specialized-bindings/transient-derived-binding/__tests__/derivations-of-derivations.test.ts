import { jest } from '@jest/globals';

import { runInDom } from '../../../__test_dependency__/index.js';
import { useBinding } from '../../../binding/use-binding.js';
import { makeTransientDerivedBinding } from '../make-transient-derived-binding.js';

describe('makeTransientDerivedBinding', () => {
  it('initial value should work with derivations of derivations', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = makeTransientDerivedBinding({ a }, ({ a }) => a + 1, { id: 'b' });
      const c = makeTransientDerivedBinding({ b }, ({ b }) => b + 1, { id: 'c' });

      const dTransformer = jest.fn(({ c }: { c: number }) => c + 1);
      const d = makeTransientDerivedBinding({ c }, dTransformer, { id: 'd' });

      onMount(() => {
        expect(d.get()).toBe(3);
        expect(dTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('updates to deepest dependency should be propagated immediately', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = makeTransientDerivedBinding({ a }, ({ a }) => a + 1, { id: 'b' });
      const c = makeTransientDerivedBinding({ b }, ({ b }) => b + 1, { id: 'c' });

      const dTransformer = jest.fn(({ c }: { c: number }) => c + 1);
      const d = makeTransientDerivedBinding({ c }, dTransformer, { id: 'd' });

      onMount(async () => {
        expect(b.get()).toBe(1);
        expect(c.get()).toBe(2);
        expect(d.get()).toBe(3);

        a.set(1);

        expect(b.get()).toBe(2);
        expect(c.get()).toBe(3);
        expect(d.get()).toBe(4);
        expect(dTransformer).toHaveBeenCalledTimes(2);
      });
    }));

  it('multiple quick updates to deepest dependency should be propagated immediately', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = makeTransientDerivedBinding({ a }, ({ a }) => a + 1, { id: 'b' });
      const c = makeTransientDerivedBinding({ b }, ({ b }) => b + 1, { id: 'c' });

      const dTransformer = jest.fn(({ c }: { c: number }) => c + 1);
      const d = makeTransientDerivedBinding({ c }, dTransformer, { id: 'd' });

      onMount(async () => {
        expect(b.get()).toBe(1);
        expect(c.get()).toBe(2);
        expect(d.get()).toBe(3);

        a.set(1);
        a.set(2);

        expect(b.get()).toBe(3);
        expect(c.get()).toBe(4);
        expect(d.get()).toBe(5);
        expect(dTransformer).toHaveBeenCalledTimes(2);
      });
    }));
});
