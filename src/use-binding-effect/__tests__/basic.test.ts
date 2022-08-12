import { waitFor } from '@testing-library/react';

import { runInDom, sleep } from '../../__test_dependency__';
import type { ReadonlyBinding } from '../../binding/types/readonly-binding';
import { useBinding } from '../../binding/use-binding';
import { useBindingEffect } from '../use-binding-effect';

describe('useBindingEffect', () => {
  it('should work with undefined bindings', () =>
    runInDom(({ onMount }) => {
      const callback = jest.fn((values) => {
        expect(values).toBeUndefined();
      });

      useBindingEffect(undefined, callback, { triggerOnMount: true });

      onMount(async () => {
        await waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
      });
    }));

  it('with default settings, callback should only run if binding changed while mounted', () =>
    runInDom(({ onMount }) => {
      const b = useBinding(() => 0, { id: 'test' });

      const callback = jest.fn(({ b }: { b: number }, bindings: { b: ReadonlyBinding<number> }) => {
        expect(b).toBe(0);
        expect(bindings.b.get()).toBe(0);
      });

      useBindingEffect({ b }, callback);

      onMount(async () => {
        await sleep(50); // giving time for callback

        expect(callback).not.toHaveBeenCalled();

        b.set(0);

        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(1);
      });
    }));

  it('with default settings, callback should be run on mount if bindings changed between render and mount', () =>
    runInDom(({ onMount }) => {
      const b = useBinding(() => 0, { id: 'test' });

      const callback = jest.fn(({ b }: { b: number }) => {
        expect(b).toBe(1);
      });

      useBindingEffect({ b }, callback);
      b.set(1);

      onMount(async () => {
        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(1);

        b.set(1);

        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(2);
      });
    }));
});
