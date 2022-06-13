import { runInDom, sleep } from '../../../__test_dependency__';
import { useBinding } from '../../../binding/use-binding';
import { useDerivedBinding } from '../use-derived-binding';

describe('useDerivedBinding', () => {
  it('initial value should work with multiple dependencies', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = useBinding(() => 1, { id: 'b' });

      const cTransformer = jest.fn(({ a, b }: { a: number; b: number }) => a + b + 1);
      const c = useDerivedBinding({ a, b }, cTransformer, { id: 'c' });

      onMount(() => {
        expect(c.get()).toBe(2);
        expect(cTransformer).toHaveBeenCalledTimes(1);
      });
    }));

  it('updates to one dependency should be propagated asynchronously', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = useBinding(() => 1, { id: 'b' });

      const cTransformer = jest.fn(({ a, b }: { a: number; b: number }) => a + b + 1);
      const c = useDerivedBinding({ a, b }, cTransformer, { id: 'c' });

      onMount(async () => {
        a.set(2);
        expect(c.get()).toBe(2);

        await sleep(50); // giving time to propagate

        expect(c.get()).toBe(4);
        expect(cTransformer).toHaveBeenCalledTimes(2);
      });
    }));

  it('quick updates to multiple dependencies should be propagated asynchronously, but only running the transformer once', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'a' });
      const b = useBinding(() => 1, { id: 'b' });

      const cTransformer = jest.fn(({ a, b }: { a: number; b: number }) => a + b + 1);
      const c = useDerivedBinding({ a, b }, cTransformer, { id: 'c' });

      onMount(async () => {
        a.set(2);
        b.set(3);
        expect(c.get()).toBe(2);

        await sleep(50); // giving time to propagate

        expect(c.get()).toBe(6);
        expect(cTransformer).toHaveBeenCalledTimes(2);
      });
    }));
});
