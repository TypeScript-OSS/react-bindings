import { jest } from '@jest/globals';

import { runInDom } from '../../../__test_dependency__/index.js';
import { useBinding } from '../../../binding/use-binding.js';
import { makeTransientDerivedBinding } from '../make-transient-derived-binding.js';

describe('makeTransientDerivedBinding', () => {
  it('initial value should work with multiple dependencies', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = useBinding(() => 1, { id: 'b' });

      const cTransformer = jest.fn(({ a, b }: { a: number; b: number }) => a + b + 1);
      const c = makeTransientDerivedBinding({ a, b }, cTransformer, { id: 'c' });

      onMount(() => {
        expect(c.get()).toBe(2);
        expect(cTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('updates to one dependency should be propagated immediately', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = useBinding(() => 1, { id: 'b' });

      const cTransformer = jest.fn(({ a, b }: { a: number; b: number }) => a + b + 1);
      const c = makeTransientDerivedBinding({ a, b }, cTransformer, { id: 'c' });

      onMount(async () => {
        a.set(2);
        expect(c.get()).toBe(4);
        expect(cTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('quick updates to multiple dependencies should be propagated immediately', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = useBinding(() => 1, { id: 'b' });

      const cTransformer = jest.fn(({ a, b }: { a: number; b: number }) => a + b + 1);
      const c = makeTransientDerivedBinding({ a, b }, cTransformer, { id: 'c' });

      onMount(async () => {
        a.set(2);
        b.set(3);
        expect(c.get()).toBe(6);
        expect(cTransformer).toHaveBeenCalledTimes(1);
      });
    }));
});
