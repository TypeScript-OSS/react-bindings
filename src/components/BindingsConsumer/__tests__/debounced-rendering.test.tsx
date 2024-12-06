import { jest } from '@jest/globals';
import { waitFor } from '@testing-library/react';
import type { ComponentType } from 'react';
import React from 'react';

import { runInDom } from '../../../__test_dependency__/run-in-dom.js';
import type { Binding } from '../../../binding/types/binding';
import { useBinding } from '../../../binding/use-binding.js';
import { BindingsConsumer } from '../index.js';

describe('BindingsConsumer', () => {
  it('updating multiple times should rerender but debounced', () =>
    runInDom(({ onMount }) => {
      let b: Binding<number>;

      const consumerRenderer = jest.fn(({ b }: { b: number }) => <span>{b}</span>);

      const MyComponent: ComponentType = jest.fn(() => {
        b = useBinding(() => 0, { id: 'test' });

        return (
          <BindingsConsumer bindings={{ b }} limitMSec={100}>
            {consumerRenderer}
          </BindingsConsumer>
        );
      });

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');

        for (let i = 1; i < 25; i += 1) {
          b.set(i);

          expect(MyComponent).toHaveBeenCalledTimes(1);
          expect(consumerRenderer).toHaveBeenCalledTimes(1);
          expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');
        }

        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>24</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);
      });

      return <MyComponent />;
    }));

  it('leading-and-trailing debounced rendering should update right away on the first change and then after changes have stopped', () =>
    runInDom(({ onMount }) => {
      let b: Binding<number>;

      const consumerRenderer = jest.fn(({ b }: { b: number }) => <span>{b}</span>);

      const MyComponent: ComponentType = jest.fn(() => {
        b = useBinding(() => 0, { id: 'test' });

        return (
          <BindingsConsumer bindings={{ b }} limitMode="leading-and-trailing" limitMSec={100}>
            {consumerRenderer}
          </BindingsConsumer>
        );
      });

      onMount(async (rootElement) => {
        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(1);
        expect(rootElement.innerHTML).toBe('<div><span>0</span></div>');

        b.set(1);
        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>1</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(2);

        for (let i = 2; i < 25; i += 1) {
          b.set(i);

          expect(MyComponent).toHaveBeenCalledTimes(1);
          expect(consumerRenderer).toHaveBeenCalledTimes(2);
          expect(rootElement.innerHTML).toBe('<div><span>1</span></div>');
        }

        await waitFor(() => expect(rootElement.innerHTML).toBe('<div><span>24</span></div>'));

        expect(MyComponent).toHaveBeenCalledTimes(1);
        expect(consumerRenderer).toHaveBeenCalledTimes(3);
      });

      return <MyComponent />;
    }));
});
