import React from 'react';

import { runInDom, sleep } from '../../__test_dependency__';
import type { ReadonlyBinding } from '../../binding/types/readonly-binding';
import { useBinding } from '../../binding/use-binding';
import { BindingsConsumer } from '../../components/BindingsConsumer';
import { useConstBinding } from '../const-binding';

describe('useConstBinding', () => {
  it('initial value should work', () =>
    runInDom(({ onMount }) => {
      const a = useConstBinding(3, { id: 'a' });

      onMount(() => {
        expect(a.get()).toBe(3);
      });
    }));

  it("if rerendered with a new value, the binding's value should change", () =>
    runInDom(({ onMount }) => {
      const value = useBinding(() => 0, { id: 'value' });
      let constBinding: ReadonlyBinding<number> | undefined;

      const MyComponent = ({ value }: { value: number }) => {
        constBinding = useConstBinding(value, { id: 'a' });

        return <span>{constBinding.get()}</span>;
      };

      onMount(async () => {
        const constBindingUid = constBinding?.uid;
        expect(constBinding?.get()).toBe(0);

        value.set(1);

        await sleep(300); // giving time to render

        expect(constBinding?.get()).toBe(1);
        expect(constBinding?.uid).toBe(constBindingUid);
      });

      return <BindingsConsumer bindings={{ value }}>{({ value }) => <MyComponent value={value} />}</BindingsConsumer>;
    }));
});
