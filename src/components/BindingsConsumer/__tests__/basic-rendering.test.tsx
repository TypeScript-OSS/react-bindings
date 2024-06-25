import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';
import React from 'react';

import { runInDom } from '../../../__test_dependency__/index.js';
import type { Binding } from '../../../binding/types/binding';
import { useBinding } from '../../../binding/use-binding.js';
import { BindingsConsumer } from '..';

describe('BindingsConsumer', () => {
  it('should work with undefined bindings', () =>
    runInDom(({ onMount }) => {
      const MyComponent: ComponentType = jest.fn(() => (
        <BindingsConsumer bindings={undefined}>
          {(values) => {
            expect(values).toBeUndefined();
            return <span />;
          }}
        </BindingsConsumer>
      ));

      onMount((rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);

        expect(rootElement.innerHTML).toBe('<div><span></span></div>');
      });

      return <MyComponent />;
    }));

  it('initial render should work', () =>
    runInDom(({ onMount }) => {
      const MyComponent: ComponentType = jest.fn(() => {
        const b = useBinding(() => 0, { id: 'test' });

        return <BindingsConsumer bindings={{ b }}>{({ b }) => <span>{b}</span>}</BindingsConsumer>;
      });

      onMount((rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);

        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');
      });

      return <MyComponent />;
    }));

  it('updating should rerender', () =>
    runInDom(({ onMount }) => {
      let b: Binding<number>;

      const consumerRenderer = jest.fn(({ b }: { b: number }) => <span>{b}</span>);

      const MyComponent: ComponentType = jest.fn(() => {
        b = useBinding(() => 0, { id: 'test' });

        return <BindingsConsumer bindings={{ b }}>{consumerRenderer}</BindingsConsumer>;
      });

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');

        b.set(1);
        await waitFor(() => expect(consumerRenderer).toHaveBeenCalledTimes(2));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<div><span>1</span></div>');
      });

      return <MyComponent />;
    }));
});
