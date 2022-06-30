import React from 'react';

import { runInDom, sleep } from '../../__test_dependency__';
import { useBinding } from '../../binding/use-binding';
import { BindingsConsumer } from '../../components/BindingsConsumer';
import { useBindingEffect } from '../use-binding-effect';

describe('useBindingEffect', () => {
  it('with triggerOnMount=false, callback should not be run on mount even if bindings changed between render and mount', () =>
    runInDom(({ onMount }) => {
      const b = useBinding(() => 0, { id: 'test' });

      const callback = jest.fn(({ b }: { b: number }) => {
        expect(b).toBe(1);
      });

      useBindingEffect({ b }, callback, { triggerOnMount: false });
      b.set(1);

      onMount(async () => {
        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(0);

        b.set(1);

        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(1);
      });
    }));

  it('with triggerOnMount=true, callback should always be made on mount', () =>
    runInDom(({ onMount }) => {
      const b = useBinding(() => 0, { id: 'test' });

      const callback = jest.fn(({ b: _b }: { b: number }) => {});

      const refreshValue = useBinding(() => 0, { id: 'refreshValue' });
      const MyComponent = () => {
        useBindingEffect({ b }, callback, { triggerOnMount: true });

        return <></>;
      };

      onMount(async () => {
        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(1);

        b.set(1);

        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(2);

        refreshValue.set(1);

        await sleep(300); // giving time to render

        expect(callback).toHaveBeenCalledTimes(3);
      });

      return <BindingsConsumer bindings={refreshValue}>{() => <MyComponent />}</BindingsConsumer>;
    }));

  it('with triggerOnMount=first, callback should be made only on the first mount -- or if the dependency values change', () =>
    runInDom(({ onMount }) => {
      const b = useBinding(() => 0, { id: 'test' });

      const callback = jest.fn(({ b: _b }: { b: number }) => {});

      const refreshValue = useBinding(() => 0, { id: 'refreshValue' });
      const MyComponent = () => {
        useBindingEffect({ b }, callback, { triggerOnMount: 'first' });

        return <></>;
      };

      onMount(async () => {
        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(1);

        b.set(1);

        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(2);

        refreshValue.set(1);

        await sleep(300); // giving time to render

        expect(callback).toHaveBeenCalledTimes(2);
      });

      return <BindingsConsumer bindings={refreshValue}>{() => <MyComponent />}</BindingsConsumer>;
    }));
});