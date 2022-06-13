import React, { useCallback, useEffect, useRef } from 'react';

import { runInDom, sleep } from '../../__test_dependency__';
import { useBinding } from '../../binding/use-binding';
import { BindingsConsumer } from '../../components/BindingsConsumer';
import { useCallbackRef } from '../use-callback-ref';

describe('useCallbackRef', () => {
  it("useCallbackRef changes shouldn't cause useEffect to rerun, unlike regular useCallback changes", () =>
    runInDom(({ onMount }) => {
      const value = useBinding(() => 0, { id: 'value' });

      const numUseEffectCallsWithRegularCallback = useRef(0);
      const lastValueInUseEffectWithRegularCallback = useRef<number | undefined>(undefined);

      const numUseEffectCallsWithCallbackRef = useRef(0);
      const lastValueInUseEffectWithCallbackRef = useRef<number | undefined>(undefined);

      const MyComponent = ({ value }: { value: number }) => {
        const callback = useCallback(() => value + 1, [value]);
        const callbackRef = useCallbackRef(() => value + 1);

        useEffect(() => {
          numUseEffectCallsWithRegularCallback.current += 1;
          lastValueInUseEffectWithRegularCallback.current = callback();
        }, [callback]);

        useEffect(() => {
          numUseEffectCallsWithCallbackRef.current += 1;
          lastValueInUseEffectWithCallbackRef.current = callbackRef();
        }, [callbackRef]);

        return (
          <span>
            {callback()}-{callbackRef()}
          </span>
        );
      };

      onMount(async (rootElement) => {
        expect(numUseEffectCallsWithRegularCallback.current).toBe(1);
        expect(lastValueInUseEffectWithRegularCallback.current).toBe(1);
        expect(numUseEffectCallsWithCallbackRef.current).toBe(1);
        expect(lastValueInUseEffectWithCallbackRef.current).toBe(1);
        expect(rootElement.innerHTML).toBe('<span>1-1</span>');

        value.set(2);

        await sleep(300); // giving time to render

        expect(numUseEffectCallsWithRegularCallback.current).toBe(2);
        expect(lastValueInUseEffectWithRegularCallback.current).toBe(3);
        expect(numUseEffectCallsWithCallbackRef.current).toBe(1);
        expect(lastValueInUseEffectWithCallbackRef.current).toBe(1);
        expect(rootElement.innerHTML).toBe('<span>3-3</span>');
      });

      return <BindingsConsumer bindings={{ value }}>{({ value }) => <MyComponent value={value} />}</BindingsConsumer>;
    }));
});
