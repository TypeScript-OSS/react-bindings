import { waitFor } from '@testing-library/react';
import React from 'react';

import { runInDom } from '../../__test_dependency__/index.js';
import type { ReadonlyBinding } from '../../binding/types/readonly-binding';
import { useBinding } from '../../binding/use-binding.js';
import { BindingsConsumer } from '../../components/BindingsConsumer/index.js';
import { useConstBinding } from '../const-binding.js';

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
        await waitFor(() => expect(constBinding?.get()).toBe(1));

        expect(constBinding?.uid).toBe(constBindingUid);
      });

      return <BindingsConsumer bindings={{ value }}>{({ value }) => <MyComponent value={value} />}</BindingsConsumer>;
    }));
});
