import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';
import React from 'react';

import { runInDom } from '../../__test_dependency__/index.js';
import { useBinding } from '../../binding/use-binding.js';
import { BindingsConsumer } from '../../components/BindingsConsumer/index.js';
import { useStableValue } from '../use-stable-value.js';

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
