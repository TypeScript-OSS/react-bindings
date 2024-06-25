import { waitFor } from '@testing-library/react';
import React, { useCallback, useEffect, useRef } from 'react';

import { runInDom } from '../../__test_dependency__/index.js';
import { useBinding } from '../../binding/use-binding.js';
import { BindingsConsumer } from '../../components/BindingsConsumer/index.js';
import { useCallbackRef } from '../use-callback-ref.js';

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
        expect(rootElement.innerHTML).toBe('<div><span>1-1</span></div>');

        value.set(2);
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>3-3</span></div>'));

        expect(numUseEffectCallsWithRegularCallback.current).toBe(2);
        expect(lastValueInUseEffectWithRegularCallback.current).toBe(3);
        expect(numUseEffectCallsWithCallbackRef.current).toBe(1);
        expect(lastValueInUseEffectWithCallbackRef.current).toBe(1);
      });

      return <BindingsConsumer bindings={{ value }}>{({ value }) => <MyComponent value={value} />}</BindingsConsumer>;
    }));
});
