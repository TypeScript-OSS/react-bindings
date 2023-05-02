import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';
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
        await waitFor(() => expect(callback).toHaveBeenCalledTimes(3));
      });

      return <BindingsConsumer bindings={refreshValue}>{() => <MyComponent />}</BindingsConsumer>;
    }));

  it('with triggerOnMount=first, callback should be made only on the first mount', () =>
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
        await waitFor(() => expect(callback).toHaveBeenCalledTimes(2));

        refreshValue.set(1);
        await expect(waitFor(() => expect(callback).not.toHaveBeenCalledTimes(2))).rejects.toThrow();
      });

      return <BindingsConsumer bindings={refreshValue}>{() => <MyComponent />}</BindingsConsumer>;
    }));

  it('with deps, callback should be made only on the first mount or if the dependency values change', () =>
    runInDom(({ onMount }) => {
      const callback = jest.fn(() => {});

      const refreshValue = useBinding(() => 0, { id: 'refreshValue' });
      const MyComponent = ({ value }: { value: number }) => {
        useBindingEffect(undefined, callback, { deps: [value], limitType: 'none' });

        return <></>;
      };

      onMount(async () => {
        await sleep(50); // giving time for callback

        expect(callback).toHaveBeenCalledTimes(0);

        refreshValue.set(0);
        await expect(waitFor(() => expect(callback).not.toHaveBeenCalledTimes(0))).rejects.toThrow();

        refreshValue.set(1);
        await waitFor(() => expect(callback).toHaveBeenCalledTimes(1));

        refreshValue.set(1);
        await expect(waitFor(() => expect(callback).not.toHaveBeenCalledTimes(1))).rejects.toThrow();

        refreshValue.set(2);
        await waitFor(() => expect(callback).toHaveBeenCalledTimes(2));
      });

      return <BindingsConsumer bindings={refreshValue}>{(refreshValue) => <MyComponent value={refreshValue} />}</BindingsConsumer>;
    }));
});
