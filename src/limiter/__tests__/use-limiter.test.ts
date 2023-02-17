import { runInDom, sleep } from '../../__test_dependency__';
import { useLimiter } from '../use-limiter';

describe('useLimiter', () => {
  it('with default settings should run only once enough time is given', () =>
    runInDom(({ onMount }) => {
      const limiter = useLimiter({ id: 'test' });

      onMount(async () => {
        const callback = jest.fn((_value) => {});
        limiter.limit(() => callback(0));
        limiter.limit(() => callback(1));
        limiter.limit(() => callback(2));
        limiter.limit(() => callback(3));
        limiter.limit(() => callback(4));

        await sleep(50); // giving time for limiter

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith(4);
      });
    }));

  it('with limitMSec=50, limitMode=leading should run only once, very shortly after the first call', () =>
    runInDom(({ onMount }) => {
      const limiter = useLimiter({ id: 'test', limitMSec: 50, limitMode: 'leading' });

      onMount(async () => {
        const callback = jest.fn();
        limiter.limit(callback);
        await sleep(0);
        expect(callback).toHaveBeenCalledTimes(1);
        limiter.limit(callback);
        limiter.limit(callback);
        limiter.limit(callback);
        limiter.limit(callback);

        await sleep(200); // giving time for limiter

        expect(callback).toHaveBeenCalledTimes(1);
      });
    }));

  it('with limitMSec=50, limitMode=leading-and-trailing should run twice: once very shortly after the first call and once after enough time is given', () =>
    runInDom(({ onMount }) => {
      const limiter = useLimiter({ id: 'test', limitMSec: 50, limitMode: 'leading-and-trailing' });

      onMount(async () => {
        const callback = jest.fn();
        limiter.limit(callback);
        await sleep(0);
        expect(callback).toHaveBeenCalledTimes(1);
        limiter.limit(callback);
        limiter.limit(callback);
        limiter.limit(callback);
        limiter.limit(callback);

        await sleep(200); // giving time for limiter

        expect(callback).toHaveBeenCalledTimes(2);
      });
    }));

  it("with cancel on unmount should never run if enough time isn't given", () =>
    runInDom(({ onMount, onUnmount }) => {
      const limiter = useLimiter({ id: 'test', cancelOnUnmount: true });

      const callback = jest.fn();

      onMount(() => {
        limiter.limit(callback);
        limiter.limit(callback);
        limiter.limit(callback);
        limiter.limit(callback);
        limiter.limit(callback);
      });

      onUnmount(async () => {
        await sleep(50); // giving time for limiter

        expect(callback).toHaveBeenCalledTimes(0);
      });
    }));

  it('with limiterType=none should run immediately every time', () =>
    runInDom(({ onMount }) => {
      const limiter = useLimiter({ id: 'test', limitType: 'none' });

      onMount(async () => {
        const callback = jest.fn();
        limiter.limit(callback);
        limiter.limit(callback);
        limiter.limit(callback);
        limiter.limit(callback);
        limiter.limit(callback);

        expect(callback).toHaveBeenCalledTimes(5);
      });
    }));

  it('with limitMSec=50, should run only once enough time is given', () =>
    runInDom(({ onMount }) => {
      const limiter = useLimiter({ id: 'test', limitMSec: 50 });

      onMount(async () => {
        const callback = jest.fn();
        limiter.limit(callback);
        await sleep(10);
        limiter.limit(callback);
        await sleep(10);
        limiter.limit(callback);
        await sleep(10);
        limiter.limit(callback);
        await sleep(10);
        limiter.limit(callback);

        await sleep(200); // giving time for limiter

        expect(callback).toHaveBeenCalledTimes(1);

        limiter.limit(callback);
        expect(callback).toHaveBeenCalledTimes(1);

        await sleep(200); // giving time for limiter

        expect(callback).toHaveBeenCalledTimes(2);
      });
    }));

  it('with limitType=throttle, limitMSec=20, should run every time enough time has elapsed', () =>
    runInDom(({ onMount }) => {
      const limiter = useLimiter({ id: 'test', limitType: 'throttle', limitMSec: 20 });

      onMount(async () => {
        const callback = jest.fn();

        limiter.limit(callback);
        expect(callback).toHaveBeenCalledTimes(0);
        await sleep(10);
        expect(callback).toHaveBeenCalledTimes(0);
        limiter.limit(callback);
        await sleep(10);

        await sleep(0); // giving time for limiter
        expect(callback).toHaveBeenCalledTimes(1);
        limiter.limit(callback);
        await sleep(10);
        expect(callback).toHaveBeenCalledTimes(1);
        limiter.limit(callback);
        await sleep(10);

        await sleep(0); // giving time for limiter
        expect(callback).toHaveBeenCalledTimes(2);
        limiter.limit(callback);

        await sleep(200); // giving time for limiter

        expect(callback).toHaveBeenCalledTimes(3);
      });
    }));

  it('with limitType=throttle, limitMSec=20, limitMode=leading should very shortly after the first call and every time enough time has elapsed', () =>
    runInDom(({ onMount }) => {
      const limiter = useLimiter({ id: 'test', limitType: 'throttle', limitMSec: 20, limitMode: 'leading' });

      onMount(async () => {
        const callback = jest.fn();

        limiter.limit(callback);
        expect(callback).toHaveBeenCalledTimes(0);
        await sleep(10);
        expect(callback).toHaveBeenCalledTimes(1);
        limiter.limit(callback);
        await sleep(10);

        await sleep(0); // giving time for limiter
        expect(callback).toHaveBeenCalledTimes(1);
        limiter.limit(callback);
        await sleep(10);
        expect(callback).toHaveBeenCalledTimes(2);
        limiter.limit(callback);
        await sleep(10);

        await sleep(0); // giving time for limiter
        expect(callback).toHaveBeenCalledTimes(2);
        limiter.limit(callback);

        await sleep(200); // giving time for limiter

        expect(callback).toHaveBeenCalledTimes(3);
      });
    }));

  it('with limitType=throttle, limitMSec=20, limitMode=leading-and-trailing should very shortly after the first call and every time enough time has elapsed', () =>
    runInDom(({ onMount }) => {
      const limiter = useLimiter({ id: 'test', limitType: 'throttle', limitMSec: 20, limitMode: 'leading-and-trailing' });

      onMount(async () => {
        const callback = jest.fn();

        limiter.limit(callback);
        expect(callback).toHaveBeenCalledTimes(0);
        await sleep(10);
        expect(callback).toHaveBeenCalledTimes(1);
        limiter.limit(callback);
        await sleep(10);

        await sleep(0); // giving time for limiter
        expect(callback).toHaveBeenCalledTimes(2);
        limiter.limit(callback);
        await sleep(10);
        expect(callback).toHaveBeenCalledTimes(2);
        limiter.limit(callback);
        await sleep(10);

        await sleep(0); // giving time for limiter
        expect(callback).toHaveBeenCalledTimes(3);
        limiter.limit(callback);

        await sleep(200); // giving time for limiter

        expect(callback).toHaveBeenCalledTimes(4);
      });
    }));
});
