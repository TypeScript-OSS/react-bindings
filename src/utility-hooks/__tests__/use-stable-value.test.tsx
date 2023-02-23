import { waitFor } from '@testing-library/react';
import React, { ComponentType } from 'react';

import { runInDom } from '../../__test_dependency__';
import { useBinding } from '../../binding/use-binding';
import { BindingsConsumer } from '../../components/BindingsConsumer';
import { useStableValue } from '../use-stable-value';

describe('useStableValue', () => {
  it('stable values should only change when they change according to areEqual', () =>
    runInDom(({ onMount }) => {
      const value = useBinding(() => 0, { id: 'value' });

      let stabilized:
        | {
            value: number;
            somethingElse: number;
          }
        | undefined;
      const MyComponent: ComponentType<{ value: number }> = jest.fn(({ value }: { value: number }) => {
        stabilized = useStableValue({ value, somethingElse: 3 });

        return <span>{value}</span>;
      });

      onMount(async () => {
        expect(MyComponent).toHaveBeenCalledTimes(1);

        const firstStabilized = stabilized;
        expect(stabilized).toMatchObject({ value: 0, somethingElse: 3 });

        value.set(0);
        await waitFor(() => expect(MyComponent).toHaveBeenCalledTimes(2));

        expect(stabilized).toBe(firstStabilized);
        expect(stabilized).toMatchObject({ value: 0, somethingElse: 3 });

        value.set(1);
        await waitFor(() => expect(MyComponent).toHaveBeenCalledTimes(3));

        expect(stabilized).not.toBe(firstStabilized);
        expect(stabilized).toMatchObject({ value: 1, somethingElse: 3 });
      });

      return <BindingsConsumer bindings={{ value }}>{({ value }) => <MyComponent value={value} />}</BindingsConsumer>;
    }));
});
