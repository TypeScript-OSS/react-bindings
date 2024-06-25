import { runInDom } from '../../__test_dependency__/run-in-dom.js';
import { sleep } from '../../__test_dependency__/sleep.js';
import { useBinding } from '../../binding/use-binding.js';
import { useFlattenedBinding } from '../flattened-binding.js';

describe('useFlattenedBinding', () => {
  it('initial value should work', () =>
    runInDom(() => {
      const a = useBinding(() => 0, { id: 'test1' });
      const b = useBinding(() => ({ myBinding: a, somethingElse: 3 }), { id: 'test2' });
      const c = useFlattenedBinding({ b }, ({ b }) => b.myBinding, { id: 'test3' });

      expect(c.get()).toBe(0);
    }));

  it('updating root binding should propagate synchronously', () =>
    runInDom(({ onMount }) => {
      const a = useBinding(() => 0, { id: 'test1' });
      const b = useBinding(() => ({ myBinding: a, somethingElse: 3 }), { id: 'test2' });
      const c = useFlattenedBinding({ b }, ({ b }) => b.myBinding, { id: 'test3' });

      onMount(() => {
        a.set(1);
        expect(b.get()).toMatchObject({ myBinding: a, somethingElse: 3 });
        expect(c.get()).toBe(1);
      });
    }));

  it('switching root bindings should propagate asynchronously', () =>
    runInDom(({ onMount }) => {
      const a1 = useBinding(() => 0, { id: 'test1' });
      const a2 = useBinding(() => 10, { id: 'test2' });
      const b = useBinding(() => ({ myBinding: a1, somethingElse: 3 }), { id: 'test3' });
      const c = useFlattenedBinding({ b }, ({ b }) => b.myBinding, { id: 'test4' });

      onMount(async () => {
        b.set({ myBinding: a2, somethingElse: 6 });
        expect(b.get()).toMatchObject({ myBinding: a2, somethingElse: 6 });
        expect(c.get()).toBe(0);

        await sleep(50); // giving time to propagate

        expect(c.get()).toBe(10);
      });
    }));
});
