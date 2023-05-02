import { jest } from '@jest/globals';

import { runInDom, sleep } from '../../__test_dependency__';
import { useBinding } from '../../binding/use-binding';
import { useBindingEffect } from '../use-binding-effect';

describe('useBindingEffect', () => {
  it('with detectInputChanges=true, callback should only run if binding values really changed, according to areEqual', () =>
    runInDom(({ onMount }) => {
      const b = useBinding(() => 0, { id: 'test' });

      const callback = jest.fn(({ b }: { b: number }) => {
        expect(b).toBe(0);
      });

      useBindingEffect({ b }, callback, { detectInputChanges: true });

      onMount(async () => {
        await sleep(50); // giving time for callback

        expect(callback).not.toHaveBeenCalled();

        b.set(0);

        await sleep(50); // giving time for callback

        expect(callback).not.toHaveBeenCalled();

        b.set(1);

        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(1);
      });
    }));

  it("with detectChanges=true and makeComparableInputValue=evenness checker, callback should only run if binding's evenness changes", () =>
    runInDom(({ onMount }) => {
      const b = useBinding(() => 0, { id: 'test' });

      const callback = jest.fn(({ b }: { b: number }) => {
        expect(b).toBe(0);
      });

      useBindingEffect({ b }, callback, { detectInputChanges: true, makeComparableInputValue: () => b.get() % 2 === 0 });

      onMount(async () => {
        await sleep(50); // giving time for callback

        expect(callback).not.toHaveBeenCalled();

        b.set(0);

        await sleep(50); // giving time for callback

        expect(callback).not.toHaveBeenCalled();

        b.set(2);

        await sleep(50); // giving time for callback

        expect(callback).not.toHaveBeenCalled();

        b.set(3);

        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(1);
      });
    }));
});
