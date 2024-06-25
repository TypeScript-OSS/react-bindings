import { jest } from '@jest/globals';

import { runInDom } from '../../__test_dependency__/run-in-dom.js';
import { sleep } from '../../__test_dependency__/sleep.js';
import { useBinding } from '../../binding/use-binding.js';
import { useBindingEffect } from '../use-binding-effect.js';

describe('useBindingEffect', () => {
  it('trailing throttled effects should be run only when the elapsed interval has been reached', () =>
    runInDom(({ onMount }) => {
      const b = useBinding(() => 0, { id: 'test' });

      const callback = jest.fn(({ b }: { b: number }) => {
        expect(b).toBe(0);
      });

      useBindingEffect({ b }, callback, { limitType: 'throttle', limitMode: 'trailing', limitMSec: 500 });

      onMount(async () => {
        await sleep(50); // giving time for callback

        expect(callback).not.toHaveBeenCalled();

        b.set(0);

        await sleep(50); // giving time for callback (shouldn't run though)

        expect(callback).not.toHaveBeenCalled();

        await sleep(50); // giving time for callback (shouldn't run though)

        expect(callback).not.toHaveBeenCalled();

        await sleep(500); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(1);

        b.set(1);
        b.set(2);
        b.set(3);

        await sleep(50); // giving time for callback (shouldn't run though)

        expect(callback).toHaveBeenCalledTimes(1);

        await sleep(50); // giving time for callback (shouldn't run though)

        expect(callback).toHaveBeenCalledTimes(1);

        await sleep(500); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(2);
      });
    }));

  it('leading throttled effects should be run on the first change or on the next change after enough time has elapsed', () =>
    runInDom(({ onMount }) => {
      const b = useBinding(() => 0, { id: 'test' });

      const callback = jest.fn(({ b }: { b: number }) => {
        expect(b).toBe(0);
      });

      useBindingEffect({ b }, callback, { limitType: 'throttle', limitMode: 'leading', limitMSec: 500 });

      onMount(async () => {
        await sleep(50); // giving time for callback

        expect(callback).not.toHaveBeenCalled();

        b.set(0);

        await sleep(50); // giving time for callback (shouldn't run though)

        expect(callback).toHaveBeenCalledTimes(1);

        await sleep(50); // giving time for callback (shouldn't run though)

        expect(callback).toHaveBeenCalledTimes(1);

        await sleep(500); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(1);

        b.set(1);

        await sleep(0); // giving time for callback (shouldn't run though)

        expect(callback).toHaveBeenCalledTimes(2);

        b.set(2);
        b.set(3);

        await sleep(50); // giving time for callback (shouldn't run though)

        expect(callback).toHaveBeenCalledTimes(2);

        await sleep(50); // giving time for callback (shouldn't run though)

        expect(callback).toHaveBeenCalledTimes(2);

        await sleep(500); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(2);
      });
    }));
});
