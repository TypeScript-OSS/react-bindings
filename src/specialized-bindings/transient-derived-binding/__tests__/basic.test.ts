import { jest } from '@jest/globals';

import { runInDom } from '../../../__test_dependency__';
import { useBinding } from '../../../binding/use-binding';
import { makeTransientDerivedBinding } from '../make-transient-derived-binding';

describe('makeTransientDerivedBinding', () => {
  it('should work with undefined bindings', () =>
    runInDom(({ onMount }) => {
      onMount(() => {
        expect(
          makeTransientDerivedBinding(
            undefined,
            (values) => {
              expect(values).toBeUndefined();
              return 1;
            },
            { id: 'a' }
          ).get()
        ).toBe(1);
      });
    }));

  it('initial value should work with named bindings', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });

      const bTransformer = jest.fn(({ a }: { a: number }) => a + 1);

      onMount(() => {
        expect(makeTransientDerivedBinding({ a }, bTransformer, { id: 'a' }).get()).toBe(1);
        expect(bTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('initial value should work with single unnamed bindings', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });

      const bTransformer = jest.fn(() => a.get() + 1);

      onMount(() => {
        expect(makeTransientDerivedBinding(a, bTransformer, { id: 'a' }).get()).toBe(1);
        expect(bTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('initial value should work with array of unnamed bindings', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });

      const bTransformer = jest.fn(() => a.get() + 1);

      onMount(() => {
        expect(makeTransientDerivedBinding([a], bTransformer, { id: 'a' }).get()).toBe(1);
        expect(bTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('updates to dependencies should be propagated asynchronously', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });

      const bTransformer = jest.fn(({ a }: { a: number }) => a + 1);

      onMount(async () => {
        expect(makeTransientDerivedBinding({ a }, bTransformer, { id: 'b' }).get()).toBe(1);

        a.set(1);

        expect(makeTransientDerivedBinding({ a }, bTransformer, { id: 'b' }).get()).toBe(2);
        expect(bTransformer).toHaveBeenCalledTimes(2);
      });
    }));
});
